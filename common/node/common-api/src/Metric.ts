export enum MetricValue {
    NONE = "none",
    READ = "read",
    VISIBLE = "visible",
}

export type Metric = {
    current?: MetricValue;
    door?: MetricValue;
    humidity?: MetricValue;
    motion?: MetricValue;
    power?: MetricValue;
    voltage?: MetricValue;
    temperature?: MetricValue;
    window?: MetricValue;
};
