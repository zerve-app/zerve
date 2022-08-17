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
  const prevFileContent = readFileSync(fullPath, { encoding: "utf-8" });
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
      const zURL = `${protocol}${origin}/.z/${path}`;
      const res = await fetch(zURL);
      if (!existsSync(join(projectPath, Z_GENERATED_CONST, zDynamicName))) {
        console.log(`> Creating "zerve/${zDynamicName}" client directory`);
        mkdirSync(join(projectPath, Z_GENERATED_CONST, zDynamicName));
        hasChangedAny = true;
      }
      const zStoreFullData = await res.json();
      const { $schemas: zStoreSchemas, ...zStoreData } = zStoreFullData;
      const zFileValues = Object.fromEntries(
        Object.entries(zStoreData).map(([fileName, file]) => [
          fileName,
          file.value,
        ]),
      );
      const zFileSchemas = Object.fromEntries(
        Object.entries(zStoreData).map(([fileName, file]) => [
          fileName,
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

      const fileSchemas = Object.fromEntries(
        await Promise.all(
          Object.entries(zFileSchemas).map(async ([fileName, fileSchema]) => {
            const interfaceName = `${capitalize(fileName)}FileSchema`;
            return [
              fileName,
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

      const zClientFileData = `
// Do not touch this file. It is generated by Zerve-Sync
// To update the file, modify the zerve field in package.json.zerve and run "npx zerve-sync"

import * as zStoreData from './data-sync.json';
import * as zStoreSchema from './schema-sync.json';
import { createZStoreClient } from '@zerve/client/StoreClient';

const zStoreProtocol = "${protocol}";
const zStoreOrigin = "${origin}";
const zStorePath = "${path}";

${Object.values(schemaSchemas).join("\n")}
${Object.values(fileSchemas)
  .map((s) => s.value)
  .join("\n")}

export const zClient = createZStoreClient(
  zStoreProtocol,
  zStoreOrigin,
  zStorePath,
  zStoreSchema,
  zStoreData
);

${Object.entries(zFileSchemas)
  .map(
    ([fileName, fileSchema]) =>
      `export const ${fileName} = zClient.createAccessor<${capitalize(
        fileName,
      )}FileSchema>("${fileName}");`,
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
        JSON.stringify(zFileValues, null, 2),
      );
      writeFileIfNeeded(
        projectPath,
        join(Z_GENERATED_CONST, zDynamicName, "schema-sync.json"),
        JSON.stringify(
          {
            schemas: zStoreSchemas,
            files: zFileSchemas,
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
