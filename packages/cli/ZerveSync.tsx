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
import { compile } from "json-schema-to-typescript";

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
      const res = await fetch(url);
      if (!existsSync(join(projectPath, Z_GENERATED_CONST, zDynamicName))) {
        console.log(`> Creating "zerve/${zDynamicName}" client directory`);
        mkdirSync(join(projectPath, Z_GENERATED_CONST, zDynamicName));
        hasChangedAny = true;
      }
      const zStoreFullData = await res.json();
      // console.log("zStoreFullData: ", zStoreFullData);
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
      const refStoreSchemas = Object.fromEntries(
        Object.entries(zStoreSchemas).map(([schemaName, schema]) => [
          schema["$id"],
          schema,
        ]),
      );

      const schemaSchemas = Object.fromEntries(
        await Promise.all(
          Object.entries(zStoreSchemas).map(async ([schemaName, schema]) => {
            const compiledSchema = await compile(
              { ...schema, $id: schemaName },
              schemaName,
              {
                bannerComment: "",
                declareExternallyReferenced: false,
                $refOptions: {
                  resolve: {
                    http: {
                      read({ url, extension }, callback?) {
                        callback?.(null, JSON.stringify(refStoreSchemas[url]));
                      },
                    },
                    external: true,
                  },
                },
              },
            );
            return [schemaName, compiledSchema];
          }),
        ),
      );

      const entrySchemas = Object.fromEntries(
        await Promise.all(
          Object.entries(zEntrySchemas).map(async ([entryName, fileSchema]) => {
            const interfaceName = `${capitalize(entryName)}FileSchema`;
            if (fileSchema.$ref) {
              const parsedRef = String(fileSchema.$ref).match(
                /^(https?):\/\/([^\/]+)\/(.+)$/,
              );
              if (!parsedRef) {
                throw new Error(
                  `Could not parse $ref type of "${entryName}" (${fileSchema.$ref})`,
                );
              }
              const typeName = parsedRef[3];
              return [
                entryName,
                {
                  label: typeName,
                  value: `export type ${interfaceName} = ${typeName};`,
                },
              ];
            }
            return [
              entryName,
              {
                label: interfaceName,
                value: await compile(fileSchema, interfaceName, {
                  bannerComment: "",
                  declareExternallyReferenced: false,
                  $refOptions: {
                    resolve: {
                      http: {
                        read({ url, extension }, callback?) {
                          callback?.(
                            null,
                            JSON.stringify(refStoreSchemas[url]),
                          );
                        },
                      },
                      external: true,
                    },
                  },
                }),
              },
            ];
          }),
        ),
      );

      const zClientFileData = `// Do not touch this file. It is generated by Zerve-Sync
// To update the file, modify the zerve field in package.json.zerve and run "npx zerve-sync"

import * as zStoreData from './data-sync.json';
import * as zStoreSchema from './schema-sync.json';
import { createZStoreClient } from '@zerve/client/StoreClient';

const zStoreProtocol = "${protocol}";
const zStoreOrigin = "${origin}";
const zStorePath = "${path}";

${Object.values(schemaSchemas).join("\n")}
${Object.values(entrySchemas)
  .map((s) => s.value)
  .join("\n")}

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
      `  ${entryName}: zClient.createAccessor<${capitalize(
        entryName,
      )}FileSchema>("${entryName}"),`,
  )
  .join("\n")}
}

${Object.entries(zEntrySchemas)
  .map(
    ([entryName, fileSchema]) =>
      `export const use${capitalize(entryName)} = zAccessors.${capitalize(
        entryName,
      )}.use;`,
  )
  .join("\n")}

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
