import { fromJS } from 'immutable';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

export default (state = initialState().get('ui') || null, action) => {
  switch (action.type) {
    case ActionTypes.OPEN_POPUP:
      return state.setIn(
        ['popup', 'visibility'],
        true
      );

    case ActionTypes.CLOSE_POPUP:
      return state.setIn(
        ['popup', 'visibility'],
        false
      );

    // NOTE: action is supposed to fire rarely, no need for optimizations.
    case ActionTypes.SET_POPUP: {
      const currentVisibility = state.getIn(['popup', 'visibility']);

      return state.set(
        'popup',
        fromJS(action.params)
      ).setIn(
        ['popup', 'visibility'],
        currentVisibility
      );
    }

    case ActionTypes.SET_POPUP_KIND:
      return state.setIn(
        ['popup', 'kind'],
        action.kind
      );

    case ActionTypes.OPEN_DIALOG:
      return state.setIn(
        ['dialog', 'visibility'],
        true
      ).setIn(
        ['dialog', 'variant'],
        action.variant
      );

    case ActionTypes.CLOSE_DIALOG:
      return state.setIn(
        ['dialog', 'visibility'],
        false
      );

    case ActionTypes.OPEN_SEARCH_BAR:
      return state.setIn(
        ['search', 'visibility'],
        true
      ).setIn(
        ['search', 'focus'],
        true
      );

    case ActionTypes.CLOSE_SEARCH_BAR:
      return state.setIn(
        ['search', 'visibility'],
        false
      ).setIn(
        ['search', 'focus'],
        false
      );

    case ActionTypes.SET_SEARCH_BAR_FOCUS:
      return state.setIn(
        ['search', 'focus'],
        action.focus
      );

    default:
      return state;
  }
};
