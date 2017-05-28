import { combineReducers } from 'redux-immutable';
import meta from './meta';
import requests from './requests';
import table from './table';

const rootReducer = combineReducers({
  meta,
  table,
  requests,
});

export default rootReducer;
