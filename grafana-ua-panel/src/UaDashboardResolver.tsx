import { DataSourceWithBackend } from '@grafana/runtime';
import { OpcUaBrowseResults } from './types';

export function findDashboard(nodeId: string, dataSource: DataSourceWithBackend | null): Promise<string> {

  if (dataSource != null) {

    dataSource.getResource('gettypedefinition', { nodeId: nodeId })
      .then((r: OpcUaBrowseResults) => r.browseName.name).then((t: string) => fetch('http://localhost:3000/api/search?query=Browse%20Ua')
      .then(res => res.json())
      .then(res => {
        if (res) {
          return res as string
          //return (res as DashboardData).url;
        }
        return "Not found";
      }))
  }
  return new Promise<string>(() => "");
}

//export function findDashboard(nodeId: string, dataSource: DataSourceWithBackend | null): Promise<string> {

//  if (dataSource != null) {

//    let type = dataSource.getResource('gettypedefinition', { nodeId: nodeId }).then((r: OpcUaBrowseResults) => r.browseName.name);
//    return type.then((t: string) => fetch('/api/search?query=' + t)
//      // the JSON body is taken from the response
//      .then(res => res.json())
//      .then(res => {
//        // The response has an `any` type, so we need to cast
//        // it to the `DashboardData` type, and return it from the promise
//        if (res) {
//          return (res as DashboardData).url
//        }
//        return "Not found"
//      }))
//  }
//  return new Promise<string>(() => "");
//}


interface DashboardData {
  url: string
}

export function getUsers(): Promise<DashboardData[]> {

  // For now, consider the data is stored on a static `users.json` file
  return fetch('/users.json')
    // the JSON body is taken from the response
    .then(res => res.json())
    .then(res => {
      // The response has an `any` type, so we need to cast
      // it to the `User` type, and return it from the promise
      return res as DashboardData[]
    })
}


//export function findDashboard(nodeId: string, dataSource: DataSourceWithBackend | null): Promise<string> {
//  if (dataSource != null)
//    return dataSource.getResource('gettypedefinition', { nodeId: nodeId }).then((r: OpcUaBrowseResults) => r.browseName.name);
//  return new Promise<string>(() => "");
//}
