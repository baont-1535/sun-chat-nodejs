'use strict';

const Room = require('../models/room.js');
const Group = require('../models/group.js');
const logger = require('./../logger/winston');
const channel = logger.init('error');

exports.create = async (req, res) => {
  const { name, desc, avatar, roomIds } = req.body;
  const { _id: userId } = req.decoded;

  try {
    if (roomIds.length) {
      let result = await Group.create({ name, desc, avatar });
      await Room.updateGroupForMember(roomIds, userId, result[0]._id);
      const io = req.app.get('socketIO');
      io.to(userId).emit('reset-list-chat');

      return res.status(200).json({ message: __('group.create.success') });
    }
  } catch (err) {
    channel.error(err);

    return res.status(500).json({ error: err.toString() });
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

    return res.status(500).json({ error: err.toString() });
  }
};
