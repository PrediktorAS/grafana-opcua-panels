import React, { PureComponent } from 'react';
import { DataFrame, DataQueryRequest, DataQueryResponse, DateTime, PanelProps, ScopedVars, TimeRange, toUtc } from '@grafana/data';
import { BrowseFilter, ColumnType, DataFetchType, NodeClass, NodePath, /*NodeClass,*/ OpcUaBrowseResults, OpcUaNodeInfo, OpcUaQuery, QualifiedName, UAListViewOptions } from 'types';
import { DataSourceWithBackend, getDataSourceSrv } from '@grafana/runtime';
import { VariableList } from './components/VariableList';

interface Props extends PanelProps<UAListViewOptions> { }

interface State {
  instanceId: OpcUaNodeInfo | null,
  fromDate: string | null,
  toDate: string | null,
  dataSource: DataSourceWithBackend | null,
}


export class UaListViewPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      instanceId: null,
      fromDate: null,
      toDate: null,
      dataSource: null,
    };
  }

  
  browse(parentId: string, nodeClassMask: NodeClass, browseFilter: BrowseFilter): Promise<OpcUaBrowseResults[]> {
    this.getDataSource();

    if (this.state.dataSource != null) {
      let res = this.state.dataSource.getResource('browse', { nodeId: parentId, nodeClassMask: nodeClassMask });
      return res;
    }
    return new Promise<OpcUaBrowseResults[]>(() => []);
  }



  readNode(nodeId: string): Promise<OpcUaNodeInfo> {
    this.getDataSource();
    if (this.state.dataSource != null) {
      return this.state.dataSource.getResource('readNode', { nodeId: nodeId });
    }
    return new Promise<OpcUaNodeInfo>(() => null);
  }

  getDataSource() {
    if (this.state.dataSource == null) {
      var datasourceName = this.props.data.request?.targets[0].datasource;

      getDataSourceSrv().get(datasourceName).then((result) => {
        var dataSourceWithBackend: DataSourceWithBackend = result as unknown as DataSourceWithBackend;
        this.setState({ dataSource: dataSourceWithBackend })
      });
    }
  }


  getQueryRequest(nodes: OpcUaNodeInfo[]): DataQueryRequest<OpcUaQuery> {
    let queries: OpcUaQuery[] = [];

    let readType = this.props.options.dataFetch == DataFetchType.Subscribe ? "Subscribe" : "ReadNode";

    for (let i = 0; i < nodes.length; i++) {
      let bp: QualifiedName[] = [nodes[i].browseName];
      let nodePath: NodePath = {
        node: nodes[i],
        browsePath: bp
      };
      var q: OpcUaQuery = {
        nodePath: nodePath,
        readType: readType,
        useTemplate: false,
        aggregate: { name: "", nodeId: "" },
        alias: "",
        templateVariable: "",
        relativePath: [],
        interval: "0",
        eventQuery: { eventColumns: [], eventFilters: [], eventTypeNodeId: "", eventTypes: [] },
        refId: i.toString()
      };
      queries.push(q);
    }

    let from: DateTime = toUtc();
    let to: DateTime = toUtc();
    let range: TimeRange =
    {
      from: from, to: to, raw: { to: to, from: from } 
    };
    let sv: ScopedVars = {};
    let app: string = "testapp";
    let req: DataQueryRequest<OpcUaQuery> = {
      requestId: "test",
      interval: "10",
      intervalMs: 1000,
      range: range,
      scopedVars: sv,
      targets: queries,
      timezone: "",
      app: app,
      startTime: 1023,
      //endTime?: number,
    }
    return req;
  }

  handleQueryResponse(response: DataQueryResponse): void{
    for (let i = 0; i < response.data.length; i++) {
      let df = response.data[i] as DataFrame;
      let v = df.fields[1].values.get(0);
      console.log("value: " + v);
    }
  }



  doQuery(nodes: OpcUaNodeInfo[], handleQueryResult: (response: DataQueryResponse) => void) {
    if (this.state.dataSource != null) {
      let req = this.getQueryRequest(nodes);
      this.state.dataSource.query(req).toPromise().then((res) => handleQueryResult(res));
    }
  }

  getColumnType(): ColumnType {
    let c: ColumnType = ColumnType.DisplayNamePath | ColumnType.Value | ColumnType.Time;
    if (this.props.options.displayBrowseName) {
      c |= ColumnType.BrowseName;
    }
    if (this.props.options.displayNodeClass) {
      c |= ColumnType.NodeClass;
    }
    return c;
  }


  renderChildren() {
    
    if (this.state.instanceId !== null) {
      let columnType = this.getColumnType();
      return <VariableList refreshRate={this.props.options.refreshRate}
        showAllVariablesToDepth={this.props.options.showAllVariablesToDepth}
        depth={this.props.options.browseDepth}
        columns={columnType}
        query={(nodes, handle) => this.doQuery(nodes, handle)}
        browse={(parent, nodeClass, browseFilter) => this.browse(parent, nodeClass, browseFilter)}
        parentNode={this.state.instanceId}> </ VariableList>;
    }
    return <></>;
  }

  // Refresh-rate

  render() {
    const instanceId = this.props.replaceVariables('$ObjectId');
    if (this.state.instanceId === null || this.state.instanceId.nodeId !== instanceId && instanceId !== '') {
      this.readNode(instanceId).then((res) => this.setState({ instanceId: res }));
    }
    return this.renderChildren();
  }
}


