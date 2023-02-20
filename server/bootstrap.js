'use strict';

module.exports = ({ strapi }) => {
  if (!process.env.STRAPI_ADMIN_MAPBOX_ACCESS_TOKEN) {
    strapi.log.warn('[map-field] Mapbox access token not found');
    strapi.log.warn('[map-field] Please add a STRAPI_ADMIN_MAPBOX_ACCESS_TOKEN environment variable and set it with a valid Mapbox api token');
  }
};
