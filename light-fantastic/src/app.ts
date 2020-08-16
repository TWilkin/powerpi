import { reduce } from 'awaity';
import fs from 'fs';
import Lifx from 'node-lifx-lan';
import Logger from 'loggy';
import util from 'util';

import { Device, Light, Lights } from './devices';
import { Schedule, ScheduleExecutor } from './executor';

// allow reading of files using await
const readFile = util.promisify(fs.readFile);

// start the service running
main();

async function main() {
    // load the config files
    const devices = JSON.parse(
        (await readFile(process.env['DEVICES_FILE'] as string)).toString()
    ).devices;
    const schedules = JSON.parse(
        (await readFile(process.env['SCHEDULES_FILE'] as string)).toString()
    );

    // create the light devices
    let lights: Lights = await reduce(
        devices.filter((device: Device) => device.type == 'light'),
        async (acc: Lights, device: Light) => {
            const light = await Lifx.createDevice({mac: device.mac, ip: device.ip});
            return {
                ...acc,
                [device.name]: light
            };
        }, 
        {}
    );
    Logger.info(`Found ${Object.keys(lights).length} light(s)`);

    // create the schedule intervals
    Logger.info(`Found ${schedules.schedules.length} schedule(s)`);
    schedules.schedules.forEach((schedule: Schedule) => new ScheduleExecutor(
        schedule,
        schedules.timezone,
        lights[schedule.device]
    ).run());
}
