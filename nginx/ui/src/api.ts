import axios, { AxiosResponse } from 'axios';
import HttpStatusCodes from 'http-status-codes';

export class ApiException extends Error {

    constructor(private _statusCode: number, message: string) {
        super(message);
    }

    get statusCode() {
        return this._statusCode;
    }
}

export default class Api {

    public getDevices = () => this.get('device');

    private async get(path: string): Promise<any> {
        let config = {
            headers: {
                'X-User': 'tom'
            }
        };
        let result = await axios.get(`http://localhost:3000/api/${path}`, config);
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
