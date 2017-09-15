import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React from 'react';

import {
  getCellId,
  getColumnId,
  getRowId,
} from '../core';
import './Spreadsheet.css';
import * as LandingActions from '../actions/landing'; // setMessages()
import * as MetaActions from '../actions/meta';
import * as RequestsActions from '../actions/requests';
import * as TableActions from '../actions/table';
import * as UiActions from '../actions/ui';
import * as UndoRedoActions from '../actions/undoRedo';
import cssToNumber from '../lib/cssToNumber';
import fetchServer from '../lib/fetchServer';
import findKeyAction from '../lib/findKeyAction';
import getRootPath from '../lib/getRootPath';
import isScrolledIntoView from '../lib/isScrolledIntoView';
import Row from '../components/Row';
import shiftScrollbar from '../lib/shiftScrollbar';
import TableMenu from '../components/TableMenu';

const mapStateToProps = (state) => {
  // FIXME: in tests table wraps into undoable twice
  //   because of environment condition in initialState().
  //   Cannot test Root render with non-empty data because if this.
  let table;
  if (process.env.NODE_ENV === 'test') {
    table = state.get('table').present.present;
  } else {
    table = state.get('table').present;
  }

  return {
    requests: state.get('requests'),
    table,
    ui: state.get('ui'),
    undo: {
      canRedo: state.get('table').future.length > 0,
      canUndo: state.get('table').past.length > 1, // omitting TABLE/SET_TABLE_FROM_JSON
    },
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...LandingActions,
      ...MetaActions,
      ...RequestsActions,
      ...TableActions,
      ...UiActions,
      ...UndoRedoActions,
    }, dispatch),
  },
});

class Spreadsheet extends React.Component {
  constructor(props) {
    super(props);

    this.documentKeyDownHandler = this.documentKeyDownHandler.bind(this);
    this.documentClickHandler = this.documentClickHandler.bind(this);

    this.style = {
      borderSpacing: '2px',
    };
  }

  componentDidMount() {
    window.addEventListener('keydown', this.documentKeyDownHandler); // eslint-disable-line no-undef
    window.addEventListener('click', this.documentClickHandler); // eslint-disable-line no-undef

    // Don't fetch data from server in tests.
    if (process.env.NODE_ENV === 'test') {
      // FIXME: causes undo-redo-related problems.
      //   Need to totally review initialState().
      //
      // this.props.actions.setShortId('1');
      //
      // const initialJSONTable = JSON.stringify(initialState(4, 4).get('table').present);
      // this.props.actions.tableSetFromJSON(initialJSONTable);

      return;
    }

    const table = this.props.table.toJS();

    // Fetch data after initial render.
    if (table.data.rows.length === 0) {
      const shortId = this.props.match.params.shortId;
      fetchServer('GET', `show?short_id=${shortId}`)
        .then((json) => {
          if (json.errors) {
            const errors = json.errors.map((error) => error.detail);

            this.props.actions.setMessages(errors);
            this.props.history.push(getRootPath());
          } else {
            // store's shortId used in handleRequestsChanges().
            this.props.actions.setShortId(shortId);
            this.props.actions.tableSetFromJSON(json.data.table);
          }
        });
    }
  }

  shouldComponentUpdate(nextProps, nextState) { // eslint-disable-line no-unused-vars
    // TODO: handle double rerenders.
    return true;
  }

  componentWillUnmount() {
    // TODO: window or document?
    window.removeEventListener('keydown', this.documentKeyDownHandler); // eslint-disable-line no-undef
    window.removeEventListener('click', this.documentClickHandler); // eslint-disable-line no-undef
  }

  documentClickHandler(evt) {
    this.props.actions.closeAllMenus();

    // FIXME: this action is messing with DataCell's click.
    // this.props.actions.clearPointer();
  }

  documentKeyDownHandler(evt) {
    const table = this.props.table.toJS();

    const action = findKeyAction(evt, [
      {
        condition: () => (evt.key.length === 1 || evt.key === 'Enter' || evt.key === 'F2'),
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
        action: () => {
          if (evt.key === 'Enter') {
            // Prevents immediately pressing Enter after focus (deletes selected text).
            evt.preventDefault();
          }

          let modifiers = { edit: true };
          if (evt.key !== 'F2') {
            modifiers.selectOnFocus = true;
          }

          // 'input' renders after 'keydown', and symbols appears after 'keyup',
          // thus after `setState` input's value is already 'evt.key'.

          const pointer = table.session.pointer;
          let cellId = pointer.cellId;
          if (!cellId) {
            // Default pointer on [0, 0].
            cellId = getCellId(
              table.data.rows[0].id,
              table.data.columns[0].id
            );
          }

          this.props.actions.tableSetPointer({ cellId, modifiers });
        },
      },
      {
        keys: [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'PageUp',
          'PageDown',
          'Home',
          'End',
        ],
        action: () => {
          // Prevents native scrollbar movement.
          evt.preventDefault();

          const rows = table.data.rows;
          const columns = table.data.columns;

          // REVIEW: 'querySelector' is probably not React-way.
          //   I could define 'this.previousPointer = this.table.session.pointer'
          //   in componentWillReceiveProps() and use it's cellId prop in getElementById,
          //   but I don't see how it is better than current implementation
          //   (also, it depends on id DataCell's id prop).
          //   Should page visibility params be part of the state?

          // Save previous pointed Cell's on-page visibility.
          const pointedCellBefore = document.querySelector('.pointed'); // eslint-disable-line no-undef
          if (!pointedCellBefore) {
            return;
          }

          let isScrolledIntoViewBefore;
          if (pointedCellBefore) {
            isScrolledIntoViewBefore = isScrolledIntoView(pointedCellBefore);
          } else {
            // Default value.
            isScrolledIntoViewBefore = { x: true, y: true };
          }

          // Perform pointer movement.
          this.props.actions.tableMovePointer(evt.key);

          // TODO: move this stuff to middleware, leave only tableMovePointer() here.
          // Figure out, should we move scrollbars to align with pointer movement.
          const pointedCellAfter = document.querySelector('.pointed'); // eslint-disable-line no-undef
          if (!pointedCellAfter) {
            return;
          }

          const isScrolledIntoViewAfter = isScrolledIntoView(pointedCellAfter);

          const pointedCellAfterPos = [
            rows.indexOf(getRowId(pointedCellAfter.id)),
            columns.indexOf(getColumnId(pointedCellAfter.id)),
          ];

          // TODO: in Chromium on 125 and 175% zoom correct value is 4.5 for some reason. Seems unfixable.
          if (
            (isScrolledIntoViewBefore.x && !isScrolledIntoViewAfter.x) ||
            (isScrolledIntoViewBefore.y && !isScrolledIntoViewAfter.y)
          ) {
            const borderSpacingNumber = cssToNumber(this.style.borderSpacing);
            shiftScrollbar(evt.key, pointedCellAfter, pointedCellAfterPos, borderSpacingNumber * 2);
          }
        },
      },
      {
        key: 'Escape',
        action: () => {
          this.props.actions.tableSetPointer({ cellId: null, modifiers: {} });
          this.props.actions.tableSetClipboard({ cells: {}, operation: null});
        },
      },
      {
        keys: ['Delete', 'Backspace'],
        action: () => {
          const cells = table.data.cells;
          const pointer = table.session.pointer;
          const cell = cells[pointer.cellId];
          if (cell && cell.value) {
            // Prevents going back in history for Backspace.
            evt.preventDefault();

            this.props.actions.tableDeleteProp(pointer.cellId, 'value');
          }
        },
      },
      {
        whichs: [67, 88], // 'Ctrl+C', 'Ctrl+X'
        ctrlKey: true,
        action: () => {
          // Prevents default action.
          evt.preventDefault();

          let operation;
          if (evt.which === 67) { // 'c'
            operation = 'COPY';
          } else if (evt.which === 88) { // 'x'
            operation = 'CUT';
          }

          const clipboardCells = {};

          // TODO: handle many selected cells (also see store/middleware/handleClipboardChanges.js).
          const cells = table.data.cells;
          const pointer = table.session.pointer;
          clipboardCells[pointer.cellId] = cells[pointer.cellId];

          if (evt.which === 88) { // 'x'
            this.props.actions.tableDeleteProp(pointer.cellId, 'value');
          }

          this.props.actions.tableSetClipboard({
            cells: clipboardCells,
            operation,
          });
        },
      },
      {
        which: 86, // 'Ctrl+V'
        ctrlKey: true,
        action: () => {
          // Prevents native pasting into cell.
          evt.preventDefault();

          const clipboard = table.session.clipboard;

          // TODO: handle many selected cells.
          const srcCellsIds = Object.keys(clipboard.cells);
          if (srcCellsIds.length !== 1) {
            return;
          }

          const srcCellId = srcCellsIds[0];
          const value = clipboard.cells[srcCellId] && clipboard.cells[srcCellId].value;
          if (value) {
            // TODO: copy all props.
            const pointer = table.session.pointer;
            this.props.actions.tableSetProp(pointer.cellId, 'value', value);
          }

          switch (clipboard.operation) {
            case 'COPY': {
              break;
            }
            case 'CUT': {
              // TODO: cut all props.
              this.props.actions.tableDeleteProp(srcCellId, 'value');
              break;
            }
            default:
          }
        },
      },
      {
        which: 90, // 'Ctrl+Z'
        ctrlKey: true,
        action: () => {
          if (this.props.undo.canUndo) {
            this.props.actions.undo();
          }
        },
      },
      {
        which: 89, // 'Ctrl+Y'
        ctrlKey: true,
        action: () => {
          if (this.props.undo.canRedo) {
            this.props.actions.redo();
          }
        },
      },
      // For dev.
      // {
      //   which: 76, // 'Ctrl+Shift+L'
      //   ctrlKey: true,
      //   shiftKey: true,
      //   action: () => {
      //     evt.preventDefault();
      //     this.props.actions.setDialogVisibility(true);
      //   },
      // },
    ]);

    action();
  }

  render() {
    const table = this.props.table.toJS();

    // TODO: draw some kind of spinner if table is empty.
    if (table.data.rows.length === 0) {
      return <div />;
    }

    // FIXME: this is a mess.
    const { actions, requests, ui } = this.props;
    const cells = table.data.cells;
    const clipboard = table.session.clipboard;
    const columns = table.data.columns;
    const menu = ui.get('menu').toJS();
    const pointer = table.session.pointer;
    const rows = table.data.rows;
    const updateTriggers = table.updateTriggers;

    const outputRows = [];
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const rowId = rows[rowIndex].id;

      // TODO: reconcider props.
      outputRows.push(
        <Row
          actions={actions}
          cells={cells}
          clipboard={clipboard}
          columns={columns}
          hoverColumnId={table.session.hover && rowIndex === 0 && getColumnId(table.session.hover)}
          key={rowId}
          menu={menu}
          pointer={pointer}
          rowId={rowId}
          rowIndex={rowIndex}
          rows={rows}
          rowUpdateTrigger={updateTriggers.data.rows[rowId]}
        />
      );
    }

    // TODO: add optional header row without number.
    // TODO: show requests queue.
    // TODO: scroll to top/bottom buttons.
    // TODO: store pointer coordinates in URL and scroll to pointer on load.
    // TODO: create menu id getter.
    // TODO: add crop option to table menu.

    return (
      <div>
        <div
          className="table"
          onMouseLeave={() => { actions.tableSetHover(null); }}
          style={this.style}
        >
          <TableMenu
            actions={actions}
            data={table.data}
            firstCellId={getCellId(rows[0].id, columns[0].id)}
            menuVisibility={menu["table"]}
            requests={requests.toJS()}
            rows={rows}
            shortId={this.props.match.params.shortId}
          />
          {outputRows}
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Spreadsheet);
