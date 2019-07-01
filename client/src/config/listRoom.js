const config = {
  FILTER_TYPE: {
    LIST_ROOM: {
      ALL: {
        VALUE: 0,
        TITLE: 'filter.all',
      },
      UNREAD: {
        VALUE: 1,
        TITLE: 'filter.un_read',
      },
      PINNED: {
        VALUE: 2,
        TITLE: 'filter.pinned',
      },
      GROUP: {
        VALUE: 3,
        TITLE: 'filter.group_chat',
      },
      DIRECT: {
        VALUE: 4,
        TITLE: 'filter.direct_chat',
      },
      SELF: {
        VALUE: 5,
        TITLE: 'filter.my_chat',
      },
    },
  },
  COND_SEARCH_TEXT: {
    MIN_LENGTH: 3,
  },
  LIMIT_ITEM_SHOW: {
    ROOM: 20,
  },
  MIN_WIDTH: 6.5, // unit %
  MAX_WIDTH: 27,  // unit %
  WIDTH_DEFAULT_ROOM: 38, // unit %
};

export default config;
