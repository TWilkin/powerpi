import { reduce } from 'awaity';
import Lifx from 'node-lifx-lan';
import Logger from 'loggy';
import { connect, MqttClient } from 'mqtt';
import os from 'os';

import Config from './config';
import { Device, Light, Lights, hostnameToIP } from './devices';
import { Schedule, ScheduleExecutor } from './executor';

// start the service running
main();

async function main() {
    // load the config
    const config = new Config();
    await config.load();

    // connect to MQTT
    const mqttClient = connectMQTT(config);

    // create the light devices
    let lights: Lights = await reduce(
        config.devices.filter((device: Device) => device.type == 'light'),
        async (acc: Lights, device: Light) => {
            const ip = device.ip ?? await hostnameToIP(device.hostname);
            const light = await Lifx.createDevice({mac: device.mac, ip: ip});
            return {
                ...acc,
                [device.name]: light
            };
        }, 
        {}
    );
    Logger.info(`Found ${Object.keys(lights).length} light(s)`);

    // create the schedule intervals
    Logger.info(`Found ${config.schedules.schedules.length} schedule(s)`);
    config.schedules.schedules.forEach((schedule: Schedule) => new ScheduleExecutor(
        config,
        schedule,
        mqttClient,
        config.schedules.timezone,
        lights[schedule.device]
    ).run());
}

function connectMQTT(config: Config): MqttClient {
    const options = {
        clientId: `light-fantastic-${os.hostname}`
    };

    let client = connect(config.mqttAddress, options);
    
    client.on('connect', () => {
        Logger.info(`MQTT client ${options.clientId} connected.`);
    });

    client.on('error', (error) => {
        Logger.error(`MQTT client error: ${error}`);
        process.exit(1);
    });

    return client;
}
