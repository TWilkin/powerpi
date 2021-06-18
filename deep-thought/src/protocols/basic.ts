import { Arg, OnVerify, Protocol } from "@tsed/passport";
import { BasicStrategy, BasicStrategyOptions } from "passport-http";

@Protocol<BasicStrategyOptions>({
  name: "basic",
  useStrategy: BasicStrategy
})
export default class BasicProtocol implements OnVerify {
  $onVerify(@Arg(0) clientId: string, @Arg(1) clientSecret: string) {
    // check client id and secret
    return true;
  }
}
