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
import { findDashboard, DashboardData, findAllDashboards } from './UaDashboardResolver';
//import { Button } from '@grafana/ui';
import { DashMappingPanel } from './DashMappingPanel';

interface Props extends PanelProps<SimpleOptions> { }

interface State {
  selectedNode: OpcUaBrowseResults | null, browsePath: QualifiedName[] | null,
  dataSource: DataSourceWithBackend | null, selectedDashboard: DashboardData | null,
  dashboards: DashboardData[] | null
}

export class UaBrowserPanel extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedNode: null,
      browsePath: null,
      dataSource: null,
      selectedDashboard: null,
      dashboards: null
    };    
  }

  render() {

    let rootNodeId: OpcUaBrowseResults = {
      nodeId: "i=85", browseName: { name: "Objects", namespaceUrl: "http://opcfoundation.org/UA/" },
      displayName: "Objects", isForward: true, nodeClass: 1
    };

    return <div className="gf-form-inline">
      <Browser closeBrowser={() => { }} closeOnSelect={false}
        browse={a => this.browse(a)}
        ignoreRootNode={true} rootNodeId={rootNodeId}
        onNodeSelectedChanged={(node, browsepath) => {

          this.setState({
            selectedNode: node, browsePath: browsepath
          })

          let dashboard = findDashboard(node.nodeId, this.state.dataSource);
          dashboard.then((dashboards: DashboardData[]) => {

            let selectedDashboard: DashboardData;

            if (dashboards.length > 0) {
              selectedDashboard = dashboards[0];
              //dashboardUrl = dashboards[0].url;
              getLocationSrv().update({

                query: {
                  'var-InstanceId': node.nodeId,
                  'var_SelectedNodeInfo': JSON.stringify(this.state.selectedNode),
                  'var-DashboardUrl': selectedDashboard.url,
                },
                partial: true,
                replace: true,

                })

                this.setState({
                  selectedDashboard: selectedDashboard
                })
              }
          });

        }}>
      </Browser>
      <div>Perspective: </div>
      <DashMappingPanel selectedNode={JSON.stringify(this.state.selectedNode)} selectedDashboard={JSON.stringify(this.state.selectedDashboard)} hidden={!this.props.options.configMode} closeBrowser={() => { }}/>
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


  addDashboardMapping() {

    let dboards = findAllDashboards();
    let res = dboards.then((dashboards: DashboardData[]) => {


      this.setState({
        dashboards: dashboards
      })
    });

    return res;
  }
};

