import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import Initializer from './components/Initializer';
import MapIcon from './components/MapIcon';
import mutateEditViewHook from './mutateEditViewHook'

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    app.customFields.register({
      name: "map",
      pluginId: pluginId,
      type: "json",
      intlLabel: {
        id: "map-field.label",
        defaultMessage: "Map",
      },
      intlDescription: {
        id: "map-field.description",
        defaultMessage: "A map custom field using Mapbox",
      },
      icon: MapIcon,
      components: {
        Input: async () => import(/* webpackChunkName: "input-component" */ "./components/MapInput"),
      },
    });

    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });
  },

  bootstrap(app) {
    app.registerHook(
      "Admin/CM/pages/EditView/mutate-edit-view-layout",
      mutateEditViewHook
    );
  },

  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "translation-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
