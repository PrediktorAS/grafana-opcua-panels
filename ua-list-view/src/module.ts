import { PanelPlugin } from '@grafana/data';
import { UAListViewOptions } from './types';
import { UaListViewPanel } from './UaListViewPanel';

export const plugin = new PanelPlugin<UAListViewOptions>(UaListViewPanel).setPanelOptions(builder => {
  return builder
    .addRadio({
      path: 'numberFormat',
      name: 'Number Format',
      defaultValue: 'Fixed',
      settings: {
        options: [
          {
            value: 'None',
            label: 'None',
          },
          {
            value: 'Fixed',
            label: 'Fixed',
          },
          {
            value: 'Precision',
            label: 'Precision',
          },
          {
            value: 'Exponential',
            label: 'Exponential',
          },
          {
            value: 'LocaleString',
            label: 'LocaleString',
          },
        ],
      }
    })
    .addNumberInput({
      path: 'decimalPrecision',
      name: 'Decimal Precision',
      defaultValue: 2,
    })
    .addNumberInput({
      path: 'headerFontSize',
      name: 'Header Font Size',
      defaultValue: 14,
    })
    .addNumberInput({
      path: 'bodyFontSize',
      name: 'Body Font Size',
      defaultValue: 12,
    })
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
    .addBooleanSwitch({ path: 'showAllVariablesToDepth', defaultValue: false, name: 'Shows all variable values from root to depth' })
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
