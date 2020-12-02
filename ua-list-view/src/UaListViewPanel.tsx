import React, { PureComponent } from 'react';
import { DataFrame, DataQueryRequest, DataQueryResponse, DateTime, PanelProps, ScopedVars, TimeRange, toUtc } from '@grafana/data';
import { BrowseFilter, NodeClass, NodePath, /*NodeClass,*/ OpcUaBrowseResults, OpcUaNodeInfo, OpcUaQuery, QualifiedName, SimpleOptions } from 'types';
import { DataSourceWithBackend, getDataSourceSrv } from '@grafana/runtime';
import { VariableList } from './components/VariableList';

interface Props extends PanelProps<SimpleOptions> { }

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

  
  browse(parentId: string, browseFilter: BrowseFilter): Promise<OpcUaBrowseResults[]> {
    this.getDataSource();

    if (this.state.dataSource != null) {
      let res = this.state.dataSource.getResource('browse', { nodeId: parentId, nodeClassMask: NodeClass.Variable });
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
    for (let i = 0; i < nodes.length; i++) {
      let bp: QualifiedName[] = [nodes[i].browseName];
      let nodePath: NodePath = {
        node: nodes[i],
        browsePath: bp
      };
      var q: OpcUaQuery = {
        nodePath: nodePath,
        readType: "Subscribe",
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
      intervalMs: 100,
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


  renderChildren() {
    
    if (this.state.instanceId !== null) {
      return <VariableList query={(nodes, handle) => this.doQuery(nodes, handle)} browse={(parent, browseFilter) => this.browse(parent, browseFilter)} parentNode={this.state.instanceId}> </ VariableList>;
    }
    return <></>;
  }


  render() {
    const instanceId = this.props.replaceVariables('$ObjectId');
    if (this.state.instanceId === null || this.state.instanceId.nodeId !== instanceId) {
      this.readNode(instanceId).then((res) => this.setState({ instanceId: res }));
    }
    return this.renderChildren();
  }
}


