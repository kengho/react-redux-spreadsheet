import uuid from 'uuid/v4';

import * as ActionTypes from '../actionTypes';

// TODO: more docs.
// changesData prop triggers server sync.
// triggersRowUpdate prop triggers row update (your K.O.).

// changesData should be true for import and false for initial data load.
export function setTableFromJSON(tableJSON, changesData = false) {
  return {
    type: ActionTypes.SET_TABLE_FROM_JSON,
    tableJSON,
    changesData,
  };
}

// If triggersRowUpdate is set and some cellId changes should be tracked,
// cellId, cellIdPath or cellIdGetter should be set.
// If triggersRowUpdate is set and some other props changes should be tracked,
// propsComparePaths should be set.
// If nor cellIdGetter or propsComparePaths are set, cellId should be set.
// See client/src/store/middleware/detectRowUpdatesNeed.js.
export function setProp(cellId, prop, value) {
  return {
    type: ActionTypes.SET_PROP,
    changesData: true,
    triggersRowUpdate: true,
    propsComparePaths: [['data', 'cells', cellId, prop]],
    cellId,
    prop,
    value,
  };
}

export function tableDeleteProp(cellId, prop) {
  return {
    type: ActionTypes.DELETE_PROP,
    changesData: true,
    triggersRowUpdate: true,
    propsComparePaths: [['data', 'cells', cellId, prop]],
    cellId,
    prop,
  };
}

export function setHover(cellId) {
  return {
    type: ActionTypes.SET_HOVER,
    cellId,
  };
}

export function setPointer(pointer) {
  return {
    type: ActionTypes.SET_POINTER,
    triggersRowUpdate: true,
    cellIdPath: ['session', 'pointer', 'cellId'],
    propsComparePaths: [['session', 'pointer', 'modifiers']],
    cellId: pointer.cellId,
    modifiers: pointer.modifiers,
  };
}

export function movePointer(key) {
  return {
    type: ActionTypes.MOVE_POINTER,
    triggersRowUpdate: true,
    cellIdPath: ['session', 'pointer', 'cellId'],
    key,
  };
}

// TODO: handle multiple clipboard cells.
// NOTE: this action looks like a mess until
//   there are only one cell in clipboard at max.
export function tableSetClipboard(clipboard) {
  let cellId;
  if (Object.keys(clipboard.cells).length > 0) {
    cellId = Object.keys(clipboard.cells)[0];
  }

  const cellIdGetter = (table) => {
    const cellsKeyes = table.getIn(['session', 'clipboard', 'cells']).keySeq().toArray();
    if (cellsKeyes.length > 0) {
      return cellsKeyes[0];
    }
  }

  return {
    type: ActionTypes.SET_CLIPBOARD,
    triggersRowUpdate: true,
    cellId,
    cellIdGetter,
    clipboard,
  };
}

export function triggerRowUpdate(rowId, ids) {
  let rowIds;
  if (Array.isArray(rowId)) {
    rowIds = rowId;
  } else {
    rowIds = [rowId];
  }

  if (typeof ids === 'undefined') {
    ids = rowIds.map(() => uuid());
  }

  return {
    type: ActionTypes.TRIGGER_ROW_UPDATE,
    rowIds,
    ids,
  };
}

export function deleteLine(lineNumber, lineRef) {
  return {
    type: ActionTypes.DELETE_LINE,
    changesData: true,
    lineNumber,
    lineRef,
  };
}

export function addLine(lineNumber, lineRef, id = uuid()) {
  return {
    type: ActionTypes.ADD_LINE,

    // Even though addLine() changes data, we don't want
    // 1) to press Ctrl+Z twice to undo SET_PROP, EXPAND actions sequence, and
    // 2) to send empty rows to server each time user presses ArrowDown.
    changesData: false,
    lineNumber,
    lineRef,
    id,
  };
}

export function pushCellHistory(cellId, value, time) {
  return {
    type: ActionTypes.PUSH_CELL_HISTORY,
    cellId,
    value,
    time,
  };
}

export function deleteCellHistory(cellId, historyIndex) {
  return {
    type: ActionTypes.DELETE_CELL_HISTORY,
    triggersRowUpdate: true,
    changesData: true,
    cellId,
    historyIndex,
  };
}

export function saveEditingCellValueIfNeeded() {
  return {
    type: ActionTypes.SAVE_EDITING_CELL_VALUE_IF_NEEDED,
  };
}
