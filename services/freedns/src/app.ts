import axios, { AxiosResponse } from "axios";
import crypto from "crypto";
import { readFile, stat } from "fs/promises";
import loggy from "loggy";
import xml2js from "xml2js";

// constants for the application
const urlBase = "http://freedns.afraid.org/api/?action=getdyndns&v=2&style=xml";
const username = process.env.FREEDNS_USER;
const interval = 5 * 60 * 1000;

// check if the password is a file
async function getPassword(file?: string) {
    if (file) {
        if (await stat(file)) {
            // read from the file
            return (await readFile(file, "utf8")).trim();
        }
    }

    // it's not a file
    return file;
}

// update the DNS records for the specified account
async function updateDNS() {
    // check the credentials
    const password = await getPassword(process.env.FREEDNS_PASSWORD);
    if (!username || !password) {
        throw new Error("Username and password are required");
    }

    // create the hashed credentials
    loggy.info(`Accessing account for ${username}.`);
    const hash = crypto.createHash("sha1");
    hash.update(`${username}|${password}`);
    const sha1 = hash.digest("hex");

    try {
        // download the XML document
        const response = await axios.get(`${urlBase}&sha=${sha1}`);

        // convert from XML
        const data = await xml2js.parseStringPromise(response.data);

        // update all the DNS entries
        for (const element of data.xml.item) {
            if (element.url && element.url[0]) {
                await updateRecord(element.host, element.url[0]);
            }
        }
    } catch (error) {
        loggy.error(error);
        throw error;
    }
}

// update the DNS record for the supplied record
async function updateRecord(host: string, url: string): Promise<AxiosResponse> {
    loggy.info(`Attempting to update host ${host}.`);

    const response = await axios.get(url);

    loggy.info(`Updated host ${host}.`);

    return response;
}

// start the program
updateDNS();
setInterval(updateDNS, interval);
