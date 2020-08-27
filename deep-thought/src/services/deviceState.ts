import { Service } from '@tsed/common';

import Config from './config';
import { Device, DeviceConfig } from '../models/device';

@Service()
export default class DeviceStateService {

    private _devices: Device[];

    constructor(private readonly config: Config) {
        this._devices = [];
    }

    async getDevices() {
        if(this._devices.length === 0) {
            this._devices = (await this.config.getDevices())
                .map((device: DeviceConfig) => ({
                    name: device.name,
                    type: device.type,
                    state: 'unknown'
                }));
        }

        return this._devices;
    }

};
