
type SeriesSize = 'sm' | 'md' | 'lg';
type CircleColor = 'red' | 'green' | 'blue';

export interface SimpleOptions {
  text: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  color: CircleColor;
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

