import { DataSourceWithBackend } from '@grafana/runtime';
import { UaDashboardInfo, UaResult} from './types';
//import { OpcUaBrowseResults } from './types';


export function getDashboard(nodeId: string, dataSource: DataSourceWithBackend | null): Promise<DashboardData | null> {

  if (dataSource != null) {

    let dashInfo = dataSource.getResource('getdashboard', { nodeId: nodeId, perspective: "Operator" })
      .then((dInfo: UaDashboardInfo) => { return dInfo; });

    let dashQueryResult = dashInfo.then(dashInfo => {

      //console.log("dashInfo?.name: " + dashInfo?.name);
      //console.log("dashInfo?.dashKeys?.length: " + dashInfo?.dashKeys?.length);
      if (dashInfo?.name != null && dashInfo.name?.length > 0) {
        return fetch('/api/search?query=' + encodeURI(dashInfo.name));
      }
      else {
        return null;
      }
    })

    if (dashQueryResult != null) {

      let jsonDash = dashQueryResult.then(res => {
        if (res != null)
          return res.json();
        else
          return null;          
      });

      if (jsonDash != null) {
        return jsonDash.then(async res => {

          if (res) {
            let db = res as DashboardData[];
            if (db.length > 0) {
              db[0].dashKeys = (await dashInfo).dashKeys;
              return db[0];
            }
          }

          return null;
        })
      }
    }
  }

  return new Promise<DashboardData>(() => null);

}

//export function getDashboard(nodeId: string, dataSource: DataSourceWithBackend | null): Promise<DashboardData | null> {

//  if (dataSource != null) {


//    let t1 = dataSource.getResource('getdashboard', { nodeId: nodeId, perspective: "Operator" })
//      .then((t: UaDashboardInfo) => { return fetch('/api/search?query=' + encodeURI(t.name))
//      });


//    if (t1)
//    console.log("t1: " + t1);

//    return dataSource.getResource('getdashboard', { nodeId: nodeId, perspective: "Operator" })

//      .then((t: UaDashboardInfo) => fetch('/api/search?query=' + encodeURI(t.name))
//        //.then((t: UaDashboardInfo) => {
//        //  if (t.name != null)
//        //    return fetch('/api/search?query=' + encodeURI(t.name));
//        //  else
//        //    return new Promise<Response>(() => null);
//        //})
//        .then(res => res.json())
//        .then(res => {

//          if (res) {
//            let db = res as DashboardData[];
//            if (db.length > 0) {
//              db[0].dashKeys = t.dashKeys;
//              return db[0];
//            }
//          }

//          return null;
//        }));
//  }

//  return new Promise<DashboardData>(() => null);
//}

//export function getDashboard(nodeId: string, dataSource: DataSourceWithBackend | null): Promise<DashboardData | null> {

//  if (dataSource != null) {

//    return dataSource.getResource('getdashboard', { nodeId: nodeId, perspective: "Operator" })

//      .then((t: UaDashboardInfo) => fetch('/api/search?query=' + encodeURI(t.name))
//      .then(res => res.json())
//      .then(res => {

//        if (res) {
//          let db = res as DashboardData[];
//          if (db.length > 0) {
//            db[0].dashKeys = t.dashKeys;
//            return db[0];
//          }
//        }

//        return null;
//      }));
//  }

//  return new Promise<DashboardData>(() => null);
//}

export function addDashboardMapping(nodeId: string, typeNodeId: string, useType: boolean, interfaces: string[], dashboard: string | undefined, existingDashboard: string | undefined, dataSource: DataSourceWithBackend | null): Promise<boolean> {

  if (dataSource != null && dashboard != undefined) {

    return dataSource.getResource('adddashboardmapping', { nodeId: nodeId, typeNodeId: typeNodeId, useType: useType, interfaces: JSON.stringify(interfaces), dashboard: dashboard, existingDashboard: existingDashboard, perspective: "Operator" })
      .then((d: UaResult) => { return d.success })
  }

  return new Promise<boolean>(() => false);
}

export function removeDashboardMapping(nodeId: string, typeNodeId: string, useType: boolean, interfaces: string[], dataSource: DataSourceWithBackend | null): Promise<boolean> {

  if (dataSource != null) {

    return dataSource.getResource('removedashboardmapping', { nodeId: nodeId, typeNodeId: typeNodeId, useType: useType, interfaces: JSON.stringify(interfaces), perspective: "Operator" })
      .then((d: UaResult) => { return d.success })
  }

  return new Promise<boolean>(() => false);
}

export function removeDashboardMappingByKeys(dashKeys: string[], dataSource: DataSourceWithBackend | null): Promise<boolean> {

  if (dataSource != null) {

    return dataSource.getResource('removedashboardmappingbykeys', { dashKeys: JSON.stringify(dashKeys), perspective: "Operator" })
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
