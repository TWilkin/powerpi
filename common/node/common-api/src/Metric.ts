export enum MetricValue {
    NONE = "none",
    READ = "read",
    VISIBLE = "visible",
}

export type Metric = {
    current?: MetricValue;
    humidity?: MetricValue;
    motion?: MetricValue;
    power?: MetricValue;
    voltage?: MetricValue;
    temperature?: MetricValue;
};

export type MetricType = keyof Metric;
