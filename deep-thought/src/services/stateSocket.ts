import { Namespace } from 'socket.io';
import { $log } from '@tsed/common';
import { Nsp, SocketService} from '@tsed/socketio';

import Config from '../services/config';
import { DeviceState } from '../models/device';
import MqttService from '../services/mqtt';
import StateListener from '../services/stateListener';

@SocketService('/api')
export default class DeviceStateSocketService extends StateListener {

    @Nsp
    namespace!: Namespace;

    constructor(
        config: Config, 
        mqttService: MqttService
    ) {
        super(config, mqttService);
    }

    onStateMessage(deviceName: string, state: DeviceState, timestamp: number) {
        this.namespace.emit('message', {
            device: deviceName, 
            state: state,
            timestamp: timestamp
        });
    }

    $onConnection() {
        $log.info('Client connected to socket.');
    }

    $onDisconnect() {
        $log.info('Client disconnected from socket.');
    }

};
