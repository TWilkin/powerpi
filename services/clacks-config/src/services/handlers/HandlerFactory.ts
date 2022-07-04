import { ConfigFileType } from "@powerpi/common";
import { Service } from "typedi";
import Handler from "./IHandler";

@Service()
export default class HandlerFactory {
    build(type: ConfigFileType): Handler | undefined {
        return undefined;
    }
}
