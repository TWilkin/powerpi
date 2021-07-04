export interface N3rgyData {
  resource: string;
  responseTimestamp: string;
  start: string;
  end: string;
  granularity: string;
  values: N3rgyDataPoint[];
  availableCacheRange: N3rgyDataCacheRange;
  unit: string;
}

export interface N3rgyDataPoint {
  value: number;
  timestamp: string;
}

export interface N3rgyDataCacheRange {
  start: string;
  end: string;
}
