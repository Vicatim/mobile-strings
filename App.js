// @flow
import React, { Component } from "react";
import { Layout, message } from "antd";
import "antd/dist/antd.css";
import "./App.css";
import FinalHeader from "./components/Header";
import ContentRow from "./components/Content";
import FinalSider from "./components/Sider";
import type { LocaleHelper } from "./controller/locale";
import { convertedObject, splitByLanuage } from "./controller/object";
import {
  createNewString,
  createNewComponent,
  createNewLanguage
} from "./controller/create";
import { exportFile, saveFile } from "./controller/file";
import { searchInObj } from "./controller/search";
import _ from "lodash";
import {
  FUNCTION_TYPES,
  MESSAGES,
  FIELD_FILLER,
  REACT_COMPONENT_FIELD_FILLER
} from "./controller/messages";

const { Content } = Layout;
const M = MESSAGES;
const FF = FIELD_FILLER;
const RC = REACT_COMPONENT_FIELD_FILLER;
const F = FUNCTION_TYPES;

// manueller schalter für den localStorage
if (_.isEmpty(JSON.parse(localStorage.getItem(FF.strings) || FF.empty)))
  localStorage.setItem(FF.strings, JSON.stringify(convertedObject));

type AppState = {
  collapsed: boolean,
  language: string,
  components: string[],
  switchTempComponents: string[],
  strings: any,
  localeList: string[],
  searchObj: any,
  visibleNewStringField: boolean,
  visibleNewLanguageField: boolean,
  visibleNewComponentField: boolean,
  newStringCompnentName: string,
  newString: string,
  newLanguage: string,
  newComponent: string,
  checkboxDisable: boolean,
  emptySearch: boolean,
  addFunc: { loading: boolean, none: boolean, one: boolean, plural: boolean }
};
class App extends Component<any, AppState> {
  constructor(props: any) {
    super(props);
    const strings = JSON.parse(
      localStorage.getItem(FF.strings) || JSON.stringify(convertedObject)
    );
    this.state = {
      collapsed: false,
      language: FF.de,
      components: Object.keys(strings.en).sort(),
      switchTempComponents: Object.keys(strings.en).sort(),
      strings,
      localeList: Object.keys(strings),
      searchObj: null,
      visibleNewStringField: false,
      visibleNewLanguageField: false,
      visibleNewComponentField: false,
      newStringCompnentName: FF.empty,
      newString: FF.empty,
      newLanguage: FF.empty,
      newComponent: FF.empty,
      checkboxDisable: false,
      emptySearch: false,
      addFunc: { loading: false, none: false, one: false, plural: false }
    };
  }
  saveToLocal = _.debounce(
    newState => localStorage.setItem(FF.strings, JSON.stringify(newState)),
    5000
  );
  //change string current elements
  onChangeTranslation = (
    value: string,
    stringName: string,
    componentName: string
  ) => {
    let newState = Object.assign({}, this.state.strings);
    newState[this.state.language][componentName][stringName] = value;
    this.saveToLocal(newState);
    this.setState({
      strings: newState
    });
  };
  // actions for Modal
  newStringFieldInComponent = (newStringState: string) => {
    this.setState({ newStringCompnentName: newStringState });
  };
  onChangeNewField = (newFieldValue: string, newFieldLayer: string) => {
    let varName = FF.new + newFieldLayer;
    this.setState({ [varName]: newFieldValue });
  };
  showNewField = (newFieldLayer: string, componentName: string = FF.empty) => {
    let visibleLayer = FF.visibleNew + newFieldLayer + FF.field;
    this.setState({
      [visibleLayer]: true,
      newStringCompnentName: componentName
    });
  };

  handleSaveNewField = (
    newFieldValue: string,
    newFieldLayer: string,
    componentName: string = FF.empty
  ) => {
    let { strings, localeList } = this.state;
    let result = strings;
    let visibleLayer = FF.visibleNew + newFieldLayer + FF.field;
    let varName = FF.new + newFieldLayer;
    let { loading, none, one, plural } = this.state.addFunc;
    if (loading || none || one || plural) {
      _.forEach(this.state.addFunc, function(value, key) {
        let fieldKey = newFieldValue + F[key];
        if (value)
          result = createNewString(
            strings,
            localeList,
            componentName,
            fieldKey
          );
      });
    } else if (newFieldLayer === FF.string) {
      result = createNewString(
        strings,
        localeList,
        componentName,
        newFieldValue
      );
    } else if (newFieldLayer === FF.component) {
      result = createNewComponent(strings, localeList, newFieldValue);
    } else if (newFieldLayer === FF.language) {
      result = createNewLanguage(strings, localeList, newFieldValue);
      if (!strings[newFieldValue]) {
        this.setState({
          localeList: [...this.state.localeList, newFieldValue],
          components: [FF.locale],
          language: newFieldValue
        });
      }
    }
    let stateTemp = { loading: false, none: false, one: false, plural: false };
    this.setState({
      addFunc: stateTemp,
      strings: result,
      [visibleLayer]: false,
      [varName]: FF.empty,
      newStringCompnentName: FF.empty
    });
    this.saveToLocal(result);
  };

  handleCancelNewField = (newFieldLayer: string) => {
    let visibleLayer = FF.visibleNew + newFieldLayer + FF.field;
    let varName = FF.new + newFieldLayer;
    let stateTemp = { loading: false, none: false, one: false, plural: false };
    this.setState({
      [visibleLayer]: false,
      [varName]: FF.empty,
      addFunc: stateTemp
    });
  };

  //visible navibar
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };
  changeEmptySearch = () => {
    const { emptySearch, strings, language, switchTempComponents } = this.state;
    this.setState({
      emptySearch: !emptySearch
    });
    if (!emptySearch) {
      const results = searchInObj("", strings, !emptySearch);
      this.setState({
        components: Object.keys(results[language]).sort(),
        searchObj: results
      });
    } else if (emptySearch) {
      this.setState({
        components: switchTempComponents
      });
    }
  };

  changeAddFunc = (parameter: string) => {
    let newCheckboxState = this.state.addFunc;
    newCheckboxState[parameter] = !this.state.addFunc[parameter];
    this.setState({
      addFunc: newCheckboxState
    });
  };

  setStringsObjToState = (strings: any) => {
    const reader = new FileReader();
    reader.readAsText(strings);
    reader.onload = () => {
      let strings = FF.empty;
      eval("strings =" + reader.result.substring("export default".length));
      const localeHelper: LocaleHelper = _.chain(strings[FF.locale])
        .entries()
        .map(([key, value]) => ({ localeCode: key, value }))
        .value();
      if (!_.isEmpty(localeHelper)) {
        let importFromFile = splitByLanuage(localeHelper, strings);
        this.setState({
          strings: importFromFile,
          localeList: Object.keys(importFromFile)
        });
        this.saveToLocal(importFromFile);
        message.success(M.stringToState.success);
      } else message.error(M.stringToState.error);
    };
  };

  exportObjAsFile = () => {
    exportFile(this.state.strings);
  };

  saveFile = () => {
    saveFile(this.state.strings);
  };

  render() {
    const {
      strings,
      components,
      localeList,
      language,
      collapsed,
      searchObj,
      visibleNewStringField,
      visibleNewComponentField,
      visibleNewLanguageField,
      newStringCompnentName,
      newString,
      newLanguage,
      newComponent,
      checkboxDisable,
      addFunc,
      emptySearch
    } = this.state;
    const languages = localeList.map(x => ({
      localeCode: x,
      value: strings[x].Locale
    }));
    return (
      <Layout>
        <FinalHeader
          collapsed={collapsed}
          toggle={this.toggle}
          currentLanguage={language}
          changeLanguage={e => this.setState({ language: e })}
          languages={languages}
          newLanguage={newLanguage}
          onChangeNewLanguage={this.onChangeNewField}
          showNewLanguageField={this.showNewField}
          handleSaveNewLanguage={this.handleSaveNewField}
          handleCancelNewLanguage={this.handleCancelNewField}
          newLanguageVisible={visibleNewLanguageField}
          setStringsObjToState={this.setStringsObjToState}
          saveFile={this.saveFile}
          exportObjAsFile={this.exportObjAsFile}
        />

        <Layout>
          <FinalSider
            components={Object.keys(strings.en).sort()}
            collapsed={collapsed}
            newComponent={newComponent}
            newComponentVisible={visibleNewComponentField}
            showNewComponentField={this.showNewField}
            handleSaveNewComponent={this.handleSaveNewField}
            handleCancelNewComponent={this.handleCancelNewField}
            onChangeNewComponent={this.onChangeNewField}
            onClick={e =>
              this.setState({ components: e, switchTempComponents: e })
            }
            changeEmptySearch={this.changeEmptySearch}
            emptySearch={emptySearch}
            onSearch={e => {
              const results = searchInObj(e, strings);
              this.setState({
                components: Object.keys(results[language]).sort(),
                searchObj: results
              });
            }}
          />
          <Layout style={{ marginLeft: collapsed ? 0 : 200 }}>
            <Content className={RC.className.content}>
              {components.map(componentName => (
                <ContentRow
                  key={componentName}
                  searchObj={
                    searchObj &&
                    searchObj[language] &&
                    searchObj[language][componentName]
                  }
                  currentLanguage={language}
                  translations={strings[language][componentName]}
                  componentName={componentName}
                  languages={languages}
                  onChangeLanguage={language => this.setState({ language })}
                  onChangeTranslation={this.onChangeTranslation}
                  newStringState={newStringCompnentName}
                  newString={newString}
                  onChangeNewString={this.onChangeNewField}
                  showNewStringField={this.showNewField}
                  handleSaveNewString={this.handleSaveNewField}
                  handleCancelNewString={this.handleCancelNewField}
                  newStringVisible={visibleNewStringField}
                  checkboxDisable={checkboxDisable}
                  changeAddFunc={this.changeAddFunc}
                  addFunc={addFunc}
                  emptySearch={emptySearch}
                />
              ))}
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default App;
