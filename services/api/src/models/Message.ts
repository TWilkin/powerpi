export default interface Message {
    type: string;
    entity: string;
    action: string;
    message: string | object;
    timestamp: number;
}
