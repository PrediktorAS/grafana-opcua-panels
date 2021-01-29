import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { DashboardData, OpcUaBrowseResults, OpcUaNodeInfo, SimpleOptions, RelativeTime } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory} from '@grafana/ui';
import { DataSourceWithBackend, getDataSourceSrv } from '@grafana/runtime';
import { getDashboard, getDashboardData } from './UaDashboardResolver';
//import { getDashboardSrv } from "@grafana/runtime/services/backendSrv";

interface Props extends PanelProps<SimpleOptions> {}

interface State {
  objectId: string | null,
  fromDate: string | null,
  toDate: string | null,
  refresh: string | null,
  dataSource: DataSourceWithBackend | null,
  dashboards: DashboardMap[] | null
}

interface DashboardMap {
  node: string,
  dashboard: DashboardData | null
}

export class UaDashboardPanel extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      objectId: null,
      fromDate: null,
      toDate: null,
      refresh:null,
      dataSource: null,
      dashboards: null
    };

    //EventBus in PanelProps (Publish panelqueries changed event, panel options changed event)
    //SystemJS.load('app/core/app_events').then((appEvents: any) => { appEvents.on('graph-hover', (e: any) => console.log(e)) })

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
    if (nodeId !== null && nodeId.length > 0) {
      this.getDataSource();
      if (this.state.dataSource != null) {
        return this.state.dataSource.getResource('readNode', { nodeId: nodeId });
      }
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
    const objectId = this.props.replaceVariables('$ObjectId');

    this.browse(objectId).then((result) => {
      var promises = new Array();
      var dbs: DashboardMap[] = [];
      let maxLength = Math.min(result.length, this.props.options.maxChildren); 

      for (let i = 0; i < maxLength; i++) {
        promises.push(getDashboard(result[i].nodeId, this.state.dataSource));
      }

      Promise.all(promises).then((dashboarddatas: DashboardData[]) => {
        for (let i = 0; i < dashboarddatas.length; i++) {
          dbs.push({ dashboard: dashboarddatas[i], node: result[i].nodeId });
        }
        this.setState({ dashboards: dbs });
      });
    });
  }


  fetchDashboard() {
    this.getDataSource();
    if (this.state.dataSource !== null) {
      const objectId = this.props.replaceVariables('$ObjectId');
      if (objectId !== null && objectId.length > 0) {
        getDashboard(objectId, this.state.dataSource).then((dashboard) => {
          if (dashboard === null) {
            if (this.props.options.dashboardFetch === "ChildrenIfNotInstance") {
              this.fetchChildrenDashboards();
            }
          }
          else {
            this.readNode(objectId).then((node) => {
              if (node !== null) {
                var dbs: DashboardMap[] = [];
                dbs.push({ dashboard: dashboard, node: node.nodeId });
                this.setState({ dashboards: dbs });
              }
            });
          }
        });
      }
    }
  }


  renderDashboardIFrame(objectId: string, fromDate: string | null, toDate: string | null, refresh: string | null, dsurl: string, width: number, height: number) {
    const styles = this.getStyles();

    let url = this.props.replaceVariables(dsurl + '?kiosk&from=' + fromDate + '&to=' + toDate + '&var-ObjectId=' + objectId);

    if (refresh != null && refresh.length > 0)
      url = url + "&refresh=" + refresh;

    console.log("IFrame url: " + url);

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


  renderDashboardEmbed(objectId: string, fromDate: string, toDate: string, dsurl: string, width: number, height: number) {
    const styles = this.getStyles();

    let url = this.props.replaceVariables(dsurl + '?kiosk&from=' + fromDate + '&to=' + toDate + '&var-ObjectId=' + objectId);
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
        let height = (this.props.height - 0) / dsCount;
        let width = this.props.width;
        return <>{this.state.dashboards.map((object, i) => this.renderDashboardIFrame(object.node, this.state.fromDate, this.state.toDate, this.state.refresh,
          object.dashboard != null ? object.dashboard.url : "", width, height))}</>;
      }
    }
    return <></>;
  }

  render() {


    const objectId = this.props.replaceVariables('$ObjectId');

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    const fromToTime = this.getFromToTime(urlParams);

    //console.log("fromToTime.from: " + fromToTime.from + " fromToTime.to: " + fromToTime.to);

    const fromDate = fromToTime.from;
    const toDate = fromToTime.to;

    const refresh = this.getRefresh(urlParams);

    //console.log("DashboardPanel: objectId: " + objectId + " fromDate: " + fromDate + " toDate: " + toDate);

    if (this.state.objectId === null || this.state.objectId !== objectId) {
      this.setState({ objectId: objectId, dashboards: null });
    }

    if ((this.state.fromDate === null && fromDate !== null)
      || this.state.fromDate !== fromDate
      || (this.state.toDate === null && toDate !== null)
      || this.state.toDate !== toDate
      || this.state.refresh !== refresh) {
      this.setState({ fromDate: fromDate, toDate: toDate, dashboards: null, refresh: refresh });
    }

    if (this.state.dashboards !== null) {
      return this.renderDashboards();
    }
    else {
      if (this.props.options.dashboardFetch === "Children")
        this.fetchChildrenDashboards();
      else if (this.props.options.dashboardFetch === "NamedDashboard")
        this.fetchNamedDashboard();
      else
        this.fetchDashboard();
      return <></>;
    }
  }


  fetchNamedDashboard() {

    let dashName = this.props.options.namedDashboardName;
    //console.log("fetchNamedDashboard for: " + dashName);

    getDashboardData(dashName).then((res) => {

      //console.log("fetchNamedDashboard uri: " + res?.url);
      if (this.state.objectId != null) {
        let dm: DashboardMap = { dashboard: res, node: this.state.objectId };
        this.setState({ dashboards: [dm] });
      }
    }
    );
  }

  private getFromToTime(urlParams: URLSearchParams) {

    const relTime: RelativeTime = new RelativeTime();

    var fromValue = urlParams.get('from');
    if (fromValue != null)
      relTime.from = fromValue;

    var toValue = urlParams.get('to');
    if (toValue != null) {
      relTime.to = toValue;
      return relTime;
    }

    console.log("No relative time found, falling back to absolute and converting");

    const fromDateAbsolute = this.props.replaceVariables('$__from');
    const toDateAbsolute = this.props.replaceVariables('$__to');

    console.log("fromDateAbsolute: " + fromDateAbsolute + "  toDateAbsolute: " + toDateAbsolute);

    if (fromDateAbsolute != null && fromDateAbsolute != undefined) {

      let periodSecs = Math.floor((parseInt(toDateAbsolute) - parseInt(fromDateAbsolute)) / 1000);

      //console.log("periodSecs: " + periodSecs);

      relTime.from = "now-" + periodSecs + "s";
      relTime.to = "now";

      return relTime;
    }

    console.log("No absolute time found, falling back to default last 6 hours");

    relTime.from = "now-6H";
    relTime.to = "now";

    return relTime;

  }

  private getRefresh(urlParams: URLSearchParams) {

    var refreshValue = urlParams.get('refresh');
    if (refreshValue != null)
      return refreshValue;

    return "";
  }
}


