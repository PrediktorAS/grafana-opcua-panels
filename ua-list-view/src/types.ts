import { DataQuery } from '@grafana/data';

export enum NodeClass {
  Unspecified = 0,
  Object = 1,
  Variable = 2,
  Method = 4,
  ObjectType = 8,
  VariableType = 16,
  ReferenceType = 32,
  DataType = 64,
  View = 128,
}

export enum ColumnType {
  Unspecified = 0,
  DisplayNamePath = 1,
  BrowseName = 2,
  NodeClass = 4,
  Value = 8,
  Time = 16,
}

export interface OpcUaQuery extends DataQuery {
  useTemplate: boolean;
  templateVariable: string;
  nodePath: NodePath;
  relativePath: QualifiedName[];
  alias: string;
  readType: string;
  aggregate: OpcUaNodeDefinition;
  interval: string;
  eventQuery: EventQuery;
}

export interface EventQuery {
  eventTypeNodeId: string;
  eventTypes: string[];
  eventColumns: EventColumn[];
  eventFilters: EventFilterSer[];
}

export interface EventColumn {
  browsePath: QualifiedName[];
  alias: string;
}


export interface EventFilterSer {
  oper: FilterOperator;
  operands: FilterOperandSer[];
}

export enum FilterOperator {
  Equals = 0,
  IsNull = 1,
  GreaterThan = 2,
  LessThan = 3,
  GreaterThanOrEqual = 4,
  LessThanOrEqual = 5,
  Like = 6,
  Not = 7,
  Between = 8,
  InList = 9,
  And = 10,
  Or = 11,
  Cast = 12,
  InView = 13,
  OfType = 14,
  RelatedTo = 15,
  BitwiseAnd = 16,
  BitwiseOr = 17,
}

export interface FilterOperandSer {
  type: FilterOperandEnum;
  value: string;
}

export enum FilterOperandEnum {
  Literal = 1,
  Element = 2,
  Attribute = 3,
  SimpleAttribute = 4,
}

export interface NodePath {
  node: OpcUaNodeInfo;
  browsePath: QualifiedName[];
}

export interface OpcUaNodeDefinition {
  name: string;
  nodeId: string;
}


export interface BrowseFilter {
  maxResults: number;
  browseName: string;
}

export interface UAListViewOptions {
  maxElementsList: number;
  displayBrowseName: boolean;
  displayNodeClass: boolean;
}


export interface QualifiedName {
  namespaceUrl: string;
  name: string;
}

export interface OpcUaNodeInfo {
  displayName: string;
  browseName: QualifiedName;
  nodeId: string;
  nodeClass: number;
}

export interface OpcUaBrowseResults extends OpcUaNodeInfo {
  isForward: boolean;
}

export interface UaDashboardInfo {
  name: string;
  dashKeys: string[];
}

export interface UaResult {
  success: boolean;
  error: string;
}

export interface InterfaceNodeInfo {
  displayName: string;
  browseName: QualifiedName;
  nodeId: string;
  selected: boolean;
}

export interface DashboardData {
  id: string
  url: string
  title: string
  type: string
  folderId: string
  dashKeys: string[]
}

export interface DashboardDataVm extends DashboardData {
  isOpen: boolean;
  dashBoards: DashboardDataVm[] | null;
}
