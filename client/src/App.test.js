import { configureStore } from './store/configureStore';
import {
  createMemoryHistory,
  createBrowserHistory,
} from 'history';
import { expect } from 'chai';
import { Map } from 'immutable';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import { getCellId } from './core';
import * as Helpers from './testHelpers';
import App from './App';
import getRootPath from './lib/getRootPath';

require('./setupTests');

// it('renders without crashing', () => {
//   const history = createBrowserHistory();
//   const div = document.createElement('div');
//
//   const store = configureStore(undefined, history);
//   ReactDOM.render(
//     <Provider store={store}>
//       <App history={history} />
//     </Provider>,
//     div
//   );
// });

it('renders landing when passed root path', () => {
  const rootPath = getRootPath();
  const history = createMemoryHistory({ initialEntries: [rootPath] });
  const store = configureStore(undefined, history);

  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <App history={history} />
    </Provider>,
    div
  );
});

it('renders spreadsheet when passed root path + spreadsheet shortId', () => {
  const spreadsheetPath = `${getRootPath()}some_spreadsheet_short_id`;
  const history = createMemoryHistory({ initialEntries: [spreadsheetPath] });
  const store = configureStore(undefined, history);

  const div = document.createElement('div');
  ReactDOM.render(
    <Provider store={store}>
      <App history={history} />
    </Provider>,
    div
  );
});

describe('functional tests', () => {
  describe('cell clicking', () => {
    // TODO: move to testHelpers.
    const spreadsheetPath = `${getRootPath()}empty_spreadsheet_short_id`;
    const history = createMemoryHistory({ initialEntries: [spreadsheetPath] });
    const store = configureStore(undefined, history);

    const rootWrapper = mount(
      <Provider store={store}>
        <App history={history} />
      </Provider>
    );

    const cellIdsSequence = [
      getCellId('r1', 'c2'),
      getCellId('r1', 'c3'),
      getCellId('r0', 'c0'),
    ];

    it('clicking on cell should make it pointed and all other cells not pointed', () => {
      cellIdsSequence.forEach((cellId) => {
        Helpers.dispatchEventOnCellWrapper(rootWrapper, cellId, 'click');
        Helpers.onlyOneDataWrapperHasClassTest(store, rootWrapper, cellId, 'pointed');
      });
    });

    it('doubleclicking on non-editing cell should make it editing and all other cells not editing', () => {
      cellIdsSequence.forEach((cellId) => {
        Helpers.dispatchEventOnCellWrapper(rootWrapper, cellId, 'doubleclick');
        Helpers.onlyOneDataWrapperHasClassTest(store, rootWrapper, cellId, 'editing');
      });
    });

    it('doubleclicking on editing cell should do nothing but default (no app actions firing)', () => {
      const cellId = getCellId('r1', 'c2');
      Helpers.dispatchEventOnCellWrapper(rootWrapper, cellId, 'doubleclick');
      const stateAfterFirstDoubleClick = store.getState();
      Helpers.dispatchEventOnCellWrapper(rootWrapper, cellId, 'doubleclick');
      const stateAfterSecondtDoubleClick = store.getState();

      expect(stateAfterSecondtDoubleClick).to.equal(stateAfterFirstDoubleClick);
    });
  });

  describe('document keys pressing', () => {
    // TODO: finish for clipboard.
    it('pressing Escape while there are pointer or/and clipboard should clear both', () => {
      // const onKeyDown = sinon.spy();
      const spreadsheetPath = `${getRootPath()}empty_spreadsheet_short_id`;
      const history = createMemoryHistory({ initialEntries: [spreadsheetPath] });
      const store = configureStore(undefined, history);

      const rootWrapper = mount(
        <Provider store={store}>
          <App history={history} />
        </Provider>
      );

      const cellId = getCellId('r1', 'c2');
      Helpers.dispatchEventOnCellWrapper(rootWrapper, cellId, 'click');

      const tableWrapper = rootWrapper.find('.table');

      // Why 'which':
      // https://github.com/airbnb/enzyme/issues/441#issuecomment-278625004
      tableWrapper.simulate('keyDown', { key: 'Escape', which: 27 });

      Helpers.onlyOneDataWrapperHasClassTest(store, rootWrapper, undefined, 'pointed');
    });
  });
});

/*
TODO: automate.

Run in all browsers:
* pressing movement key (arrow, pgdn, etc) while there is non-editing pointer should move pointer accordingly
* pressing movement key (arrow, pgdn, etc) while there are no pointer should move pointer accordingly
* pressing movement key (arrow, pgdn, etc) while there is non-editing pointer should add new rows/columns if necessary
* clicking on document should hide all open menus and cell histories and clear pointer and clipboard
* pressing on table menu button should show menu
* pressing on cell menu button should show menu
* pressing on new cell menu button after adding row/column should show menu
* when hover on cell, one and only appropriate row/column menus' buttons should become visible
* table menu should always be visible
* when data is changed table menu icon should change, signalizing server sync
* 'insert row above' button should insert row above
* 'insert row below' button should insert row below
* 'delete row' button should delete row
* 'insert column at left' button should insert column at left
* 'insert column at right' button should insert column at right
* 'delete column' button should delete column
* all those buttons should work properly after adding/removing rows/columns
* 'delete spreadsheet' button should show dialog and delete spreadsheet if user pressed 'yes'
* when there are only one row/column, delete row/column option shouldn't be present
* lines addressing should update after adding/removing rows/columns
* after showing menu first element should be active
* after dialog appearing arrow, Enter and Escape keys should work // TODO: currently doesn't work
* on document, pressing regular key should start editing currently pointed cell with value equals to that key
* on document, if regular key pressed while there are no pointed cells, [0, 0] cell should become pointed
* pressing Enter while there are pointer should make pointed cell editable and select all it's content
* pressing F2 while there are pointer should make pointed cell editable and move cursor to the end of cell's content
* pressing Delete or Backspace while there are pointer should delete pointed cell's value
* pressing Escape should hide all cell histories
* pressing Ctrl+X or Ctrl+C while there are pointer should mark cell as clipboard
* pressing Ctrl+V while there are pointer should copy/cut value from clipboard
* pressing Ctrl+V while there are pointer multiple times should cut multiple times even if clipboard cell is already empty
* pressing Ctrl+V shouldn't throw errors if the source cell have no value
* pressing Ctrl+X and then Ctrl+C on the same cell should do nothing to the cell's value
* pressing Ctrl+V should copy/cut empty cell's values too
* pressing Enter/Shift+Enter while editing should save cell's value and move pointer down/up (unless top border; at bottom table should expand)
* pressing Tab/Shift+Tab while editing should save cell's value and move pointer right/left (unless left border; at right table should expand)
* pressing Ctrl+Enter while editing should add new line after cursor
* pressing Escape while editing should make cell uneditable and leave cell's value as it was before
* clicking on other cell while there are editable cell should save content of editing cell and move pointer
* typing text to cell should expand it to some point horizontally and to infinity vertically, never showing scrollbar
* moving pointer should scroll page if necessary (even after 100 key presses)
* Ctrl+Z/Ctrl+Y should undo/redo last changing data action, leaving last edited cell pointed, but uneditable
* when user sets cell's value and then do undo, that cell's history should be removed with the value
* expanding table with empty cells shouldn't affect history and/or server sync
* if backend is't responding to requests, error icon should appear where table actions icon was, and it should be always visible and have tooltip
* export button should save CSV file
* import button should show dialog with 'Choose file' button and inactive 'Import' button
* when user selects CSV file, 'Import button' should become active and file name should appear at the right
* when user selects incorrect CSV file, errors should appear
* when import dialog closes and opens again, it should look exactly the same, regardles of previous actions
* when user selects any file in import dialog, then opens 'Choose file' dialog again and presses Escape, no errors should occur
* when data is imported, spreadsheet should sync data with server immediately
* when user is trying to import bad format file, no errors should occur
* on landing, when errors while creating spreadsheet occurs, they should be shown near 'create' button
* on landing, when error messages occurs, 'create' button should become enabled
* on landing, error messages appearing shouldn't lead to moving 'create' button on-screen position
* if there are errors occurs while loading spreadsheet in Spreadsheet, user should be redirected to Landing with messages
* back and forward history movements between Landing and Spreadsheet should work
* after deleting spreadsheet user should be redirected to Landing
* each cell's value's change should be saved in cell history
* cell menu should appear on cell hover with little delay
* (REVIEW) when there is clipboard, cell menu should be always invisible
* cell menu should contain cell history button, which show cell history if it's not shown already and vice versa
* when cell history if empty, show cell history button should be inactive
* when cell history is shown, document click should close it
* when cell history is shown, opening another should close first one
* cell history should have close button
* each record in cell history should have delete button
* when user deletes all cell history records, cell history should hide
* user should be able to select/copy/paste text from cell history
* each record in cell history should have restore button
* if records' value equals current cell's value, restore record button should be inactive
* cell menu should have clear cell button, which clears cell value
* if cell's is already empty, clear cell button should be inactive
*/
