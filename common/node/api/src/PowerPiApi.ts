import axios, { AxiosInstance } from "axios";
import { connect, Socket } from "socket.io-client";
import Config from "./Config";
import Device from "./Device";
import DeviceState from "./DeviceState";
import { DeviceStatusCallback, DeviceStatusMessage } from "./DeviceStatus";
import { Floorplan } from "./Floorplan";
import History from "./History";
import PaginationResponse from "./Pagination";
import Sensor from "./Sensor";
import { SensorStatusCallback, SensorStatusMessage } from "./SensorStatus";

type ErrorHandler = (error: { response: { status: number } }) => void;

export default class PowerPiApi {
    private readonly instance: AxiosInstance;
    private socket: Socket | undefined;
    private listeners: {
        device: DeviceStatusCallback[];
        sensor: SensorStatusCallback[];
    };
    private headers: { [key: string]: string };

    constructor(private readonly apiBaseUrl: string) {
        this.instance = axios.create({
            baseURL: this.apiBaseUrl,
        });

        this.listeners = {
            device: [],
            sensor: [],
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
        lastDate?: Date,
        records?: number
    ) =>
        this.get<PaginationResponse<History>>("history", {
            type,
            entity,
            action,
            lastDate,
            records,
        });

    public getHistoryRange = (
        start?: Date,
        end?: Date,
        type?: string,
        entity?: string,
        action?: string
    ) => this.get<History[]>("history/range", { start, end, type, entity, action });

    public getHistoryTypes = () => this.get<{ type: string }[]>("history/types");

    public getHistoryEntities = (type?: string) =>
        this.get<{ entity: string }[]>("history/entities", { type });

    public getHistoryActions = (type?: string) =>
        this.get<{ action: string }[]>("history/actions", { type });

    public postMessage = (device: string, state: DeviceState) =>
        this.post(`topic/device/${device}/change`, { state });

    public addDeviceListener(callback: DeviceStatusCallback) {
        this.connectSocketIO();
        this.listeners.device.push(callback);
    }

    public addSensorListener(callback: SensorStatusCallback) {
        this.connectSocketIO();
        this.listeners.sensor.push(callback);
    }

    public removeDeviceListener(callback: DeviceStatusCallback) {
        this.listeners.device = this.listeners.device.filter((listener) => listener === callback);
    }

    public removeSensorListener(callback: SensorStatusCallback) {
        this.listeners.sensor = this.listeners.sensor.filter((listener) => listener === callback);
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
            config
        );
        return result?.data;
    }

    private connectSocketIO() {
        if (!this.socket) {
            this.socket = connect(this.apiBaseUrl, {
                path: "/api/socket.io",
            });

            this.socket.on("device", this.onDeviceMessage);
            this.socket.on("sensor", this.onSensorMessage);
        }
    }
}
