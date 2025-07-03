import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // Register the custom field
  strapi.customFields.register({
    name: 'map-field',
    type: 'json',
  });
};

export default register;
