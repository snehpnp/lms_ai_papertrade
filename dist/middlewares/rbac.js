"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrSubadmin = exports.userOnly = exports.subadminOnly = exports.adminOnly = void 0;
exports.requireRoles = requireRoles;
const errors_1 = require("../utils/errors");
function requireRoles(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.user) {
            next(new errors_1.ForbiddenError('Authentication required'));
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            next(new errors_1.ForbiddenError('Insufficient permissions'));
            return;
        }
        next();
    };
}
exports.adminOnly = requireRoles('ADMIN');
exports.subadminOnly = requireRoles('SUBADMIN');
exports.userOnly = requireRoles('USER');
exports.adminOrSubadmin = requireRoles('ADMIN', 'SUBADMIN');
//# sourceMappingURL=rbac.js.map