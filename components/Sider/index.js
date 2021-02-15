// @flow
import React from "react";
import { Layout, Menu, Input, Icon, Modal, Switch } from "antd";
import _ from "lodash";
import {
  FIELD_FILLER,
  REACT_COMPONENT_FIELD_FILLER
} from "../../controller/messages";
// Antd
const { Sider } = Layout;
const Search = Input.Search;
const FF = FIELD_FILLER;
const RC = REACT_COMPONENT_FIELD_FILLER;

type SiderProps = {
  components: string[],
  collapsed: boolean,
  onClick: (string[]) => void,
  onSearch: string => void,
  onChangeNewComponent: (string, string) => void,
  showNewComponentField: string => void,
  handleSaveNewComponent: (string, string) => void,
  handleCancelNewComponent: string => void,
  newComponentVisible: boolean,
  newComponent: string,
  changeEmptySearch: () => void,
  emptySearch: boolean
};

export default ({
  components,
  collapsed,
  onClick,
  onSearch,
  showNewComponentField,
  handleSaveNewComponent,
  handleCancelNewComponent,
  newComponentVisible,
  onChangeNewComponent,
  newComponent,
  changeEmptySearch,
  emptySearch
}: SiderProps) => {
  const searchDebounce = _.debounce(onSearch, 200);
  const coll = !collapsed ? RC.collapsed.fixed : RC.collapsed.relative;
  return (
    <Sider
      style={{ overflow: "auto", height: "95.2vh", position: "fixed", left: 0 }}
      trigger={null}
      collapsible
      collapsed={collapsed}
      collapsedWidth={RC.para.zero}
    >
      <Menu
        theme={RC.para.dark}
        mode={RC.para.inline}
        defaultSelectedKeys={[FF.strings]}
        className={RC.className.menuSider}
      >
        <Modal
          title={FF.newComponent}
          visible={newComponentVisible}
          onOk={() => handleSaveNewComponent(newComponent, FF.component)}
          onCancel={() => handleCancelNewComponent(FF.component)}
          okButtonProps={{ disabled: !newComponent }}
        >
          <Input
            placeholder={FF.compunentCode}
            value={newComponent}
            onChange={e => onChangeNewComponent(e.target.value, FF.component)}
          />
        </Modal>

        <Menu.Item
          key={RC.para.plus}
          onClick={() => showNewComponentField(FF.component)}
        >
          <Icon type={RC.para.plus} />
          <span>Component</span>
        </Menu.Item>
        <Menu.Divider className={RC.className.menuDiv} />
        <Menu.ItemGroup>
          <Menu.Item key={FF.strings} onClick={() => onClick(components)}>
            <span>All Components</span>
          </Menu.Item>
          {components.map(component => (
            <Menu.Item key={component} onClick={() => onClick([component])}>
              <span>{component}</span>
            </Menu.Item>
          ))}
        </Menu.ItemGroup>
      </Menu>
      <Search
        className={RC.className.search}
        style={{
          position: coll
        }}
        disabled={emptySearch}
        placeholder={FF.search}
        onChange={e => searchDebounce(e.target.value)}
        onSearch={onSearch}
        allowClear
      />
      <div style={{ position: coll }} className={RC.className.switchDiv}>
        <span className={RC.className.switchText}>search empty fields</span>
        <Switch
          checked={emptySearch}
          onChange={changeEmptySearch}
          className={RC.className.switch}
        />{" "}
      </div>
    </Sider>
  );
};
