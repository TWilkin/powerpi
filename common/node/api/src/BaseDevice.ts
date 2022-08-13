export default interface BaseDevice {
    name: string;
    display_name: string;
    visible: boolean;
    type: string;
    location?: string;
}
