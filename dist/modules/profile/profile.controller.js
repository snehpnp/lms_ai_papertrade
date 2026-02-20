"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileController = void 0;
const profile_service_1 = require("./profile.service");
exports.profileController = {
    async getProfile(req, res, next) {
        try {
            const data = await profile_service_1.profileService.getProfile(req.user.id);
            if (!data)
                return res.status(404).json({ success: false, message: 'Profile not found' });
            res.json({ success: true, data });
        }
        catch (e) {
            next(e);
        }
    },
    async updateProfile(req, res, next) {
        try {
            const data = await profile_service_1.profileService.updateProfile(req.user.id, req.body);
            res.json({ success: true, data, message: 'Profile updated' });
        }
        catch (e) {
            next(e);
        }
    },
};
//# sourceMappingURL=profile.controller.js.map