const { check } = require('express-validator/check');
const { groupValidate } = require('./../../../config/validate');

let checkGroupName = () => {
  return check('name')
    .not()
    .isEmpty()
    .withMessage((value, { req }) => {
      return req.__('group.name_required');
    })
    .optional()
    .custom(async (value, { req }) => {
      if (value !== '' && (value.length < groupValidate.name.minLength || value.length > groupValidate.name.maxLength)) {
        throw Error(req.__('group.name_length', { min: groupValidate.name.minLength, max: groupValidate.name.maxLength }));
      }
    });
};

module.exports = {
  checkGroupName,
};
