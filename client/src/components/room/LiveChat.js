import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import Peer from 'peerjs';
import './../../scss/live_chat.scss';
import { Button, message } from 'antd';
import $ from 'jquery';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaAngleLeft,
  FaAngleRight,
  FaUserPlus,
  FaUserSlash,
} from 'react-icons/fa';
import { MdAddToQueue } from 'react-icons/md';
import { Icon } from 'antd';
import { checkMember, acceptMember, leaveLiveChat, getListNotMember } from './../../api/call';
import { getUserAvatarUrl } from './../../helpers/common';
import { openStream } from './../../helpers/livechat/openStream';
import { playVideo } from './../../helpers/livechat/playVideo';
import { SocketContext } from './../../context/SocketContext';
import { withUserContext } from './../../context/withUserContext';
import ModalShowListUserToChooseMember from './../modals/call/ModalShowListUserToChooseMember';

class LiveChat extends Component {
  static contextType = SocketContext;
  socket = this.context.socket;
  peer = null;
  stream = null;
  state = {
    checkDisplayLayout: null,
    leftOn: true,
    rightOn: true,
    cameraOn: true,
    microOn: true,
    isCaller: false,
    listUserToChooseMember: null,

    listMember: [],
    listOfferPerson: [],
    loaded: false,
  };

  componentDidMount() {
    let _this = this;
    const { liveChatId } = this.props.match.params;

    this.socket.on('change-offer-list', res => {
      const roomId = this.props.match.params.roomId;
      const { listMember, listOfferPerson, isCaller } = this.state;

      if (res.roomId && roomId === res.roomId) {
        const listKeyMember = listMember.map(item => {
          return item.id;
        });

        const listKeyOffer = listOfferPerson.map(item => {
          return item.id;
        });

        if (isCaller && listKeyOffer.concat(listKeyMember).indexOf(res.userId) === -1) {
          listOfferPerson.push({
            id: res.userId,
            avatar: res.info.avatar,
            name: res.info.name,
          });

          this.setState({
            listOfferPerson: listOfferPerson,
          });
        }
      } else if (res.userGiveUp) {
        this.memberGetOut(res.userGiveUp);
        this.removePersonOffer(res.userGiveUp);
      }
    });

    this.socket.on('be-accepted-by-master', res => {
      this.joinLiveChat(liveChatId, res.isTypeVideo);

      this.setState({
        checkDisplayLayout: res.accepted,
        cameraOn: res.isTypeVideo,
      });
    });

    this.socket.on('add-member', res => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(() => {
          var call = _this.peer.call(res.peerId, _this.stream);

          call.on('stream', function(remoteStream) {
            playVideo(remoteStream, res.userId);
          });
        })
        .catch(e => {
          console.log(e.name + ': ' + e.message);
        });
    });

    this.socket.on('list-member-live-chat', ({ listMember, offerId }) => {
      let members = [];

      listMember.forEach(function(item) {
        members.push({
          id: item.user_id,
          cameraView: '',
        });
      });

      this.setState({
        listMember: members,
      });

      this.removePersonOffer(offerId);
    });
  }

  componentDidUpdate(prevProps) {
    const { roomId, liveChatId } = this.props.match.params;

    if (this.props.userContext.info._id && !this.state.loaded) {
      if (window.location.search.split('main-member=')[1]) {
        this.socket.emit('regist-live-chat', { roomId: roomId, liveId: liveChatId, master: false });

        this.acceptMember({ roomId, liveChatId });
        this.setState({
          checkDisplayLayout: true,
        });
      } else {
        this.checkMember({ roomId, liveChatId });
      }

      this.setState({
        loaded: true,
      });
    }
  }

  joinLiveChat(liveChatId, isTypeVideo) {
    let _this = this,
      options = { audio: true, video: true };

    this.peer = new Peer();

    this.peer.on('open', function(peerId) {
      _this.socket.emit('join-live-chat', { liveChatId: liveChatId, peerId: peerId });
    });

    this.peer.on('call', function(call) {
      navigator.mediaDevices
        .getUserMedia(options)
        .then(() => {
          call.answer(_this.stream);
          call.on('stream', function(remoteStream) {
            playVideo(
              remoteStream,
              $('.participant-video')
                .first()
                .attr('id')
            );
          });
        })
        .catch(e => {
          console.log(e.name + ': ' + e.message);
        });
    });

    openStream(options, function(stream) {
      _this.stream = stream;
      playVideo(stream, 'main-video');
      playVideo(stream, _this.props.userContext.info._id);

      if (!isTypeVideo) {
        _this.toggleCamera();
      }
    });
  }

  checkMember({ roomId, liveChatId }) {
    checkMember({ roomId, liveChatId }).then(res => {
      let enable = false;
      const { status, isCaller, isTypeVideo } = res.data;

      if (status) {
        enable = true;
        let listMember = this.state.listMember;
        listMember.push({
          id: this.props.userContext.info._id,
          cameraView: '',
        });

        this.joinLiveChat(liveChatId, isTypeVideo);
        this.setState({
          listMember: listMember,
          isCaller: isCaller,
          cameraOn: isTypeVideo,
        });
      }

      this.setState({
        checkDisplayLayout: enable,
      });

      this.socket.emit('regist-live-chat', { roomId: roomId, liveId: liveChatId, master: this.state.isCaller });
    });
  }

  removePersonOffer(userId) {
    const { listOfferPerson } = this.state;
    const listKeyOffer = listOfferPerson.map(item => {
      return item.id;
    });
    let position = listKeyOffer.indexOf(userId);

    if (position !== -1) {
      listOfferPerson.splice(position, position ? position : 1);

      this.setState({
        listOfferPerson: listOfferPerson,
      });
    }
  }

  memberGetOut(userId) {
    const { listMember } = this.state;
    const listKey = listMember.map(item => {
      return item.id;
    });
    let position = listKey.indexOf(userId);

    if (position !== -1) {
      listMember.splice(position, position ? position : 1);

      this.setState({
        listMember: listMember,
      });
    }
  }

  showOrHide = e => {
    if (e.currentTarget.dataset.right > 0) {
      this.setState({
        rightOn: !this.state.rightOn,
      });
    } else {
      this.setState({
        leftOn: !this.state.leftOn,
      });
    }
  };

  changeMicro = () => {
    this.toggleMicrophone();
    this.setState({
      microOn: !this.state.microOn,
    });
  };

  changeCamera = () => {
    const { cameraOn } = this.state;
    this.toggleCamera();
    this.setState({
      cameraOn: !cameraOn,
    });
  };

  toggleMicrophone = () => {
    this.stream.getAudioTracks()[0].enabled = !this.stream.getAudioTracks()[0].enabled;
  };

  toggleCamera = () => {
    this.stream.getVideoTracks()[0].enabled = !this.stream.getVideoTracks()[0].enabled;
  };

  rejectPerson = e => {
    this.removePersonOffer(e.currentTarget.dataset.id);
  };

  addMember = e => {
    const { roomId, liveChatId } = this.props.match.params;
    const memberId = e.currentTarget.dataset.id;

    if (memberId) {
      let param = { roomId, liveChatId, memberId };
      this.acceptMember(param);
    }
  };

  acceptMember(param) {
    acceptMember(param).then(res => {
      if (!res.data.success) {
        message.error(res.data.message);
      }
    });
  }

  leaveLiveChat = () => {
    const { roomId, liveChatId } = this.props.match.params;
    const userId = this.props.userContext.info._id;

    leaveLiveChat(userId, { roomId: roomId, liveId: liveChatId })
      .then(res => {
        if (res.data.success) {
          window.close();
        } else {
          message.error(res.data.message);
        }
      })
      .catch(res => {
        message.error(res.message);
      });
  };

  showListNotMember = () => {
    const { roomId, liveChatId } = this.props.match.params;

    getListNotMember({ roomId, liveId: liveChatId }).then(res => {
      const listUser = res.data.result;
      let user_info = listUser.map(function(item) {
        return item.user[0];
      });

      this.setState({
        listUserToChooseMember: user_info,
      });
    });
  };

  inviteMember = users => {
    const { roomId, liveChatId } = this.props.match.params;
    const roomName = decodeURI(window.location.search.split('roomName=')[1]);
    this.socket.emit('invite-member', { roomName, roomId, liveChatId, users });
  };

  closeModalListNotMember = () => {
    this.setState({
      listUserToChooseMember: null,
    });
  };

  changeMainVideo = e => {
    document.getElementById('main-video').srcObject = document.getElementById(e.currentTarget.id).srcObject;
  };

  render = () => {
    const {
      checkDisplayLayout,
      leftOn,
      rightOn,
      microOn,
      cameraOn,
      listOfferPerson,
      listMember,
      isCaller,
      listUserToChooseMember,
    } = this.state;
    const { t } = this.props;
    let waiting = '';

    if (checkDisplayLayout === false) {
      waiting = (
        <div id="waiting-accept">
          <div id="top-div" />
          <div id="tmp-video">
            <h1 id="notice">{t('wait_notify')}</h1>
          </div>
        </div>
      );
    }

    return (
      <div id="live-chat">
        {checkDisplayLayout ? (
          <div>
            <video className="video" id="main-video" />
            <div id="top-right-column" className="block">
              <div className="show-or-hide" data-right="1" onClick={this.showOrHide.bind(this)}>
                {rightOn ? (
                  <div>
                    <FaAngleRight />
                    <FaAngleRight />
                  </div>
                ) : (
                  <div>
                    <FaAngleLeft />
                    <FaAngleLeft />
                  </div>
                )}
              </div>
              <div className="list-block">
                {listMember.map(member => {
                  return (
                    <div key={member.id} className={rightOn ? 'member-of-stream' : 'member-of-stream hide'}>
                      <video className="participant-video" id={member.id} onClick={this.changeMainVideo} />
                      <span className="person-name">{member.name}</span>
                    </div>
                  );
                })}

                <div className={isCaller ? '' : 'hide'} id="add-participant">
                  <Button onClick={this.showListNotMember}>
                    <MdAddToQueue />
                  </Button>
                  {listUserToChooseMember && listUserToChooseMember.length && (
                    <ModalShowListUserToChooseMember
                      closeModalListNotMember={this.closeModalListNotMember}
                      inviteMember={this.inviteMember}
                      listUserToChooseMember={listUserToChooseMember}
                    />
                  )}
                </div>
              </div>
            </div>
            <div id="top-left-column" className="block">
              {isCaller && listOfferPerson.length > 0 && (
                <div
                  className="show-or-hide"
                  data-right="0"
                  onClick={this.showOrHide.bind(this)}
                  style={{ margin: !leftOn ? '0 0 0 0' : '' }}
                >
                  {leftOn ? (
                    <div>
                      <FaAngleLeft />
                      <FaAngleLeft />
                    </div>
                  ) : (
                    <div>
                      <FaAngleRight />
                      <FaAngleRight />
                    </div>
                  )}
                </div>
              )}
              <div className="list-block">
                {isCaller &&
                  listOfferPerson.map(person => {
                    return (
                      <div key={person.id} className={leftOn ? 'person' : 'person hidden'}>
                        <img src={getUserAvatarUrl(person.avatar)} />
                        <div>
                          <span className="person-name">{person.name}</span>
                          <div className="add-member" data-id={person.id} onClick={this.addMember.bind(this)}>
                            <FaUserPlus />
                          </div>
                          <div className="remove-person" data-id={person.id} onClick={this.rejectPerson.bind(this)}>
                            <FaUserSlash />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div id="bottom-chat">
              <div id="option-center">
                <div id="action-micro">
                  <Button onClick={this.changeMicro}>
                    {microOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    <span className="tooltip-text">{t('tooltip_micro')}</span>
                  </Button>
                </div>
                <div id="hangup">
                  <Button onClick={this.leaveLiveChat}>
                    <Icon type="phone" />
                    <span className="tooltip-text">{t('tooltip_hangUp')}</span>
                  </Button>
                </div>
                <div id="action-camera">
                  <Button onClick={this.changeCamera}>
                    {cameraOn ? <FaVideo /> : <FaVideoSlash />}
                    <span className="tooltip-text">{t('tooltip_camera')}</span>
                  </Button>
                </div>
              </div>
              <div id="share-screen">
                <Button>{t('share_screen')}</Button>
              </div>
            </div>
          </div>
        ) : (
          waiting
        )}
      </div>
    );
  };
}

export default withNamespaces(['liveChat'])(withUserContext(LiveChat));
