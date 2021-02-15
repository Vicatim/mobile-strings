#!/bin/node
const fs = require("fs");
const _ = require("lodash");
const readline = require("readline");
const jsStringify = require("javascript-stringify");
const prettier = require("prettier");

const applyTemplate = (name, type, fullType, translations) => {
  
  return `
// @flow  
type strings = ${type};

export type ${name}Strings = ${fullType};

const translations: ${name}Strings = ${translations};

export default translations;
`;
};

function importFilesFromDirectory(dir, importedLanguages) {
  const className = dir.split("/").reverse()[0];
  for (let fileName of fs.readdirSync(dir)) {
    const fullDir = `${dir}/${fileName}`;
    if (fs.statSync(fullDir).isDirectory()) {
      importFilesFromDirectory(fullDir, importedLanguages);
    } else if (fileName.indexOf("strings.js") === 0) {
      console.log("Opening: ", className);
      createNewStringsFile(fullDir, className, importedLanguages[className]);
    }
  }
}

function createNewStringsFile(dir, name, importedStrings) {
  const localeFile = require(dir).default;
  console.log(`Processing ${name}...`);
  const en = localeFile.en;
  const allLanguages = _.uniq(
    _.concat(Object.keys(localeFile), Object.keys(importedStrings))
  );
  const typeDef = createTypeDefinition(localeFile.en);
  const fullTypeDef = createFullTypeTemplate(allLanguages);
  const translations = createTranslations(localeFile, importedStrings);
  let fullFile = applyTemplate(
    name,
    typeDef,
    fullTypeDef,
    translations
  ).replace(/function (\w+)(\(\w+\))/gi, "$2 =>");
  fullFile = prettier.format(fullFile, {
    parser: "babel"
  });
  fs.writeFileSync(dir, fullFile);
  console.log(`Done`);
}

function createTypeDefinition(strings) {
  let typeDefinition = {};
  for (let key of Object.keys(strings)) {
    if (typeof strings[key] === "object") {
      typeDefinition[key] = createTypeDefinition(strings[key]);
    } else {
      typeDefinition[key] =
        typeof strings[key] === "string" ? "string" : "Function";
    }
  }
  return jsStringify(typeDefinition).replace(/'/gi, "");
}

function createFullTypeTemplate(locales) {
  let types = {};
  for (let lang of locales) {
    types[lang] = "strings";
  }
  return jsStringify(types).replace(/'/gi, "");
}

function createTranslations(strings, importedStrings) {
  let translations = Object.assign({}, strings, importedStrings);
  return jsStringify(translations);
}

function run() {
  let workingDir = process.cwd();
  if (workingDir.endsWith("scripts")) {
    workingDir = workingDir.substring(0, workingDir.indexOf("/scripts"));
  }
  const importPath = workingDir + "/scripts/languages.js";
  if (!fs.existsSync(importPath)) {
    console.error(
      "no import file found, please run `yarn run exportLanguages` and modify `scripts/languages.js` with the new translations"
    );
    process.exit(1);
  }
  const importedLanguages = require(importPath).default;
  importFilesFromDirectory(`${workingDir}/app`, importedLanguages);
}
run();
