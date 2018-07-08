import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { BATCH } from 'redux-batched-actions';

// landing
export const SET_LANDING_MESSAGES = 'landing/SET_LANDING_MESSAGES';
export const DISABLE_LANDING_BUTTON = 'landing/DISABLE_LANDING_BUTTON';

// settings
export const SET_SETTINGS = 'settings/SET_SETTINGS';

// table
export const SET_CELL = 'table/SET_CELL';
export const SET_PROP = 'table/SET_PROP';
export const SET_LINES_OFFSETS = 'table/SET_LINES_OFFSETS';
export const SET_POINTER = 'table/SET_POINTER';
export const MOVE_POINTER = 'table/MOVE_POINTER';
export const PUSH_CELL_HISTORY = 'table/PUSH_CELL_HISTORY';
export const DELETE_CELL_HISTORY = 'table/DELETE_CELL_HISTORY';
export const UPDATE_CELL_SIZE = 'table/UPDATE_CELL_SIZE';
export const SET_LINE_SIZE = 'table/SET_LINE_SIZE';
export const SET_SCROLL_SIZE = 'table/SET_SCROLL_SIZE';
export const SET_SCREEN_SIZE = 'table/SET_SCREEN_SIZE';
export const MERGE_IN = 'table/MERGE_IN';
export const INSERT_LINES = 'table/INSERT_LINES';
export const DELETE_LINES = 'table/DELETE_LINES';
export const SET_CLIPBOARD = 'table/SET_CLIPBOARD';
export const PERFORM_OPERATION_AT_POINTER = 'table/PERFORM_OPERATION_AT_POINTER';
export const COPY_AT_POINTER = 'table/COPY_AT_POINTER';
export const CUT_AT_POINTER = 'table/CUT_AT_POINTER';
export const PASTE_AT_POINTER = 'table/PASTE_AT_POINTER';
export const CLEAR_AT_POINTER = 'table/CLEAR_AT_POINTER';
export const DELETE_AT_POINTER = 'table/DELETE_AT_POINTER';
export const MERGE_SERVER_STATE = 'table/MERGE_SERVER_STATE';
export const SORT = 'table/SORT';
export const BATCH_ACTIONS = 'table/BATCH_ACTIONS';

// server
export const SET_SHORT_ID = 'server/SET_SHORT_ID';
export const SET_SYNC = 'meta/SET_SYNC';
export const MAKE_SERVER_REQUEST = 'server/MAKE_SERVER_REQUEST';
export const SET_REQUEST_FAILED = 'server/SET_REQUEST_FAILED';

// ui
export const OPEN_POPUP = 'ui/OPEN_POPUP';
export const CLOSE_POPUP = 'ui/CLOSE_POPUP';
export const CLOSE_POPUP_ONLY_IF_VISIBLE = 'ui/CLOSE_POPUP_ONLY_IF_VISIBLE';
export const SET_POPUP = 'ui/SET_POPUP';
export const SET_POPUP_KIND = 'ui/SET_POPUP_KIND';
export const SET_MENU = 'ui/SET_MENU';
export const OPEN_DIALOG = 'ui/OPEN_DIALOG';
export const CLOSE_DIALOG = 'ui/CLOSE_DIALOG';
export const OPEN_SEARCH_BAR = 'ui/OPEN_SEARCH_BAR';
export const CLOSE_SEARCH_BAR = 'ui/CLOSE_SEARCH_BAR';
export const SET_SEARCH_BAR_FOCUS = 'ui/SET_SEARCH_BAR_FOCUS';

// undoRedo
export const UNDO = UndoActionCreators.undo().type;
export const REDO = UndoActionCreators.redo().type;
export const CLEAR_HISTORY = UndoActionCreators.clearHistory().type;

// ...other
export const VENDOR_BATCH_ACTIONS = BATCH;
