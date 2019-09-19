import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router';
import 'antd/dist/antd.css';
import { createGroup, editGroup } from '../../../api/group';
import { room } from '../../../config/room';
import { Row, Col, Card, Form, Input, Icon, Modal, message, Checkbox, Upload, List, Avatar } from 'antd';
import { SocketContext } from '../../../context/SocketContext';
import { getRoomAvatarUrl, getUserAvatarUrl } from '../../../helpers/common';
import InfiniteScroll from 'react-infinite-scroller';

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

class FormGroup extends Component {
  static contextType = SocketContext;
  static defaultProps = {
    handleModalGroup: () => {},
    groupInfo: {
      name: '',
      desc: '',
    },
  };
  state = {
    previewVisible: false,
    previewImage: '',
    changeAvatar: false,
    fileList: [],
    errors: {},
    listChat: [],
    roomIds: [],
  };

  rules = {
    name: [
      {
        required: false,
        message: this.props.t('validate.amount_char', {
          min: room.CHAR_MIN,
          max: room.CHAR_MAX,
        }),
        min: room.CHAR_MIN,
        max: room.CHAR_MAX,
      },
    ],
  };

  componentWillReceiveProps(nextProps) {
    const { groupInfo, rooms } = nextProps;
    if (groupInfo._id) {
      let roomIds = [];
      rooms.every(room => {
        if (room.joined) {
          roomIds.push(room._id);
          return true;
        } else {
          return false;
        }
      });
      this.setState({
        roomIds: roomIds,
      });
    }

    if (nextProps.groupInfo._id !== this.props.groupInfo._id) {
      this.setState({
        fileList: groupInfo.avatar_url
          ? [
              {
                uid: '-1',
                url: getRoomAvatarUrl(groupInfo.avatar_url),
              },
            ]
          : [],
      });
    }
  }

  handleCancelPreview = () => this.setState({ previewVisible: false });

  handlePreview = file => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  };

  handleChangeAvatar = info => {
    const types = room.IMG_TYPES;

    if (info.file.uid !== '-1') {
      if (types.every(type => info.file.type !== type)) {
        message.error(
          this.props.t('validate.img_type', {
            types: room.IMG_TYPES.join(', '),
          })
        );

        return;
      }

      if (info.file.size / 1024 / 1024 > room.IMG_MAX_SIZE) {
        message.error(
          this.props.t('validate.img_size', {
            max: room.IMG_MAX_SIZE,
          })
        );

        return;
      }
    }

    this.setState({ fileList: info.fileList.slice(-1), changeAvatar: true });
  };

  handleCancelSubmit = () => {
    let { groupInfo } = this.props;
    this.setState({
      changeAvatar: false,
      errors: {},
      fileList: groupInfo.avatar_url
        ? [
            {
              uid: '-1',
              url: getRoomAvatarUrl(groupInfo.avatar_url),
            },
          ]
        : [],
    });
    this.props.handleModalGroup();
  };

  handleCreateGroup = param => {
    const { form, handleModalGroup } = this.props;

    createGroup(param).then(response => {
      const { notice, success } = response.data;

      if (success) {
        message.success(notice);
      } else {
        message.error(notice);
      }

      handleModalGroup();
      form.resetFields();
      this.setState({
        fileList: [],
      });
    });
  };

  handleEditGroup = (groupId, param) => {
    const { handleModalGroup } = this.props;
    editGroup(groupId, param)
      .then(response => {
        const { notice, success } = response.data;

        if (success) {
          message.success(notice);
        } else {
          message.error(notice);
        }
        handleModalGroup();
      })
      .catch(this.handleError);
  };

  handleSubmit = () => {
    const { form, groupInfo } = this.props;
    const { fileList, changeAvatar, roomIds } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      fieldsValue.name = fieldsValue.name.trim();
      fieldsValue.desc = fieldsValue.desc.trim();
      let param = fieldsValue;

      if (this.state.fileList.length > 0 && changeAvatar) {
        param = { ...fieldsValue, ...{ avatar_url: fileList[0].thumbUrl } };
      }

      param = { ...param, ...{ roomIds } };

      if (groupInfo._id === undefined) {
        this.handleCreateGroup(param);
      } else {
        param.changeAvatar = this.state.changeAvatar;

        this.handleEditGroup(groupInfo._id, param);
      }
    });
  };

  handleCheckBox = roomIds => {
    this.setState({
      roomIds,
    });
  };

  render() {
    const { t, form, modalVisible, groupInfo, rooms } = this.props;
    const { previewVisible, previewImage, fileList, errors, roomIds } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">{t('title.upload')}</div>
      </div>
    );

    const renderHtml =
      rooms &&
      rooms.length > 0 &&
      rooms.map((chat, index) => {
        return (
          <List.Item key={index} data-room-id={chat._id}>
            <div className="avatar-name">
              <Avatar
                src={
                  chat.information.type === room.ROOM_TYPE.GROUP_CHAT
                    ? getRoomAvatarUrl(chat.information.avatar)
                    : getUserAvatarUrl(chat.information.avatar)
                }
              />
              &nbsp;&nbsp;
              <span className="nav-text">{chat.information.name}</span>
            </div>
            <Checkbox className="item-checkbox" value={chat._id} key={chat._id} />
          </List.Item>
        );
      });

    return (
      <Modal
        destroyOnClose
        title={groupInfo._id === undefined ? t('title.create_group') : t('title.edit_group')}
        visible={modalVisible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancelSubmit}
        okText={t('button.submit')}
        cancelText={t('button.cancel')}
        width="750px"
      >
        <Form className="createRoom-form">
          <Row type="flex" justify="end" align="middle">
            <Col span={4}>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                fileList={fileList}
                onPreview={this.handlePreview}
                beforeUpload={() => false}
                onChange={this.handleChangeAvatar}
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
              {errors && errors.avatar ? <span className="error-message-from-server">{errors.avatar}</span> : ''}
              <Modal visible={previewVisible} footer={null} onCancel={this.handleCancelPreview}>
                <img alt="{t('avatar')}" style={{ width: '100%' }} src={previewImage} />
              </Modal>
            </Col>
            <Col span={20}>
              <FormItem
                key="name"
                help={
                  form.getFieldError('name') ? (
                    form.getFieldError('name')
                  ) : errors && errors.name ? (
                    <span className="error-message-from-server">{errors.name}</span>
                  ) : (
                    ''
                  )
                }
              >
                {form.getFieldDecorator('name', {
                  initialValue: groupInfo.name,
                  rules: this.rules.name,
                })(<Input placeholder={t('title.group_name')} />)}
              </FormItem>
              <div style={{ margin: '24px 0' }} />
              <FormItem key="desc">
                {form.getFieldDecorator('desc', {
                  initialValue: groupInfo.desc,
                })(<TextArea placeholder={t('title.group_des')} autosize={{ minRows: 2, maxRows: 6 }} />)}
              </FormItem>
            </Col>
            <Col span={24}>
              <Card title={t('title.add_room_into_group')} bordered={false}>
                <div className="rooms-for-group">
                  <InfiniteScroll>
                    <CheckboxGroup onChange={this.handleCheckBox} value={roomIds}>
                      {renderHtml}
                    </CheckboxGroup>
                  </InfiniteScroll>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}

FormGroup = Form.create()(FormGroup);

export default withNamespaces(['group'])(withRouter(FormGroup));
