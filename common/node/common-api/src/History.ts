interface History {
    type: string;
    entity: string;
    action: string;
    timestamp?: string;
    message?: object;
}
export default History;
