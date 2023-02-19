'use strict';

module.exports = ({ strapi }) => {
  strapi.customFields.register({
    name: 'map',
    plugin: 'map-field',
    type: 'json',
  });
};
