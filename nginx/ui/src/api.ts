import axios, { AxiosResponse } from 'axios';
import HttpStatusCodes from 'http-status-codes';

export type DeviceState = 'on' | 'off' | 'unknown';

export interface Device {
    name: string;
    type: string;
    state: DeviceState;
    since: number;
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

    private apiBaseUrl = 'http://localhost:3000/api';

    public getDevices = () => this.get('device') as Promise<Device[]>;

    public postMessage = (device: Device, state: DeviceState) => 
            this.post(`topic/device/${device.name}/change`, { state: state });

    private async get(path: string): Promise<any> {
        let config = {
            headers: {
                'X-User': 'tom'
            }
        };
        let result = await axios.get(`${this.apiBaseUrl}/${path}`, config);
        this.checkForError(result);
        return result.data;
    }

    private async post(path: string, message: any): Promise<any> {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'X-User': 'tom'
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
