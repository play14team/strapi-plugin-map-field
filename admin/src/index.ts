import { GeoPicker } from './components/GeoPicker';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';
import { PLUGIN_ID } from './pluginId';

export default {
  register(app: any) {
    app.customFields.register({
      name: 'map-field',
      type: 'json',
      icon: PluginIcon,
      intlLabel: {
        id: 'custom.fields.map-field.label',
        defaultMessage: 'Map',
      },
      intlDescription: {
        id: 'custom.fields.map-field.description',
        defaultMessage: 'A map custom field using Mapbox',
      },
      components: {
        Input: () => ({ default: GeoPicker as React.ComponentType }) as any,
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
