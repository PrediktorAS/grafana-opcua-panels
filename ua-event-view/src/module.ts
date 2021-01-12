import { PanelPlugin } from '@grafana/data';
import { UAAEPanelOptions } from './types';
import { UAAEPanel } from './UAAEPanel';

export const plugin = new PanelPlugin<UAAEPanelOptions>(UAAEPanel).setPanelOptions(builder => {

  return builder
    .addRadio({
      path: 'panelType',
      name: 'Type of events',
      defaultValue: 'history',
      settings: {
        options: [
          {
            value: 'history',
            label: 'History',
          },
          {
            value: 'realtime',
            label: 'Realtime',
          },
        ],
      }
    });
});
