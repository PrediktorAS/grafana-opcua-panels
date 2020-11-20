
import React, { Component } from "react";
//import Select from 'react-select';
import { /*Select,*/ Checkbox/*, Input*/, Button, Collapse } from '@grafana/ui';;
//import { convertRemToPixels } from './ConvertRemToPixels';
import { ThemeGetter } from './ThemesGetter';
import { GrafanaTheme } from '@grafana/data';
import { DashboardData, getAllDashboards, addDashboardMapping } from './UaDashboardResolver';
import { OpcUaBrowseResults, InterfaceNodeInfo, DashboardDataVm } from './types';
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
  instanceChecked: boolean;
  typedefinitionChecked: boolean;
  selectedPerspective: string | null | undefined;
  folderboards: DashboardDataVm[] | null;
  selectedNode: OpcUaBrowseResults | null;
  selectedNodeType: OpcUaBrowseResults | null;
  typedefinitionCheckedChanged: boolean;
  selectedDashFolder: DashboardData | null;
  selectedDash: DashboardData | null;
  mappedDashboard: DashboardData | null;
  mappedDashboardChanged: boolean;
  interfaces: InterfaceNodeInfo[] | null;
}

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
      instanceChecked: false,
      typedefinitionChecked: true,
      typedefinitionCheckedChanged: false,
      selectedPerspective: "General",
      folderboards: null,
      selectedNode: null,
      selectedNodeType: null,
      selectedDashFolder: null,
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

    console.log("this.props.selectedNode: " + this.props.selectedNode);
    let selectedNode = JSON.parse(this.props.selectedNode) as OpcUaBrowseResults;
    let selectedNodeType = JSON.parse(this.props.selectedNodeType) as OpcUaBrowseResults;
    let mappedDashboard = JSON.parse(this.props.mappedDashboard) as DashboardData;
    let interfaces = JSON.parse(this.props.interfaces) as OpcUaBrowseResults[];

    let selectedNodeDisplayName: string = " ";
    if (selectedNode != null) {
      selectedNodeDisplayName = selectedNode.displayName;
    }
    let selectedNodeTypeDisplayName: string = " ";
    if (selectedNode != null) {
      selectedNodeTypeDisplayName = selectedNodeType.displayName;
    }

    let selectionChanged = this.hasSelectionChanged(selectedNode);
    if (selectionChanged) {
      this.setState({ typedefinitionChecked: true, typedefinitionCheckedChanged: false, instanceChecked: false });
    }

    this.setupSelectedNodeType(selectedNodeType, mappedDashboard);
    this.setupInterfaces(interfaces, mappedDashboard);
    this.setupCurrentMapping(selectedNode, mappedDashboard);
    this.setupDashboards(selectionChanged, mappedDashboard);

    if (!this.props.hidden) {

      let bg: string = "";
      if (this.state.theme != null) {
        bg = this.state.theme.colors.bg2;
      }

      let interfaceText = interfaces?.length > 0 ? <div>Interfaces</div> : "";

      //console.info("Pre render: this.state.typedefinitionChecked: " + this.state.typedefinitionChecked);

      return (
        <div style={{
          background: bg,
          height: "100%",
          width: "100%",
          margin: "0px 0px 0px 0px"
        }}>
          <ThemeGetter onTheme={this.onTheme} />
          
          <h2 style={{ margin: "0px 0px 5px 3px"}}>Dashboard mapping</h2>

          <h5 style={{ color: "#2572F2", margin: "0px 0px 3px 5px" }}>Map from instance, type, interfaces</h5>
          <table style={{ width: "100%"}}>

            <tr>
              <td>
                <div style={{ background: "#141619", margin: "0px 5px 10px 5px", borderRadius: "3px" }}>
                  <div style={{ margin: "0px 0px 0px 5px" }}>
                    <table style={{ width: "100%" }}>
                      <tr>
                        <td style={{ verticalAlign: "top" }}>
                          Instance
                          <div>
                            <Checkbox css={""} value={this.state.instanceChecked} label={selectedNodeDisplayName} onChange={() => {

                            if (!this.state.instanceChecked && this.state.typedefinitionChecked)
                              this.setState({ instanceChecked: !this.state.instanceChecked, typedefinitionChecked: false, typedefinitionCheckedChanged: true });
                            else
                              this.setState({ instanceChecked: !this.state.instanceChecked });

                            }}>
                            </Checkbox>
                          </div>
                          Type
                          <div>
                            <Checkbox css={""} value={this.state.typedefinitionChecked} label={selectedNodeTypeDisplayName} onChange={() => {

                              //console.info("Apply: this.state.typedefinitionChecked: " + !this.state.typedefinitionChecked);

                              if (!this.state.typedefinitionChecked && this.state.instanceChecked)
                                this.setState({ typedefinitionChecked: !this.state.typedefinitionChecked, typedefinitionCheckedChanged: true, instanceChecked: false });
                              else
                                this.setState({ typedefinitionChecked: !this.state.typedefinitionChecked, typedefinitionCheckedChanged: true });
                            }}></Checkbox>
                          </div>
                        </td>
                        <td style={{ verticalAlign: "top" }}>
                          {interfaceText}
                          {this.state.interfaces?.map(iface => (
                            <tr>
                              <td></td>
                              <td>
                                <Checkbox css={""} value={iface.selected} label={iface.displayName} onChange={() => {
                                  iface.selected = !iface.selected;
                                  this.setState({ interfaces: this.state.interfaces });
                                }}></Checkbox>
                              </td>
                            </tr>
                          ))}
                        </td>
                      </tr>
                    </table>
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td>
                <h5 style={{ color: "#2572F2", margin: "0px 0px 3px 5px" }}>Map to dashboard</h5>
                {this.state.folderboards?.map(dFolder => (

                  <div style={{ background: "#141619", margin: "0px 5px 10px 5px" }}>
                    <Collapse collapsible label={dFolder.title} isOpen={dFolder.isOpen}
                      onToggle={() => this.toggleFolderDashOpen(dFolder.id)} >
                      {
                        dFolder.dashBoards?.map(dBoard => (
                          <p style={{ margin: "0px 0px 5px 25px", height: "35px" }} >
                            <div style={{ background: "#25272B", height: "35px", borderRadius: "3px" }} >
                              <table>
                                <tr>
                                  <td>
                                    <div style={{ height: "7px" }} > </div>
                                  </td>
                                  <td>
                                    <div style={{ height: "7px" }} > </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td>
                                    <div style={{ width: "7px" }} > </div>
                                  </td>
                                  <td>
                                    <Checkbox style={{ margin: "0px 0px 0px 10px" }} css={""} value={this.state.selectedDash?.id == dBoard.id} label={dBoard.title} onChange={() => this.setState({ selectedDash: dBoard })}></Checkbox>
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </p>
                        ))
                      }
                    </Collapse>
                  </div>
                ))}
              </td>
            </tr>
            <tr >
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

  private toggleFolderDashOpen(id:string) {

    if (this.state.folderboards != null) {
      for (let i = 0; i < this.state.folderboards.length; i++) {

        if (this.state.folderboards[i]?.id == id) {
          this.state.folderboards[i].isOpen = !this.state.folderboards[i].isOpen;

          this.setState({ folderboards: this.state.folderboards});
          break;
        }
      }
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

        //console.info("setupSelectedNodeType: this.state.typedefinitionChecked: " + this.state.typedefinitionChecked + " => " + isTypeSelected);

        this.setState({ typedefinitionChecked: isTypeSelected, instanceChecked: !isTypeSelected });
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

  private setupDashboards(selectionChanged: boolean, mappedDashboard: DashboardData) {

    if (this.state.folderboards == null) {

      let foldersMap = new Map();

      let dboards = getAllDashboards();
      let res = dboards.then((dashboards: DashboardData[]) => {

        let generalFolder: DashboardDataVm = { id: "General", title: "General", folderId: "", type: "dash-folder", url: "", dashKeys: [], isOpen: false, dashBoards: [] };

        foldersMap.set(generalFolder.id, generalFolder);

        let fBoards: DashboardDataVm[] = [generalFolder];
        let dBoards: DashboardDataVm[] = [];
        for (let i = 0; i < dashboards.length; i++) {
          let df = dashboards[i];
          let dashVm: DashboardDataVm = { id: df.id, title: df.title, folderId: df.folderId, type: df.type, url: df.url, dashKeys: df.dashKeys, isOpen: false, dashBoards: [] };

          if (dashVm.type == "dash-folder") {
            fBoards.push(dashVm);
            foldersMap.set(dashVm.id, dashVm);
          }

          dBoards.push(dashVm);
        }

        for (let i = 0; i < dBoards.length; i++) {

          if (dBoards[i].type != "dash-folder") {

            let folder: DashboardDataVm = foldersMap.get("General");

            if (foldersMap.has(dBoards[i].folderId)) {
              folder = foldersMap.get(dBoards[i].folderId);
            }

            folder.dashBoards?.push(dBoards[i]);
          }
        }

        this.setState({
          folderboards: fBoards
        })
      });

      return res;
    }
    else if (selectionChanged) {

      //console.log("Setting up folders");
      for (let i = 0; this.state.folderboards != null && i < this.state.folderboards.length; i++) {

        let dashboards: DashboardDataVm[] | null = this.state.folderboards[i].dashBoards;

        //console.log("Dashboards in folder " + this.state.folderboards[i].title + ": " + dashboards?.length);

        this.state.folderboards[i].isOpen = false;

        if (dashboards != null) {
          for (let j = 0; j < dashboards.length; j++) {
            if (dashboards[j] != null) {
              //console.log("Testing match: " + mappedDashboard?.id + "  " + dashboards[j].id);
              if (mappedDashboard?.id == dashboards[j].id) {
                //console.log("Opening folder " + this.state.folderboards[i].title);
                this.state.folderboards[i].isOpen = true;
                break;
              }
            }
          }
        }
      }
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

