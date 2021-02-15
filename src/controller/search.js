// @flow
import _ from "lodash";
import { RULE_FILLER } from "./messages";

const RF = RULE_FILLER;

export const searchInObj = (
  search: string,
  obj: any,
  emptySearch: boolean = false
) => {
  if (!search && !emptySearch) {
    return obj;
  }
  if (emptySearch) search = "";
  const results = _.chain(obj)
    .mapValues((component, language) =>
      searchComponent(search, language, component, emptySearch)
    )
    .value();
  return results;
};

function removeEmptyAndUndefinedReducer(acc, value, key) {
  // filter out empty and undefined objects
  if (!value || _.isEmpty(value)) {
    return acc;
  }
  acc[key] = value;
  return acc;
}

// searching
function searchComponent(
  search: string,
  language: string,
  component: {
    [componentName: string]: {
      [key: string]: string
    }
  },
  emptySearch: boolean
) {
  return _.chain(component)
    .mapValues((translations, componentName) => {
      if (searchRule(search, componentName) && !emptySearch) {
        return translations;
      }
      const matches = _.chain(translations)
        .mapValues((value, key) => {
          // on match return translation
          if (
            (searchRule(search, key) && !emptySearch) ||
            (searchRule(search, value) && !emptySearch)
          ) {
            return value;
          } else if (value.length < 1 && emptySearch) return "emptySearch";
        })
        .reduce(removeEmptyAndUndefinedReducer, {})
        .value();
      return matches;
    })
    .reduce(removeEmptyAndUndefinedReducer, {})
    .value();
}

function searchRule(searchText: string, string: string) {
  if (typeof string === RF.function) {
    return false;
  } else {
    return string.toLowerCase().includes(searchText.toLowerCase());
  }
}
