import { PanelPlugin } from '@grafana/data';
import { TableCellDisplayMode } from './DataGrid/types';
//import { TableCellDisplayMode } from '@grafana/ui';
import { UAAEPanelOptions } from './types';
import { UAAEPanel } from './UAAEPanel';

export const plugin = new PanelPlugin<UAAEPanelOptions>(UAAEPanel)
  .setNoPadding()
  .useFieldConfig({
    useCustomConfig: builder => {
      builder
        .addNumberInput({
          path: 'width',
          name: 'Column width',
          settings: {
            placeholder: 'auto',
            min: 20,
            max: 1300,
          },
          shouldApply: () => true,
        })
        .addRadio({
          path: 'align',
          name: 'Column alignment',
          settings: {
            options: [
              { label: 'auto', value: null },
              { label: 'left', value: 'left' },
              { label: 'center', value: 'center' },
              { label: 'right', value: 'right' },
            ],
          },
          defaultValue: null,
        })
        .addSelect({
          path: 'displayMode',
          name: 'Cell display mode',
          description: 'Color text, background, show as gauge, etc',
          settings: {
            options: [
              { value: TableCellDisplayMode.Auto, label: 'Auto' },
              { value: TableCellDisplayMode.ColorText, label: 'Color text' },
              { value: TableCellDisplayMode.ColorBackground, label: 'Color background' },
              { value: TableCellDisplayMode.GradientGauge, label: 'Gradient gauge' },
              { value: TableCellDisplayMode.LcdGauge, label: 'LCD gauge' },
              { value: TableCellDisplayMode.BasicGauge, label: 'Basic gauge' },
              { value: TableCellDisplayMode.JSONView, label: 'JSON View' },
              { value: TableCellDisplayMode.Image, label: 'Image' },
              { value: TableCellDisplayMode.BooleanImage, label: 'BooleanImage' },
            ],
          },
        })
        .addBooleanSwitch({
          path: 'filterable',
          name: 'Columns filterable',
          description: 'Enables/disables field filters in table',
          defaultValue: true,
        });
    },
  })
  .setPanelOptions(builder => {

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
