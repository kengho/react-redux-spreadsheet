import * as ActionTypes from '../actionTypes';

import { MENU } from '../constants';

export function setPopup({ params }) {
  return {
    type: ActionTypes.SET_POPUP,
    params,
  };
}

export function openPopup() {
  return {
    type: ActionTypes.OPEN_POPUP,
  };
}

export function closePopup() {
  return {
    type: ActionTypes.CLOSE_POPUP,
  };
}

export function setPopupKind(kind) {
  return {
    type: ActionTypes.SET_POPUP_KIND,
    kind,
  };
}

export function setMenu(menu) {
  return {
    type: ActionTypes.SET_POPUP,
    subType: ActionTypes.SET_MENU,
    params: { ...menu, kind: MENU },
  };
}

export function openDialog(variant) {
  return {
    type: ActionTypes.OPEN_DIALOG,
    variant,
  };
}

export function closeDialog() {
  return {
    type: ActionTypes.CLOSE_DIALOG,
  };
}

export function openSearchBar() {
  return {
    type: ActionTypes.OPEN_SEARCH_BAR,
  };
}

export function closeSearchBar() {
  return {
    type: ActionTypes.CLOSE_SEARCH_BAR,
  };
}

export function setSearchBarFocus() {
  return {
    type: ActionTypes.SET_SEARCH_BAR_FOCUS,
  };
}
