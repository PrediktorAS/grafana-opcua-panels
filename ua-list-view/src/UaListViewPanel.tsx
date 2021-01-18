import React, { PureComponent } from 'react';
import { DataQueryRequest, DataQueryResponse, DateTime, PanelProps, ScopedVars, TimeRange, toUtc } from '@grafana/data';
import { BrowseFilter, ColumnType, DataFetchType, NodeClass, NodePath, /*NodeClass,*/ OpcUaBrowseResults, OpcUaNodeInfo, OpcUaQuery, QualifiedName, UAListViewOptions } from 'types';
import { DataSourceWithBackend, getDataSourceSrv } from '@grafana/runtime';
import { VariableList } from './components/VariableList';
import { toFormatOptions } from './utils/Number';
import { toDataFetchType } from './utils/DataFetch';

interface Props extends PanelProps<UAListViewOptions> { }

interface State {
  objectId: OpcUaNodeInfo | null,
  fromDate: string | null,
  toDate: string | null,
  dataSource: DataSourceWithBackend | null,
  refreshRate: number,
}


export class UaListViewPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      objectId: null,
      fromDate: null,
      toDate: null,
      dataSource: null,
      refreshRate: 0,
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
    if (this.state.dataSource != null && nodeId != null && nodeId.length > 0) {
      return this.state.dataSource.getResource('readNode', { nodeId: nodeId }).catch(e => {
        console.error("readNode failed: " + e);
      });
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

    let readType = toDataFetchType(this.props.options.dataFetch) == DataFetchType.Subscribe ? "Subscribe" : "ReadNode";

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

  doQuery(nodes: OpcUaNodeInfo[], handleQueryResult: (response: DataQueryResponse) => void) {

    if (this.state.dataSource != null) {
      let req = this.getQueryRequest(nodes);
      this.state.dataSource.query(req).toPromise().then((res) => {

        //if (res?.error != null) {
        //  console.error("doQuery failed: " + res.error?.message);
        //}

        handleQueryResult(res);

      }).catch(e => { console.error("doQuery: " + e); });
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

  private getRefresh(urlParams: URLSearchParams) {

    var refreshValue = urlParams.get('refresh');
    if (refreshValue != null) {

      let value = parseInt(refreshValue.substring(0, refreshValue.length - 1));

      if (refreshValue.endsWith('s')) {
        return value;
      }
      else if (refreshValue.endsWith('m')) {
        return value * 60;
      }
      else if (refreshValue.endsWith('h')) {
        return value * 3600;
      }
      else if (refreshValue.endsWith('d')) {
        return value * 3600 * 24;
      }
      else if (refreshValue.endsWith('w')) {
        return value * 3600 * 24 * 7;
      }
      else {
        console.error("Unable to parse refresh-rate: " + refreshValue);
      }

    }

    return 0;
  }

  private getRefreshRate() {
    return this.state.refreshRate;
  }

  renderChildren() {
    
    if (this.state.objectId !== null) {
      let columnType = this.getColumnType();
      return <VariableList refreshRate={() => this.getRefreshRate()}
        decimalPoints={this.props.options.decimalPrecision}
        numberFormat={toFormatOptions(this.props.options.numberFormat)}
        maxResults={this.props.options.maxElementsList}
        showAllVariablesToDepth={this.props.options.showAllVariablesToDepth}
        depth={this.props.options.browseDepth}
        columns={columnType}
        headerFontSize={this.props.options.headerFontSize}
        bodyFontSize={this.props.options.bodyFontSize}
        query={(nodes, handle) => this.doQuery(nodes, handle)}
        browse={(parent, nodeClass, browseFilter) => this.browse(parent, nodeClass, browseFilter)}
        parentNode={this.state.objectId}> </ VariableList>;
    }
    return <></>;
  }

  render() {
    const objectId = this.props.replaceVariables('$ObjectId');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    let refresh = this.getRefresh(urlParams);

    if (this.state.refreshRate != refresh) {
      this.setState({ refreshRate: refresh })
    }

    if (this.state.objectId === null || this.state.objectId.nodeId !== objectId && objectId !== null && objectId.length > 0) {
      this.readNode(objectId).then((res) => this.setState({ objectId: res }));
    }
    return this.renderChildren();
  }
}


