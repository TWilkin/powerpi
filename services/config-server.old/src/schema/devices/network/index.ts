import * as Computer from "./Computer.schema.json" with { type: "json" };

export default function loadNetworkSchema() {
    return {
        Computer,
    };
}
