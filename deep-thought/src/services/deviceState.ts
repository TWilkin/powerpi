import { Service } from '@tsed/common';

import Config from './config';
import { Device, DeviceConfig } from '../models/device';
import MqttService, { MqttListener } from './mqtt';

@Service()
export default class DeviceStateService implements MqttListener {

    private topicMatcherRegex: RegExp;

    private _devices: Device[] | undefined;

    constructor(private readonly config: Config, private readonly mqttService: MqttService) {
        this._devices = undefined;
        this.topicMatcherRegex = new RegExp(this.topicName('.*')).compile();
    }

    public get devices() {
        return this._devices ?? [];
    }

    public get topicMatcher() {
        return this.topicMatcherRegex;
    }

    public async $onInit() {
        await this.initialise();

        this.mqttService.subscribe(this.topicName('+'), this);
    }

    public async onMessage(topic: string, message: any) {
        let [ , , deviceName, ] = topic.split('/', 4);

        let device = this.devices
            .find(device => device.name === deviceName);
        
        if(device) { 
            device.state = message.state;
            device.since = message.timestamp;
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

    private topicName = (placeholder: string) => `${this.config.topicNameBase}/device/${placeholder}/status`;

};
