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

// NOTE: please add subType prop when calling those meta actions for debugging purpose.
// REVIEW: consider replacing all simple actions with that.
export function setIn(path, object) {
  return {
    type: ActionTypes.SET_IN,
    object,
    path,
  };
}

export function mergeIn(path, object, defaults) {
  return {
    type: ActionTypes.MERGE_IN,
    object,
    path,
    defaults,
  };
}

export function defaultizeIn(path) {
  return {
    type: ActionTypes.DEFAULTIZE_IN,
    path,
  };
}

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
    type: ActionTypes.MERGE_IN,
    subType: ActionTypes.SET_SCREEN_SIZE,
    path: ['major', 'vision'],
    object: screenSize,
  };
}

export function setLinesOffsets(offsets) {
  return {
    type: ActionTypes.SET_IN,
    subType: ActionTypes.SET_LINES_OFFSETS,
    path: ['minor', 'linesOffsets'],
    object: offsets,
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
    type: ActionTypes.SET_IN,
    subType: ActionTypes.SET_LINE_SIZE,
    path: ['major', 'layout', lineType, 'list', index, 'size'],
    object: size,
  };
}

// NOTE: if number not specified, inserting lines from last one to 'index'.
// TODO: adding lines at the end shouldn't change data.
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

export function setClipboard(props) {
  return {
    type: ActionTypes.SET_IN,
    subType: ActionTypes.SET_CLIPBOARD,
    path: ['major', 'session', 'clipboard', 0],
    object: props,
  };
}

export function deleteArea(area) {
  return {
    type: ActionTypes.DELETE_AREA,
    area,
    changesData,
  };
}

export function setArea(anchorCell, area) {
  return {
    type: ActionTypes.SET_AREA,
    anchorCell,
    area,
    changesData,
  };
}

export function workOnUserSpecifiedArea(operation) { // areaOperations
  return {
    type: ActionTypes.WORK_ON_USER_SPECIFIED_AREA,
    operation,
    changesData,
  };
}

export function copyUserSpecifiedArea() {
  return {
    type: ActionTypes.WORK_ON_USER_SPECIFIED_AREA,
    subType: ActionTypes.COPY_USER_SPECIFIED_AREA,
    operation: COPY,
  };
}

export function cutUserSpecifiedArea() {
  return {
    type: ActionTypes.WORK_ON_USER_SPECIFIED_AREA,
    subType: ActionTypes.CUT_USER_SPECIFIED_AREA,
    operation: CUT,
  };
}

export function pasteUserSpecifiedArea(text = '') {
  return {
    type: ActionTypes.WORK_ON_USER_SPECIFIED_AREA,
    subType: ActionTypes.PASTE_USER_SPECIFIED_AREA,
    operation: PASTE,
    text,
  };
}

export function clearUserSpecifiedArea() {
  return {
    type: ActionTypes.WORK_ON_USER_SPECIFIED_AREA,
    subType: ActionTypes.CLEAR_USER_SPECIFIED_AREA,
    operation: CLEAR,
  };
}

export function deleteUserSpecifiedArea() {
  return {
    type: ActionTypes.WORK_ON_USER_SPECIFIED_AREA,
    subType: ActionTypes.DELETE_USER_SPECIFIED_AREA,
    operation: DELETE,
  };
}

export function setCurrentSelectionAnchor({
  selectionAnchorType,
  anchor,
}) {
  return {
    type: ActionTypes.SET_IN,
    subType: ActionTypes.SET_CURRENT_SELECTION_ANCHOR,
    path: ['minor', 'currentSelection', selectionAnchorType],
    object: anchor,
  };
}

export function setCurrentSelectionVisibility(visibility) {
  return {
    type: ActionTypes.SET_IN,
    subType: ActionTypes.SET_CURRENT_SELECTION_VISIBILITY,
    path: ['minor', 'currentSelection', 'visibility'],
    object: visibility,
  };
}

export function fixateCurrentSelection() {
  return {
    type: ActionTypes.FIXATE_CURRENT_SELECTION,
  };
}

export function clearSelection() {
  return {
    type: ActionTypes.DEFAULTIZE_IN,
    subType: ActionTypes.CLEAR_SELECTION,
    path: ['major', 'session', 'selection'],
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

export function sort({
  lineType,
  index,
  order, // sortOrders
  propPath = ['value'],
  fixFirstLine = false,
}) {
  return {
    type: ActionTypes.SORT,
    lineType,
    index,
    order,
    propPath,
    fixFirstLine,
    changesData,
  };
}

export function clearSpreadsheet() {
  return {
    type: ActionTypes.DEFAULTIZE_IN,
    subType: ActionTypes.CLEAR_SPREADSHEET,
    path: ['major', 'layout'],
    changesData,
  };
}

export function batchActions(actions) {
  return {
    type: ActionTypes.BATCH_ACTIONS,
    actions,
  };
}
