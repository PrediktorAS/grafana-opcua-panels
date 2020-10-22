import { DataSourceWithBackend } from '@grafana/runtime';
import { UaDashboardInfo, UaResult } from './types';
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

  return new Promise<DashboardData[]>(() => []);
}

export function addDashboardMapping(nodeId: string, useType: boolean, dashboard: string | undefined, existingDashboard: string | undefined, dataSource: DataSourceWithBackend | null): Promise<boolean> {

  if (dataSource != null && dashboard != undefined) {

    return dataSource.getResource('adddashboardmapping', { nodeId: nodeId, useType: useType, dashboard: dashboard, existingDashboard: existingDashboard, perspective: "Operator" })
      .then((d: UaResult) => { return d.success })
  }

  return new Promise<boolean>(() => false);
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
