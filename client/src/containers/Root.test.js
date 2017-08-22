import React from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';

require('./../test_helper');

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Root />, div);
});

/*
TODO: automate.

Run in all browsers:
* clicking on cell should make it pointed and all other cells not pointed
* doubleclicking on non-editing cell should make it editing and all other cells not editing
* doubleclicking on editing cell should do nothing but default
* pressing movement key (arrow, pgdn, etc) while there is pointer should move pointer accordingly
* pressing movement key (arrow, pgdn, etc) while there are no pointer should move pointer accordingly
* pressing movement key (arrow, pgdn, etc) while there is pointer should add new rows/columns if necessary
* pressing on table menu button should show menu
* pressing on cell menu button should show menu
* pressing on cell menu button after adding row/column should show menu
* 'insert row above' button should insert row above
* 'insert row below' button should insert row below
* 'delete row' button should delete row
* 'insert column at left' button should insert column at left
* 'insert column at right' button should insert column at right
* 'delete column' button should delete column
* all those buttons should work properly after adding/removing rows/columns
* 'delete spreadsheet' button should show dialog and delete spreadsheet if user pressed 'yes'
* when there are only one row/column, delete row/column button shouldn't be present
* lines addressing should update after adding/removing rows/columns
* after showing menu first element should be active
* after showing menu arrow, Enter and Escape keys should work
* after dialog appearing arrow, Enter and Escape keys should work
* pressing Enter while there are pointer should make pointed cell editable and select all it's content
* pressing F2 while there are pointer should make pointed cell editable and move cursor to the end of cell's content
* pressing Delete while there are pointer should delete pointed cell's value
* pressing Backspace while there are pointer should work as Delete
* pressing Escape while there are pointer and clipboard should clear both
* pressing Ctrl+X or ctrl+c while there are pointer should mark cell as clipboard
* pressing Ctrl+V while there are pointer should copy/cut value from clipboard
* pressing Ctrl+V while there are pointer multiple times should cut multiple times even if clipboard cell is already empty
* pressing Ctrl+V shouldn't throw errors if the source cell have no value
* pressing Enter/Shift+Enter while editing should save cell's value and move pointer down/up (unless border)
* pressing Tab/Shift+Tab while editing should save cell's value and move pointer right/left (unless border)
* pressing Ctrl+Enter while editing should add new line after cursor
* pressing Escape while editing should make cell uneditable and leave cell's value as it was before
* clicking on other cell while there are editable cell should save content of editing cell and move pointer
* typing text to cell should expand it to some point horizontally and to infinity vertically. never showing scrollbar
* when data is changed table menu icon should change, and it should be visible even is not hover until data is saved and it changes back
* moving pointer should scroll page if necessary (even after 100 key presses)
* when hover on cell, ones and only appropriate row/column menus should visible
* Ctrl+Z/Ctrl+Y should undo/redo last changing data action, leaving last edited cell pointed, but uneditable
* expanding table with empty cells shouldn't affect history and/or server sync
* if backend is't responding to requests, error icon should appear where table actions icon was, and it should be always visible and have tooltip
*/
