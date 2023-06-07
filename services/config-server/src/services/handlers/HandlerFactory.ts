import { ConfigFileType, IDeviceConfigFile } from "@powerpi/common";
import { Service } from "typedi";
import Container from "../../container";
import DeviceHandler from "./DeviceHandler";
import IHandler from "./IHandler";

@Service()
export default class HandlerFactory {
    build<TConfigFile extends IDeviceConfigFile>(
        type: ConfigFileType
    ): IHandler<TConfigFile> | undefined {
        switch (type) {
            case ConfigFileType.Devices:
                return Container.get(DeviceHandler);
        }

        return undefined;
    }
}
