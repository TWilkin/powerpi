export default interface Sensor {
    name: string;
    display_name: string;
    visible: boolean;
    type: string;
    location: string;
    state?: string;
    value?: number;
    unit?: string;
    since: number;
}
