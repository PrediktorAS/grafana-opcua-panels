import { CellProps } from 'react-table';
import { Field, PanelProps } from '@grafana/data';
import { TableStyles } from './styles';
import { CSSProperties, FC } from 'react';

export interface TableFieldOptions {
  width: number;
  align: FieldTextAlignment;
  displayMode: TableCellDisplayMode;
  hidden?: boolean;
}

export enum TableCellDisplayMode {
  Auto = 'auto',
  ColorText = 'color-text',
  ColorBackground = 'color-background',
  GradientGauge = 'gradient-gauge',
  LcdGauge = 'lcd-gauge',
  JSONView = 'json-view',
  BasicGauge = 'basic',
  Image = 'image',
  BooleanImage = 'booleanimage',
}

export type FieldTextAlignment = 'auto' | 'left' | 'right' | 'center';

export interface TableRow {
  [x: string]: any;
}

export const FILTER_FOR_OPERATOR = '=';
export const FILTER_OUT_OPERATOR = '!=';
export type FilterOperator = typeof FILTER_FOR_OPERATOR | typeof FILTER_OUT_OPERATOR;
export type FilterItem = { key: string; value: string; operator: FilterOperator };
export type TableFilterActionCallback = (item: FilterItem) => void;
export type TableColumnResizeActionCallback = (fieldDisplayName: string, width: number) => void;
export type TableSortByActionCallback = (state: TableSortByFieldState[]) => void;

export interface TableSortByFieldState {
  displayName: string;
  desc?: boolean;
}

export interface TableCellProps extends CellProps<any> {
  tableStyles: TableStyles;
  cellProps: CSSProperties;
  field: Field;
  onCellFilterAdded: TableFilterActionCallback;
}

//export interface MyField extends Field {

//  config: FieldConfigGrid;

//}

export type CellComponent = FC<TableCellProps>;

//export interface FieldOverrideEditorProps<TValue, TSettings> extends Omit<StandardEditorProps<TValue>, 'item'> {
//  item: FieldConfigPropertyItem<TValue, TSettings>;
//  context: FieldOverrideContext;
//}

//export interface FieldOverrideEditorPropsDataGrid<TValue, TSettings> extends FieldOverrideEditorProps<TValue, TSettings> {
//  item: FieldConfigPropertyItem<TValue, TSettings>;
//  context: FieldOverrideContextGrid;
//}

//export interface FieldOverrideContextGrid extends FieldOverrideContext {

//  field?: MyField;
//}

//export interface FieldConfigGrid extends FieldConfig {

//  findMe: string;
//  alarmThresholds: AlarmThreshold[];
//}


export interface AlarmThreshold {
  iconId: number,
  color: string,
  value: number
}

export interface SimpleOptions {
  //alarmthresholds: AlarmThreshold[];
}

export interface AlarmThresholdProps extends PanelProps<SimpleOptions> {
  alarmthresholds: AlarmThreshold[];
}
