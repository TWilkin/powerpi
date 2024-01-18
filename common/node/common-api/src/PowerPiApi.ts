import axios, { AxiosInstance } from "axios";
import { connect, Socket } from "socket.io-client";
import AdditionalState from "./AdditionalState";
import { BatteryStatusCallback, BatteryStatusMessage } from "./BatteryStatus";
import { CapabilityStatusCallback, CapabilityStatusMessage } from "./CapabilityStatus";
import Config from "./Config";
import Device from "./Device";
import DeviceChangeMessage from "./DeviceChangeMessage";
import DeviceState from "./DeviceState";
import { DeviceStatusCallback, DeviceStatusMessage } from "./DeviceStatus";
import { Floorplan } from "./Floorplan";
import History from "./History";
import PaginationResponse from "./Pagination";
import Sensor from "./Sensor";
import { SensorStatusCallback, SensorStatusMessage } from "./SensorStatus";
import SocketIONamespace from "./SocketIONamespace";

type ErrorHandler = (error: { response: { status: number } }) => void;

export default class PowerPiApi {
    private readonly instance: AxiosInstance;
    private socket: Socket | undefined;
    private listeners: {
        device: DeviceStatusCallback[];
        sensor: SensorStatusCallback[];
        battery: BatteryStatusCallback[];
        capability: CapabilityStatusCallback[];
    };
    private headers: { [key: string]: string };

    constructor(private readonly apiBaseUrl: string) {
        this.instance = axios.create({
            baseURL: this.apiBaseUrl,
        });

        this.listeners = {
            device: [],
            sensor: [],
            battery: [],
            capability: [],
        };

        this.headers = {};
    }

    public getConfig = () => this.get<Config>("config");

    public getDevices = () => this.get<Device[]>("device");

    public getFloorplan = () => this.get<Floorplan>("floorplan");

    public getSensors = () => this.get<Sensor[]>("sensor");

    public getHistory = (
        type?: string,
        entity?: string,
        action?: string,
        start?: Date,
        end?: Date,
        records?: number,
    ) =>
        this.get<PaginationResponse<History>>("history", {
            type,
            entity,
            action,
            start,
            end,
            records,
        });

    public getHistoryRange = (
        start?: Date,
        end?: Date,
        type?: string,
        entity?: string,
        action?: string,
    ) => this.get<History[]>("history/range", { start, end, type, entity, action });

    public getHistoryTypes = () => this.get<{ type: string }[]>("history/types");

    public getHistoryEntities = (type?: string) =>
        this.get<{ entity: string }[]>("history/entities", { type });

    public getHistoryActions = (type?: string) =>
        this.get<{ action: string }[]>("history/actions", { type });

    public postDeviceChange(
        device: string,
        state?: DeviceState,
        additionalState?: AdditionalState,
    ) {
        let message: DeviceChangeMessage = {};

        if (state) {
            message["state"] = state;
        }

        if (additionalState) {
            message = { ...message, ...additionalState };
        }

        this.post(`device/${device}`, message);
    }

    public addDeviceListener(callback: DeviceStatusCallback) {
        this.connectSocketIO();
        this.listeners.device.push(callback);
    }

    public addSensorListener(callback: SensorStatusCallback) {
        this.connectSocketIO();
        this.listeners.sensor.push(callback);
    }

    public addBatteryListener(callback: BatteryStatusCallback) {
        this.connectSocketIO();
        this.listeners.battery.push(callback);
    }

    public addCapabilityListener(callback: CapabilityStatusCallback) {
        this.connectSocketIO();
        this.listeners.capability.push(callback);
    }

    public removeDeviceListener(callback: DeviceStatusCallback) {
        this.listeners.device = this.listeners.device.filter((listener) => listener === callback);
    }

    public removeSensorListener(callback: SensorStatusCallback) {
        this.listeners.sensor = this.listeners.sensor.filter((listener) => listener === callback);
    }

    public removeBatteryListener(callback: BatteryStatusCallback) {
        this.listeners.battery = this.listeners.battery.filter((listener) => listener === callback);
    }

    public removeCapabilityListener(callback: CapabilityStatusCallback) {
        this.listeners.capability = this.listeners.capability.filter(
            (listener) => listener === callback,
        );
    }

    public setErrorHandler(handler: ErrorHandler) {
        this.instance.interceptors.response.use((response) => response, handler);
    }

    public setCredentials(token: string) {
        this.headers.Authorization = `Bearer ${token}`;
    }

    private onDeviceMessage = (message: DeviceStatusMessage) =>
        this.listeners.device.forEach((listener) => listener(message));

    private onSensorMessage = (message: SensorStatusMessage) =>
        this.listeners.sensor.forEach((listener) => listener(message));

    private onBatteryMessage = (message: BatteryStatusMessage) =>
        this.listeners.battery.forEach((listener) => listener(message));

    private onCapabilityMessage = (message: CapabilityStatusMessage) =>
        this.listeners.capability.forEach((listener) => listener(message));

    private async get<TResult>(path: string, params?: object) {
        const result = await this.instance.get<TResult>(path, {
            params,
            headers: this.headers,
        });
        return result?.data;
    }

    private async post<TResult, TMessage>(path: string, message: TMessage) {
        const config = {
            headers: {
                ...this.headers,
                "Content-Type": "application/json",
            },
        };
        const result = await this.instance.post<string, { data: TResult }>(
            path,
            JSON.stringify(message),
            config,
        );
        return result?.data;
    }

    private connectSocketIO() {
        if (!this.socket) {
            this.socket = connect(this.apiBaseUrl, {
                path: "/api/socket.io",
            });

            this.socket.on(SocketIONamespace.Device, this.onDeviceMessage);
            this.socket.on(SocketIONamespace.Sensor, this.onSensorMessage);
            this.socket.on(SocketIONamespace.Battery, this.onBatteryMessage);
            this.socket.on(SocketIONamespace.Capability, this.onCapabilityMessage);
        }
    }
}
