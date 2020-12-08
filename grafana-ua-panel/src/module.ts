import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { UaBrowserPanel } from './UaBrowserPanel';

export const plugin = new PanelPlugin<SimpleOptions>(UaBrowserPanel).setPanelOptions(builder => {
  return builder
    .addBooleanSwitch({
      path: 'configMode',
      name: 'Configure dashboard mappings',
      defaultValue: false,
    })
    .addRadio({
      path: 'root',
      name: 'Root node to browse',
      defaultValue: 'Objects',
      settings: {
        options: [
          {
            value: 'Objects',
            label: 'Objects',
          },
          {
            value: 'Types',
            label: 'Types',
          },
        ],
      }
    });
});

