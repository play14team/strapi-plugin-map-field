import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';
import { Box, Field, Grid } from "@strapi/design-system";
import React, { useCallback, useMemo, useState } from "react";
import { useIntl } from 'react-intl';
import Map, { FullscreenControl, GeolocateControl, Marker, NavigationControl } from 'react-map-gl/mapbox';
import { getTranslation } from '../utils/getTranslation';
import GeocoderControl from './GeocoderControl';

import { Status, Typography } from '@strapi/design-system';
import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = process.env.STRAPI_ADMIN_MAPBOX_ACCESS_TOKEN;

interface Result extends GeoJSON.Feature<GeoJSON.Point> {
  bbox: [number, number, number, number];
  center: number[];
  place_name: string;
  place_type: string[];
  relevance: number;
  text: string;
  address: string;
  context: any[];
}

interface GeoPickerProps {
  name: string;
  onChange: (event: {
    target: { name: string; value: string; type: string };
  }) => void;
  value?: string | Result | null;
  intlLabel?: {
    defaultMessage: string;
  };
  required?: boolean;
}

function parseResult(value: string | Result | null | undefined): Result | null {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') {
    return value as Result;
  }
  return null;
}

const GeoPicker: React.FC<GeoPickerProps> = ({
  name,
  onChange,
  value,
  intlLabel,
  required,
}) => {
  if (!TOKEN) {
    return (
      <Status variant="danger" showBullet={false}>
        <Typography fontWeight="bold">Map field cannot be displayed! </Typography>{' '}
        <Typography>
          Mapbox access token not found. Please add a STRAPI_ADMIN_MAPBOX_ACCESS_TOKEN environment
          variable and set it with a valid Mapbox api token.
        </Typography>
      </Status>
    );
  }

  const { formatMessage } = useIntl();
  const result = useMemo(() => parseResult(value), [value]);
  const isDefaultViewState = !result;

  // State for marker and address
  const [longitude, setLongitude] = useState<number | null>(result?.geometry.coordinates[0] ?? null);
  const [latitude, setLatitude] = useState<number | null>(result?.geometry.coordinates[1] ?? null);
  const [address, setAddress] = useState<string>(result?.place_name ?? '');

  // Map view state
  const [viewState, setViewState] = useState({
    longitude: longitude ?? 15,
    latitude: latitude ?? 45,
    zoom: 3.5,
  });

  // Handle geocoder result
  const handleGeocoderResult = useCallback((evt: { result: Result }) => {
    if (evt?.result) updateValues(evt.result);
  }, [name, onChange]);

  // Reverse geocode on map double click
  const handleReverseGeocode = useCallback((evt: any) => {
    evt.preventDefault();
    const geocodingService = mbxGeocoding({ accessToken: TOKEN });
    geocodingService
      .reverseGeocode({ query: [evt.lngLat.lng, evt.lngLat.lat] })
      .send()
      .then((response: any) => {
        const feature = response.body.features[0];
        if (feature) updateValues(feature);
      });
  }, [name, onChange]);

  // Update all values and propagate change
  const updateValues = useCallback((feature: Result) => {
    if (!feature) return;
    setAddress(feature.place_name);
    setLongitude(feature.geometry.coordinates[0]);
    setLatitude(feature.geometry.coordinates[1]);
    onChange({ target: { name, value: JSON.stringify(feature), type: 'json' } });
  }, [name, onChange]);

  // Fly to marker on map load
  const handleMapLoad = useCallback((evt: any) => {
    if (isDefaultViewState) return;
    const map = evt.target;
    if (longitude !== null && latitude !== null) {
      map.flyTo({ center: [longitude, latitude], zoom: 15 });
    }
  }, [isDefaultViewState, longitude, latitude]);

  return (
    <Field.Root name={name} required={required}>
      <Field.Label>{intlLabel?.defaultMessage ?? "Location"}</Field.Label>
      <Box padding={4}>
        <Map
          {...viewState}
          onMove={(evt: any) => setViewState(evt.viewState)}
          onDblClick={handleReverseGeocode}
          onLoad={handleMapLoad}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={TOKEN}
          attributionControl={false}
          style={{ height: '500px', width: '100%' }}
        >
          {/* Map Controls */}
          <FullscreenControl />
          <NavigationControl />
          <GeolocateControl />
          <GeocoderControl mapboxAccessToken={TOKEN} position="top-left" onResult={handleGeocoderResult} />
          {/* Marker */}
          {longitude !== null && latitude !== null && (
            <Marker longitude={longitude} latitude={latitude} color="#ff5200" />
          )}
        </Map>

        <Box marginTop={4}>
          <Grid.Root gap={3}>
            <Grid.Item col={2} s={12} m={12}>
              <Field.Root>
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('fields.latitude'),
                    defaultMessage: 'Latitude',
                  })}
                </Field.Label>
                <Field.Input type="text" placeholder={formatMessage({
                  id: getTranslation('fields.latitude'),
                  defaultMessage: 'Latitude',
                })} disabled value={latitude} />
              </Field.Root>
            </Grid.Item>
            <Grid.Item col={2} s={12} m={12}>
              <Field.Root>
                <Field.Label>
                  {formatMessage({
                    id: getTranslation('fields.longitude'),
                    defaultMessage: 'Longitude',
                  })}
                </Field.Label>
                <Field.Input type="text" placeholder={formatMessage({
                  id: getTranslation('fields.longitude'),
                  defaultMessage: 'Longitude',
                })} disabled value={longitude} />
              </Field.Root>
            </Grid.Item>
            <Grid.Item col={8} s={12} m={12}>
              <Box style={{ flex: 1 }}>
                <Field.Root>
                  <Field.Label>
                    {formatMessage({
                      id: getTranslation('fields.address'),
                      defaultMessage: 'Address',
                    })}
                  </Field.Label>
                  <Field.Input type="text" placeholder={formatMessage({
                    id: getTranslation('fields.address'),
                    defaultMessage: 'Address',
                  })} disabled value={address} />
                </Field.Root>
              </Box>
            </Grid.Item>
          </Grid.Root>
        </Box>
      </Box>
      <Field.Error />
      <Field.Hint />
    </Field.Root>
  );
};

export { GeoPicker };
