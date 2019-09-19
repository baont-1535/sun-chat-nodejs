import Http from './../utils/Http';

export function createGroup(group) {
  return new Http().authenticated().post(`/group/create`, group);
}

export function getInfoForGroupForm(groupId = 0) {
  return new Http().authenticated().post(`/group/${groupId}`);
}

export function editGroup(groupId, param) {
  return new Http().authenticated().post(`/group/edit/${groupId}`, param);
}

export function deleteGroup(groupId) {
  return new Http().authenticated().post(`/group/delete/${groupId}`);
}

export function togglePinnedGroup(groupId, pinned) {
  return new Http().authenticated().post(`/group/pin-group/${groupId}`, { pinned: pinned });
}
