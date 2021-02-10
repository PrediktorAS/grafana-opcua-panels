import { DashboardData } from './UaDashboardResolver';

type BrowseRoot = 'Objects' | 'Types';

export interface SimpleOptions {

  configMode: boolean;
  root: BrowseRoot;
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

export interface DashboardDataVm extends DashboardData {
  isOpen: boolean;
  dashBoards: DashboardDataVm[] | null;
}

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
