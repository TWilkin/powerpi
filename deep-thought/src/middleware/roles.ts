import {
  $log,
  EndpointInfo,
  IMiddleware,
  Middleware,
  Req,
  UseBefore
} from "@tsed/common";
import { StoreSet, useDecorators } from "@tsed/core";
import { Unauthorized } from "@tsed/exceptions";
import Role from "../models/roles";
import User from "../models/user";
import HttpStatus = require("http-status-codes");

export default function RequiresRole(...roles: Role[]) {
  return useDecorators(
    UseBefore(RoleMiddleware),
    StoreSet(RoleMiddleware, roles)
  );
}

@Middleware()
class RoleMiddleware implements IMiddleware {
  public use(@Req() request: Req, @EndpointInfo() endpoint: EndpointInfo) {
    $log.info(JSON.stringify(request.user));
    if (request.user && request.isAuthenticated()) {
      const user = request.user as User;

      const roles = endpoint.get(RoleMiddleware);
      if (user.role && user.role in roles) {
        $log.info(`User ${user.email} is authorised.`);
        return true;
      }
    }

    $log.info("User not authorised.");
    throw new Unauthorized(HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED));
  }
}
