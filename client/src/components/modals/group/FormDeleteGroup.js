import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router';
import { deleteGroup } from '../../../api/group';
import 'antd/dist/antd.css';
import { Modal, message } from 'antd';

class FormDeleteGroup extends Component {
  handleCancelSubmit = () => {
    this.props.handleModalDeleteGroup(false);
  };

  handleSubmit = () => {
    deleteGroup(this.props.groupId).then(response => {
      const { notice, success } = response.data;

      if (success) {
        message.success(notice);
      } else {
        message.error(notice);
      }
    });

    this.props.handleModalDeleteGroup(false);
  };

  render() {
    const { t, modalVisible } = this.props;
    return (
      <Modal
        destroyOnClose
        title={t('title.delete_group')}
        visible={modalVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancelSubmit}
        okText={t('button.submit')}
        cancelText={t('button.cancel')}
        width="500px"
      >
        <h3>{t('notice.confirm.delete')}</h3>
      </Modal>
    );
  }
}

export default withNamespaces(['group'])(withRouter(FormDeleteGroup));
