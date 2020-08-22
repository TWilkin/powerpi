import { Request } from 'express';
import HttpStatus from 'http-status-codes';
import { EndpointInfo, IMiddleware, Middleware, Req, UseAuth } from '@tsed/common';
import { useDecorators } from '@tsed/core';
import { Forbidden, Unauthorized } from '@tsed/exceptions';

import { getRoles, Role } from '../roles';

export * from '../roles';

export function RequiresRole(roles: Role[]): Function {
    return useDecorators(
        UseAuth(AuthMiddleware, roles)
    )
};

@Middleware()
class AuthMiddleware implements IMiddleware {
    public use(
        @Req() request: Request,
        @EndpointInfo() endpoint: EndpointInfo
    ) {
        const roles: Role[] = endpoint.get(AuthMiddleware) || [];

        const user = request.get('X-User');

        if(!user || user === '') {
            throw new Unauthorized(HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED));
        }

        if(getRoles(user).filter(role => roles.includes(role)).length == 0) {
            throw new Forbidden(HttpStatus.getStatusText(HttpStatus.FORBIDDEN));
        }
    }
}
