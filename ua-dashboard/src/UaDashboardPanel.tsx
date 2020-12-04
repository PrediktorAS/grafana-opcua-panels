import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { DashboardData, OpcUaBrowseResults, OpcUaNodeInfo, SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory} from '@grafana/ui';
import { DataSourceWithBackend, getDataSourceSrv } from '@grafana/runtime';
import { getDashboard } from './UaDashboardResolver';

interface Props extends PanelProps<SimpleOptions> {}

interface State {
  instanceId: string | null,
  fromDate: string | null,
  toDate: string | null,
  dataSource: DataSourceWithBackend | null,
  dashboards: DashboardMap[] | null,
}

interface DashboardMap {
  node: OpcUaNodeInfo,
  dashboard: DashboardData | null
}

export class UaDashboardPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      instanceId: null,
      fromDate: null,
      toDate: null,
      dataSource: null,
      dashboards: null
    };
  }

  getStyles = stylesFactory(() => {
    return {
      wrapper: css`
      position: relative;
    `,
      svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
      textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
    };
  });


  browse(parentId: string): Promise<OpcUaBrowseResults[]> {
    this.getDataSource();

    if (this.state.dataSource != null) {
      let res = this.state.dataSource.getResource('browse', { nodeId: parentId });
      return res;
    }
    return new Promise<OpcUaBrowseResults[]>(() => []);
  }

  readNode(nodeId: string): Promise<OpcUaNodeInfo> {
    this.getDataSource();
    if (this.state.dataSource != null) {
      return this.state.dataSource.getResource('readNode', { nodeId: nodeId });
    }
    return new Promise<OpcUaNodeInfo>(() => null);
  }

  getDataSource() {
    if (this.state.dataSource == null) {
      var datasourceName = this.props.data.request?.targets[0].datasource;

      getDataSourceSrv().get(datasourceName).then((result) => {
        var dataSourceWithBackend: DataSourceWithBackend = result as unknown as DataSourceWithBackend;
        this.setState({ dataSource: dataSourceWithBackend })
      });
    }
  }


  fetchChildrenDashboards() : void  {
    this.getDataSource();
    const instanceId = this.props.replaceVariables('$InstanceId');

    //http://localhost:3000/api/dashboards/db/pumplooptype
    //DashboardModel


    this.browse(instanceId).then((result) => {
      var promises = new Array();
      var dbs: DashboardMap[] = [];
      let maxLength = Math.min(result.length, this.props.options.maxChildren); 

      for (let i = 0; i < maxLength; i++) {
        promises.push(getDashboard(result[i].nodeId, this.state.dataSource));
      }

      Promise.all(promises).then((dashboarddatas: DashboardData[]) => {
        for (let i = 0; i < dashboarddatas.length; i++) {
          dbs.push({ dashboard: dashboarddatas[i], node: result[i] });
        }
        this.setState({ dashboards: dbs });
      });
    });
  }


  fetchDashboard() {
    this.getDataSource();
    if (this.state.dataSource !== null) {
      const instanceId = this.props.replaceVariables('$InstanceId');
      getDashboard(instanceId, this.state.dataSource).then((dashboard) =>
      {
        if (dashboard === null) {
          if (this.props.options.dashboardFetch === "ChildrenIfNotInstance") {
            this.fetchChildrenDashboards();
          }
        }
        else {
          this.readNode(instanceId).then((node) => {
            if (node !== null) {
              var dbs: DashboardMap[] = [];
              dbs.push({ dashboard: dashboard, node: node });
              this.setState({ dashboards: dbs });
            }
          });
        }
      });
    }
  }


  renderDashboardIFrame(instanceId: string, fromDate: string | null, toDate: string | null, dsurl: string, width: number, height: number) {
    const styles = this.getStyles();

    let url = this.props.replaceVariables(dsurl + '?kiosk&from=' + fromDate + '&to=' + toDate + '&var-ObjectId=' + instanceId);
    return (
      <div
        className={cx(
          styles.wrapper,
          css`
            width: ${width}px;
            height: ${height}px;
          `
        )}
      >
        <iframe src={url} width={width} height={height} frameBorder="0">
        </iframe>
      </div>
    );
  }


  renderDashboardEmbed(instanceId: string, fromDate: string, toDate: string, dsurl: string, width: number, height: number) {
    const styles = this.getStyles();

    let url = this.props.replaceVariables(dsurl + '?kiosk&from=' + fromDate + '&to=' + toDate + '&var-ObjectId=' + instanceId);
    return (
      <div
        className={cx(
          styles.wrapper,
          css`
            width: ${width}px;
            height: ${height}px;
          `
        )}
      >
        <embed src={url} width={width} height={height}>
        </embed>
      </div>
    );
  }


  renderDashboards() {
    //const fromDate = this.props.replaceVariables('$__from');
    //const toDate = this.props.replaceVariables('$__to');

    if (this.state.dashboards !== null) {
      let dsCount = this.state.dashboards.length;
      if (dsCount > 0) {
        let height = this.props.height / dsCount;
        let width = this.props.width;
        return <>{this.state.dashboards.map((object, i) => this.renderDashboardIFrame(object.node.nodeId, this.state.fromDate, this.state.toDate,
          object.dashboard != null ? object.dashboard.url : "", width, height))}</>;
      }
    }
    return <></>;
  }

  render() {

    const instanceId = this.props.replaceVariables('$InstanceId');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const fromDate = this.getRelativeFromTime(urlParams);
    const toDate = this.getRelativeToTime(urlParams);

    console.log("toDate: " + toDate + " to: " + toDate);


    if (this.state.instanceId === null || this.state.instanceId !== instanceId) {
      this.setState({ instanceId: instanceId, dashboards: null });
    }
    //const fromDate = this.props.replaceVariables('$__from');
    //const toDate = this.props.replaceVariables('$__to');

    if ((this.state.fromDate === null && fromDate !== null) || this.state.fromDate !== fromDate
      || (this.state.toDate === null && toDate !== null) || this.state.toDate !== toDate) {
        this.setState({ fromDate: fromDate, toDate: toDate, dashboards: null });
    }

    if (this.state.dashboards !== null) {
      return this.renderDashboards();
    }
    else {
      if (this.props.options.dashboardFetch === "Children")
        this.fetchChildrenDashboards();
      else
        this.fetchDashboard();
      return <></>;
    }
  }

  private getRelativeFromTime(urlParams: URLSearchParams) {

    var value = urlParams.get('from');
    if (value != null)
      return value;

    return 'now-6h';
  }

  private getRelativeToTime(urlParams: URLSearchParams) {

    var value = urlParams.get('to');
    if (value != null)
      return value;

    return 'now';
  }
}


