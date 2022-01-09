import axios, { AxiosInstance } from "axios";
import io from "socket.io-client";
import Device from "./Device";
import DeviceState from "./DeviceState";
import { DeviceStatusCallback, DeviceStatusMessage } from "./DeviceStatus";
import History from "./History";
import PaginationResponse from "./Pagination";

type ErrorHandler = (error: { response: { status: number } }) => void;

export default class PowerPiApi {
    private readonly instance: AxiosInstance;
    private socket: SocketIOClient.Socket | undefined;
    private listeners: DeviceStatusCallback[];
    private headers: { [key: string]: string };

    constructor(private readonly apiBaseUrl: string) {
        this.instance = axios.create({
            baseURL: this.apiBaseUrl,
        });

        this.listeners = [];

        this.headers = {};
    }

    public getDevices = () => this.get<Device[]>("device");

    public getHistory = (
        type?: string,
        entity?: string,
        action?: string,
        page?: number,
        records?: number
    ) => this.get<PaginationResponse<History>>("history", { type, entity, action, page, records });

    public getHistoryTypes = () => this.get<{ type: string }[]>("history/types");

    public getHistoryEntities = (type?: string) =>
        this.get<{ entity: string }[]>("history/entities", { type });

    public getHistoryActions = (type?: string) =>
        this.get<{ action: string }[]>("history/actions", { type });

    public postMessage = (device: string, state: DeviceState) =>
        this.post(`topic/device/${device}/change`, { state });

    public addListener(callback: DeviceStatusCallback) {
        this.connectSocketIO();
        this.listeners.push(callback);
    }

    public removeListener(callback: DeviceStatusCallback) {
        this.listeners = this.listeners.filter((listener) => listener === callback);
    }

    public setErrorHandler(handler: ErrorHandler) {
        this.instance.interceptors.response.use((response) => response, handler);
    }

    public setCredentials(token: string) {
        this.headers.Authorization = `Bearer ${token}`;
    }

    private onMessage = (message: DeviceStatusMessage) =>
        this.listeners.forEach((listener) => listener(message));

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
            this.socket = io.connect(this.apiBaseUrl, {
                path: "/api/socket.io",
            });

            this.socket.on("message", this.onMessage);
        }
    }
}
