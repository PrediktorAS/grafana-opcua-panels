
import React, { Component } from "react";
//import Select from 'react-select';
import { /*Select,*/ Checkbox, Input, Button } from '@grafana/ui';;
//import { convertRemToPixels } from './ConvertRemToPixels';
import { ThemeGetter } from './ThemesGetter';
import { GrafanaTheme } from '@grafana/data';
import { DashboardData, findAllDashboards, addDashboardMapping } from './UaDashboardResolver';
import { OpcUaBrowseResults } from './types';
import { DataSourceWithBackend } from '@grafana/runtime';
//import { Input } from '@grafana/ui';


type Props = {
  closeBrowser: () => void;
  hidden: boolean;
  selectedNode: string;
  mappedDashboard: string;
  dataSource: DataSourceWithBackend | null;
};

type State = {
  theme: GrafanaTheme | null;
  typedefinitionChecked: boolean;
  selectedPerspective: string | null | undefined;
  dashboards: DashboardData[] | null;
  selectedNode: OpcUaBrowseResults | null;
  selectedDashFolder: DashboardData | null;
  selectedDash: DashboardData | null;
  mappedDashboard: DashboardData | null;
  mappedDashboardChanged: boolean;
}

const generalFolder: DashboardData = { id: "", title: "General", folderId: "", type: "dash-folder", url: "" };

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

    //alert("mappedDashboard: " + props.mappedDashboard);
    this.state = {
      theme: null,
      typedefinitionChecked: true,
      selectedPerspective: "General",
      dashboards: null,
      selectedNode: null,
      selectedDashFolder: generalFolder,
      selectedDash: null,
      mappedDashboard: null,
      mappedDashboardChanged: false,
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
    let mappedDashboard = JSON.parse(this.props.mappedDashboard) as DashboardData;

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
              <td><Input style={{ margin: "15px" }} css={""} type="text" value={selectedNode?.displayName} readOnly={true} /></td>
              <td><Input css={""} type="text" value={this.state.mappedDashboard?.title} readOnly={true} /></td>
            </tr>
            <tr>
              <td>
                <Checkbox css={""} value={this.state.typedefinitionChecked} label={"Apply to Typedefinition"} onChange={() => this.setState({ typedefinitionChecked: !this.state.typedefinitionChecked })}></Checkbox>
              </td>
              <td>
              </td>
            </tr>
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
              <td style={{ textAlign: "right", padding: "5px" }} ><Button disabled={this.state.selectedDash?.id == this.state.mappedDashboard?.id} contentEditable={false} onClick={() => this.applyDashboardMapping(selectedNode, mappedDashboard)}>Apply Mapping</Button></td>
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

  private setupDashboards() {

    if (this.state.dashboards == null) {
      let dboards = findAllDashboards();
      let res = dboards.then((dashboards: DashboardData[]) => {

        this.setState({
          dashboards: dashboards
        })
      });

      return res;
    }

    return null;
  }

  private applyDashboardMapping(selectedNode: OpcUaBrowseResults, existingDashboard: DashboardData) {

    if (this.props.dataSource != null && this.state.selectedDash != null) {
      addDashboardMapping(selectedNode.nodeId, this.state.typedefinitionChecked, this.state.selectedDash?.title, existingDashboard?.title, this.props.dataSource)
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
}

