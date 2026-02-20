"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const user_service_1 = require("./user.service");
exports.userController = {
    async create(req, res, next) {
        try {
            const data = await user_service_1.userService.create(req.body);
            res.status(201).json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async list(req, res, next) {
        try {
            const subadminId = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await user_service_1.userService.findAll({
                role: req.query.role,
                search: req.query.search,
                page: req.query.page,
                limit: req.query.limit,
                subadminId,
            });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async getOne(req, res, next) {
        try {
            const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await user_service_1.userService.findById(req.params.id, { forSubadmin });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async update(req, res, next) {
        try {
            const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await user_service_1.userService.update(req.params.id, req.body, { forSubadmin });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async delete(req, res, next) {
        try {
            const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            await user_service_1.userService.delete(req.params.id, { forSubadmin });
            res.json({ success: true, message: 'User deleted' });
        }
        catch (e) {
            next(e);
        }
    },
    async block(req, res, next) {
        try {
            const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await user_service_1.userService.block(req.params.id, { forSubadmin });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async unblock(req, res, next) {
        try {
            const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await user_service_1.userService.unblock(req.params.id, { forSubadmin });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async activityReport(req, res, next) {
        try {
            const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await user_service_1.userService.getActivityReport(req.params.id, { forSubadmin });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async tradingReport(req, res, next) {
        try {
            const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await user_service_1.userService.getTradingReport(req.params.id, { forSubadmin });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async courseProgress(req, res, next) {
        try {
            const forSubadmin = req.user?.role === 'SUBADMIN' ? req.user.id : undefined;
            const data = await user_service_1.userService.getCourseProgress(req.params.id, { forSubadmin });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=user.controller.js.map