import _ from "lodash";
import { message } from "antd";
import { MESSAGES, FIELD_FILLER } from "../controller/messages";

const M = MESSAGES;
const FF = FIELD_FILLER;

// new Elements
export function createNewString(
  obj: any,
  locale: any,
  componentName: string,
  key: string,
  value: string = FF.empty
) {
  let newState = Object.assign({}, obj);

  if (newState[FF.en][componentName][key] === undefined) {
    _.each(locale, localeCode => {
      newState[localeCode][componentName][key] = value;
    });
    message.success(M.string.success);
  } else message.error(M.string.error);
  return newState;
}

export function createNewComponent(
  obj: any,
  locale: any,
  componentName: string
) {
  let newState = Object.assign({}, obj);
  if (newState[FF.en][componentName] === undefined) {
    _.each(locale, localeCode => {
      newState[localeCode][componentName] = {};
    });
    message.success(M.component.success);
  } else message.error(M.component.error);
  return newState;
}

export function createNewLanguage(obj: any, locale: any, newLanguage: string) {
  let newState = obj;
  if (obj[newLanguage] === undefined) {
    newState = createNewString(
      obj,
      locale,
      FF.locale,
      newLanguage,
      newLanguage
    );
    const newLangObj = JSON.parse(JSON.stringify(newState[FF.en]));
    let overKey = "";
    _.forEach(newLangObj, function(value, key) {
      overKey = key;
      _.forEach(newLangObj[key], function(value, key) {
        newLangObj[overKey][key] = "";
      });
    });
    newLangObj.Locale.key = newLanguage;
    newLangObj.Locale.en = newLanguage;
    newState[newLanguage] = newLangObj;
    message.success(M.language.success);
  } else message.error(M.language.error);
  return newState;
}
