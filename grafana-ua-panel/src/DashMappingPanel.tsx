
import React, { Component } from "react";
//import Select from 'react-select';
import { /*Select,*/ Checkbox, Input, Button } from '@grafana/ui';;
//import { convertRemToPixels } from './ConvertRemToPixels';
import { ThemeGetter } from './ThemesGetter';
import { GrafanaTheme } from '@grafana/data';
import { DashboardData, getAllDashboards, addDashboardMapping } from './UaDashboardResolver';
import { OpcUaBrowseResults, InterfaceNodeInfo } from './types';
import { DataSourceWithBackend } from '@grafana/runtime';
//import { Input } from '@grafana/ui';


type Props = {
  closeBrowser: () => void;
  hidden: boolean;
  selectedNode: string;
  selectedNodeType: string;
  mappedDashboard: string;
  dataSource: DataSourceWithBackend | null;
  interfaces: string;
};

type State = {
  theme: GrafanaTheme | null;
  typedefinitionChecked: boolean;
  selectedPerspective: string | null | undefined;
  dashboards: DashboardData[] | null;
  selectedNode: OpcUaBrowseResults | null;
  selectedNodeType: OpcUaBrowseResults | null;
  typedefinitionCheckedChanged: boolean;
  selectedDashFolder: DashboardData | null;
  selectedDash: DashboardData | null;
  mappedDashboard: DashboardData | null;
  mappedDashboardChanged: boolean;
  interfaces: InterfaceNodeInfo[] | null;
}

const generalFolder: DashboardData = { id: "", title: "General", folderId: "", type: "dash-folder", url: "", dashKeys: [] };

/**
 * Mapping of UA instance/type to dashboard.
 */
export class DashMappingPanel extends Component<Props, State> {
	/**
	 *
	 * @param {*} props sets the data structure
	 */
	constructor(props: Props) {
    super(props);

    this.state = {
      theme: null,
      typedefinitionChecked: true,
      typedefinitionCheckedChanged: false,
      selectedPerspective: "General",
      dashboards: null,
      selectedNode: null,
      selectedNodeType: null,
      selectedDashFolder: generalFolder,
      selectedDash: null,
      mappedDashboard: null,
      mappedDashboardChanged: false,
      interfaces: null,
		}
	}

	onTheme = (theme: GrafanaTheme) => {
		if (this.state.theme == null && theme != null) {
			this.setState({ theme: theme });
		}
	}

	/**
	 * Renders the component.
	 */
  render() {

    //console.log("DashMappingPanel start");
    let selectedNode = JSON.parse(this.props.selectedNode) as OpcUaBrowseResults;
    let selectedNodeType = JSON.parse(this.props.selectedNodeType) as OpcUaBrowseResults;
    let mappedDashboard = JSON.parse(this.props.mappedDashboard) as DashboardData;
    let interfaces = JSON.parse(this.props.interfaces) as OpcUaBrowseResults[];
    let mappedDashboardTitle = this.state.mappedDashboard == null ? "" : this.state.mappedDashboard.title;

    let selectionChanged = this.hasSelectionChanged(selectedNode);
    if (selectionChanged) {
      //alert("selectionChanged");
      this.setState({ typedefinitionChecked: true, typedefinitionCheckedChanged: false });
    }

    this.setupSelectedNodeType(selectedNodeType, mappedDashboard);
    this.setupInterfaces(interfaces, mappedDashboard);
    this.setupCurrentMapping(selectedNode, mappedDashboard);
    this.setupDashboards();

    const dashFolders = [
      generalFolder
    ]

    var counter = 1;
    for (var i = 0; this.state.dashboards != null && i < this.state.dashboards.length; i++) {
      if (this.state.dashboards[i].type == "dash-folder")
        dashFolders[counter++] = this.state.dashboards[i];
    }

    const dashboardsInFolder = [];
    counter = 0;
    for (var i = 0; this.state.dashboards != null && i < this.state.dashboards.length; i++) {
      if (this.state.dashboards[i].type != "dash-folder") {

        if (this.state.selectedDashFolder != null) {

          if (this.state.dashboards[i].folderId == this.state.selectedDashFolder?.id || (this.state.selectedDashFolder?.id == "" && this.state.dashboards[i].folderId == null))
            dashboardsInFolder[counter++] = this.state.dashboards[i];
        }
        else {
          if (this.state.dashboards[i].folderId == null)
            dashboardsInFolder[counter++] = this.state.dashboards[i];
        }
      }
    }

    if (!this.props.hidden) {

      let bg: string = "";
      if (this.state.theme != null) {
        bg = this.state.theme.colors.bg2;
      }

      let interfaceText = interfaces?.length > 0 ? <div>Interfaces:</div> : "";

      console.info("Pre render: this.state.typedefinitionChecked: " + this.state.typedefinitionChecked);

      return (
        <div style={{
          background: bg,
          height: "100%",
          width: "100%"
        }}>
          <ThemeGetter onTheme={this.onTheme} />
          <h2>Dashboard mapping</h2>

          <table style={{ width: "100%"}}>
            <tr >
              <th>Selected instance</th>
              <th>Mapped to Dashboard</th>
            </tr>
            <tr >
              <td><Input style={{ margin: "15px" }} css={""} type="text" value={selectedNode?.displayName + " [" + selectedNodeType?.displayName + "]"} readOnly={true} /></td>
              <td><Input css={""} type="text" value={mappedDashboardTitle} readOnly={true} /></td>
            </tr>
            <tr>
              <td>
                <Checkbox css={""} value={this.state.typedefinitionChecked} label={"Apply to Typedefinition"} onChange={() => {

                  console.info("Apply: this.state.typedefinitionChecked: " + !this.state.typedefinitionChecked);

                  this.setState({ typedefinitionChecked: !this.state.typedefinitionChecked, typedefinitionCheckedChanged: true });
                }}></Checkbox>
              </td>
              <td>
              </td>
            </tr>
            
            {interfaceText}
            {this.state.interfaces?.map(iface => (
              <tr>
                <td>
                  <Checkbox css={""} value={iface.selected} label={iface.displayName} onChange={() => {
                    iface.selected = !iface.selected;
                    this.setState({ interfaces: this.state.interfaces });
                  }}></Checkbox>
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ verticalAlign: "top" }}>
                <table style={{ width: "50%"}}>
                  <tr >
                    <th>Folders</th>
                  </tr>
                  {dashFolders?.map(dBoard => (
                    <tr>
                      <td>
                        <Checkbox css={""} value={this.state.selectedDashFolder?.id == dBoard.id} label={dBoard.title} onChange={() => this.setState({ selectedDashFolder: dBoard })}></Checkbox>
                      </td>
                    </tr>
                  ))}

                </table>
              </td>
              <td style={{ verticalAlign: "top" }}>
                <table style={{ width: "50%"}}>
                  <tr >
                    <th>Dashboards</th>
                  </tr>
                  {dashboardsInFolder?.map(dBoard => (
                    <tr>
                      <td>
                        <Checkbox css={""} value={this.state.selectedDash?.id == dBoard.id} label={dBoard.title} onChange={() => this.setState({ selectedDash: dBoard })}></Checkbox>

                      </td>
                    </tr>
                  ))}
                </table>
              </td>
            </tr>
            <tr >
              <td></td>
              <td style={{ textAlign: "right", padding: "5px" }} ><Button disabled={this.isApplyButtonDisabled()} contentEditable={false} onClick={() => this.applyDashboardMapping(selectedNode, selectedNodeType, mappedDashboard)}>Apply Mapping</Button></td>
            </tr>
          </table>
          
        </div>
      );
    }
    else {
      return (<div style={{
        height: "0%",
        width: "0%"
      }}></div>

      );
    }
  }

  private setupSelectedNodeType(selectedNodeType: OpcUaBrowseResults, mappedDashboard: DashboardData) {

    if (selectedNodeType != null && mappedDashboard != null && !this.state.typedefinitionCheckedChanged) {

      let isTypeSelected: boolean = false;
      for (let i = 0; i < mappedDashboard?.dashKeys.length; i++) {
        if (selectedNodeType.nodeId == mappedDashboard.dashKeys[i]) {
          isTypeSelected = true;
          break;
        }
      }

      if (isTypeSelected != this.state.typedefinitionChecked) {

        console.info("setupSelectedNodeType: this.state.typedefinitionChecked: " + this.state.typedefinitionChecked + " => " + isTypeSelected);

        this.setState({ typedefinitionChecked: isTypeSelected });
      }
    }
  }

  private hasSelectionChanged(selectedNode: OpcUaBrowseResults): boolean {

    let currentNode = this.state.selectedNode;

    if (!(selectedNode == null && currentNode == null)) {

      if ((selectedNode == null && currentNode != null) || (selectedNode != null && currentNode == null))
        return true;

      return selectedNode.nodeId != currentNode?.nodeId;
    }

    return false;

  }

  private isApplyButtonDisabled(): boolean {

    if (this.state.selectedDash?.id != this.state.mappedDashboard?.id)
      return false;

    if (this.state.typedefinitionCheckedChanged)
      return false;

    return true;
  }

  private setupCurrentMapping(selectedNode: OpcUaBrowseResults, mappedDashboard: DashboardData) {

    if (selectedNode != null && selectedNode.nodeId != this.state.selectedNode?.nodeId) {
        this.setState({
            selectedNode: selectedNode,
            mappedDashboard: null,
            mappedDashboardChanged: false
        });
    }

    //console.log("mappedDashboard: " + mappedDashboard + "  this.state.mappedDashboard: " + this.state.mappedDashboard);

    if (mappedDashboard != null) {

      if (!this.state.mappedDashboardChanged && this.state.mappedDashboard?.id != mappedDashboard.id) {
        this.setState({
          mappedDashboard: mappedDashboard,
          selectedDash: mappedDashboard
        });
      }
    }
    else if (this.state.mappedDashboard != null) {
      this.setState({
        mappedDashboard: null,
        mappedDashboardChanged: false
      });
    }

  }

  private setupDashboards() {

    if (this.state.dashboards == null) {
      let dboards = getAllDashboards();
      let res = dboards.then((dashboards: DashboardData[]) => {

        this.setState({
          dashboards: dashboards
        })
      });

      return res;
    }

    return null;
  }

  private applyDashboardMapping(selectedNode: OpcUaBrowseResults, selectedNodeType: OpcUaBrowseResults, existingDashboard: DashboardData) {

    if (this.props.dataSource != null && this.state.selectedDash != null) {

      let selectedInterfaces = this.state.interfaces?.filter(x => x.selected);
      let interfaces = new Array<string>();

      for (let i = 0; selectedInterfaces != null && i < selectedInterfaces?.length; i++) {
        interfaces.push(selectedInterfaces[i].nodeId);
      }

      addDashboardMapping(selectedNode.nodeId, selectedNodeType.nodeId, this.state.typedefinitionChecked, interfaces, this.state.selectedDash?.title, existingDashboard?.title, this.props.dataSource)
        .then((success: boolean) => {
          if (success) {

            this.setState({

              mappedDashboardChanged: true,
              mappedDashboard: this.state.selectedDash
            });
          }

        })
    }
  }

  private setupInterfaces(iFaces: OpcUaBrowseResults[], mappedDashboard: DashboardData) {

    let converted = this.convertInterfaces(iFaces);

    if (converted != null) {
      if (converted.length != this.state.interfaces?.length) {

        this.setupInterfaceSelection(converted, mappedDashboard);

        this.setState({
          interfaces: converted
        });
      }
      else {
        let updateState = false;
        for (let i = 0; i < iFaces?.length; i++) {

          if (converted[i].nodeId != iFaces[i].nodeId) {
            updateState = true;
            break;
          }
        }

        if (updateState) {

          this.setupInterfaceSelection(converted, mappedDashboard);

          this.setState({
            interfaces: converted
          });
        }
      }
    }
  }

  private setupInterfaceSelection(iFaces: InterfaceNodeInfo[], mappedDashboard: DashboardData) {

    if (mappedDashboard !== null) {
      for (let i = 0; i < iFaces?.length; i++) {
        let iFace = iFaces[i];
        for (let j = 0; j < mappedDashboard.dashKeys?.length; j++) {
          if (iFace.nodeId === mappedDashboard.dashKeys[j]) {
            iFace.selected = true;
            break;
          }
        }
      }
    }
  }

  private convertInterfaces(iFaces: OpcUaBrowseResults[]): InterfaceNodeInfo[] {

    let interfaceNodeInfos = new Array<InterfaceNodeInfo>();

    for (let i = 0; i < iFaces?.length; i++) {
      let entry: InterfaceNodeInfo = { browseName: iFaces[i].browseName, displayName: iFaces[i].displayName, nodeId: iFaces[i].nodeId, selected: false };
      interfaceNodeInfos.push(entry);
    }

    return interfaceNodeInfos;
  }
}

