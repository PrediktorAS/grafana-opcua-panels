import React, { PureComponent } from "react";
import { PanelProps } from '@grafana/data';
import { SimpleOptions, OpcUaBrowseResults, QualifiedName } from 'types';
//import { Button } from '@grafana/ui';

//import { css, cx } from 'emotion';
//import { stylesFactory, useTheme } from '@grafana/ui';
import { getDataSourceSrv } from '@grafana/runtime';
import { DataSourceWithBackend } from '@grafana/runtime';
import { Browser } from './Browser';

interface Props extends PanelProps<SimpleOptions> { }

interface State { selectedNode: OpcUaBrowseResults | null, browsePath: QualifiedName[] | null, dataSource: DataSourceWithBackend | null }

export class UaBrowserPanel extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedNode: null,
      browsePath: null,
      dataSource: null
    };    
  }

  render() {

    let rootNodeId: OpcUaBrowseResults = { nodeId: "i=85", browseName: { name: "Objects", namespaceUrl: "http://opcfoundation.org/UA/" }, displayName: "Objects", isForward: true, nodeClass: 1 };

    return <div className="gf-form-inline">
      <Browser closeBrowser={() => { }} closeOnSelect={false}
        browse={a => this.browse(a)}
        ignoreRootNode={true} rootNodeId={rootNodeId}
        onNodeSelectedChanged={(node, browsepath) => {
          this.setState({
            selectedNode: node, browsePath: browsepath
          })
        }}>
      </Browser>
      <div>Selected Node: {this.state.selectedNode?.displayName}</div>
    </div>;
  }

  browse(parentId: string): Promise<OpcUaBrowseResults[]> {

    if (this.state.dataSource == null) {
      var datasourceName = this.props.data.request?.targets[0].datasource;
      getDataSourceSrv().get(datasourceName).then((result) => {

        var dataSourceWithBackend: DataSourceWithBackend = result as unknown as DataSourceWithBackend;
        this.setState({ dataSource: dataSourceWithBackend })
      });
    }

    if (this.state.dataSource != null) {

      let res = this.state.dataSource.getResource('browse', { nodeId: parentId });
      return res;
    }

    return new Promise<OpcUaBrowseResults[]>(() => [] );
  }

  //testButton() {

  //  var datasourceName = this.props.data.request?.targets[0].datasource;
  //  getDataSourceSrv().get(datasourceName).then((result) => {

  //    var dataSourceWithBackend: DataSourceWithBackend = result as unknown as DataSourceWithBackend;
  //    var nodeId = "i=85";
  //    dataSourceWithBackend.getResource('browse', { nodeId: nodeId }).then((r: OpcUaBrowseResults[]) => {
  //      this.setState({ s: r[0].displayName });
  //    })
  //  })
  //}

};

