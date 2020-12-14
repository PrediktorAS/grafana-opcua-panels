import { DataFetchType } from '../types';

export function toDataFetchType(dataFetch: string): DataFetchType {
  if (dataFetch === "Polling")
    return DataFetchType.Polling;
  if (dataFetch === "Subscribe")
    return DataFetchType.Subscribe;
  return DataFetchType.Polling;
}

