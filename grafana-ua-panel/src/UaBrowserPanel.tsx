import React, { PureComponent } from "react";
import { PanelProps } from '@grafana/data';
import { SimpleOptions, OpcUaBrowseResults, QualifiedName, OpcUaNodeInfo, NodeClass } from 'types';
import { getLocationSrv } from '@grafana/runtime';
import { getDataSourceSrv } from '@grafana/runtime';
import { DataSourceWithBackend } from '@grafana/runtime';
import { Browser } from './Browser';
import { getDashboard, DashboardData, getAllDashboards } from './UaDashboardResolver';
import { DashMappingPanel } from './DashMappingPanel';
import SplitPane from 'react-split-pane';

interface Props extends PanelProps<SimpleOptions> { }

interface State {
  selectedNode: OpcUaBrowseResults | null, selectedNodeType: OpcUaBrowseResults | null,
  browsePath: QualifiedName[] | null,
  dataSource: DataSourceWithBackend | null, mappedDashboard: DashboardData | null,
  dashboards: DashboardData[] | null, interfaces: OpcUaNodeInfo[] | null,
  panelHeight: number,
  browserHeight: string
  dashMappingHeight: string
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
      interfaces: null,
      panelHeight: 0,
      browserHeight: "300px",
      dashMappingHeight: "300px"
    };    
  }


  render() {

    let rootNodeId: OpcUaBrowseResults = this.getRootNodeId();

    if (this.props.height != this.state.panelHeight) {
      //console.log("Panel Height init: " + this.props.height);
      this.setInitHeights();
    }

    const styles = {
      background: '#0B0C0E',
      height: '4px',
      cursor: 'row-resize',
      margin: '0 0px',
      width: '100%',
    };

    if (this.props.options.configMode) {
      return <div className="gf-form-inline" style={{ position: "relative", height: "100%", width: "100%" }}>

        <SplitPane
          split="horizontal"
          minSize={100}
          defaultSize={"50%"}
          resizerStyle={styles}
          onChange={height => this.splitbarChanged(height)}
        >
          <div style={{ height: this.state.browserHeight, width: "100%" }}>
            <Browser closeBrowser={() => { }} closeOnSelect={false}
              browse={a => this.browse(a)}
              ignoreRootNode={true} rootNodeId={rootNodeId}
              onNodeSelectedChanged={(node, browsepath) => this.nodeSelectedChanged(node, browsepath) }>
            </Browser>
          </div>
          <div data-id="Treeview-ScrollDiv" style={{ height: this.state.dashMappingHeight, width: "100%", overflowY: "auto", margin: "5px 0px 0px 0px" }} >
            <DashMappingPanel selectedNode={JSON.stringify(this.state.selectedNode)} selectedNodeType={JSON.stringify(this.state.selectedNodeType)} mappedDashboard={JSON.stringify(this.state.mappedDashboard)}
              hidden={!this.props.options.configMode} dataSource={this.state.dataSource} interfaces={JSON.stringify(this.state.interfaces)} closeBrowser={() => { }} />
          </div>
        </SplitPane>
      </div>;
    }
    else {
      return <div className="gf-form-inline" style={{ position: "relative", height: "100%", width: "100%" }}>

          <div style={{ height: "100%", width: "100%" }}>
            <Browser closeBrowser={() => { }} closeOnSelect={false}
              browse={a => this.browse(a)}
            ignoreRootNode={true} rootNodeId={rootNodeId}
            onNodeSelectedChanged={(node, browsepath) => this.nodeSelectedChanged(node, browsepath) }>
            </Browser>
          </div>
      </div>;
    }
  }

  private nodeSelectedChanged(node: OpcUaBrowseResults, browsepath: QualifiedName[]) {

    console.log("nodeSelectedChanged: " + node?.displayName);
    let browseType = this.browseReferenceTargets(node.nodeId, "i=40");
    browseType.then((browseTypes: OpcUaBrowseResults[]) => {

      if (browseTypes?.length > 0) {

        let selectedNodeType = browseTypes[0];
        this.setState({
          selectedNodeType: selectedNodeType
        });
      }
      else if (this.state.selectedNodeType != null) {
        this.setState({
          selectedNodeType: null
        });
      }
    });

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

      this.setState({
        selectedNode: node, browsePath: browsepath,
        mappedDashboard: mappedDashboard
      });

    });

    if (this.props.options.configMode) {

      let interfaceList = new Array<OpcUaBrowseResults>();

      let hasInterface = "i=17603";
      let hasInterfacePresent = this.isNodePresentAtServer(hasInterface);
      hasInterfacePresent.then((present: boolean) => {

        if (present) {

          console.log("Server supports interfaces");

          let interfaces = this.browseReferenceTargets(node.nodeId, hasInterface);
          interfaces.then((interfaces: OpcUaBrowseResults[]) => {

            for (let i = 0; i < interfaces?.length; i++) {
              interfaceList.push(interfaces[i]);
            }
          });
        }
        else {
          console.warn("Server does not support interfaces");
        }

      });

      let definedByEquipmentClass = "{\"namespaceUrl\":\"http://www.OPCFoundation.org/UA/2013/01/ISA95\",\"id\":\"i=4919\"}";
      let defByEqClass = this.isNodePresentAtServer(definedByEquipmentClass);
      defByEqClass.then((present: boolean) => {

        if (present) {

          console.log("ISA95 is present");
          let eqClasses = this.browseReferenceTargets(node.nodeId, definedByEquipmentClass);
          eqClasses.then((eqClasses: OpcUaBrowseResults[]) => {

            for (let i = 0; i < eqClasses?.length; i++) {
              interfaceList.push(eqClasses[i]);
            }
          });

        }
        else {
          console.log("ISA95 not present");
        }
      });


      this.setState({
        interfaces: interfaceList
      });
    }

  }

  private isNodePresentAtServer(nodeId:string): Promise<boolean> {

    if (this.state.dataSource != null) {

      return this.state.dataSource.getResource('isnodepresent', { nodeId: nodeId })
        .then(res => {

          if (res) {
            let present = res as boolean;
            return present;
          }

          return false;
        });
    }

    return new Promise<boolean>(() => false);
  }

  private getRootNodeId(): OpcUaBrowseResults {

    let browseRoot = this.props.options.root;

    //console.log("browseRoot: " + browseRoot);

    if (browseRoot == 'Objects')
        return {
            nodeId: "i=85", browseName: { name: "Objects", namespaceUrl: "http://opcfoundation.org/UA/" },
            displayName: "Objects", isForward: true, nodeClass: 1
        };

    return {
      nodeId: "i=86", browseName: { name: "Types", namespaceUrl: "http://opcfoundation.org/UA/" },
      displayName: "Types", isForward: true, nodeClass: 1
    };
  }

  splitbarChanged(height: number) {

    const maxHeight = this.props.height;

    //console.log("maxHeight: " + maxHeight + "  height: " + height);

    height -= 5;

    let dashMappingHeight = maxHeight - height - 20;

    this.setState({ panelHeight: maxHeight, browserHeight: height + "px", dashMappingHeight: dashMappingHeight + "px" });

  }

  setInitHeights() {

    const maxHeight = this.props.height;

    let compHeight = maxHeight/2 - 10;

    this.setState({ panelHeight: maxHeight, browserHeight: compHeight + 5 + "px", dashMappingHeight: compHeight - 5 + "px" });
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

      if (this.props.options.root == "Types") {
        let nodeClassMask: NodeClass = NodeClass.ObjectType | NodeClass.Object;

        let res = this.state.dataSource.getResource('browse', { nodeId: parentId, nodeClassMask: nodeClassMask });
        return res;
      }
      else {
        let res = this.state.dataSource.getResource('browse', { nodeId: parentId });
        return res;
      }
    }

    return new Promise<OpcUaBrowseResults[]>(() => [] );
  }

  getNamespaces(): Promise<string[]> {

    if (this.state.dataSource != null) {

      return this.state.dataSource.getResource('getnamespaces')
        .then(res => {

          if (res) {
            let namespaces = res as string[];
            return namespaces;
          }

          return [];
        });
    }

    return new Promise<string[]>(() => []);

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

