import { Request } from 'express';
import HttpStatus from 'http-status-codes';
import { EndpointInfo, IMiddleware, Middleware, Req, UseAuth } from '@tsed/common';
import { useDecorators } from '@tsed/core';
import { Forbidden, Unauthorized } from '@tsed/exceptions';

import Role from '../roles';

export default function RequiresRole(roles: Role[]): Function {
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
        const userRoles: Role[] | undefined = request.get('X-Roles')?.split(' ')?.map(role => (<any>Role)[role]);

        if(!user || user === '') {
            throw new Unauthorized(HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED));
        }

        if(userRoles?.filter(role => roles.includes(role)).length == 0) {
            throw new Forbidden(HttpStatus.getStatusText(HttpStatus.FORBIDDEN));
        }
    }
}
