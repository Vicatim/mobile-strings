// @flow
import strings from "../languages";
import _ from "lodash";
import { localeHelper } from "./locale";
import { FUNCTION_TYPES, RULE_FILLER } from "./messages";

const F = FUNCTION_TYPES;
const RF = RULE_FILLER;

// logik für umwandlung
export const convertedObject = splitByLanuage(localeHelper, strings);

// build Object
export function splitByLanuage(localeHelper: any, strings: any) {
  // split bei sprache
  let result = {};
  for (let index = 0; index < localeHelper.length; index++) {
    const language = localeHelper[index].localeCode;
    result[language] = _.mapValues(strings, (value, key) =>
      buildComponentKeys(value[language])
    );
  }
  return result;
}

function buildComponentKeys(obj, mainKey = 0, result = {}) {
  // build all translation keys
  _.map(obj, (value, key) => {
    function rule(equals) {
      return value.toString().indexOf(equals);
    }
    let currentKey = !mainKey ? key : mainKey + RF.hashtag + key;
    if (typeof value === RF.object) {
      buildComponentKeys(value, key, result);
    } else if (typeof value === RF.function) {
      if (
        rule("else") ||
        rule("return") === value.toString().lastIndexOf("return")
      ) {
        if (rule(F.JobListScreen) !== -1) {
          result[currentKey] = value(F.JobListScreen);
        } else if (rule(RF.loading) !== -1) {
          result[currentKey + F.loading] = value(null, true);
          result[currentKey + F.none] = value(0);
          result[currentKey + F.one] = value(1);
          result[currentKey + F.plural] = value(F.placeholder);
        } else if (
          rule(RF.biggerThen) !== -1 ||
          (rule(RF.equalsZero) === -1 && rule(RF.equalsOne) !== -1)
        ) {
          result[currentKey + F.one] = value(1);
          result[currentKey + F.plural] = value(F.placeholder);
        } else if (rule(RF.return) !== -1) {
          result[currentKey + F.replace] = value(F.placeholder);
        }
      } else {
        if (rule(F.JobListScreen) !== -1)
          result[currentKey] = value(F.JobListScreen);
        if (rule(RF.loading) !== -1)
          result[currentKey + F.loading] = value(null, true);
        if (rule(RF.equalsZero) !== -1) result[currentKey + F.none] = value(0);
        if (rule(RF.equalsOne) !== -1) result[currentKey + F.one] = value(1);
        if (RF.biggerThen)
          result[currentKey + F.plural] = value(12345).replace(
            12345,
            F.placeholder
          );
      }
    } else {
      result[currentKey] = value;
    }
  });
  return result;
}

export function parseByLanuage(strings: any) {
  let result = {};
  let components = Object.keys(strings.en);
  let languages = Object.keys(strings);
  for (let j = 0; j < components.length; j++) {
    result[components[j]] = {};
    for (let k = 0; k < languages.length; k++) {
      result[components[j]][languages[k]] = parseByComponentKeys(
        strings[languages[k]][components[j]]
      );
    }
  }
  return result;
}

function parseByComponentKeys(obj, result = {}) {
  _.forEach(obj, function(value, key) {
    let temp = {};
    function rule(equals) {
      return key.indexOf(equals);
    }
    if (rule(RF.hashtag) !== -1) {
      let mainKey = key.substring(0, rule(RF.hashtag));
      let subKey = key.substring(rule(RF.hashtag) + 1);
      if (!result[mainKey]) result[mainKey] = {};
      if (rule(F.function) !== -1) {
        subKey = key.substring(rule(RF.hashtag) + 1, rule(RF.star));
        temp[subKey] = parseByFunction(obj, key);
      } else {
        temp[subKey] = value;
      }
      _.merge(result[mainKey], temp);
    } else if (rule(F.function) !== -1) {
      let funcKey = key.substring(0, rule(RF.star));
      result[funcKey] = parseByFunction(obj, key);
    } else {
      result[key] = value;
    }
  });
  return result;
}

function parseByFunction(obj, key) {
  function rule(equals) {
    return key.indexOf(equals);
  }
  let funcWrapper = "";
  let mainKey = key.substring(0, rule(F.function));

  if (rule(F.function) !== -1) {
    if (obj[mainKey + F.loading]) {
      funcWrapper += `if(loading){
        return \`${obj[mainKey + F.loading]}\`
        }`;
    }
    if (obj[mainKey + F.none]) {
      funcWrapper += `if(n === 0){
        return \`${obj[mainKey + F.none]}\`
        }`;
    }
    if (obj[mainKey + F.one]) {
      funcWrapper += `if(n === 1){
        return \`${obj[mainKey + F.one]}\`
      }`;
    }
    if (obj[mainKey + F.plural]) {
      funcWrapper += `if(n > 1){
        return \`${obj[mainKey + F.plural]}\`
      }`;
    }
    if (obj[mainKey + F.replace]) {
      funcWrapper += `
      return \`${obj[mainKey + F.plural]}\`
      `;
    }
    return eval("(n, loading) => { " + funcWrapper + " }");
  }
  return;
}
