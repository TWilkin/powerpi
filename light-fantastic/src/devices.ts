import Logger from 'loggy';
import ping from 'ping';

export class Device {
    type: string | undefined = undefined;
    name: string = '';
};

export class Light extends Device {
    mac: string | undefined = undefined;
    hostname: string | undefined = undefined;
    ip: string | undefined = undefined;
};

export interface Lights {
    [name: string]: any
};

export async function hostnameToIP(hostname: string | undefined) {
    if(!hostname) {
        return null;
    }

    Logger.info(`Searching for IP of ${hostname}`);

    let result = await ping.promise.probe(hostname);

    return result?.numeric_host?.replace(')', '');
}
