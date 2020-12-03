import { PanelPlugin } from '@grafana/data';
import { UAListViewOptions } from './types';
import { UaListViewPanel } from './UaListViewPanel';

export const plugin = new PanelPlugin<UAListViewOptions>(UaListViewPanel).setPanelOptions(builder => {
  return builder
    //.addRadio({
    //  path: 'dashboardFetch',
    //  name: 'Dashboard fetching',
    //  defaultValue: 'Instance',
    //  settings: {
    //    options: [
    //      {
    //        value: 'Instance',
    //        label: 'Instance',
    //      },
    //      {
    //        value: 'ChildrenIfNotInstance',
    //        label: 'ChildrenIfNotInstance',
    //      },
    //      {
    //        value: 'Children',
    //        label: 'Children',
    //      },
    //    ],
    //  }
    //})
    .addNumberInput({
      path: 'maxElementsList',
      name: 'Maximum elements in list',
      defaultValue: 100,
    })
    .addNumberInput({
      path: 'refreshRate',
      name: 'Automatic Refresh Rate [s]',
      defaultValue: 0,
    })
    .addBooleanSwitch({ path: 'displayBrowseName', defaultValue: false, name: 'Display Browsename' })
    .addBooleanSwitch({ path: 'displayNodeClass', defaultValue: false, name: 'Display Node Class' })
    .addNumberInput({ path: 'browseDepth', defaultValue: 1, name: 'Depth from selected node to variables to be displayed' })
    .addRadio({
      path: 'dataFetch',
      name: 'Data Fetching Strategy',
      defaultValue: 'Subscribe',
      settings: {
        options: [
          {
            value: 'Polling',
            label: 'Polling',
          },
          {
            value: 'Subscribe',
            label: 'Subscribe',
          },
        ],
      }})
});
