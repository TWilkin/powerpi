import Resources from "../../@types/resources";

type SupportSensorState = keyof Resources["translation"]["common"]["sensors"]["states"];

/** Returns whether the supplied state has a supported translation.
 * @param state The state to check for a translation.
 * @returns Whether the state has a supported translation.
 */
export default function isSupportedSensorState(state: string): state is SupportSensorState {
    return ["detected", "undetected", "open", "close"].includes(state);
}
