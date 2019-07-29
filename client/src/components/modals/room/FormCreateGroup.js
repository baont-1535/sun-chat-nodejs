import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { withRouter } from 'react-router';
import 'antd/dist/antd.css';
// import { createGroup, editGroup } from '../../../api/group';
import { room } from '../../../config/room';
import {Row, Col, Card, Form, Input, Icon, Modal, message, Checkbox, Upload, List, Avatar} from 'antd';
import { SocketContext } from '../../../context/SocketContext';
import {getRoomAvatarUrl, getUserAvatarUrl} from '../../../helpers/common';
import {getListRoomsByUser, getQuantityRoomsByUserId} from "../../../api/room";
import InfiniteScroll from "react-infinite-scroller";

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

class FormCreateGroup extends Component {
  static contextType = SocketContext;
  static defaultProps = {
    handleModalCreateGroup: () => {},
    roomInfo: {
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
    page: 1,
    listChat: [],
    roomIds: [],
    hasMore: true,
    quantity_chats: 0
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

  fetchData() {
    const filterType = 0, aloneRoom = 1;

    getListRoomsByUser(this.state.page, filterType, aloneRoom).then(res => {
      this.setState({
        listChat: [...this.state.listChat, ...res.data],
      });
    });
  }

  componentDidMount() {
    getQuantityRoomsByUserId().then(res => {
      this.setState({
        quantity_chats: res.data.result,
      });
    });
  }

  componentDidUpdate() {
    if (this.props.modalVisible && !this.state.listChat.length) {
      this.fetchData();
    }
  }
  componentWillReceiveProps(nextProps) {
    const { roomInfo } = nextProps;

    if (nextProps.roomInfo._id !== this.props.roomInfo._id) {
      this.setState({
        fileList: roomInfo.avatar ? [
          {
            uid: '-1',
            url: getRoomAvatarUrl(roomInfo.avatar),
          },
        ] : [],
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
    let { roomInfo } = this.props;
    this.setState({
      changeAvatar: false,
      errors: {},
      fileList: roomInfo.avatar ? [
        {
          uid: '-1',
          url: getRoomAvatarUrl(roomInfo.avatar),
        },
      ] : [],
    });
    this.props.handleModalCreateGroup();
  };

  handleError = err => {
    if (err.response.data.error) {
      message.error(err.response.data.error);
    } else {
      this.setState({
        errors: err.response.data,
      });
    }
  };

  handleCreateGroup = group => {
    const { form, handleModalCreateGroup } = this.props;

    // createGroup(group)
    //   .then(response => {
    //     form.resetFields();
    //
    //     this.setState({
    //       fileList: [],
    //     });
    //
    //     message.success(response.data.message);
    //     handleModalCreateGroup();
    //   })
    //   .catch(this.handleError);
  };

  handleEditGroup = (groupId, group) => {
    const { handleModalCreateGroup } = this.props;
    // editGroup(groupId, group)
    //   .then(response => {
    //     message.success(response.data.message);
    //     handleModalCreateGroup();
    //   })
    //   .catch(this.handleError);
  };

  handleSubmit = () => {
    const { form, roomInfo } = this.props;
    const { fileList, changeAvatar, roomIds } = this.state;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      let param = fieldsValue;

      if (this.state.fileList.length > 0 && changeAvatar) {
        param = { ...fieldsValue, ...{ avatar: fileList[0].thumbUrl } };
      }

      if (roomInfo._id === undefined) {
        param = { ...param, ...{ roomIds } };
        this.handleCreateGroup(param);
      } else {
        param.changeAvatar = this.state.changeAvatar;

        this.handleEditGroup(roomInfo._id, param);
      }
    });
  };

  handleInfiniteOnLoad = () => {
    const { quantity_chats, page, listChat} = this.state;

    this.setState({
      page: page + 1,
    });

    if (listChat.length >= quantity_chats) {
      message.warning(this.props.t('notice.action.end_of_list'));
      this.setState({
        hasMore: false,
      });
      return;
    }
    this.fetchData();
  };

  handleCheckBox = roomIds => {
    this.setState({
      roomIds,
    });
  };

  render() {
    const { t, form, modalVisible, roomInfo } = this.props;
    const { previewVisible, previewImage, fileList, errors, listChat, roomIds } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">{t('title.upload')}</div>
      </div>
    );

    const renderHtml =
      ( listChat.length > 0 &&
      listChat.map((item, index) => {
        return (
          <List.Item
            key={index}
            data-room-id={item._id}
          >
            <div className="avatar-name">
              <Avatar
                src={
                  item.type === room.ROOM_TYPE.GROUP_CHAT
                    ? getRoomAvatarUrl(item.avatar)
                    : getUserAvatarUrl(item.avatar)
                }
              />
              &nbsp;&nbsp;
              <span className="nav-text">{item.name}</span>
            </div>
            <Checkbox
              className="item-checkbox"
              value={item._id}
              key={item._id}
            />
          </List.Item>
        );
      }));
    return (
      <Modal
        destroyOnClose
        title={roomInfo._id === undefined ? t('title.create_group') : t('title.edit_group')}
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
                  initialValue: roomInfo.name,
                  rules: this.rules.name,
                })(<Input placeholder={t('title.group_name')} />)}
              </FormItem>
              <div style={{ margin: '24px 0' }} />
              <FormItem key="desc">
                {form.getFieldDecorator('desc', {
                  initialValue: roomInfo.desc,
                })(<TextArea placeholder={t('title.group_des')} autosize={{ minRows: 2, maxRows: 6 }} />)}
              </FormItem>
            </Col>
            {roomInfo._id === undefined && (
              <Col span={24}>
                <Card title={t('title.add_group')} bordered={false}>
                  <div className="rooms-for-group">
                    <InfiniteScroll
                      initialLoad={false}
                      pageStart={0}
                      loadMore={this.handleInfiniteOnLoad}
                      hasMore={this.state.hasMore}
                      useWindow={false}
                    >
                      <CheckboxGroup onChange={this.handleCheckBox} value={roomIds}>
                      {renderHtml}
                      </CheckboxGroup>
                    </InfiniteScroll>
                  </div>
                </Card>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    );
  }
}

FormCreateGroup = Form.create()(FormCreateGroup);

export default withNamespaces(['group'])(withRouter(FormCreateGroup));
