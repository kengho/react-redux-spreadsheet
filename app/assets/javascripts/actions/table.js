// Data comes from server, so we doesn't need to sync it.
export function setData(data) {
  return {
    type: 'SET_DATA',
    data,
  };
}

export function setProp(pos, prop, value) {
  return {
    type: 'SET_PROP',
    syncWithServer: true,
    pos,
    prop,
    value,
  };
}

export function deleteProp(pos, prop) {
  return {
    type: 'DELETE_PROP',
    syncWithServer: true,
    pos,
    prop,
  };
}

export function setHover(pos) {
  return {
    type: 'SET_HOVER',
    pos,
  };
}

export function setPointer(pos, modifiers = []) {
  return {
    type: 'SET_POINTER',
    pos,
    modifiers,
  };
}

export function movePointer(key) {
  return {
    type: 'MOVE_POINTER',
    syncWithServer: true,
    key,
  };
}

export function togglePointerEdit() {
  return {
    type: 'TOGGLE_POINTER_EDIT',
  };
}

export function reduce(pos) {
  return {
    type: 'REDUCE',
    syncWithServer: true,
    pos,
  };
}

export function expand(pos) {
  return {
    type: 'EXPAND',
    syncWithServer: true,
    pos,
  };
}
