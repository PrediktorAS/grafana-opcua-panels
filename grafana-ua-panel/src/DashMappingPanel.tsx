
import React, { Component } from "react";
//import Select from 'react-select';
import { /*Select,*/ Checkbox, Input, Button } from '@grafana/ui';;
//import { convertRemToPixels } from './ConvertRemToPixels';
import { ThemeGetter } from './ThemesGetter';
import { GrafanaTheme } from '@grafana/data';
import { DashboardData, findAllDashboards } from './UaDashboardResolver';
import { OpcUaBrowseResults } from './types';
//import { Input } from '@grafana/ui';


type Props = {
  closeBrowser: () => void;
  hidden: boolean;
  selectedNode: string;
  selectedDashboard: string;
};

type State = {
  theme: GrafanaTheme | null;
//  currentDashboard: DashboardData | null;
  typedefinitionChecked: boolean;
  selectedPerspective: string | null | undefined;
  dashboards: DashboardData[] | null;
  selectedDashFolder: DashboardData | null;
  selectedDash: DashboardData | null;
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
    this.state = {
      theme: null,
//      currentDashboard: null,
      typedefinitionChecked: true,
      selectedPerspective: "general",
      dashboards: null,
      selectedDashFolder: generalFolder,
      selectedDash: null,
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

    //alert("DashMappingPanel");

    let selectedNode = JSON.parse(this.props.selectedNode) as OpcUaBrowseResults;
    let selectedDashboard = JSON.parse(this.props.selectedDashboard) as DashboardData;
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
              <td><Input css={""} type="text" value={selectedDashboard?.title} /></td>
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
                    <th>Dashboard Folders</th>
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
              <td><Button contentEditable={false} onClick={() => alert("Apply")}>Apply Mapping</Button></td>
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

  setupDashboards() {

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

  dashboardFolderSelected(selectedFolder: DashboardData) {
    //alert("dashboardFolderSelected: " + selectedFolder.title);

    this.setState({
      selectedDashFolder: selectedFolder
    })

  }
  //perspectiveChanged(persp: SelectableValue<string>) {

  //  this.setState({
      
  //    selectedPerspective:  persp.value
  //  })

  //}
}

