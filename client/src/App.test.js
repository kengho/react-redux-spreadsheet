import { createMemoryHistory, createBrowserHistory } from 'history';
import { expect } from 'chai';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import configureStore from './store/configureStore';
import getRootPath from './lib/getRootPath';

require('./setupTests');

it('renders without crashing', () => {
  const history = createBrowserHistory();
  const div = document.createElement('div');

  const store = configureStore(undefined, history);
  ReactDOM.render(
    <Provider store={store}>
      <App history={history} />
    </Provider>,
    div
  );
});

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

/*
TODO: automate.
TODO: mark all tests with numbers (irb -> "test_#{rand 10000}") and put labels in the code.

Run in all browsers:
* (test_2000) rightclick on grid header should show spreadsheet menu
* (test_6999) rightclick on cell should show cell menu
* (test_2731) rightclick on selected cells' area should show area menu
* rightclick on lines headers show lines headers menu
* line headers corresponding to pointed cell should have different style
* "insert row above menu item should insert row above
* "insert row below" menu item should insert row below
* "delete row" menu item should delete row
* "insert column at left" menu item should insert column at left
* "insert column at right" menu item should insert column at right
* "delete column" menu item should delete column
* all those menu items should work properly after adding/removing rows/columns
* sort menu button should sort
* (test_9322) sort should work on empty table
* "delete spreadsheet" button should show dialog and delete spreadsheet if user pressed "yes"
* "export to csv" grid menu item should save CSV file
* "export to json" grid menu item should save JSON file containing history if any
* "import" grid menu item should show dialog with "Choose file" button and inactive 'Import' button
* when user selects CSV file, "Import button" should become active and file name should appear
* when user selects incorrect file, errors should appear
* when data is imported, spreadsheet should sync data with server (unless offline mode)
* when user is trying to import bad format file, errors should occur
* import from JSON string should work regardless of settings key in it
* making one line extra large shouldn't break grid layout
* table should have column labels A, B, C, ... AA, ...
* grid should be infinite
* grid should update on scroll or changing screen size
* table should have row labels 1, 2, 3 starting with first row if parameter 'tableHasHeader' is true and with second otherwise
* (test_957) after changin any cells' data sync request should be sent (unless offline mode)

TODO: this.
* "new" button on table menu should show captcha (if necessary) and show link that should open new spreadsheet in new tab

TODO: this.
* if user clicks on "new" button on table menu and skips captcha by clicking on document, he should be able to press this button and meet captcha again

TODO: this.
* if new spreadsheet is created using "new" button on table menu, it shouldn't let user to create another one until he follows link
* lines addressing should update after adding/removing rows/columns
* after dialog appearing, Enter and Escape keys should work
* on document, pressing regular key should start editing currently pointed cell with value equals to that key
* editing cell should always be visible and all it's text should fit screen
* pressing Enter while there is pointer should make pointed cell editable and select all it's content
* pressing F2 while there are pointer should make pointed cell editable and move cursor to the end of cell's content
* pressing Delete while there are pointer should delete pointed cell's value

TODO: Backspace.
* pressing Backspace while there are pointer should delete all pointed cells' props
* pressing Escape should hide cell history, all menus and dialogs
* pressing arrowkeys at body should move pointer accordingly (unless border)
* pressing arrowkeys with Ctrl at body should move pointer to the corresponding nearest cell before empty one
* pressing ArrowDown and ArrowRight with Ctrl at body while there are no nonempty cells after pointer shouldn't move pointer
* pressing PageUp and PageDown at body should move pointer to the one screen up and down accordingly (unless border)
* pressing PageUp and PageDown with Alt at body should move pointer to the one screen left and right accordingly (unless border)
* pressing Ctrl+X or Ctrl+C while there are pointer should mark cell as clipboard
* pressing Ctrl+V while there are pointer should copy/cut value from clipboard
* pressing Ctrl+V after Ctrl+X multiple times should paste multiple times even if original cell is already empty
* pressing Ctrl+V shouldn't throw errors if the source cell have no value
* pressing Ctrl+X and then Ctrl+C on the same cell should do nothing to the cell's value
* pressing Ctrl+V should copy/cut empty cell's values too
* pressing Enter/Shift+Enter while editing should save cell's value and move pointer down/up (unless top/left border)
* pressing Tab/Shift+Tab on non-editing should move pointer right/left (unless top/left border)
* pressing Tab/Shift+Tab while editing should save cell's value and move pointer right/left (unless top/left border)
* pressing Enter/Shift+Enter/Tab/Shift+Tab should make next pointer non-editing
* pressing Ctrl+Enter while editing should add new line after cursor
* pressing Escape while editing should make cell uneditable and leave cell's value as it was before
* (test_241) pressing Escape while editing shouldn't affect cell's history
* clicking on other cell or document while there are editable cell should save content of editing cell and move pointer accordingly
* (test_804) after doubleclicking cell with value and then doubleclicking on another cell it's value shouldn't be previous pointer's value
* moving pointer using any hotkey should scroll page if necessary (even after 100 key presses)
* (test_134) if user presses ArrowUp when second row cell is selected and first row cell isn't visible, scroll should be to the top of the page (the same with columns)
* after pressing any arrow key appropriate cell should always became visible, even if previous cell wasn't fitting the screen entirely or wasn't visible at all

// TODO:
* Ctrl+Z/Ctrl+Y should undo/redo last changing data action, leaving last edited cell pointed, but uneditable

// TODO:
* undo/redo should consider batched actions as single action
* when user sets cell's value and then do undo, that cell's history should be removed with the value
* if backend is't responding to requests, error icon should appear where table actions icon was, and it should be always visible and have tooltip
* after backend error frontend should attempt retry periodically until succeeded
* on landing, when errors while creating spreadsheet occurs, they should be shown near 'create' button
* on landing, when error messages occurs, "create" button should become enabled
* on landing, error messages appearing shouldn't lead to moving "create" button on-screen position
* if there are errors occurs while loading spreadsheet in Spreadsheet, user should be redirected to Landing with messages
* back and forward history movements between Landing and Spreadsheet should work
* after deleting spreadsheet user should be redirected to Landing
* each cell's value's change should be saved in cell history if "autoSaveHistory" is true, and not saved otherwise

TODO: first element isn't highlighted yet.
* (test_420) after calling any menu first item should focus and arrowkeys should work
* cell menu should contain cell history button, which show cell history if it's not shown already and vice versa
* when cell history is shown, document click or Escape should close it
* each record in cell history should have delete button
* user should be able to select/copy/paste text from cell history
* each record in cell history should have restore button
* if records' value equals current cell's value, restore record button should be inactive
* cell menu should have clear cell button, which clears cell value
* in grid menu item "settings" should be present
* in table menu, when user clicks on "settings", appropriate dialog should pop up
* (test_1156) when user changes something in settings dialog and presses OK update request should sync it with server (unless offline mode)
* when "settings" dialog opens first input should focus
* when "info" dialog appears, after pressing "Enter" should close it
* in "import" dialog after importing and processing data "OK" button should focus
* in "destroy spreadsheet" dialog pressing "Enter" shouldn't have effect unless user manually "tabbed" there
* drawing rectangle from cell to cell should make selection
* (test_465) selecting overflowing cell text shouldn't create cells area selection
* (test_205) selecting cell text, replacing it with some value and moving pointer out of cell shouldn't create cells area selection
* (test_816) if there is editing cell making selection should make it unediting
* (test_772) Shift+Leftclick on non-pointed cell should create rectangle selection
* if there is already selection then creating new selection should make it disappear
* Ctlr+C/Ctrl+X/Ctlr+V/Delete with selection should do exactly the same as with single pointer
* Ctlr+V on body should paste-spread \n- \t-formatted text to cells
* (test_636) Ctlr+V on settings or any other input shouldn't lead to pasting into cells
* Ctlr+C on body should copy selected cells' values to real clipboard making it \n- \t-formatted if there are many of them
* // (legacy) after scrolling down, changing some cell and pressing Ctrl+Z layout shouldn't break
* (test_752) context menu button should show context menu on pointer
* (test_127) when cell is editing no matter how far user scroll the screen focus doesn't disappear
* (test_992) clearing, cutting or pasting area should change history
* (test_9898) after opening any menu, going back in browser and opening any spreadsheet without closing tab menu shouldn't appear
* (test_2340) after opening table menu, closing it using leftclick and openeing line menu, app shouldn't crash
* (test_5119) dragging lines' edges should resize them
* (test_9985) changing lines' sizes should lead to sync state with server (unless disabled)
* (test_1990) after selecting rectangle from top left to bottom right with top left cell with value and pressing Ctlr+C and then setting pointer on other cell after beginnging to edit that cell it shouldn't have value already (it was broken once, but fixed by itself fsr)
* search bar should open on Ctlr+F and work as expected

TODO:
* after editing non-0.0 cell, selecting another cell and pressing Ctlr+Z pointer should go not to 0.0-cell, but as expected
* (test_9082) after copy and paste and pressing Enter or F2 immediately value shouldn't be empty

TODO: more tests.
*/
