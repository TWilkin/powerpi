import * as HarmonyActivity from "./HarmonyActivity.schema.json";
import * as HarmonyHub from "./HarmonyHub.schema.json";

export default function loadHarmonySchema() {
    return {
        HarmonyActivity,
        HarmonyHub,
    };
}
