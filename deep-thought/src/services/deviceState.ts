import { Service } from '@tsed/common';

import Config from './config';
import { Device, DeviceConfig, DeviceState } from '../models/device';
import MqttService from './mqtt';
import StateListener from './stateListener';

@Service()
export default class DeviceStateService extends StateListener {

    private _devices: Device[] | undefined;

    constructor(config: Config, mqttService: MqttService) {
        super(config, mqttService);

        this._devices = undefined;
    }

    public get devices() {
        return this._devices ?? [];
    }

    public async $onInit() {
        await this.initialise();

        super.$onInit();
    }

    protected onStateMessage(deviceName: string, state: DeviceState, timestamp: number) {
        let device = this.devices
            .find(device => device.name === deviceName);
        
        if(device) { 
            device.state = state;
            device.since = timestamp;
        }
    }

    private async initialise() {
        this._devices = (await this.config.getDevices())
            .map((device: DeviceConfig) => ({
                name: device.name,
                type: device.type,
                state: 'unknown',
                since: -1
            }));
    }

};
