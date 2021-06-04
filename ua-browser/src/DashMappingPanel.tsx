
import React, { Component } from "react";
//import Select from 'react-select';
import { /*Select,*/ Checkbox/*, Input*/, Button, Collapse } from '@grafana/ui';;
//import { convertRemToPixels } from './ConvertRemToPixels';
import { ThemeGetter } from './ThemesGetter';
import { GrafanaTheme } from '@grafana/data';
import { DashboardData, getAllDashboards, addDashboardMapping, removeDashboardMappingByKeys } from './UaDashboardResolver';
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
  isType: boolean;
  typedefinitionCheckedChanged: boolean;
  selectedDashFolder: DashboardData | null;
  selectedDash: DashboardData | null;
  mappedDashboard: DashboardData | null;
  mappedDashboardChanged: boolean;
  interfaces: InterfaceNodeInfo[] | null;
  applyPressed: boolean;
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
      isType: false,
      selectedDashFolder: null,
      selectedDash: null,
      mappedDashboard: null,
      mappedDashboardChanged: false,
      interfaces: null,
      applyPressed: false,
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

    let selectedNode = JSON.parse(this.props.selectedNode) as OpcUaBrowseResults;
    //console.log("Selected node: " + selectedNode?.displayName);
    let selectedNodeType = JSON.parse(this.props.selectedNodeType) as OpcUaBrowseResults;
    let mappedDashboard = JSON.parse(this.props.mappedDashboard) as DashboardData;
    let interfaces = JSON.parse(this.props.interfaces) as OpcUaBrowseResults[];

    //let dashKey1 = mappedDashboard?.dashKeys?.length > 0 ? mappedDashboard.dashKeys[0] : "";
    //console.log("mappedDashboard: " + mappedDashboard?.title + " keys: " + mappedDashboard?.dashKeys?.length + " key1: " + dashKey1);

    let selectedNodeDisplayName: string = " ";
    let selectedNodeTypeDisplayName: string = " ";
    let isType = false;
    if (selectedNode != null) {
    
      if (selectedNodeType?.displayName != null) {
        selectedNodeTypeDisplayName = selectedNodeType.displayName;
        selectedNodeDisplayName = selectedNode.displayName;
      }
      else {
        isType = true;
        selectedNodeTypeDisplayName = selectedNode.displayName;
      }
    }

    //console.log("selectedNodeTypeDisplayName: " + selectedNodeTypeDisplayName + "  isType: " + isType);
    //console.log("this.state.selectedDash?.title: " + this.state.selectedDash?.title);

    let selectionChanged = this.hasSelectionChanged(selectedNode);
    if (selectionChanged) {
      this.setState({ typedefinitionChecked: true, typedefinitionCheckedChanged: false, instanceChecked: false, isType: isType });
    }
    else if (this.state.isType != isType) {
      this.setState({ isType: isType });
    }

    this.setupSelectedNodeInstAndType(selectedNode, selectedNodeType, mappedDashboard);
    this.setupInterfaces(interfaces, mappedDashboard);
    this.setupCurrentMapping(selectedNode, selectedNodeType, mappedDashboard);
    this.setupDashboards(selectionChanged, mappedDashboard);

    if (!this.props.hidden) {

      let bg: string = "";
      if (this.state.theme != null) {
        bg = this.state.theme.colors.bg2;
      }

      let interfaceText = interfaces?.length > 0 ? <div>Interfaces</div> : "";

      //console.info("Pre render: this.state.typedefinitionChecked: " + this.state.typedefinitionChecked);
      console.info("Interface count: " + this.state.interfaces?.length);
      return (
        <div style={{
          background: bg,
          height: "100%",
          width: "100%",
          margin: "0px 0px 0px 0px"
        }}>
          <ThemeGetter onTheme={this.onTheme} />
          
          <h2 style={{ margin: "0px 0px 5px 3px"}}>Dashboard mapping</h2>

          <h5 style={{ color: "#2572F2", margin: "0px 0px 3px 5px" }}>Map from instance, type or interfaces</h5>
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
                            <Checkbox css={""} value={this.state.instanceChecked} label={selectedNodeDisplayName} disabled={this.state.isType} onChange={() => {

                              if (!this.state.instanceChecked && this.state.typedefinitionChecked)
                                this.setState({
                                  instanceChecked: !this.state.instanceChecked,
                                  typedefinitionChecked: false,
                                  typedefinitionCheckedChanged: true,
                                  applyPressed: false,
                                });
                              else
                                this.setState({
                                  instanceChecked: !this.state.instanceChecked,
                                  typedefinitionCheckedChanged: true,
                                  applyPressed: false,
                                });

                            }}>
                            </Checkbox>
                          </div>
                          Type
                          <div>
                            <Checkbox css={""} value={this.state.typedefinitionChecked} label={selectedNodeTypeDisplayName} disabled={this.state.isType} onChange={() => {

                              //console.info("Apply: this.state.typedefinitionChecked: " + !this.state.typedefinitionChecked);

                              if (!this.state.typedefinitionChecked && this.state.instanceChecked)
                                this.setState({
                                  typedefinitionChecked: !this.state.typedefinitionChecked,
                                  typedefinitionCheckedChanged: true,
                                  instanceChecked: false,
                                  applyPressed: false,
                                });
                              else
                                this.setState({
                                  typedefinitionChecked: !this.state.typedefinitionChecked,
                                  typedefinitionCheckedChanged: true,
                                  applyPressed: false,
                                });
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
                                  this.setState({
                                    interfaces: this.state.interfaces,
                                    applyPressed: false,
                                  });
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
                                    <Checkbox style={{ margin: "0px 0px 0px 10px" }} css={""} value={this.state.selectedDash?.id == dBoard.id} label={dBoard.title} onChange={() => this.selectedDashChanged(dBoard) }></Checkbox>
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
              <td style={{ textAlign: "right", padding: "5px" }} >
                <Button style={{ marginLeft: "5px" }} disabled={this.isMappedAsPersisted()} contentEditable={false} onClick={() => this.changeDashboardMapping(true, selectedNode, selectedNodeType, mappedDashboard)}>Apply</Button>
              </td>
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

  private selectedDashChanged(dBoard: DashboardDataVm) {

    //console.log("selectedDashChanged: current: " + this.state.selectedDash?.title + "  new: " + dBoard.title);

    if (this.state.selectedDash == null) {
      this.setState({
        selectedDash: dBoard,
        applyPressed: false,
      })
    }
    else {
      if (this.state.selectedDash?.id == dBoard.id)
        this.setState({
          selectedDash: null,
          applyPressed: false,
        })
      else
        this.setState({
          selectedDash: dBoard,
          applyPressed: false,
        })
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

  private setupSelectedNodeInstAndType(selectedInstance: OpcUaBrowseResults, selectedNodeType: OpcUaBrowseResults, mappedDashboard: DashboardData) {

    if (mappedDashboard != null && !this.state.typedefinitionCheckedChanged) {
      
      let isTypeSelected: boolean = false;
      let isInstanceSelected: boolean = false;

      if (selectedNodeType != null) {
        for (let i = 0; i < mappedDashboard?.dashKeys.length; i++) {

          if (selectedNodeType.nodeId == mappedDashboard.dashKeys[i]) {
            isTypeSelected = true;
          }

          if (selectedInstance.nodeId == mappedDashboard.dashKeys[i]) {
            isInstanceSelected = true;
          }
        }

      }
      else {
        isTypeSelected = true;
      }

      if (isTypeSelected != this.state.typedefinitionChecked || isInstanceSelected != this.state.instanceChecked) {

        //console.info("setupSelectedNodeType: this.state.typedefinitionChecked: " + this.state.typedefinitionChecked + " => " + isTypeSelected);

        this.setState({ typedefinitionChecked: isTypeSelected, instanceChecked: isInstanceSelected });
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

  private isMappedAsPersisted(): boolean {

    if (this.state.applyPressed) {
      //console.log("isMappedAsPersisted: true, applyPressed");
      return true;
    }

    if (this.state.selectedDash?.id != this.state.mappedDashboard?.id) {
      //console.log("isMappedAsPersisted: false, selected dash changed");
      return false;
    }

    if (!this.state.isType) {
      let instanceIsMapped = this.isIdMapped(this.state.selectedNode?.nodeId);

      if (instanceIsMapped != this.state.instanceChecked) {
        //console.log("isMappedAsPersisted: false, instanceIsMapped changed. selectedNodeType: " + this.state.selectedNodeType?.displayName);
        return false;
      }
    }

    let typeIsMapped = this.state.isType ? this.isIdMapped(this.state.selectedNode?.nodeId) : this.isIdMapped(this.state.selectedNodeType?.nodeId);

    if (typeIsMapped != this.state.typedefinitionChecked) {
      //console.log("isMappedAsPersisted: false, typeIsMapped changed. typeIsMapped: " + typeIsMapped + "  this.state.typedefinitionChecked: " + this.state.typedefinitionChecked);
      return false;
    }

    if (this.state.interfaces != null && this.state.interfaces.length > 0) {

      for (let i = 0; i < this.state.interfaces.length; i++) {

        let intIsMapped = this.isIdMapped(this.state.interfaces[i].nodeId);
        if (intIsMapped != this.state.interfaces[i].selected) {
          //console.log("isMappedAsPersisted: false, selected interfaces changed");
          return false;
        }
      }
    }

   //console.log("isMappedAsPersisted: true");

    return true;
  }

  private isIdMapped(nodeId: string | undefined) {

    if (nodeId != undefined) {
      if (this.state.mappedDashboard != null) {

        if (this.state.mappedDashboard.dashKeys != null) {

          for (let i = 0; i < this.state.mappedDashboard.dashKeys.length; i++) {
            //console.log("isIdMapped: " + nodeId + " key: " + this.state.mappedDashboard.dashKeys[i]);
            if (nodeId == this.state.mappedDashboard.dashKeys[i])
              return true;
          }
        }
      }
    }

    return false;
  }

  private setupCurrentMapping(selectedNode: OpcUaBrowseResults, selectedNodeType: OpcUaBrowseResults, mappedDashboard: DashboardData) {

    //console.log("setupCurrentMapping: mappedDashboard: " + mappedDashboard?.title);

    let setSelectedNodeState = selectedNode != null && selectedNode.nodeId != this.state.selectedNode?.nodeId;

    let setSelectedNodeTypeState = selectedNodeType != null && selectedNodeType.nodeId != this.state.selectedNodeType?.nodeId;

    if (setSelectedNodeState && setSelectedNodeTypeState) {
      //console.log("Reset 1");
      this.setState({
        selectedNode: selectedNode,
        selectedNodeType: selectedNodeType,
        mappedDashboard: null,
        mappedDashboardChanged: false,
        applyPressed: false,
      });
    }
    else if (setSelectedNodeState) {
      //console.log("Reset 2");
      this.setState({
        selectedNode: selectedNode,
        mappedDashboard: null,
        mappedDashboardChanged: false,
        applyPressed: false,
      });
    }
    else if (setSelectedNodeTypeState) {
      //console.log("Reset 3");
      this.setState({
        selectedNodeType: selectedNodeType,
        mappedDashboard: null,
        mappedDashboardChanged: false,
        applyPressed: false,
      });
    }

    if (mappedDashboard != null) {
      //console.log("Reset 4");
      if (!this.state.mappedDashboardChanged && this.state.mappedDashboard?.id != mappedDashboard.id) {
        this.setState({
          mappedDashboard: mappedDashboard,
          selectedDash: mappedDashboard
        });
      }
    }
    else if (this.state.mappedDashboard != null) {
      //console.log("Reset 5");
      this.setState({
        mappedDashboard: null,
        mappedDashboardChanged: false,
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

  private changeDashboardMapping(add:boolean, selectedNode: OpcUaBrowseResults, selectedNodeType: OpcUaBrowseResults, existingDashboard: DashboardData) {

    if (this.props.dataSource != null) {

      let selectedInterfaces = this.state.interfaces?.filter(x => x.selected);
      let interfaces = new Array<string>();

      for (let i = 0; selectedInterfaces != null && i < selectedInterfaces?.length; i++) {
        interfaces.push(selectedInterfaces[i].nodeId);
      }

      let add = this.state.selectedDash != null;

      //console.log("changeDashboardMapping: add = " + add);

      if (add) {

        if (this.state.mappedDashboard?.dashKeys != null && this.state.mappedDashboard.dashKeys.length > 0)
          removeDashboardMappingByKeys(this.state.mappedDashboard.dashKeys, this.props.dataSource);

        let typedefinitionChecked = selectedNodeType == null ? false : this.state.typedefinitionChecked; // selectedNodeType == null means that selected node is a type and will be treated as an instance in the following
        addDashboardMapping(selectedNode?.nodeId, selectedNodeType?.nodeId, typedefinitionChecked, interfaces, this.state.selectedDash?.title, existingDashboard?.title, this.props.dataSource)
          .then((success: boolean) => {
            if (success) {

              //console.log("AddDashMap: this.state.selectedDash: " + this.state.selectedDash?.title);


              if (this.state.selectedDash != null) {
                let newDashKeys = this.gatherKeys(selectedNode?.nodeId, selectedNodeType?.nodeId, typedefinitionChecked, interfaces);
                this.state.selectedDash.dashKeys = newDashKeys;
              }

              this.setState({

                mappedDashboardChanged: true,
                mappedDashboard: this.state.selectedDash,
                applyPressed: true,
              });
            }
            else {
              console.error("addDashboardMapping failed");
            }

          });
      }
      else {

        if (this.state.mappedDashboard?.dashKeys != null && this.state.mappedDashboard.dashKeys.length > 0) {
          removeDashboardMappingByKeys(this.state.mappedDashboard.dashKeys, this.props.dataSource)
            .then((success: boolean) => {

              if (success) {
                this.setState({

                  mappedDashboardChanged: true,
                  mappedDashboard: null,
                  applyPressed: true,
                });
              }
              else {
                console.error("removeDashboardMappingByKeys failed");
              }

            });
        }
        else {
          this.setState({
            applyPressed: true,
          });
        }

      }
    }
  }

  private gatherKeys(nodeId: string | null, selectedNodeType: string | null, typedefinitionChecked: boolean, interfaces: string[] | null) {

    let dashKeys = new Array<string>();

    if (typedefinitionChecked) {
      if (selectedNodeType != null)
        dashKeys.push(selectedNodeType);
    }
    else {
      if (nodeId != null)
        dashKeys.push(nodeId);
    }

    if (interfaces != null && interfaces.length > 0)
      for (let i = 0; i < interfaces.length; i++) {
        dashKeys.push(interfaces[i]);
      }

    return dashKeys;
  }

  private setupInterfaces(iFaces: OpcUaBrowseResults[], mappedDashboard: DashboardData) {

    let converted = this.convertInterfaces(iFaces);

    if (converted != null) {

      let updateState = false;

      if (converted.length != this.state.interfaces?.length) {

        updateState = true;
      }
      else {
        for (let i = 0; i < iFaces?.length; i++) {

          if (converted[i].nodeId != iFaces[i].nodeId) {

            updateState = true;
            break;
          }
        }
      }

      this.setupInterfaceSelection(converted, mappedDashboard);

      if (updateState) {

        this.setState({
          interfaces: converted
        });
      }
    }
  }

  private setupInterfaceSelection(iFaces: InterfaceNodeInfo[], mappedDashboard: DashboardData) {

    //console.log("setupInterfaceSelection: " + iFaces.length + " mappedDashboard: " + mappedDashboard);

    for (let i = 0; i < iFaces?.length; i++) {
      let iFace = iFaces[i];
      iFace.selected = false;
      if (mappedDashboard !== null) {
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

