import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { UaDashboardPanel } from './UaDashboardPanel';

export const plugin = new PanelPlugin<SimpleOptions>(UaDashboardPanel).setPanelOptions(builder => {
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
          {
            value: 'NamedDashboard',
            label: 'Named Dashboard',
          },
        ],
      }
    })
    .addNumberInput({
      path: 'maxChildren',
      name: 'Maximum Views',
      defaultValue: 10,
    })
    .addTextInput({
      path: 'namedDashboardName',
      name: 'Named Dashboard',
      defaultValue: ''})
    ;
});
