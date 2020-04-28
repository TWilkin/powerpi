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
    ).schedules;

    // create the light devices
    let lights: Lifx.LifxLanDevice[] = await Promise.all(devices
        .filter(device => device.type == 'light')
        .map(device => Lifx.createDevice({mac: device.mac, ip: device.ip}))
    );
    Logger.info(`Found ${lights.length} light(s)`);

    // create the schedule intervals
    Logger.info(`Found ${schedules.length} schedule(s)`);
    schedules.forEach((schedule: Schedule) => new ScheduleExecutor(schedule).run());
}
