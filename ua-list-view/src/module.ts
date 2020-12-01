import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { UaListViewPanel } from './UaListViewPanel';

export const plugin = new PanelPlugin<SimpleOptions>(UaListViewPanel).setPanelOptions(builder => {
  return builder
    .addRadio({
      path: 'dashboardFetch',
      name: 'Dashboard fetching',
      defaultValue: 'Instance',
      settings: {
        options: [
          {
            value: 'Instance',
            label: 'Instance',
          },
          {
            value: 'ChildrenIfNotInstance',
            label: 'ChildrenIfNotInstance',
          },
          {
            value: 'Children',
            label: 'Children',
          },
        ],
      }
    })
    .addNumberInput({
      path: 'maxChildren',
      name: 'Maximum Views',
      defaultValue: 10,
    });
});
