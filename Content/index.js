// @flow
import React from "react";
import {
  Input,
  Radio,
  Row,
  Col,
  Icon,
  Button,
  Modal,
  Popover,
  Checkbox
} from "antd";
import {
  FIELD_FILLER,
  REACT_COMPONENT_FIELD_FILLER
} from "../../controller/messages";

const FF = FIELD_FILLER;
const RC = REACT_COMPONENT_FIELD_FILLER;

const findImage = (component: string) => {
  try {
    return require(`../../images/${component}.png`);
  } catch {
    return require("../../images/default.png");
  }
};

const buildStringInputField = (
  componentStringObj,
  componentName,
  onChangeTranslation,
  searchObj,
  emptySearch
) => {
  let items = [];
  for (let key in componentStringObj) {
    let keyBefore = "";
    let keyAfter = key;
    const matching = !searchObj || searchObj[key] !== undefined;
    const translation = componentStringObj[key];
    if (matching && key !== FF.key) {
      if (keyAfter.indexOf("#") !== -1) keyAfter = keyAfter.replace("#", " ");
      if (keyAfter.indexOf("*") !== -1) {
        keyBefore = keyAfter.substring(keyAfter.lastIndexOf("*") + 1);
        keyAfter = keyAfter.substring(0, keyAfter.indexOf("*"));
      }
      items.push(
        <Input
          key={key}
          addonAfter={keyAfter}
          addonBefore={keyBefore}
          value={translation}
          onChange={e =>
            onChangeTranslation(e.target.value, key, componentName)
          }
        />
      );
    }
  }
  return items;
};

type ContentProps = {
  currentLanguage: string,
  translations: any,
  searchObj: any,
  componentName: string,
  languages: any,
  onChangeLanguage: string => void,
  onChangeTranslation: (string, string, string) => void,
  newStringState: string,
  newString: string,
  onChangeNewString: (string, string) => void,
  showNewStringField: (string, string) => void,
  handleSaveNewString: (string, string, string) => void,
  handleCancelNewString: string => void,
  newStringVisible: boolean,
  checkboxDisable: boolean,
  changeAddFunc: string => void,
  addFunc: any,
  emptySearch: boolean
};
export default ({
  currentLanguage,
  translations,
  searchObj,
  componentName,
  languages,
  onChangeLanguage,
  onChangeTranslation,
  newStringState,
  newString,
  onChangeNewString,
  showNewStringField,
  handleSaveNewString,
  handleCancelNewString,
  newStringVisible,
  checkboxDisable,
  changeAddFunc,
  addFunc,
  emptySearch
}: ContentProps) => {
  const renderData = buildStringInputField(
    translations,
    componentName,
    onChangeTranslation,
    searchObj,
    emptySearch
  );

  return (
    <Row key={componentName}>
      <Col span={8}>
        <Popover content={componentName} trigger={RC.para.hover}>
          <img
            src={findImage(componentName)}
            alt={componentName}
            style={{ width: "99%", minWidth: "300px", maxWidth: "700px" }}
          />
        </Popover>
      </Col>
      <Col span={16}>
        <h1 style={{ backgroundColor: "#fff" }}>{componentName}</h1>
        {renderData}
        <Modal
          title={FF.newString}
          visible={newStringVisible && componentName === newStringState}
          onOk={() => handleSaveNewString(newString, FF.string, componentName)}
          onCancel={() => handleCancelNewString(FF.string)}
          okButtonProps={{ disabled: !newString }}
        >
          <Input
            key={componentName}
            placeholder={FF.stringKey}
            value={newString}
            onChange={e => onChangeNewString(e.target.value, FF.string)}
          />
          <span style={{ fontSize: 10 }}>
            strings in subcomponents use <mark style={{ color: "red" }}>#</mark>{" "}
            as saparator like "subcomponent
            <mark style={{ color: "red" }}>#</mark>stringkey"
          </span>
          <p style={{ marginTop: 20 }}>Pluralization</p>
          <Checkbox
            onChange={() => changeAddFunc("loading")}
            checked={addFunc.loading}
          >
            loading
          </Checkbox>
          <Checkbox
            onChange={() => changeAddFunc("none")}
            checked={addFunc.none}
          >
            none
          </Checkbox>
          <Checkbox onChange={() => changeAddFunc("one")} checked={addFunc.one}>
            one
          </Checkbox>
          <Checkbox
            onChange={() => changeAddFunc("plural")}
            checked={addFunc.plural}
          >
            plural
          </Checkbox>
          <br />
          <span style={{ fontSize: 10 }}>Pluralization click all</span>
          <br />
          <span style={{ fontSize: 10 }}>Replacement click one and plural</span>
        </Modal>
        <Button onClick={() => showNewStringField(FF.string, componentName)}>
          <Icon type={RC.para.plus} /> String
        </Button>
        <Radio.Group
          onChange={e => onChangeLanguage(e.target.value)}
          value={currentLanguage}
          style={{ marginBottom: 8 }}
        >
          {languages.map(({ localeCode, value }) => (
            <Radio.Button key={localeCode} value={localeCode}>
              {value[FF.en]}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Col>
    </Row>
  );
};
