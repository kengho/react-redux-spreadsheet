import { ActionCreators as UndoActionCreators } from 'redux-undo';

// detachments
export const SET_CURRENT_CELL_VALUE = 'detachments/SET_CURRENT_CELL_VALUE';

// landing
export const SET_LANDING_MESSAGES = 'landing/SET_LANDING_MESSAGES';
export const DISABLE_LANDING_BUTTON = 'landing/DISABLE_LANDING_BUTTON';

// meta
export const SET_SHORT_ID = 'meta/SET_SHORT_ID';

// requests
export const PUSH_REQUEST = 'requests/PUSH_REQUEST';
export const POP_REQUEST = 'requests/POP_REQUEST';
export const MARK_REQUEST_AS_FAILED = 'requests/MARK_REQUEST_AS_FAILED';

// settings
export const SET_SETTINGS_FROM_JSON = 'settings/SET_SETTINGS_FROM_JSON';
export const SET_SETTINGS_PARAM = 'settings/SET_SETTINGS_PARAM';

// table
export const SET_TABLE_FROM_JSON = 'table/SET_TABLE_FROM_JSON';
export const SET_PROP = 'table/SET_PROP';
export const DELETE_PROP = 'table/DELETE_PROP';
export const SET_HOVER = 'table/SET_HOVER';
export const SET_POINTER = 'table/SET_POINTER';
export const MOVE_POINTER = 'table/MOVE_POINTER';
export const SET_CLIPBOARD = 'table/SET_CLIPBOARD';
export const TRIGGER_ROW_UPDATE = 'table/TRIGGER_ROW_UPDATE';
export const DELETE_LINE = 'table/DELETE_LINE';
export const ADD_LINE = 'table/ADD_LINE';
export const PUSH_CELL_HISTORY = 'table/PUSH_CELL_HISTORY';
export const DELETE_CELL_HISTORY = 'table/DELETE_CELL_HISTORY';
export const SAVE_EDITING_CELL_VALUE_IF_NEEDED = 'table/SAVE_EDITING_CELL_VALUE_IF_NEEDED';

// ui
export const OPEN_UI = 'ui/OPEN_UI';
export const CLOSE_UI = 'ui/CLOSE_UI';
export const DISABLE_NEW_SPREADSHEET_BUTTON = 'ui/DISABLE_NEW_SPREADSHEET_BUTTON';
export const SET_NEW_SPREADSHEET_PATH = 'ui/SET_NEW_SPREADSHEET_PATH';

// undoRedo
export const UNDO = UndoActionCreators.undo().type;
export const REDO = UndoActionCreators.redo().type;
export const CLEAR_HISTORY = UndoActionCreators.clearHistory().type;
