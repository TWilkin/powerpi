export enum MetricValue {
    NONE = "none",
    READ = "read",
    VISIBLE = "visible",
}

export type MetricStateType = "door" | "motion" | "window";

export type MetricNumericType = "current" | "humidity" | "power" | "temperature" | "voltage";

export type MetricType = MetricStateType | MetricNumericType;

export type Metric = {
    [key in MetricType]?: MetricValue;
};
