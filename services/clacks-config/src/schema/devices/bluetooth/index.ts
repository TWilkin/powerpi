import * as BluetoothDevice from "./BluetoothDevice.schema.json";
import * as BluetoothPresence from "./BluetoothPresence.schema.json";

export default function loadBluetoothSchema() {
    return {
        BluetoothDevice,
        BluetoothPresence,
    };
}
