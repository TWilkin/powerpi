import axios, { AxiosInstance, AxiosResponse } from "axios";
import io from "socket.io-client";
import Device from "./Device";
import DeviceState from "./DeviceState";
import { DeviceStatusCallback, DeviceStatusMessage } from "./DeviceStatus";
import History from "./History";

class PowerPiApi {
  private readonly apiBaseUrl = `${window.location.origin}/api`;
  private readonly instance: AxiosInstance;
  private readonly socket: SocketIOClient.Socket;
  private listeners: DeviceStatusCallback[];

  constructor() {
    this.instance = axios.create({
      baseURL: this.apiBaseUrl
    });

    this.socket = io.connect(this.apiBaseUrl, {
      path: "/api/socket.io"
    });
    this.listeners = [];

    this.socket.on("message", this.onMessage);
  }

  public getDevices = () => this.get("device") as Promise<Device[]>;

  public getHistory = (type?: string, entity?: string, action?: string) =>
    this.get("history", { type, entity, action }) as Promise<History[]>;

  public getHistoryTypes = () =>
    this.get("history/types") as Promise<{ type: string }[]>;

  public getHistoryEntities = () =>
    this.get("history/entities") as Promise<{ entity: string }[]>;

  public getHistoryActions = () =>
    this.get("history/actions") as Promise<{ action: string }[]>;

  public postMessage = (device: string, state: DeviceState) =>
    this.post(`topic/device/${device}/change`, { state });

  public addListener(callback: DeviceStatusCallback) {
    this.listeners.push(callback);
  }

  public removeListener(callback: DeviceStatusCallback) {
    this.listeners = this.listeners.filter((listener) => listener === callback);
  }

  public setErrorHandler(handler: (error: any) => void) {
    this.instance.interceptors.response.use((response) => response, handler);
  }

  private onMessage = (message: DeviceStatusMessage) =>
    this.listeners.forEach((listener) => listener(message));

  private async get(path: string, params?: object): Promise<any> {
    const result = await this.instance.get(path, { params });
    return result.data;
  }

  private async post(path: string, message: any): Promise<any> {
    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    const result = await this.instance.post(
      path,
      JSON.stringify(message),
      config
    );
    return result.data;
  }
}
export default PowerPiApi;
