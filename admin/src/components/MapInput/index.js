import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import { Stack, Typography, TextInput, Grid, GridItem, Status } from '@strapi/design-system';
import Map, {FullscreenControl, GeolocateControl, Marker, NavigationControl} from 'react-map-gl';
import GeocoderControl from './geocoder-control';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'
import getTranslation from '../../utils/getTrad';

import 'mapbox-gl/dist/mapbox-gl.css';

const TOKEN = process.env.STRAPI_ADMIN_MAPBOX_ACCESS_TOKEN

const MapField = ({
  intlLabel,
  name,
  onChange,
  value
}) => {

  if (!TOKEN) {
    return (<Status variant="danger" showBullet={false}>
             <Typography fontWeight="bold">Map field cannot be displayed! </Typography> <Typography>Mapbox access token not found. Please add a STRAPI_ADMIN_MAPBOX_ACCESS_TOKEN environment variable and set it with a valid Mapbox api token.</Typography>
           </Status>)
  }

  const { formatMessage } = useIntl();
  const result = value && JSON.parse(value) || null;
  const isDefaultViewState = (result == null)

  const [longitude, setLongitude] = useState(result && result.geometry.coordinates[0] || null);
  const [latitude, setLatitude] = useState(result && result.geometry.coordinates[1] || null);
  const [address, setAddress] = useState(result && result.place_name || '');

  const [viewState, setViewState] = useState({
    longitude: longitude || 15,
    latitude: latitude || 45,
    zoom: 3.5
  });

  const handleChange = (evt) => {
    const {result} = evt;
    if (! result) return;
    updateValues(result);
  }

  const reverseGeocode= (evt) => {
    evt.preventDefault();

    const geocodingService = mbxGeocoding({ accessToken: TOKEN });
    geocodingService.reverseGeocode({
      query: [evt.lngLat.lng, evt.lngLat.lat]
    })
      .send()
      .then(response => {
        const result = response.body.features[0];
        if (! result) return;
        updateValues(result);
    });
  }

  const updateValues = (result) => {
    if (!result) return;
    const value = JSON.stringify(result);

    setAddress(result.place_name);
    setLongitude(result.geometry.coordinates[0]);
    setLatitude(result.geometry.coordinates[1]);
    onChange({ target: { name, value, type: "json" } });
  }

  const flyTo = (evt) => {
    if (isDefaultViewState) return;
    const map = evt.target;
    map.flyTo({center: [longitude, latitude], zoom: 15})
  }

  return (
  <Stack spacing={4}>
    <Typography
      textColor="neutral800"
      as="label"
      variant="pi"
      fontWeight="bold"
    >
      {formatMessage(intlLabel)}
    </Typography>

    <Map
      {...viewState}
      onMove={evt => setViewState(evt.viewState)}
      onDblClick={reverseGeocode}
      onLoad={flyTo}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={TOKEN}
      attributionControl={false}
      style={{ height:"500px", width:"100%" }}
    >
      <FullscreenControl />
      <NavigationControl />
      <GeolocateControl />
      <GeocoderControl mapboxAccessToken={TOKEN} position="top-left" onResult={handleChange}/>
      <Marker longitude={longitude} latitude={latitude} color="#ff5200" />
    </Map>

    <Grid>
      <GridItem padding={1} col={8} xs={12}>
        <TextInput label={formatMessage({
          id: getTranslation(
            'fields.address'
          ),
          defaultMessage: 'address',
        })} name="address" value={address} disabled
      />
      </GridItem>
      <GridItem padding={1} col={2} xs={12}>
        <TextInput label={formatMessage({
          id: getTranslation(
            'fields.longitude'
          ),
          defaultMessage: 'longitude',
        })} name="longitude" value={longitude} disabled />
      </GridItem>
      <GridItem padding={1} col={2} xs={12}>
        <TextInput label={formatMessage({
          id: getTranslation(
            'fields.latitude'
          ),
          defaultMessage: 'latitude',
        })} name="latitude" value={latitude} disabled />
      </GridItem>
    </Grid>
  </Stack>
  );
}

export default MapField;
