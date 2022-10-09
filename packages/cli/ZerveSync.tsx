#!/usr/bin/env node

import {
  existsSync,
  fstat,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs-extra";
import { join } from "path";
import fetch from "node-fetch";
import { ZSchema } from "@zerve/zed";

const projectPath = process.cwd();
const packagePath = join(projectPath, "package.json");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function readJSONFile(jsonPath: string): any {
  try {
    const packageData = readFileSync(packagePath, "utf8");
    const modulePackage = JSON.parse(packageData);
    return modulePackage;
  } catch (e) {
    fail(`Could not read JSON from ${jsonPath}`);
  }
}
function capitalize(s: string): string {
  return `${s[0].toUpperCase()}${s.substring(1)}`;
}
const modulePackage = readJSONFile(packagePath);

if (!modulePackage.zerve)
  fail(`package.json does not have a zerve configuration`);

const { zerve: localZerveConfig } = modulePackage;

const Z_GENERATED_CONST = "zerve";

console.log("==== Zerve-Sync ====");

if (!existsSync(join(projectPath, Z_GENERATED_CONST))) {
  console.log('> Creating "zerve" directory');

  mkdirSync(join(projectPath, Z_GENERATED_CONST));
}

let hasChangedAny = false;

const NEWLINE = `
`;

function indent(input: string): string {
  return "  " + input.split(NEWLINE).join(`${NEWLINE}  `);
}

function jsComment(input: string): string {
  return (
    `/**${NEWLINE} * ` +
    input.split(NEWLINE).join(`${NEWLINE} * `) +
    `${NEWLINE} */`
  );
}

function writeFileIfNeeded(
  basePath: string,
  filePath: string,
  newFileContent: string,
) {
  const fullPath = join(basePath, filePath);
  let prevFileContent = undefined;
  try {
    readFileSync(fullPath, { encoding: "utf-8" });
  } catch (e) {}
  if (newFileContent !== prevFileContent) {
    console.log(`> Writing "${filePath}"`);
    writeFileSync(fullPath, newFileContent);
    hasChangedAny = true;
  }
}

Promise.all(
  Object.entries(localZerveConfig.dynamicSync).map(
    async ([zDynamicName, url]) => {
      console.log(`== Syncronizing ./zerve/${zDynamicName} from ${url} ==`);
      const parsedURL = String(url).match(/^(https?:\/\/)([^\/]+)\/(.+)$/);
      if (!parsedURL) fail(`Invalid dynamicSync URL: ${url}`);
      const [_fullUrl, protocol, origin, path] = parsedURL;
      const res = await fetch(`${url}/state`);
      if (!existsSync(join(projectPath, Z_GENERATED_CONST, zDynamicName))) {
        console.log(`> Creating "zerve/${zDynamicName}" client directory`);
        mkdirSync(join(projectPath, Z_GENERATED_CONST, zDynamicName));
        hasChangedAny = true;
      }
      const zStoreFullData = await res.json();
      const { $schemas: zStoreSchemas, ...zStoreData } = zStoreFullData;
      const zEntryValues = Object.fromEntries(
        Object.entries(zStoreData).map(([entryName, file]) => [
          entryName,
          file.value,
        ]),
      );
      const zEntrySchemas = Object.fromEntries(
        Object.entries(zStoreData).map(([entryName, file]) => [
          entryName,
          file.schema,
        ]),
      );

      function serializeSchemaHint(schema: ZSchema): string {
        if (schema.title && schema.description) {
          return `${jsComment(
            `${schema.title}${NEWLINE}${NEWLINE}${schema.description}`,
          )}${NEWLINE}`;
        }
        if (schema.title && !schema.description) {
          return `${jsComment(schema.title)}${NEWLINE}`;
        }
        if (schema.description) {
          return `${jsComment(schema.description)}${NEWLINE}`;
        }
        return "";
      }

      function serializeSchemaType(schema: ZSchema): string {
        if (schema.type === "null") return `null`;
        if (schema.type === "string") return `string`;
        if (schema.type === "boolean") return `boolean`;
        if (schema.type === "number") return `number`;
        if (schema.type === "array")
          return `${serializeSchemaType(schema.items)}[]`;
        if (schema.type === "object") {
          const required = new Set(schema.required);
          const propertiesType = `{
${indent(
  Object.entries(schema.properties)
    .map(([propertyName, propertySchema]) => {
      const isRequired = required.has(propertyName);
      return `${serializeSchemaHint(propertySchema)}${propertyName}${
        isRequired ? "" : "?"
      }: ${serializeSchemaType(propertySchema)};`;
    })
    .join(NEWLINE),
)}
}`;
          if (schema.additionalProperties) {
            return `${propertiesType} & {
  [key: string]: ${serializeSchemaType(schema.additionalProperties)}
}`;
          } else return propertiesType;
        }
        if (schema.$ref) {
          return schema.title;
        }
        if (schema.const !== undefined) {
          if (typeof schema.const === "string") return "`" + schema.const + "`";
          if (typeof schema.const === "number")
            return JSON.stringify(schema.const);
          if (typeof schema.const === "boolean")
            return JSON.stringify(schema.const);
        }
        if (schema.oneOf) {
          // note, we loose the title/description of the sub schemas here :(
          return schema.oneOf
            .map((subSchema) => serializeSchemaType(subSchema))
            .join(" | ");
        }
        return "never";
      }

      function serializeTypedef(schema: ZSchema, name: string): string {
        return `${serializeSchemaHint(
          schema,
        )}export type ${name} = ${serializeSchemaType(schema)};`;
      }

      const storeSchemas = Object.fromEntries(
        Object.entries(zStoreSchemas).map(([schemaName, storeSchema]) => {
          const serialized = serializeTypedef(storeSchema, schemaName);
          return [schemaName, { serialized }];
        }),
      );
      const entrySchemas = Object.fromEntries(
        Object.entries(zEntrySchemas).map(([entryName, entrySchema]) => {
          const serialized = serializeTypedef(entrySchema, `${entryName}Entry`);
          return [entryName, { serialized }];
        }),
      );

      const zClientFileData = `// Do not touch this file. It is generated by Zerve-Sync
// To update the file, modify the zerve field in package.json.zerve and run "npx zerve-sync"

import * as zStoreData from './data-sync.json';
import * as zStoreSchema from './schema-sync.json';
import { createZStoreClient } from '@zerve/client/StoreClient';

const zStoreProtocol = "${protocol}";
const zStoreOrigin = "${origin}";
const zStorePath = "${path}";

${Object.values(storeSchemas)
  .map((s) => s.serialized)
  .join(`${NEWLINE}${NEWLINE}`)}

${Object.values(entrySchemas)
  .map((s) => s.serialized)
  .join(`${NEWLINE}${NEWLINE}`)}

export const zClient = createZStoreClient(
  zStoreProtocol,
  zStoreOrigin,
  zStorePath,
  zStoreSchema,
  zStoreData
);

export const zAccessors = {
${Object.entries(zEntrySchemas)
  .map(
    ([entryName, fileSchema]) =>
      `  ${capitalize(entryName)}: zClient.createAccessor<${capitalize(
        entryName,
      )}Entry>("${entryName}"),`,
  )
  .join(`${NEWLINE}`)}
}

${Object.entries(zEntrySchemas)
  .map(
    ([entryName, fileSchema]) =>
      `export const use${capitalize(entryName)} = zAccessors.${capitalize(
        entryName,
      )}.use;`,
  )
  .join(`${NEWLINE}`)}

`;
      writeFileIfNeeded(
        projectPath,
        join(Z_GENERATED_CONST, zDynamicName, "index.ts"),
        zClientFileData,
      );
      writeFileIfNeeded(
        projectPath,
        join(Z_GENERATED_CONST, zDynamicName, "data-sync.json"),
        JSON.stringify(zEntryValues, null, 2),
      );
      writeFileIfNeeded(
        projectPath,
        join(Z_GENERATED_CONST, zDynamicName, "schema-sync.json"),
        JSON.stringify(
          {
            schemas: zStoreSchemas,
            files: zEntrySchemas,
          },
          null,
          2,
        ),
      );
    },
  ),
)
  .then(() => {
    if (hasChangedAny) {
      console.log("=== Zerve-Sync Complete! ✅ ===");
    } else {
      console.log("=== Zerve-Sync Complete. (No Changes) ✅ ===");
    }
  })
  .catch((e) => {
    console.error(e);
    fail("Could not sync dynamic config");
  });
