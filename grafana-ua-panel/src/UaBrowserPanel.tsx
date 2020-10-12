import React, { PureComponent } from "react";
import { PanelProps } from '@grafana/data';
import { SimpleOptions, OpcUaBrowseResults, QualifiedName } from 'types';
//import { Button } from '@grafana/ui';

//import { css, cx } from 'emotion';
//import { stylesFactory, useTheme } from '@grafana/ui';
import { getLocationSrv } from '@grafana/runtime';
import { getDataSourceSrv } from '@grafana/runtime';
import { DataSourceWithBackend } from '@grafana/runtime';
import { Browser } from './Browser';
import { findDashboard } from './UaDashboardResolver';

interface Props extends PanelProps<SimpleOptions> { }

interface State { selectedNode: OpcUaBrowseResults | null, browsePath: QualifiedName[] | null, dataSource: DataSourceWithBackend | null, selectedDashboard: string | null }

export class UaBrowserPanel extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedNode: null,
      browsePath: null,
      dataSource: null,
      selectedDashboard: null,
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

          //let dashboard = findDashboard(node.nodeId, this.state.dataSource);
          //dashboard.then((dashboardName: string) => getLocationSrv().update({
          //  query: {
          //    'var-InstanceId': dashboardName,
          //  },
          //  partial: true,
          //  replace: true,
          //}));

          //let dashboard2 = findDashboard(node.nodeId, this.state.dataSource);
          //dashboard2.then((dashboardName: string) =>
          //  this.setState({ selectedDashboard: dashboardName }));

          let jsRes = fetch('/api/search?query=Browse%20Ua')
            //.then(res => res.json())
            .then(res => {
              //if (res != null) {
                return res as unknown as string
                //return (res as DashboardData).url;
              //}
              //return "Not found";
            });

          jsRes.then((dashboardName: string) => this.setState({ selectedDashboard: dashboardName }));

        }}>
      </Browser>
        <a href="/d/1VFKB3FGz/my-dashboard">
        <div>Selected Node: {this.state.selectedNode?.displayName}</div>
        <div>Selected Dashboard: {this.state.selectedDashboard}</div>
        </a>
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

 resizeIframe(obj:any) {
  obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
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

