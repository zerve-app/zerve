#!/usr/bin/env node

import { readFileSync } from "fs-extra";
import { join } from "path";

const packagePath = join(process.cwd(), "package.json");

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

const modulePackage = readJSONFile(packagePath);

if (!modulePackage.zerve)
  fail(`package.json does not have a zerve configuration`);

const { zerve: localZerveConfig } = modulePackage;

console.log("TO DO: Sync from zerve server into this repo, some how.");
console.log(localZerveConfig);
