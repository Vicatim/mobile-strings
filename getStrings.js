const fs = require("fs");
const jsStringify = require("javascript-stringify");
const prettier = require("prettier");
const _ = require("lodash");

let projectRoot = process.cwd();
if (projectRoot.endsWith("scripts")) {
  projectRoot = projectRoot.substring(0, projectRoot.indexOf("/scripts"));
}

function getAllTranslations(dir) {
  const className = dir.split("/").reverse()[0];
  let translations = {};
  for (let fileName of fs.readdirSync(dir)) {
    const fullDir = `${dir}/${fileName}`;
    if (fs.statSync(fullDir).isDirectory()) {
      Object.assign(translations, getAllTranslations(fullDir));
    } else if (fileName.indexOf("strings.js") === 0) {
      console.log("Found strings: ", className);
      translations[className] = require(fullDir).default;
    }
  }
  // console.log(jsStringify(translations));
  return translations;
}

function copyWithEmptyTranslations(x, key) {
  if (typeof x === "object") {
    return _.mapValues(x, copyWithEmptyTranslations);
  }
  if (typeof x !== "string") {
    return function foo(x) {
      return `${x}`;
    };
  }
  return " ";
}

const translations = getAllTranslations(`${projectRoot}/app`);

let newLanguages = process.argv.splice(2);
if (newLanguages && newLanguages.length > 0) {
  for (let locale of newLanguages) {
    if (!locale || locale.length !== 2) {
      console.log("unrecognized locale: ", locale);
    } else {
      _.mapValues(translations, strings => {
        strings[locale] = copyWithEmptyTranslations(strings.en);
        return strings;
      });
    }
  }
}

fs.writeFileSync(
  projectRoot + "/scripts/languages.js",
  prettier.format(
    "export default " +
      jsStringify(translations).replace(/function (\w+)(\(\w+\))/gi, "$2 =>"),
    {
      parser: "babel"
    }
  )
);
