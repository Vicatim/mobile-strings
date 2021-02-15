// @flow
import strings from "../languages";
import _ from "lodash";

export type LocaleHelper = {
  localeCode: string,
  value: {
    [language: string]: string
  }
}[];

export const extractLocales = (strings: any) => {
  const languages = _.keys(strings);
  return _.map(languages, value => {
    return {
      localeCode: value,
      value: {
        ...strings[value].Locale
      }
    };
  });
};
export const localeHelper: LocaleHelper = _.chain(strings["Locale"])
  .entries()
  .map(([key, value]) => ({ localeCode: key, value }))
  .value();
