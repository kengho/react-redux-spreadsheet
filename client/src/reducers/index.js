import { combineReducers } from 'redux-immutable';
import undoable, { groupByActionTypes } from 'redux-undo';

import * as ActionTypes from '../actionTypes';
import landing from './landing';
import server from './server';
import settings from './settings';
import table from './table';
import ui from './ui';

export default combineReducers({
  landing,
  settings,
  server,
  table: undoable(table, {
    // NOTE: Dispaching ActionTypes.MERGE_SERVER_STATE should save state to history.
    //  https://github.com/omnidan/redux-undo/issues/157#issuecomment-298245650
    filter: (action) => (action.changesData || action.type === ActionTypes.MERGE_SERVER_STATE),
    groupBy: groupByActionTypes([ActionTypes.SET_PROP, ActionTypes.SET_CELL]),

    // For ActionTypes.UNDO and ActionTypes.REDO in table reducer.
    neverSkipReducer: true,
  }),
  ui,
});
