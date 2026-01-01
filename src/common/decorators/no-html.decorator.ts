import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

const HTML_TAG_RE = /<\s*\/?\s*[a-zA-Z][^>]*>/;

export function NoHtml(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'NoHtml',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (value === null || value === undefined) return true;
          if (typeof value !== 'string') return false;
          if (value.includes('<') || value.includes('>')) return false;
          if (HTML_TAG_RE.test(value)) return false;
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must not contain HTML or script tags`;
        },
      },
    });
  };
}
