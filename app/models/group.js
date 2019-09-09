'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema(
  {
    name: { type: String, required: true },
    desc: { type: String },
    avatar_url: { type: String },
    pinned: { type: Boolean, default: false },
    deleted_at: { type: Date, default: null },
    updated_at: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

GroupSchema.statics = {
  create: function({ name, desc, avatar = null }) {
    return this.insertMany([
      {
        name: name,
        desc: desc,
        avatar_url: avatar,
      },
    ]);
  },

  updatePin: function(groupId, pinned) {
    return this.findOneAndUpdate(
      {
        _id: groupId,
        deletedAt: null,
      },
      { $set: { pinned: pinned } }
    ).exec();
  },
};

module.exports = mongoose.model('Group', GroupSchema);
