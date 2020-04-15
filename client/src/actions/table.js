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
import { initialTable } from '../core';

const changesData = true;
const branch = 'table';

// NOTE: please add subType prop when calling those meta actions for debugging purpose.
// TODO: TEST: check all side effects for all actions with "changesData" flag equals true.

export function batchActions(actions) {
  return {
    type: ActionTypes.BATCH_ACTIONS,
    actions,
  };
}

export function clearClipboard() {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.CLEAR_CLIPBOARD,
    branch,
    updater: (state) => state.major.session.clipboard[0] = initialTable().major.session.clipboard[0],
  };
}

export function clearSelection() {
  // REVIEW: maybe break initialTable into peaces and use them separately?
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.CLEAR_SELECTION,
    branch,
    updater: (state) => state.major.session.selection = initialTable().major.session.selection,
  };
}

export function clearSpreadsheet() {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.CLEAR_SPREADSHEET,
    branch,
    updater: (state) => state.major.layout = initialTable().major.layout,
    changesData,
  };
}

export function clearUserSpecifiedArea() {
  return {
    type: ActionTypes.WORK_ON_USER_SPECIFIED_AREA,
    subType: ActionTypes.CLEAR_USER_SPECIFIED_AREA,
    operation: CLEAR,
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

export function deleteCellHistory(cell, historyIndex) {
  return {
    type: ActionTypes.DELETE_CELL_HISTORY,
    cell,
    historyIndex,
    changesData,
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

export function deleteUserSpecifiedArea() {
  return {
    type: ActionTypes.WORK_ON_USER_SPECIFIED_AREA,
    subType: ActionTypes.DELETE_USER_SPECIFIED_AREA,
    operation: DELETE,
  };
}

export function fixateCurrentSelection() {
  return {
    type: ActionTypes.FIXATE_CURRENT_SELECTION,
  };
}

export function insertColumns({
  index,
  number,
}) {
  return {
    type: ActionTypes.INSERT_LINES,
    subType: ActionTypes.INSERT_COLUMNS,
    lineType: COLUMN,
    index,
    number,
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
    subType:ActionTypes.INSERT_ROWS,
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

export function pasteUserSpecifiedArea(text = '') {
  return {
    type: ActionTypes.WORK_ON_USER_SPECIFIED_AREA,
    subType: ActionTypes.PASTE_USER_SPECIFIED_AREA,
    operation: PASTE,
    text,
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

export function setClipboard(clipboard) {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_CLIPBOARD,
    branch,
    updater: (state) => state.major.session.clipboard[0] = clipboard,
  };
}

export function setCurrentSelectionAnchor({
  selectionAnchorType,
  anchor,
}) {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_CURRENT_SELECTION_ANCHOR,
    branch,
    updater: (state) => state.minor.currentSelection[selectionAnchorType] = anchor,
  };
}

export function setCurrentSelectionVisibility(visibility) {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_CURRENT_SELECTION_VISIBILITY,
    branch,
    updater: (state) => state.minor.currentSelection.visibility = visibility,
  };
}

export function setLineSize({
  lineType,
  index,
  size,
}) {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_LINE_SIZE,
    changesData, // test_9985
    branch,
    updater: (state) => state.major.layout[lineType].list[index].size = size,
  };
}

export function setLinesOffsets(offsets) {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_LINES_OFFSETS,
    branch,
    updater: (state) => state.minor.linesOffsets = offsets,
  };
}

export function setPointerProps(pointerProps) {
  return {
    type: ActionTypes.SET_POINTER_PROPS,
    pointerProps,
  };
}

export function setPointerPosition(pointerPosition) {
  return {
    type: ActionTypes.SET_POINTER_POSITION,
    pointerPosition,
  };
}

export function setProp(cell) {
  return {
    type: ActionTypes.SET_PROP,
    cell,
    changesData,
  };
}

export function setScreenSize(screenHeight, screenWidth) {
  return {
    type: ActionTypes.UPDATE,
    subType: ActionTypes.SET_SCREEN_SIZE,
    branch,
    updater: (state) => {
      state.major.vision[ROW].screenSize = screenHeight;
      state.major.vision[COLUMN].screenSize = screenWidth;
    },
  };
}

export function setScrollSize(scrollTop, scrollLeft) {
  return {
    type: ActionTypes.SET_SCROLL_SIZE,
    scrollTop,
    scrollLeft,
  };
}

export function sort({
  lineType,
  index,
  order, // sortOrders
  fixFirstLine = false,
}) {
  return {
    type: ActionTypes.SORT,
    lineType,
    index,
    order,
    fixFirstLine,
    changesData,
  };
}

// NOTE: middleware-only action.
export function workOnUserSpecifiedArea(operation) { // areaOperations
  return {
    type: ActionTypes.WORK_ON_USER_SPECIFIED_AREA,
    operation,
    changesData,
  };
}
