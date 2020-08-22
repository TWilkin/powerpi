export enum Role {
    WEB,
    USER
};

export function getRoles(user: string): Role[] {
    if(user === 'ifttt') {
        return [ Role.WEB ];
    } else if(user === 'tom') {
        return [ Role.WEB, Role.USER ];
    }

    return [];
};
