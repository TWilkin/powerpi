import { MetricValue, Sensor } from "@powerpi/common-api";
import { renderHook } from "@testing-library/react";
import useSensors from "./useSensors";

describe("useSensors", () => {
    const sensors: Sensor[] = [
        {
            name: "Sensor1",
            display_name: "Sensor 1",
            type: "door",
            metrics: {
                door: MetricValue.VISIBLE,
                temperature: MetricValue.VISIBLE,
            },
            data: {},
            visible: true,
        },
        {
            name: "Sensor2",
            display_name: "Sensor 2",
            type: "window",
            metrics: {
                window: MetricValue.VISIBLE,
                humidity: MetricValue.VISIBLE,
            },
            data: {},
            visible: true,
        },
        {
            name: "Sensor3",
            display_name: undefined,
            type: "motion",
            metrics: {
                motion: MetricValue.VISIBLE,
            },
            data: {},
            visible: true,
        },
        {
            name: "Sensor4",
            display_name: "Sensor 4",
            type: "zigbee_energy_monitor",
            metrics: {
                current: MetricValue.VISIBLE,
                power: MetricValue.VISIBLE,
                voltage: MetricValue.VISIBLE,
            },
            data: {},
            visible: true,
        },
        {
            name: "Sensor5",
            display_name: "Sensor 5",
            type: "unknown",
            data: {},
            visible: true,
        },
    ];

    test("expands and sorts sensors correctly", () => {
        const { result } = renderHook(() => useSensors(sensors));

        expect(result.current).toStrictEqual([
            {
                name: "Sensor4-current",
                display_name: "Sensor 4 (Current)",
                type: "current",
                entity: "Sensor4",
                action: "current",
                metrics: {
                    current: MetricValue.VISIBLE,
                    power: MetricValue.VISIBLE,
                    voltage: MetricValue.VISIBLE,
                },
                data: {},
                visible: true,
            },
            {
                name: "Sensor1-door",
                display_name: "Sensor 1 (Door)",
                type: "door",
                entity: "Sensor1",
                action: "door",
                metrics: {
                    door: MetricValue.VISIBLE,
                    temperature: MetricValue.VISIBLE,
                },
                data: {},
                visible: true,
            },
            {
                name: "Sensor2-humidity",
                display_name: "Sensor 2 (Humidity)",
                type: "humidity",
                entity: "Sensor2",
                action: "humidity",
                metrics: {
                    window: MetricValue.VISIBLE,
                    humidity: MetricValue.VISIBLE,
                },
                data: {},
                visible: true,
            },
            {
                name: "Sensor3-motion",
                display_name: "Sensor3 (Motion)",
                type: "motion",
                entity: "Sensor3",
                action: "motion",
                metrics: {
                    motion: MetricValue.VISIBLE,
                },
                data: {},
                visible: true,
            },
            {
                name: "Sensor4-power",
                display_name: "Sensor 4 (Power)",
                type: "power",
                entity: "Sensor4",
                action: "power",
                metrics: {
                    current: MetricValue.VISIBLE,
                    power: MetricValue.VISIBLE,
                    voltage: MetricValue.VISIBLE,
                },
                data: {},
                visible: true,
            },
            {
                name: "Sensor1-temperature",
                display_name: "Sensor 1 (Temperature)",
                type: "temperature",
                entity: "Sensor1",
                action: "temperature",
                metrics: {
                    door: MetricValue.VISIBLE,
                    temperature: MetricValue.VISIBLE,
                },
                data: {},
                visible: true,
            },
            {
                name: "Sensor5",
                display_name: "Sensor 5",
                type: "unknown",
                data: {},
                visible: true,
            },
            {
                name: "Sensor4-voltage",
                display_name: "Sensor 4 (Electrical Potential)",
                type: "voltage",
                entity: "Sensor4",
                action: "voltage",
                metrics: {
                    current: MetricValue.VISIBLE,
                    power: MetricValue.VISIBLE,
                    voltage: MetricValue.VISIBLE,
                },
                data: {},
                visible: true,
            },
            {
                name: "Sensor2-window",
                display_name: "Sensor 2 (Window)",
                type: "window",
                entity: "Sensor2",
                action: "window",
                metrics: {
                    window: MetricValue.VISIBLE,
                    humidity: MetricValue.VISIBLE,
                },
                data: {},
                visible: true,
            },
        ]);
    });

    test("returns empty array when no sensors are provided", () => {
        const { result } = renderHook(() => useSensors([]));

        expect(result.current).toStrictEqual([]);
    });
});
