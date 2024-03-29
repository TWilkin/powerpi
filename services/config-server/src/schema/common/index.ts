import * as AdditionalState from "./AdditionalState.schema.json";
import * as ColourTemperature from "./ColourTemperature.schema.json";
import * as Condition from "./Condition.schema.json";
import * as DeviceState from "./DeviceState.schema.json";
import * as Hue from "./Hue.schema.json";
import * as Identifier from "./Identifier.schema.json";
import * as JsonPath from "./JsonPatch.schema.json";
import * as MACAddress from "./MACAddress.schema.json";
import * as Percentage from "./Percentage.schema.json";
import * as Port from "./Port.schema.json";
import * as Time from "./Time.schema.json";
import * as WeekDay from "./WeekDay.schema.json";

export default function loadCommonSchema() {
    return {
        AdditionalState,
        ColourTemperature,
        Condition,
        DeviceState,
        Hue,
        Identifier,
        JsonPath,
        MACAddress,
        Percentage,
        Port,
        Time,
        WeekDay,
    };
}
