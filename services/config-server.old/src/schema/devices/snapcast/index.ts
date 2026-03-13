import * as SnapcastClient from "./SnapcastClient.schema.json" with { type: "json" };
import * as SnapcastServer from "./SnapcastServer.schema.json" with { type: "json" };

export default function loadSnapcastSchema() {
    return {
        SnapcastClient,
        SnapcastServer,
    };
}
