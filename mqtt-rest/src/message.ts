import { Request } from 'express';
import { IncomingMessage } from 'http';

export class BodyParserIncomingMessage extends IncomingMessage {

    rawBody: string = '';

};

export interface BodyParserRequest extends Request {

    rawBody: string;

};

export class TopicMessage {
    type: string;
    entity: string;
    action: string;

    constructor(params: any) {
        this.type = params['type'];
        this.entity = params['entity'];
        this.action = params['action'];
    }

    get topicName() {
        return `${this.type}/${this.entity}/${this.action}`;
    }
};
