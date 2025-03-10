import * as AdditionalState from "./AdditionalState.schema.json" with { type: "json" };
import * as ColourTemperature from "./ColourTemperature.schema.json" with { type: "json" };
import * as Condition from "./Condition.schema.json" with { type: "json" };
import * as Cron from "./Cron.schema.json" with { type: "json" };
import * as DeviceState from "./DeviceState.schema.json" with { type: "json" };
import * as Hue from "./Hue.schema.json" with { type: "json" };
import * as Identifier from "./Identifier.schema.json" with { type: "json" };
import * as JsonPath from "./JsonPatch.schema.json" with { type: "json" };
import * as MACAddress from "./MACAddress.schema.json" with { type: "json" };
import * as Percentage from "./Percentage.schema.json" with { type: "json" };
import * as Port from "./Port.schema.json" with { type: "json" };

export default function loadCommonSchema() {
    return {
        AdditionalState,
        ColourTemperature,
        Condition,
        Cron,
        DeviceState,
        Hue,
        Identifier,
        JsonPath,
        MACAddress,
        Percentage,
        Port,
    };
}
