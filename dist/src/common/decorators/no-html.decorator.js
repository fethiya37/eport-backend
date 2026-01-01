"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoHtml = NoHtml;
const class_validator_1 = require("class-validator");
const HTML_TAG_RE = /<\s*\/?\s*[a-zA-Z][^>]*>/;
function NoHtml(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'NoHtml',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value) {
                    if (value === null || value === undefined)
                        return true;
                    if (typeof value !== 'string')
                        return false;
                    if (value.includes('<') || value.includes('>'))
                        return false;
                    if (HTML_TAG_RE.test(value))
                        return false;
                    return true;
                },
                defaultMessage(args) {
                    return `${args.property} must not contain HTML or script tags`;
                },
            },
        });
    };
}
//# sourceMappingURL=no-html.decorator.js.map