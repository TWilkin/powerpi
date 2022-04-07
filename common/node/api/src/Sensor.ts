export default interface Sensor {
    name: string;
    display_name: string;
    visible: boolean;
    type: string;
    location: string;
    entity?: string;
    action?: string;
    state?: string;
    value?: number;
    unit?: string;
    since: number;
    battery?: number;
    batterySince?: number;
}
