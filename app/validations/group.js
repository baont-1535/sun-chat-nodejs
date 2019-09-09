const { checkGroupName } = require('./actions/createGroup');

exports.validate = type => {
  switch (type) {
    case 'create': {
      return [checkGroupName()];
    }
  }
};
