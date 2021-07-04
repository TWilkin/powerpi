import { Container as CommonContainer } from "powerpi-common";
import { Constructable, Container as LocalContainer } from "typedi";

export default class Container {
  public static get<T>(identifier: Constructable<T>): T {
    try {
      return CommonContainer.get(identifier);
    } catch {
      return LocalContainer.get(identifier);
    }
  }
}
