import { Container as CommonContainer } from "powerpi-common";
import { Constructable, Container as LocalContainer } from "typedi";

export default class Container {
    public static get<TService>(identifier: Constructable<TService>): TService {
        try {
            return CommonContainer.get(identifier);
        } catch {
            return LocalContainer.get(identifier);
        }
    }

    public static set<TService>(identifier: Constructable<TService>, service: TService) {
        CommonContainer.set(identifier, service);
    }

    public static override<TParent, TOverride extends TParent>(
        parent: Constructable<TParent>,
        override: Constructable<TOverride>
    ) {
        const instance = this.get(override);
        this.set(parent, instance);
    }
}
