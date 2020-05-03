import axios, { AxiosResponse } from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import loggy from 'loggy';
import xml2js from 'xml2js';

// constants for the application
const urlBase = 'http://freedns.afraid.org/api/?action=getdyndns&v=2&style=xml'
const username = process.env.FREEDNS_USER as string;
const password = getPassword(process.env.FREEDNS_PASSWORD as string);
const interval = 5 * 60 * 1000;

// check if the password is a file
function getPassword(file: string): string {
    if(fs.existsSync(file)) {
        // read from the file
        return fs.readFileSync(file, 'utf8').trim();
    }

    // it's not a file
    return file;
}

// update the DNS records for the specified account
async function updateDNS() {
    // create the hashed credentials
    loggy.info(`Accessing account for ${username}.`);
    const hash = crypto.createHash('sha1');
    hash.update(`${username}|${password}`);
    let sha1 = hash.digest('hex');
    
    try {
        // download the XML document
        const response = await axios.get(`${urlBase}&sha=${sha1}`);

        // convert from XML
        const data = await xml2js.parseStringPromise(response.data);

        // update all the DNS entries
        for (let element of data.xml.item) {
            if(element.url && element.url[0]) {
                updateRecord(element.host, element.url[0]);
            }
        }
    } catch(error) {
        loggy.error(error);
    }
}

// update the DNS record for the supplied record
async function updateRecord(host: string, url: string): Promise<AxiosResponse<any>> {
    loggy.info(`Attempting to update host ${host}.`);
    const response = await axios.get(url);
    loggy.info(`Updated host ${host}.`);
    return response;
}

// start the program
updateDNS();
setInterval(updateDNS, interval);
