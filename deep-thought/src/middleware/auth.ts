import { useDecorators } from "@tsed/core";
import { Authorize as PassportAuthorize } from "@tsed/passport";

export default function Authorize() {
  return useDecorators(PassportAuthorize("google"));
}
