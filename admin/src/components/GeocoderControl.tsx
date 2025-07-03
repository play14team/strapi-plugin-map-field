import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl from 'mapbox-gl';
import React from 'react';
import { useControl } from 'react-map-gl/mapbox';

import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

/* eslint-disable complexity,max-statements */
interface GeocoderControlProps {
  mapboxAccessToken: string;
  position?: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left';
  marker?: boolean;
  onLoading?: (...args: any[]) => void;
  onResults?: (...args: any[]) => void;
  onResult?: (evt: { result: any }) => void;
  onError?: (...args: any[]) => void;
  proximity?: any;
  render?: any;
  language?: string;
  zoom?: number;
  flyTo?: any;
  placeholder?: string;
  countries?: string;
  types?: string;
  minLength?: number;
  limit?: number;
  filter?: any;
  origin?: string;
}

const noop = () => { };

const GeocoderControl: React.FC<GeocoderControlProps> = ({
  mapboxAccessToken,
  position,
  marker = true,
  onLoading = noop,
  onResults = noop,
  onResult = noop,
  onError = noop,
  proximity,
  render,
  language,
  zoom,
  flyTo,
  placeholder,
  countries,
  types,
  minLength,
  limit,
  filter,
  origin,
  ...props
}) => {
  useControl(() => {
    const ctrl = new MapboxGeocoder({
      ...props,
      marker,
      accessToken: mapboxAccessToken,
      mapboxgl: mapboxgl as any,
    });
    onLoading && ctrl.on('loading', onLoading);
    onResults && ctrl.on('results', onResults);
    onResult && ctrl.on('result', onResult);
    onError && ctrl.on('error', onError);
    return ctrl as any;
  }, { position });

  return null;
};

export default GeocoderControl;
