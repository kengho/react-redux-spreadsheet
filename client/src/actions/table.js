import uuid from 'uuid/v4';

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
    changesData: true,
    triggersRowUpdate: true,
    cellId,
    prop,
    value,
  };
}

export function deleteProp(cellId, prop) {
  return {
    type: 'DELETE_PROP',
    changesData: true,
    triggersRowUpdate: true,
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

export function setPointerModifiers(modifiers) {
  return {
    type: 'SET_POINTER_MODIFIERS',
    modifiers,
  };
}

export function clearPointer() {
  return {
    type: 'CLEAR_POINTER',
  };
}

export function movePointer(key) {
  return {
    type: 'MOVE_POINTER',
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
    changesData: true,
    pos,
  };
}

export function expand(pos, id = uuid()) {
  return {
    type: 'EXPAND',

    // Even though expand() changes data, we don't want
    // 1) to press Ctrl+Z twice to undo SET_PROP, EXPAND actions sequence, and
    // 2) to send empty rows to server each time user presses ArrowDown.
    changesData: false,
    pos,
    id,
  };
}
