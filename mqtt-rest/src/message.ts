import { Request } from 'express';
import { IncomingMessage } from 'http';

export class BodyParserIncomingMessage extends IncomingMessage {

    rawBody: string = '';

};

export interface BodyParserRequest extends Request {

    rawBody: string;

};
