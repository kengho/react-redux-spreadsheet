import uuid from 'uuid/v4';

// TODO: more docs.
// changesData prop triggers server sync.
// triggersRowUpdate prop triggers row update (your K.O.).

// TODO: rename other actions' types the same way as table's.

// changesData should be true for import and false for initial data load.
export function tableSetFromJSON(tableJSON, changesData: false) {
  return {
    type: 'TABLE/SET_TABLE_FROM_JSON',
    tableJSON,
    changesData,
  };
}

// If triggersRowUpdate is set and some cellId changes should be tracked,
// cellId, cellIdPath or cellIdGetter should be set.
// If triggersRowUpdate is set and some other props changes should be tracked,
// propsComparePaths should be set.
// See client/src/store/middleware/detectRowUpdatesNeed.js.
export function tableSetProp(cellId, prop, value) {
  return {
    type: 'TABLE/SET_PROP',
    changesData: true,
    triggersRowUpdate: true,
    propsComparePaths : [['data', 'cells', cellId, prop]],
    cellId,
    prop,
    value,
  };
}

export function tableDeleteProp(cellId, prop) {
  return {
    type: 'TABLE/DELETE_PROP',
    changesData: true,
    triggersRowUpdate: true,
    propsComparePaths : [['data', 'cells', cellId, prop]],
    cellId,
    prop,
  };
}

export function tableSetHover(cellId) {
  return {
    type: 'TABLE/SET_HOVER',
    cellId,
  };
}

export function tableSetPointer(pointer) {
  return {
    type: 'TABLE/SET_POINTER',
    triggersRowUpdate: true,
    cellIdPath : ['session', 'pointer', 'cellId'],
    propsComparePaths : [['session', 'pointer', 'modifiers']],
    cellId: pointer.cellId,
    modifiers: pointer.modifiers,
  };
}

export function tableMovePointer(key) {
  return {
    type: 'TABLE/MOVE_POINTER',
    triggersRowUpdate: true,
    cellIdPath : ['session', 'pointer', 'cellId'],
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
    type: 'TABLE/SET_CLIPBOARD',
    triggersRowUpdate: true,
    cellId,
    cellIdGetter,
    clipboard,
  };
}

export function tableSetRowUpdateTrigger(rowId, ids) {
  let rowIds;
  if (Array.isArray(rowId)) {
    rowIds = rowId;
  } else {
    rowIds = [rowId]
  }

  if (typeof ids === 'undefined') {
    ids = rowIds.map(() => uuid());
  }

  return {
    type: 'TABLE/SET_ROW_UPDATE_TRIGGER',
    rowIds,
    ids,
  };
}

export function tableReduce(lineNumber, lineRef) {
  return {
    type: 'TABLE/REDUCE',
    changesData: true,
    lineNumber,
    lineRef,
  };
}

export function tableExpand(lineNumber, lineRef, id = uuid()) {
  return {
    type: 'TABLE/EXPAND',

    // Even though tableExpand() changes data, we don't want
    // 1) to press Ctrl+Z twice to undo SET_PROP, EXPAND actions sequence, and
    // 2) to send empty rows to server each time user presses ArrowDown.
    changesData: false,
    lineNumber,
    lineRef,
    id,
  };
}

export function tablePushCellHistory(cellId, value, unixTime) {
  return {
    type: 'TABLE/PUSH_CELL_HISTORY',
    cellId,
    value,
    unixTime,
  };
}

export function tableDeleteCellHistory(cellId, historyIndex) {
  return {
    type: 'TABLE/DELETE_CELL_HISTORY',
    cellId,
    historyIndex,
  };
}
