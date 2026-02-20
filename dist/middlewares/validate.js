"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const errors_1 = require("../utils/errors");
function getSchemas(schemas) {
    const s = schemas;
    if (s.shape && typeof s.shape === 'object') {
        return {
            body: s.shape.body,
            query: s.shape.query,
            params: s.shape.params,
            headers: s.shape.headers,
        };
    }
    return schemas;
}
function validate(schemas) {
    return (req, _res, next) => {
        const normalized = getSchemas(schemas);
        const keys = ['body', 'query', 'params', 'headers'];
        try {
            for (const key of keys) {
                const schema = normalized[key];
                if (schema) {
                    const value = req[key];
                    const result = schema.safeParse(value);
                    if (!result.success) {
                        const err = result.error;
                        const messages = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
                        throw new errors_1.BadRequestError(messages.join('; '));
                    }
                    switch (key) {
                        case 'body':
                            req.body = result.data;
                            break;
                        case 'query':
                            req.query = result.data;
                            break;
                        case 'params':
                            req.params = result.data;
                            break;
                        case 'headers':
                            req.headers = result.data;
                            break;
                    }
                }
            }
            next();
        }
        catch (e) {
            next(e);
        }
    };
}
//# sourceMappingURL=validate.js.map