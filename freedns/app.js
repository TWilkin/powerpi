import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import loggy from 'loggy';
import xml2js from 'xml2js';

// constants for the application
const urlBase = 'http://freedns.afraid.org/api/?action=getdyndns&v=2&style=xml'
const username = process.env.FREEDNS_USER;
const password = getPassword(process.env.FREEDNS_PASSWORD);
const interval = 5 * 60 * 1000;

// check if the password is a file
function getPassword(file) {
    if(fs.existsSync(file)) {
        // read from the file
        return fs.readFileSync(file, 'utf8').trim();
    }

    // it's not a file
    return file;
}

function updateDNS() {
    // create the hashed credentials
    loggy.info(`Accessing account for ${username}.`);
    const hash = crypto.createHash('sha1');
    hash.update(`${username}|${password}`);
    let sha1 = hash.digest('hex');
    
    // download the XML document
    axios.get(`${urlBase}&sha=${sha1}`)
        .then((response) => {
            // convert from XML
            return xml2js.parseStringPromise(response.data);
        }).then((data) => {
            // update all the records
            return Promise.all(
                data.xml.item.map((element) => {
                    if(element.url && element.url[0]) {
                        loggy.info(`Attempting to update host ${element.host}.`);
                        return updateRecord(element.host, element.url[0]);
                    }
                    return null;
                })
            );
        }).catch((error) => {
            loggy.error(error);
        });
    
    // now schedule it to run again
    loggy.info(`Waiting ${interval}ms.`);
    setTimeout(updateDNS, interval);
}

function updateRecord(host, url) {
    return axios.get(url)
        .then(() => {
            loggy.info(`Updated host ${host}.`);
        });
}

// start the program
updateDNS();
