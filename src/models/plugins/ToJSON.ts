import { Schema, Document } from 'mongoose';

export const toJSON = (schema: Schema) => {
  let originalTransform:
    | ((doc: Document, ret: Record<string, any>, options?: any) => any)
    | undefined;

  const existingToJSON = schema.get('toJSON') || {};

  if (typeof existingToJSON.transform === 'function') {
    originalTransform = existingToJSON.transform as (
      doc: Document,
      ret: Record<string, any>,
      options?: any
    ) => any;
  }

  schema.set('toJSON', {
    ...existingToJSON,
    transform: (
      doc: Document,
      ret: Record<string, any>,
      options?: any
    ) => {
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options?.private) {
          delete ret[path];
        }
      });

      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;

      return originalTransform ? originalTransform(doc, ret, options) : ret;
    },
  });
};
