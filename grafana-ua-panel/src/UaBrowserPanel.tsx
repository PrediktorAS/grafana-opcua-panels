import React, { PureComponent } from "react";
import { PanelProps } from '@grafana/data';
import { SimpleOptions, OpcUaBrowseResults, QualifiedName, OpcUaNodeInfo } from 'types';
//import { Button } from '@grafana/ui';

//import { css, cx } from 'emotion';
//import { stylesFactory, useTheme } from '@grafana/ui';
import { getLocationSrv } from '@grafana/runtime';
import { getDataSourceSrv } from '@grafana/runtime';
import { DataSourceWithBackend } from '@grafana/runtime';
import { Browser } from './Browser';
import { getDashboard, DashboardData, getAllDashboards } from './UaDashboardResolver';
//import { Button } from '@grafana/ui';
import { DashMappingPanel } from './DashMappingPanel';

interface Props extends PanelProps<SimpleOptions> { }

interface State {
  selectedNode: OpcUaBrowseResults | null, selectedNodeType: OpcUaBrowseResults | null,
  browsePath: QualifiedName[] | null,
  dataSource: DataSourceWithBackend | null, mappedDashboard: DashboardData | null,
  dashboards: DashboardData[] | null, interfaces: OpcUaNodeInfo[] | null
}

export class UaBrowserPanel extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedNode: null,
      selectedNodeType: null,
      browsePath: null,
      dataSource: null,
      mappedDashboard: null,
      dashboards: null,
      interfaces: null
    };    
  }

  render() {

    let rootNodeId: OpcUaBrowseResults = {
      nodeId: "i=85", browseName: { name: "Objects", namespaceUrl: "http://opcfoundation.org/UA/" },
      displayName: "Objects", isForward: true, nodeClass: 1
    };

    return <div className="gf-form-inline" >

      <table style={{ width:"100%"}}>
        <tr>
          <td style={{ height:"50%" }}>
            <Browser closeBrowser={() => { }} closeOnSelect={false}
              browse={a => this.browse(a)}
              ignoreRootNode={true} rootNodeId={rootNodeId}
              onNodeSelectedChanged={(node, browsepath) => {

                let browseType = this.browseReferenceTargets(node.nodeId, "i=40");
                browseType.then((browseTypes: OpcUaBrowseResults[]) => {

                  if (browseTypes?.length > 0) {

                    let selectedNodeType = browseTypes[0];
                    this.setState({
                      selectedNodeType: selectedNodeType
                    });
                  }
                });


                //this.setState({
                //  selectedNode: node, browsePath: browsepath
                //});

                let dashboard = getDashboard(node.nodeId, this.state.dataSource);
                dashboard.then((mappedDashboard: DashboardData | null) => {

                  console.info("mappedDashboard?.title: " + mappedDashboard?.title);
                  console.info("mappedDashboard?.dashKeys?.length: " + mappedDashboard?.dashKeys?.length);
                  console.info("mappedDashboard?.url: " + mappedDashboard?.url);

                  getLocationSrv()?.update({

                    query: {
                      'var-InstanceDisplayName': node.displayName,
                      'var-InstanceId': node.nodeId,
                      'var-DashboardUrl': mappedDashboard?.url,
                    },
                    partial: true,
                    replace: true,

                  });

                  //console.info("setState mappedDashboard: " + mappedDashboard);

                  this.setState({
                    selectedNode: node, browsePath: browsepath,
                    mappedDashboard: mappedDashboard
                  });

                });

                if (this.props.options.configMode) {

                  let interfaceList = new Array<OpcUaBrowseResults>();

                  let hasInterface = "i=17603";
                  let interfaces = this.browseReferenceTargets(node.nodeId, hasInterface);
                  interfaces.then((interfaces: OpcUaBrowseResults[]) => {

                    for (let i = 0; i < interfaces?.length; i++) {
                      interfaceList.push(interfaces[i]);
                    }
                  })

                  let definedByEquipmentClass = "{\"namespaceUrl\":\"http://www.OPCFoundation.org/UA/2013/01/ISA95\",\"id\":\"i=4919\"}";
                  let eqClasses = this.browseReferenceTargets(node.nodeId, definedByEquipmentClass);
                  eqClasses.then((eqClasses: OpcUaBrowseResults[]) => {

                    for (let i = 0; i < eqClasses?.length; i++) {
                      interfaceList.push(eqClasses[i]);
                    }
                  })

                  this.setState({
                    interfaces: interfaceList
                  });
                }

              }}>
            </Browser>
           </td>
        </tr>
        <div style={{ margin: "0px 0px 10px 0px" }}></div>
        <tr style={{ height: "50%"}}>
          <td>
            <DashMappingPanel selectedNode={JSON.stringify(this.state.selectedNode)} selectedNodeType={JSON.stringify(this.state.selectedNodeType)} mappedDashboard={JSON.stringify(this.state.mappedDashboard)}
              hidden={!this.props.options.configMode} dataSource={this.state.dataSource} interfaces={JSON.stringify(this.state.interfaces)} closeBrowser={() => { }} />
          </td>
        </tr>
      </table>

     
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

  browseReferenceTargets(nodeId: string, referenceId: string): Promise<OpcUaBrowseResults[]> {

    if (this.state.dataSource != null) {

      return this.state.dataSource.getResource('browsereferencetargets', { nodeId: nodeId, referenceId: referenceId })
      .then(res => {

        if (res) {
          let interfaces = res as OpcUaBrowseResults[];
          return interfaces;
        }

        return [];
      });
    }

    return new Promise<OpcUaBrowseResults[]>(() => []);
  }


  resizeIframe(obj:any) {
    obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
  }


  addDashboardMapping() {

    let dboards = getAllDashboards();
    let res = dboards.then((dashboards: DashboardData[]) => {


      this.setState({
        dashboards: dashboards
      })
    });

    return res;
  }
};

