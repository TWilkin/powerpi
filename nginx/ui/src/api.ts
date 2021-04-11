import axios, { AxiosResponse } from "axios";
import HttpStatusCodes from "http-status-codes";
import io from "socket.io-client";
import { ApiException } from "./ApiException";

export type DeviceState = "on" | "off" | "unknown";

export interface Device {
  name: string;
  display_name: string;
  visible: boolean;
  type: string;
  state: DeviceState;
  since: number;
}

export interface History {
  type: string;
  entity: string;
  action: string;
  timestamp?: Date;
  message?: object;
}

export interface SocketListener {
  onMessage(message: any): void;
}

export class Api {
  private apiBaseUrl = `${window.location.origin}/api`;
  private socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io.connect(this.apiBaseUrl, {
      path: "/api/socket.io"
    });
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

  public addListener(callback: SocketListener) {
    this.socket.on("message", callback.onMessage);
  }

  private async get(path: string, params?: object): Promise<any> {
    const result = await axios.get(`${this.apiBaseUrl}/${path}`, { params });
    this.checkForError(result);
    return result.data;
  }

  private async post(path: string, message: any): Promise<any> {
    const config = {
      headers: {
        "Content-Type": "application/json"
      }
    };
    const result = await axios.post(
      `${this.apiBaseUrl}/${path}`,
      JSON.stringify(message),
      config
    );
    this.checkForError(result);
    return result.data;
  }

  private checkForError(result: AxiosResponse<any>) {
    switch (result.status) {
      case HttpStatusCodes.OK:
      case HttpStatusCodes.CREATED:
        return;

      case HttpStatusCodes.UNAUTHORIZED:
      case HttpStatusCodes.FORBIDDEN:
        throw new ApiException(
          result.status,
          "User is not authroised to access this endpoint."
        );

      case HttpStatusCodes.NOT_FOUND:
        throw new ApiException(
          result.status,
          "The API endpoint could not be found."
        );

      case HttpStatusCodes.BAD_REQUEST:
        throw new ApiException(result.status, "The API request was malformed.");

      case HttpStatusCodes.INTERNAL_SERVER_ERROR:
      default:
        throw new ApiException(
          result.status,
          "The API endpoint did not respond as expected."
        );
    }
  }
}
