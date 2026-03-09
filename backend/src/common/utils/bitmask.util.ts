export const PERMISSIONS = {
    MANAGE_EVENT: 1n << 0n,      // 1
    MANAGE_ROLES: 1n << 1n,      // 2
    VALIDATE_TICKETS: 1n << 2n,  // 4
    READ_CHECKPOINTS: 1n << 3n,  // 8
    CREATE_TRACKING: 1n << 4n,   // 16
};

export class Bitmask {
    static hasPermission(userPermissions: bigint, requiredPermission: bigint): boolean {
        return (userPermissions & requiredPermission) === requiredPermission;
    }

    static hasAnyPermission(userPermissions: bigint, requiredPermissions: bigint[]): boolean {
        return requiredPermissions.some((perm) => this.hasPermission(userPermissions, perm));
    }

    static addPermission(userPermissions: bigint, newPermission: bigint): bigint {
        return userPermissions | newPermission;
    }

    static removePermission(userPermissions: bigint, permissionToRemove: bigint): bigint {
        return userPermissions & ~permissionToRemove;
    }
}
