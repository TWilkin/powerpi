import { connect, IClientPublishOptions, MqttClient } from 'mqtt';
import os from 'os';
import { Service, $log } from '@tsed/common';

import Config from './config';

@Service()
export default class MqttService {

    private client: MqttClient | undefined = undefined;

    constructor(private readonly config: Config) { }

    public publish(topic: string, message: any) {
        this.connect();

        const options: IClientPublishOptions = {
            qos: 2,
            retain: true
        };

        message.timestamp = new Date().getTime();

        this.client?.publish(topic, JSON.stringify(message), options);
    }

    private connect() {
        if(!this.client) {
            const options = {
                clientId: `api-${os.hostname}`
            };
        
            this.client = connect(this.config.mqttAddress, options);
            
            this.client.on('connect', () => {
                $log.info(`MQTT client ${options.clientId} connected.`);
            });
        
            this.client.on('error', (error) => {
                $log.error(`MQTT client error: ${error}`);
                process.exit(1);
            });
        }
    }
};
