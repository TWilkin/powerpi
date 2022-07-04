import { ConfigFileType } from "@powerpi/common";
import Container, { Service } from "typedi";
import DeviceHandler from "./DeviceHandler";
import IHandler from "./IHandler";

@Service()
export default class HandlerFactory {
    build<TConfigFile>(type: ConfigFileType): IHandler<TConfigFile> | undefined {
        switch (type) {
            case ConfigFileType.Devices:
                return Container.get(DeviceHandler);
        }

        return undefined;
    }
}
