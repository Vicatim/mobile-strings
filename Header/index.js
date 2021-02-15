// @flow
import React from "react";
import {
  Layout,
  Icon,
  Select,
  Affix,
  Modal,
  Button,
  Input,
  Popover
} from "antd";
import sgLogo from "../../images/sgLogo.svg";
import {
  FIELD_FILLER,
  POPOVER_MESSAGES,
  REACT_COMPONENT_FIELD_FILLER
} from "../../controller/messages";
// Antd
const { Header } = Layout;
const Option = Select.Option;
const FF = FIELD_FILLER;
const PM = POPOVER_MESSAGES;
const RC = REACT_COMPONENT_FIELD_FILLER;

type HeaderProps = {
  collapsed: boolean,
  toggle: Boolean => void,
  currentLanguage: string,
  changeLanguage: string => void,
  languages: any,
  newLanguage: string,
  onChangeNewLanguage: (string, string) => void,
  showNewLanguageField: string => void,
  handleSaveNewLanguage: (string, string) => void,
  handleCancelNewLanguage: string => void,
  newLanguageVisible: boolean,
  setStringsObjToState: any => void,
  saveFile: any => void,
  exportObjAsFile: any => void
};

export default ({
  collapsed,
  toggle,
  currentLanguage,
  changeLanguage,
  languages,
  newLanguage,
  onChangeNewLanguage,
  showNewLanguageField,
  handleSaveNewLanguage,
  handleCancelNewLanguage,
  newLanguageVisible,
  setStringsObjToState,
  saveFile,
  exportObjAsFile
}: HeaderProps) => {
  const uploadFile = React.createRef();
  return (
    <Affix offsetTop={0}>
      <Header className={RC.className.header}>
        <img src={sgLogo} alt={RC.para.logo} />
        <span className={RC.className.languages}>Mobile-Strings</span>

        <Select
          value={currentLanguage}
          className={RC.className.select}
          onSelect={changeLanguage}
          dropdownRender={menu => <div>{menu}</div>}
        >
          {languages.map(({ localeCode, value }) => (
            <Option key={localeCode} value={localeCode}>
              {value[FF.en]}
            </Option>
          ))}
        </Select>
        <Modal
          title={FF.newLanguage}
          visible={newLanguageVisible}
          onOk={() => handleSaveNewLanguage(newLanguage, FF.language)}
          onCancel={() => handleCancelNewLanguage(FF.language)}
          okButtonProps={{ disabled: !newLanguage }}
        >
          <Input
            placeholder={FF.languageCode}
            value={newLanguage}
            onChange={e => onChangeNewLanguage(e.target.value, FF.language)}
          />
        </Modal>
        {/** TODO save onclick */}
        <Popover content={PM.addLanguage} trigger={RC.para.hover}>
          <Button
            type={RC.para.link}
            className={RC.className.newLanguage}
            onClick={() => showNewLanguageField(FF.language)}
          >
            <Icon type={RC.para.plus} />
            <Icon type={RC.para.global} />
          </Button>
        </Popover>
        <input
          multiple={false}
          type={RC.para.file}
          className={RC.className.uploadHiddenButton}
          onChange={el => setStringsObjToState(el.target.files[0])}
          ref={uploadFile}
        />
        <Popover content={PM.upload} trigger={RC.para.hover}>
          <Icon
            type={RC.className.upload}
            className={RC.className.upload}
            onClick={() => uploadFile.current.click()}
          />
        </Popover>
        <Popover content={PM.download} trigger={RC.para.hover}>
          <Icon
            type={RC.className.download}
            className={RC.className.download}
            onClick={() => exportObjAsFile()}
          />
        </Popover>
        {/* <Icon type="save" className="save" onClick={() => saveFile()} /> */}
        <Popover content={PM.showMenu} trigger={RC.para.hover}>
          <Icon
            type={collapsed ? RC.collapsed.unfold : RC.collapsed.fold}
            className={RC.className.trigger}
            onClick={toggle}
          />
        </Popover>
      </Header>
    </Affix>
  );
};
