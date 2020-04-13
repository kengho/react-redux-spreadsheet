import produce from 'immer';

import { initialState } from '../core';
import * as ActionTypes from '../actionTypes';

export default (state = initialState().ui, action) => produce(state, draft => {
  // eslint-disable-next-line default-case
  switch (action.type) {
    case ActionTypes.UPDATE: {
      if (action.branch === 'ui') {
        action.updater(draft);
      };
      break;
    }

    case ActionTypes.OPEN_POPUP:
      draft.popup.kind = action.kind;
      draft.popup.visibility = true;
      break;

    case ActionTypes.OPEN_DIALOG:
      draft.dialog.variant = action.variant;
      draft.dialog.visibility = true;
      break;

    case ActionTypes.OPEN_SEARCH_BAR: {
      draft.searchBar.visibility = true;
      draft.searchBar.focus = true;
      break;
    }

    case ActionTypes.CLOSE_SEARCH_BAR: {
      draft.searchBar.visibility = false;
      draft.searchBar.focus = false;
      break;
    }
  }
});
