import fs from 'fs';
import Lifx from 'node-lifx-lan';
import Logger from 'loggy';
import util from 'util';

// allow reading of files using await
const readFile = util.promisify(fs.readFile);

// start the service running
main();

async function main() {
    // load the config files
    let devices = JSON.parse(
        (await readFile(process.env['DEVICES_FILE'] as string)).toString()
    );

    // create the light devices
    let lights: Lifx.LifxLanDevice[] = await Promise.all(devices.devices
        .filter(device => device.type == 'light')
        .map(device => Lifx.createDevice({mac: device.mac, ip: device.ip}))
    );
    Logger.info(`Found ${lights.length} light(s)`);
}
