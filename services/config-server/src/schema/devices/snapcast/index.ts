import * as SnapcastClient from "./SnapcastClient.schema.json";
import * as SnapcastServer from "./SnapcastServer.schema.json";

export default function loadSnapcastSchema() {
    return {
        SnapcastClient,
        SnapcastServer,
    };
}
