import * as ActionTypes from '../actionTypes';
import {
  ROW,
  COLUMN,
  COPY,
  CUT,
  PASTE,
  CLEAR,
  DELETE,
} from '../constants';

const changesData = true;

export function setCell(cell) {
  return {
    type: ActionTypes.SET_CELL,
    cell,
    changesData,
  };
}

export function setProp(cell) {
  return {
    type: ActionTypes.SET_PROP,
    cell,
    changesData,
  };
}

export function setScrollSize(scrollSize) {
  return {
    type: ActionTypes.SET_SCROLL_SIZE,
    scrollSize,
  };
}

export function setScreenSize(screenSize) {
  return {
    type: ActionTypes.SET_SCREEN_SIZE,
    screenSize,
  };
}

export function setLinesOffsets(offsets) {
  return {
    type: ActionTypes.SET_LINES_OFFSETS,
    offsets,
  };
}

// NOTE: please add subType prop when calling mergeIn for debugging purpose.
export function mergeIn(path, object, defaults) {
  return {
    type: ActionTypes.MERGE_IN,
    object,
    path,
    defaults,
  };
}

// NOTE: this is really complex action which I don't want to divide.
//   MERGE_IN is allowed to use only here.
export function setPointer(pointer) {
  return {
    type: ActionTypes.MERGE_IN,
    subType: ActionTypes.SET_POINTER,
    object: pointer,
    path: ['major', 'session', 'pointer'],

    // NOTE: fixes issue when you have editing cell and scroll it ouf of vision
    //   and click on other cell after this copying editing cell's value to new
    //   cell because of saving pointed cell's vlaue after scroll mechanism.
    defaults: { value: '' },
  };
}

// REVIEW: do we really need default params here?
export function movePointer({
  key,
  altKey = false,
  ctrlKey = false,
  cell,
}) {
  return {
    type: ActionTypes.MOVE_POINTER,
    key,
    altKey,
    ctrlKey,
    cell,
  };
}

export function updateCellSize(cellSize) {
  return {
    type: ActionTypes.UPDATE_CELL_SIZE,
    cellSize,
  };
}

export function setLineSize({
  lineType,
  index,
  size,
}) {
  return {
    type: ActionTypes.SET_LINE_SIZE,
    lineType,
    index,
    size,
  };
}

// NOTE: if number not specified, inserting lines from last one to 'index'.
export function insertLines({
  lineType,
  index,
  number,
}) {
  return {
    type: ActionTypes.INSERT_LINES,
    lineType,
    index,
    number,
    changesData,
  };
}

export function insertRows({
  index,
  number,
}) {
  return {
    type: ActionTypes.INSERT_LINES,
    lineType: ROW,
    index,
    number,
  };
}

export function insertColumns({
  index,
  number,
}) {
  return {
    type: ActionTypes.INSERT_LINES,
    lineType: COLUMN,
    index,
    number,
  };
}

export function deleteLines({
  lineType,
  index,
  number,
}) {
  return {
    type: ActionTypes.DELETE_LINES,
    lineType,
    index,
    number,
    changesData,
  };
}

export function pushCellHistory(cell, time, value = '') {
  return {
    type: ActionTypes.PUSH_CELL_HISTORY,
    cell,
    time,
    value,

    // NOTE: if you set this flag here, UNDO will not undo MOVE_POINTER
    //   bacause of this chain of actions appearing due to history middleware:
    //     table/MOVE_POINTER
    //     table/PUSH_CELL_HISTORY
    //     table/SET_PROP
    //   Alternative is to apply history middleware aall other acions like this:
    //     ...
    //     const nextAction = next(action);
    //     ...
    //     return nextAction;
    //   But code reader's brain could explode trying understand chain of actions
    //   in this case especially is you use this trick more than once.
    //
    // changesData,
  };
}

export function deleteCellHistory(cell, historyIndex) {
  return {
    type: ActionTypes.DELETE_CELL_HISTORY,
    cell,
    historyIndex,
    changesData,
  };
}

export function setClipboard(clipboard) {
  return {
    type: ActionTypes.SET_CLIPBOARD,
    clipboard,
  };
}

export function performOperationAtPointer(operation) { // pointerPperations
  return {
    type: ActionTypes.PERFORM_OPERATION_AT_POINTER,
    operation,
  };
}

export function copyAtPointer() {
  return {
    type: ActionTypes.PERFORM_OPERATION_AT_POINTER,
    subType: ActionTypes.COPY_AT_POINTER,
    operation: COPY,
  };
}

export function cutAtPointer() {
  return {
    type: ActionTypes.PERFORM_OPERATION_AT_POINTER,
    subType: ActionTypes.CUT_AT_POINTER,
    operation: CUT,
  };
}

export function pasteAtPointer() {
  return {
    type: ActionTypes.PERFORM_OPERATION_AT_POINTER,
    subType: ActionTypes.PASTE_AT_POINTER,
    operation: PASTE,
  };
}

export function clearAtPointer() {
  return {
    type: ActionTypes.PERFORM_OPERATION_AT_POINTER,
    subType: ActionTypes.CLEAR_AT_POINTER,
    operation: CLEAR,
  };
}

export function deleteAtPointer() {
  return {
    type: ActionTypes.PERFORM_OPERATION_AT_POINTER,
    subType: ActionTypes.DELETE_AT_POINTER,
    operation: DELETE,
  };
}

// changesData should be true for import and false for initial data load.
// NOTE: serverState should be plain object.
export function mergeServerState(serverState, changesData = false) {
  return {
    type: ActionTypes.MERGE_SERVER_STATE,
    serverState,
    changesData,
  };
}

export function batchActions(actions) {
  return {
    type: ActionTypes.BATCH_ACTIONS,
    actions,
  };
}
