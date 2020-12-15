

type DashboardFetch = 'Instance' | 'ChildrenIfNotInstance' | 'Children';

export interface SimpleOptions {
  dashboardFetch: DashboardFetch;
  maxChildren: number;
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

export class RelativeTime {
  from!: string;
  to!: string;
}
