import { defaultHideFields, defaultRenameFields } from '../../utils/constants';

// Helper function to delete a path from the object (handles dot notation for nested paths)
function deleteAtPath(obj: any, path: string[], index: number) {
  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }

  if (obj[path[index]]) {
    deleteAtPath(obj[path[index]], path, index + 1);
  }
}

// The custom plugin that accepts schema, hideFields, and renameFields as arguments
export const customPlugin = ({
  hideFields = [],
  renameFields = [],
}: {
  hideFields?: string[];
  renameFields?: string[];
  }) => {
  return (schema: any) => {
    // Combine default fields with the provided ones, ensuring no duplicates
    const finalHideFields = Array.from(new Set([...defaultHideFields, ...hideFields]));
    const finalRenameFields = Array.from(new Set([...defaultRenameFields, ...renameFields]));

    let transform: (
      arg0: any,
      arg1: any,
      arg2: any
    ) => any;

    if (schema.options.toJSON && schema.options.toJSON.transform) {
      transform = schema.options.toJSON.transform;
    }
    schema.options.toJSON = Object.assign(schema.options.toJSON || {}, {
      transform(
        doc: any,
        ret: any,
        options: any
      ) {
        Object.keys(schema.paths).forEach((path) => {
          if (schema.paths[path].options.private) {
            deleteAtPath(ret, path.split('.'), 0);
          }
        });

        // Handle field renaming (from:to format)
        finalRenameFields.forEach((field) => {
          const [from, to] = field.split(':');
          if (from && to && ret[from]) {
            ret[to] = ret[from];
            delete ret[from];
          }
        });

        // Handle hiding fields (deleting them from the result)
        finalHideFields.forEach((field) => {
          if (ret[field]) {
            delete ret[field];
          }
        });

        if (transform) {
          return transform(doc, ret, options);
        }
        return ret; // Return the transformed document
      },
    });
  }
};
