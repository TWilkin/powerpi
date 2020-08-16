export class Device {
    type: string | undefined = undefined;
    name: string = '';
};

export class Light extends Device {
    mac: string | undefined = undefined;
    ip: string | undefined = undefined;
};

export interface Lights {
    [name: string]: any
};
