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

export function setSelection(selection) {
  return {
    type: 'SET_SELECTION',
    selection,
  };
}

export function clearSelection() {
  return {
    type: 'CLEAR_SELECTION',
  };
}

export function setClipboard(clipboard) {
  return {
    type: 'SET_CLIPBOARD',
    clipboard,
  };
}

export function clearClipboard() {
  return {
    type: 'CLEAR_CLIPBOARD',
  };
}

export function toggleRowUpdateTrigger(rowId) {
  return {
    type: 'TOGGLE_ROW_UPDATE_TRIGGER',
    rowId,
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
