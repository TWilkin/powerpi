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
import User from "../models/user";
import Role from "../roles";
import UserService from "../services/user";

export default function RequiresRole(...roles: Role[]) {
  return useDecorators(
    UseBefore(RoleMiddleware),
    StoreSet(RoleMiddleware, roles)
  );
}

interface RequestWithUser extends Request {
  user: User | undefined;
  isAuthenticated: () => boolean;
}

@Middleware()
class RoleMiddleware implements IMiddleware {
  constructor(private readonly userService: UserService) {}

  public use(
    @Req() request: RequestWithUser,
    @EndpointInfo() endpoint: EndpointInfo
  ) {
    if (request.user && request.user.role && request.isAuthenticated()) {
      $log.info(
        `Found user ${request.user.name} with role ${request.user.role}.`
      );
      const roles = endpoint.get(RoleMiddleware);

      if (request.user.role in roles) {
        $log.info(`User ${request.user.name} is authorised.`);
        return;
      }
    }

    $log.info(`User not authorised.`);
    throw new Unauthorized(HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED));
  }
}
