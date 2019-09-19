import React, { PureComponent } from 'react';
import 'antd/dist/antd.css';
import FormCreateRoom from './modals/room/FormCreateRoom';
import FormGroup from './modals/group/FormGroup';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router';
import { Icon, Badge, Popover } from 'antd';
import { getInfoForGroupForm } from '../api/group';

class SettingRoom extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      modalCreateRoom: false,
      modalCreateGroup: false,
      listChat: [],
    };
  }

  openCreateGroupForm = () => {
    getInfoForGroupForm().then(res => {
      this.setState({
        listChat: res.data.rooms,
      });
    });
    this.handleModalCreateGroup(true);
  };

  handleModalVisible = flag => {
    this.setState({
      modalCreateRoom: flag,
    });
  };

  handleModalCreateGroup = flag => {
    this.setState({
      modalCreateGroup: flag,
    });
  };

  render() {
    const { t } = this.props;
    const { modalCreateRoom, modalCreateGroup, listChat } = this.state;
    const methodCreateRoom = {
      handleModalVisible: this.handleModalVisible,
    };

    const methodCreateGroup = {
      handleModalGroup: this.handleModalCreateGroup,
    };

    const content = (
      <div>
        <p>
          <a href="javascript:;" onClick={() => this.handleModalVisible(true)}>
            <Icon type="plus-circle" /> {t('room:title.create_room')}
          </a>
        </p>
        <p>
          <a href="javascript:;" onClick={() => this.openCreateGroupForm()}>
            <Icon type="menu-unfold" /> {t('group:title.create_group')}
          </a>
        </p>
      </div>
    );

    return (
      <React.Fragment>
        <Popover content={content}>
          <Badge className="header-icon" type="primary">
            <a href="javascript:;">
              <Icon type="setting" />
            </a>
          </Badge>
        </Popover>
        <FormCreateRoom {...methodCreateRoom} modalVisible={modalCreateRoom} />
        <FormGroup {...methodCreateGroup} modalVisible={modalCreateGroup} rooms={listChat} />
      </React.Fragment>
    );
  }
}

export default withNamespaces(['room, group'])(withRouter(SettingRoom));
