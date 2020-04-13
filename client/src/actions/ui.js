import * as ActionTypes from '../actionTypes';

const branch = 'ui';

export function openPopup(kind) {
  return {
    type: ActionTypes.OPEN_POPUP,
    kind,
  };
}

export function closePopup() {
  return {
    type: ActionTypes.UPDATE,
    subTypee: ActionTypes.CLOSE_POPUP,
    branch,
    updater: (state) => state.popup.visibility = false,
  };
}

export function setPopupPlace(place) {
  return {
    type: ActionTypes.UPDATE,
    subTypee: ActionTypes.SET_POPUP_PLACE,
    branch,
    updater: (state) => state.popup.place = place,
  };
}

export function setPopupCellProps(cellProps) {
  return {
    type: ActionTypes.UPDATE,
    subTypee: ActionTypes.SET_POPUP_CELL_PROPS,
    branch,
    updater: (state) => state.popup.cellProps = cellProps,
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
    type: ActionTypes.UPDATE,
    subTypee: ActionTypes.CLOSE_DIALOG,
    branch,
    updater: (state) => state.dialog.visibility = false,
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

export function setSearchBarFocus(focus) {
  return {
    type: ActionTypes.UPDATE,
    subTypee: ActionTypes.SET_SEARCH_BAR_FOCUS,
    branch,
    updater: (state) => state.searchBar.focus = focus,
  };
}
