import { expect } from 'chai';

import {
  ROW,
  COLUMN,
  MENU,
  CELL,
  IMPORT,
} from './../constants';
import * as Core from './../core';
import * as UiActions from './ui';
import configureStore from './../store/configureStore';

describe('ui', () => {
  // Testing in regular workflow style.

  const state = Core.initialState();
  const store = configureStore(state);

  it('should open popup of given type', () => {
    store.dispatch(UiActions.openPopup(MENU));

    const actualPopupVisibility = store.getState().ui.popup.visibility;
    const expectedPopupVisibility = true;

    const actualPopupKind = store.getState().ui.popup.kind;
    const expectedPopupKind = MENU;

    expect(actualPopupVisibility).to.equal(expectedPopupVisibility);
    expect(actualPopupKind).to.equal(expectedPopupKind);
  });

  it('should close popup', () => {
    store.dispatch(UiActions.closePopup());
    const actualPopupVisibility = store.getState().ui.popup.visibility;
    const expectedPopupVisibility = false;

    expect(actualPopupVisibility).to.equal(expectedPopupVisibility);
  });

  it('should set popup place', () => {
    store.dispatch(UiActions.setPopupPlace(CELL));
    const actualPopupPlace = store.getState().ui.popup.place;
    const expectedPopupPlace = CELL;

    expect(actualPopupPlace).to.equal(expectedPopupPlace);
  });

  it('should set popup cell props', () => {
    store.dispatch(UiActions.setPopupCellProps({
      [ROW]: {
        index: 1,
        offset: 200,
      },
      [COLUMN]: {
        index: 3,
        offset: 400,
      },
    }));
    const actualPopupPosition = store.getState().ui.popup.cellProps;
    const expectedPopupPosition = {
      [ROW]: {
        index: 1,
        offset: 200,
      },
      [COLUMN]: {
        index: 3,
        offset: 400,
      },
    };

    expect(actualPopupPosition).to.deep.equal(expectedPopupPosition);
  });

  it('should open dialog of given variant', () => {
    store.dispatch(UiActions.openDialog(IMPORT));

    const actualDialogVisibility = store.getState().ui.dialog.visibility;
    const expectedDialogVisibility = true;

    const actualDialogVariant = store.getState().ui.dialog.variant;
    const expectedDialogVariant = IMPORT;

    expect(actualDialogVisibility).to.equal(expectedDialogVisibility);
    expect(actualDialogVariant).to.equal(expectedDialogVariant);
  });

  it('should close dialog', () => {
    store.dispatch(UiActions.closeDialog());
    const actualDialogVisibility = store.getState().ui.dialog.visibility;
    const expectedDialogVisibility = false;

    expect(actualDialogVisibility).to.equal(expectedDialogVisibility);
  });

  it('should open search bar', () => {
    store.dispatch(UiActions.openSearchBar());
    const actualSearchBarVisibility = store.getState().ui.searchBar.visibility;
    const actualSearchBarFocus = store.getState().ui.searchBar.focus;
    const expectedSearchBarVisibility = true;
    const expectedSearchBarFocus = true;

    expect(actualSearchBarVisibility).to.equal(expectedSearchBarVisibility);
    expect(actualSearchBarFocus).to.equal(expectedSearchBarVisibility);
  });

  it('should close search bar', () => {
    store.dispatch(UiActions.closeSearchBar());
    const actualSearchBarVisibility = store.getState().ui.searchBar.visibility;
    const actualSearchBarFocus = store.getState().ui.searchBar.focus;
    const expectedSearchBarVisibility = false;
    const expectedSearchBarFocus = false;

    expect(actualSearchBarVisibility).to.equal(expectedSearchBarVisibility);
    expect(actualSearchBarFocus).to.equal(expectedSearchBarVisibility);
  });

  it('should set search bar focus flag', () => {
    store.dispatch(UiActions.setSearchBarFocus(true));
    const actualSearchBarFocus = store.getState().ui.searchBar.focus;
    const expectedSearchBarFocus = true;

    expect(actualSearchBarFocus).to.equal(expectedSearchBarFocus);
  });
});
