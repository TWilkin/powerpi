import { reduce } from 'awaity';
import fs from 'fs';
import Lifx from 'node-lifx-lan';
import Logger from 'loggy';
import util from 'util';

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
    let lights = await reduce(
        devices.filter(device => device.type == 'light'),
        async (acc, device) => {
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
    Logger.info(`Found ${schedules.length} schedule(s)`);
    schedules.schedules.forEach((schedule: Schedule) => new ScheduleExecutor(
        schedule,
        schedules.timezone,
        lights[schedule.device]
    ).run());
}
