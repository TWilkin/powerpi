import axios, { AxiosInstance } from "axios";
import { connect, Socket } from "socket.io-client";
import AdditionalState from "./AdditionalState.js";
import { BatteryStatusCallback, BatteryStatusMessage } from "./BatteryStatus.js";
import { CapabilityStatusCallback, CapabilityStatusMessage } from "./CapabilityStatus.js";
import Config from "./Config.js";
import { ConfigStatusCallback, ConfigStatusMessage } from "./ConfigStatus.js";
import Device from "./Device.js";
import ChangeMessage, { DeviceChangeCallback, DeviceChangeMessage } from "./DeviceChangeMessage.js";
import DeviceState from "./DeviceState.js";
import { DeviceStatusCallback, DeviceStatusMessage } from "./DeviceStatus.js";
import { Floorplan } from "./Floorplan.js";
import History from "./History.js";
import PaginationResponse from "./Pagination.js";
import Sensor from "./Sensor.js";
import { SensorStatusCallback, SensorStatusMessage } from "./SensorStatus.js";
import SocketIONamespace from "./SocketIONamespace.js";

type ErrorHandler = (error: { response: { status: number } }) => void;

export default class PowerPiApi {
    private readonly instance: AxiosInstance;

    private socket: Socket | undefined;

    private readonly listeners: {
        device: DeviceStatusCallback[];
        sensor: SensorStatusCallback[];
        battery: BatteryStatusCallback[];
        capability: CapabilityStatusCallback[];
        change: DeviceChangeCallback[];
        config: ConfigStatusCallback[];
    };

    private readonly headers: { [key: string]: string };

    constructor(private readonly apiBaseUrl: string) {
        this.instance = axios.create({
            baseURL: this.apiBaseUrl,
        });

        this.listeners = {
            device: [],
            sensor: [],
            battery: [],
            capability: [],
            change: [],
            config: [],
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

    public async postDeviceChange(
        device: string,
        state?: DeviceState,
        additionalState?: AdditionalState,
    ) {
        let message: ChangeMessage = {};

        if (state) {
            message["state"] = state;
        }

        if (additionalState) {
            message = { ...message, ...additionalState };
        }

        await this.post(`device/${device}`, message);
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

    public addDeviceChangeListener(callback: DeviceChangeCallback) {
        this.connectSocketIO();
        this.listeners.change.push(callback);
    }

    public addConfigChangeListener(callback: ConfigStatusCallback) {
        this.connectSocketIO();
        this.listeners.config.push(callback);
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

    public removeDeviceChangeListener(callback: DeviceChangeCallback) {
        this.listeners.change = this.listeners.change.filter((listener) => listener === callback);
    }

    public removeConfigChangeListener(callback: ConfigStatusCallback) {
        this.listeners.config = this.listeners.config.filter((listener) => listener === callback);
    }

    public setErrorHandler(handler: ErrorHandler) {
        this.instance.interceptors.response.use((response) => response, handler);
    }

    public setCredentials(token: string) {
        this.headers.Authorization = `Bearer ${token}`;
    }

    private readonly onDeviceMessage = (message: DeviceStatusMessage) =>
        this.listeners.device.forEach((listener) => listener(message));

    private readonly onSensorMessage = (message: SensorStatusMessage) =>
        this.listeners.sensor.forEach((listener) => listener(message));

    private readonly onBatteryMessage = (message: BatteryStatusMessage) =>
        this.listeners.battery.forEach((listener) => listener(message));

    private readonly onCapabilityMessage = (message: CapabilityStatusMessage) =>
        this.listeners.capability.forEach((listener) => listener(message));

    private readonly onDeviceChangeMessage = (message: DeviceChangeMessage) =>
        this.listeners.change.forEach((listener) => listener(message));

    private readonly onConfigMessage = (message: ConfigStatusMessage) =>
        this.listeners.config.forEach((listener) => listener(message));

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
            this.socket.on(SocketIONamespace.Change, this.onDeviceChangeMessage);
            this.socket.on(SocketIONamespace.Config, this.onConfigMessage);
        }
    }
}
