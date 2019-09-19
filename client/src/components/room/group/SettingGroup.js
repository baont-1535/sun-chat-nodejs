import React, { PureComponent } from 'react';
import 'antd/dist/antd.css';
import FormGroup from '../../modals/group/FormGroup';
import FormDeleteGroup from '../../modals/group/FormDeleteGroup';
import { getInfoForGroupForm } from '../../../api/group';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router';
import { Icon, Popover } from 'antd';

class SettingGroup extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      modalEditGroup: false,
      modalDeleteGroup: false,
      groupInfo: {},
      listChat: [],
    };
  }

  handleModalEditGroup = flag => {
    this.setState({
      modalEditGroup: flag,
    });
  };

  openEditForm = (groupId) => {
    getInfoForGroupForm(groupId).then(res => {
      this.setState({
        groupInfo: res.data.group,
        listChat: res.data.rooms,
      });
    });
    this.handleModalEditGroup(true);
  }

  handleModalDeleteGroup = flag => {
    this.setState({
      modalDeleteGroup: flag,
    });
  };

  render() {
    const { t, groupId } = this.props;
    const { modalEditGroup, modalDeleteGroup, groupInfo, listChat } = this.state;
    const methodEditGroup = {
      handleModalGroup: this.handleModalEditGroup,
    };

    const methodDeleteGroup = {
      handleModalDeleteGroup: this.handleModalDeleteGroup,
    };

    const content = (
      <div>
        <p>
          <a href="javascript:;" onClick={() => this.openEditForm(groupId)}>
            {t('title.edit_group')}
          </a>
        </p>
        <p>
          <a href="javascript:;" onClick={() => this.handleModalDeleteGroup(true)}>
            {t('title.delete_group')}
          </a>
        </p>
      </div>
    );

    return (
      <div className="edit_delete_group">
        <React.Fragment>
          <Popover content={content}>
            <Icon type="more" />
          </Popover>
          <FormGroup {...methodEditGroup} modalVisible={modalEditGroup} groupInfo={groupInfo} rooms={listChat}/>
          <FormDeleteGroup {...methodDeleteGroup} modalVisible={modalDeleteGroup} groupId={groupId}/>
        </React.Fragment>
      </div>
    );
  }
}

export default withNamespaces(['group'])(withRouter(SettingGroup));
