// In this context data comes from server,
// so we doesn't need to sync it.
export function setTableFromJSON(tableJSON) {
  return {
    type: 'SET_TABLE_FROM_JSON',
    tableJSON,
  };
}

export function setProp(cellId, prop, value) {
  return {
    type: 'SET_PROP',
    syncWithServer: true,
    cellId,
    prop,
    value,
  };
}

export function deleteProp(cellId, prop) {
  return {
    type: 'DELETE_PROP',
    syncWithServer: true,
    cellId,
    prop,
  };
}

export function setHover(cellId) {
  return {
    type: 'SET_HOVER',
    cellId,
  };
}

export function setPointer(pointer) {
  return {
    type: 'SET_POINTER',
    pointer,
  };
}

export function movePointer(key) {
  return {
    type: 'MOVE_POINTER',
    syncWithServer: true,
    key,
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
