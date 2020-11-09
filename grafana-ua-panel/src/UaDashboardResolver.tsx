import { DataSourceWithBackend } from '@grafana/runtime';
import { UaDashboardInfo, UaResult} from './types';
//import { OpcUaBrowseResults } from './types';

//export function getDashboard(nodeId: string, dataSource: DataSourceWithBackend | null): Promise<DashboardData | null> {

//  if (dataSource != null) {

//    let dboard: UaDashboardInfo = await dataSource.getResource('getdashboard', { nodeId: nodeId, perspective: "Operator" });

//    console.log("dboard: " + dboard);
//     // .then((t: UaDashboardInfo) => fetch('/api/search?query=' + encodeURI(t.name)));

//      //.then((t: UaDashboardInfo) => {
//      //  if (t.name != null)
//      //    return fetch('/api/search?query=' + encodeURI(t.name));
//      //  else
//      //    return new Promise<Response>(() => null);
//      //})
//      //.then(res => res.json())
//      //.then(res => {

//      //  if (res) {
//      //    let db = res as DashboardData[];
//      //    if (db.length > 0) {
//      //      db[0].dashKeys = t.dashKeys;
//      //      return db[0];
//      //    }
//      //  }

//      //  return null;
//      //}));
//  //}

//  return new Promise<DashboardData>(() => null);
//}

export function getDashboard(nodeId: string, dataSource: DataSourceWithBackend | null): Promise<DashboardData | null> {

  if (dataSource != null) {

    return dataSource.getResource('getdashboard', { nodeId: nodeId, perspective: "Operator" })

      .then((t: UaDashboardInfo) => fetch('/api/search?query=' + encodeURI(t.name))
        //.then((t: UaDashboardInfo) => {
        //  if (t.name != null)
        //    return fetch('/api/search?query=' + encodeURI(t.name));
        //  else
        //    return new Promise<Response>(() => null);
        //})
        .then(res => res.json())
        .then(res => {

          if (res) {
            let db = res as DashboardData[];
            if (db.length > 0) {
              db[0].dashKeys = t.dashKeys;
              return db[0];
            }
          }

          return null;
        }));
  }

  return new Promise<DashboardData>(() => null);
}

export function addDashboardMapping(nodeId: string, typeNodeId: string, useType: boolean, interfaces: string[], dashboard: string | undefined, existingDashboard: string | undefined, dataSource: DataSourceWithBackend | null): Promise<boolean> {

  if (dataSource != null && dashboard != undefined) {

    return dataSource.getResource('adddashboardmapping', { nodeId: nodeId, typeNodeId: typeNodeId, useType: useType, interfaces: JSON.stringify(interfaces), dashboard: dashboard, existingDashboard: existingDashboard, perspective: "Operator" })
      .then((d: UaResult) => { return d.success })
  }

  return new Promise<boolean>(() => false);
}

export function getAllDashboards(): Promise<DashboardData[]> {

  return fetch('/api/search?query=')
    .then(res => res.json())
    .then(res => {

      if (res) {
        let dd = res as DashboardData[];
        return dd;
      }

      return [];
    });
}


export interface DashboardData {
  id: string
  url: string
  title: string
  type: string
  folderId: string
  dashKeys: string[]
}
