import Http from './../utils/Http';

export function createGroup(group) {
  return new Http().authenticated().post(`/group/create`, group);
}

export function editGroup(groupId, param) {
  return new Http().authenticated().post(`/group/edit/groupId=${groupId}`, param);
}

export function togglePinnedGroup(groupId, pinned) {
  return new Http().authenticated().post(`/group/pin-group/${groupId}`, { pinned: pinned });
}
