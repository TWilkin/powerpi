import {
  $log,
  EndpointInfo,
  IMiddleware,
  Middleware,
  Req,
  Request,
  UseBefore
} from "@tsed/common";
import { StoreSet, useDecorators } from "@tsed/core";
import { Unauthorized } from "@tsed/exceptions";
import HttpStatus from "http-status-codes";
import Role from "../roles";
import UserService from "../services/user";

export default function RequiresRole(...roles: Role[]) {
  return useDecorators(
    UseBefore(RoleMiddleware),
    StoreSet(RoleMiddleware, roles)
  );
}

@Middleware()
class RoleMiddleware implements IMiddleware {
  constructor(private readonly userService: UserService) {}

  public use(@Req() request: Request, @EndpointInfo() endpoint: EndpointInfo) {
    const roles = endpoint.get(RoleMiddleware);
    $log.info(roles);
    $log.info(this.userService.users);
    throw new Unauthorized(HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED));
  }
}
