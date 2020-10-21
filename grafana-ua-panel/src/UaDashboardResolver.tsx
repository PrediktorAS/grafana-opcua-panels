import { DataSourceWithBackend } from '@grafana/runtime';
import { UaDashboardInfo } from './types';
//import { OpcUaBrowseResults } from './types';

export function findDashboard(nodeId: string, dataSource: DataSourceWithBackend | null): Promise<DashboardData[]> {

  if (dataSource != null) {

    return dataSource.getResource('getdashboard', { nodeId: nodeId, perspective: "Operator" })
      .then((d: UaDashboardInfo) => d.name)
      .then((t: string) => fetch('/api/search?query=' + encodeURI(t))
      .then(res => res.json())
      .then(res => {

        if (res) {
          let db = res as DashboardData[];
          return db;
        }

        return [];
      }))
  }

  //if (dataSource != null) {

  //  return dataSource.getResource('gettypedefinition', { nodeId: nodeId })
  //    .then((r: OpcUaBrowseResults) => r.browseName.name)
  //    .then((t: string) => fetch('/api/search?query=' + encodeURI(t))
  //      .then(res => res.json())
  //      .then(res => {

  //        if (res) {
  //          let db = res as DashboardData[];
  //          return db;
  //        }

  //        return [];
  //      }))
  //}

  return new Promise<DashboardData[]>(() => []);
}

export function findAllDashboards(): Promise<DashboardData[]> {

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
}
