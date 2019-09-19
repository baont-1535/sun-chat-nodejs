'use strict';

const Room = require('../models/room.js');
const Group = require('../models/group.js');
const logger = require('./../logger/winston');
const channel = logger.init('error');
const files = require('../services/files.js');
const config = require('../../config/config');
const slug = require('slug');

exports.create = async (req, res) => {
  const { name, desc, avatar, roomIds } = req.body;
  const { _id: userId } = req.decoded;

  try {
    if (roomIds.length) {
      let result = await Group.create({ name, desc, avatar });
      await Room.updateGroupForMember(userId, roomIds, result[0]._id);
      const io = req.app.get('socketIO');
      io.to(userId).emit('reset-list-chat');

      return res.status(200).json({ notice: __('group.create.success'), success: true });
    }
  } catch (err) {
    channel.error(err);

    return res.status(500).json({ notice: __('group.create.fail') });
  }
};

exports.togglePinGroup = async (req, res) => {
  const { groupId } = req.params;
  const { pinned } = req.body;

  try {
    await Group.updatePin(groupId, !pinned);

    return res.status(200).json({ message: __('group.update.success') });
  } catch (err) {
    channel.error(err);

    return res.status(500).json({ message: __('group.update.fail') });
  }
};

exports.getInfoForGroupForm = async (req, res) => {
  const { groupId } = req.params;
  const { _id: userId } = req.decoded;

  try {
    let result = await Room.getInfoForGroupForm(groupId, userId);

    return res.status(200).json(result[0]);
  } catch (err) {
    channel.error(err);

    return res.status(500).json({ error: err.toString() });
  }
};

exports.editGroup = async (req, res) => {
  const { groupId } = req.params;
  const { _id: userId } = req.decoded;
  const pathRoomAvatar = config.DIR_UPLOAD_FILE.ROOM_AVATAR;

  try {
    const groupData = req.body;
    if (groupData.avatar_url) {
      await files
        .saveImage(groupData.avatar_url, slug(groupData.name, '-'), pathRoomAvatar, groupData.avatar_url)
        .then(url => {
          groupData.avatar_url = url;
        });
    } else if (groupData.changeAvatar) {
      groupData.avatar_url = null;
    }

    await Group.findOneAndUpdate({ _id: groupId }, { $set: groupData });
    let rooms = await Room.getRoomsByGroup(groupId, userId);
    let roomIds = rooms.map(item => String(item._id));

    if (roomIds.length) {
      let removeIds = roomIds.filter(id => !groupData.roomIds.includes(id));
      let joinIds = groupData.roomIds.filter(id => !roomIds.includes(id));

      Room.removeRoomsWithoutGroup(userId, removeIds);
      Room.updateGroupForMember(userId, joinIds, groupId);

      const io = req.app.get('socketIO');
      io.to(userId).emit('reset-list-chat');

      return res.status(200).json({ notice: __('group.edit.success'), success: true });
    }
  } catch (err) {
    channel.error(err);

    return res.status(500).json({ notice: __('group.edit.fail') });
  }
};

exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const { _id: userId } = req.decoded;

  try {
    let rooms = await Room.getRoomsByGroup(groupId, userId);

    if (rooms.length) {
      const roomIds = rooms.map(item => item._id);
      await Room.removeRoomsWithoutGroup(userId, roomIds);

      const io = req.app.get('socketIO');
      io.to(userId).emit('reset-list-chat');

      return res.status(200).json({ notice: __('group.delete.success') });
    }
  } catch (err) {
    channel.error(err);

    return res.status(500).json({ notice: __('group.delete.fail') });
  }
};
