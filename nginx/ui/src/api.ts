import axios, { AxiosResponse } from 'axios';
import HttpStatusCodes from 'http-status-codes';
import io from 'socket.io-client';

export type DeviceState = 'on' | 'off' | 'unknown';

export interface Device {
    name: string;
    type: string;
    state: DeviceState;
    since: number;
};

export interface SocketListener {
    onMessage(message: any): void;
};

export class ApiException extends Error {

    constructor(private _statusCode: number, message: string) {
        super(message);
    }

    get statusCode() {
        return this._statusCode;
    }
};

export class Api {

    private apiBaseUrl = `${window.location.origin}/api`;

    public getDevices = () => this.get('device') as Promise<Device[]>;

    public postMessage = (device: Device, state: DeviceState) => 
            this.post(`topic/device/${device.name}/change`, { state: state });

    public connectSocket(callback: SocketListener) {
        const socket = io.connect(this.apiBaseUrl, {
            path: '/api/socket.io'
        });
        socket.on('message', callback.onMessage);
    }

    private async get(path: string): Promise<any> {
        let result = await axios.get(`${this.apiBaseUrl}/${path}`);
        this.checkForError(result);
        return result.data;
    }

    private async post(path: string, message: any): Promise<any> {
        let config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        let result = await axios.post(
            `${this.apiBaseUrl}/${path}`, 
            JSON.stringify(message), 
            config
        );
        this.checkForError(result);
        return result.data;
    }

    private checkForError(result: AxiosResponse<any>) {
        switch(result.status) {
            case HttpStatusCodes.OK:
            case HttpStatusCodes.CREATED:
                return;
            
            case HttpStatusCodes.UNAUTHORIZED:
            case HttpStatusCodes.FORBIDDEN:
                throw new ApiException(result.status, 'User is not authroised to access this endpoint.');
            
            case HttpStatusCodes.NOT_FOUND:
                throw new ApiException(result.status, 'The API endpoint could not be found.');
            
            case HttpStatusCodes.BAD_REQUEST:
                throw new ApiException(result.status, 'The API request was malformed.');

            case HttpStatusCodes.INTERNAL_SERVER_ERROR:
            default:
                throw new ApiException(result.status, 'The API endpoint did not respond as expected.');
        }
    }
    
};
