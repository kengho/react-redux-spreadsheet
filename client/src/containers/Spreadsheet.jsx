import PropTypes from 'prop-types';
import React from 'react';
import uuid from 'uuid/v4';
// TODO: use https://github.com/callemall/material-ui.

import {
  getCellId,
  getColumnId,
  getRowId,
  initialState,
} from '../core';
import './Spreadsheet.css';
import ActionsRow from './../components/Rows/ActionsRow';
import AddressingRow from './../components/Rows/AddressingRow';
import DataRow from './../components/Rows/DataRow';
import Dialog from '../components/Dialog';
import fetchServer from './../lib/fetchServer';
import findKeyAction from '../lib/findKeyAction';
import getRootPath from './../lib/getRootPath';
import isScrolledIntoView from '../lib/isScrolledIntoView';
import shiftScrollbar from '../lib/shiftScrollbar';

const propTypes = {
  actions: PropTypes.object.isRequired,
  dialog: PropTypes.object.isRequired,
  requests: PropTypes.object.isRequired,
  rootPath: PropTypes.string.isRequired,
  table: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  undo: PropTypes.object.isRequired,
};

const defaultProps = {
};

class Spreadsheet extends React.Component {
  constructor(props) {
    super(props);

    this.windowKeyDownHandler = this.windowKeyDownHandler.bind(this);

    this.fictiveRows = [`r${uuid()}`, `r${uuid()}`];
    this.fictiveColumns = [`c${uuid()}`, `c${uuid()}`];
    this.prepareTable = (somePops) => {
      this.table = somePops.table.toJS();

      // Adds 2 fictive rows and columns for actions and addressing.
      // See render().
      this.table.data.rows = [...this.fictiveRows, ...this.table.data.rows];
      this.table.data.columns = [...this.fictiveColumns, ...this.table.data.columns];
    };
    this.prepareTable(props);

    this.css = {
      borderSpacing: '2px',
    };
  }

  componentDidMount() {
    // TODO: add removeEventListener on componentWillUnmount.
    // NOTE: don't use document.addEventListener here, it fires
    //   whenever stopImmediatePropagation is set in childs or not.
    //   Wrapping addEventListener in setTimeout helps,
    //   but it looks like ugly hack.
    // TODO: figure out why this happens.
    window.addEventListener('keydown', this.windowKeyDownHandler); // eslint-disable-line no-undef

    // Don't fetch data from server in tests.
    if (process.env.NODE_ENV === 'test') {
      // FIXME: causes undo-redo-related problems.
      //   Need to totally review initialState().
      // 
      // this.props.actions.setShortId('1');
      //
      // const initialJSONTable = JSON.stringify(initialState(4, 4).get('table').present);
      // this.props.actions.setTableFromJSON(initialJSONTable);

      return;
    }

    // Fetch data after initial render.
    // -2 because fictive rows.
    if (this.table.data.rows.length - 2 === 0) {
      const pathname = document.location.pathname;
      const shortId = pathname.slice(this.props.rootPath.length);
      fetchServer('GET', `show?short_id=${shortId}`)
        .then((json) => {
          if (json.errors) {
            // TODO: set Landing message somehow.
            const rootPath = getRootPath();
            window.location.replace(rootPath); // eslint-disable-line no-undef
          } else {
            this.props.actions.setShortId(shortId);
            this.props.actions.setTableFromJSON(json.data.table);
          }
        });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.prepareTable(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) { // eslint-disable-line no-unused-vars
    // TODO: handle double rerenders.
    return true;
  }

  windowKeyDownHandler(evt) {
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

          const pointer = this.table.session.pointer;
          let cellId = pointer.cellId;
          if (!cellId) {
            // Default pointer on [0, 0].
            // [2] is for fictive rows/columns.
            cellId = getCellId(this.table.data.rows[2], this.table.data.columns[2]);
          }
          this.props.actions.setPointer({ cellId, modifiers });
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

          const rows = this.table.data.rows;
          const columns = this.table.data.columns;

          // REVIEW: 'querySelector' is probably not React-way.
          //   I could define 'this.previousPointer = this.table.session.pointer'
          //   in componentWillReceiveProps() and use it's cellId prop in getElementById,
          //   but I don't see how it is better than current implementation
          //   (also, it depends on id DataCell's id prop).
          //   Should page visibility params be part of the state?

          // Save previous pointed Cell's on-page visibility.
          const pointedCellBefore = document.querySelector('.pointed'); // eslint-disable-line no-undef
          let isScrolledIntoViewBefore;
          if (pointedCellBefore) {
            isScrolledIntoViewBefore = isScrolledIntoView(pointedCellBefore);
          } else {
            // Default value.
            isScrolledIntoViewBefore = { x: true, y: true };
          }

          // Perform pointer movement.
          this.props.actions.movePointer(evt.key);

          // Figure out, should we move scrollbars to align with pointer movement.
          const pointedCellAfter = document.querySelector('.pointed'); // eslint-disable-line no-undef
          const isScrolledIntoViewAfter = isScrolledIntoView(pointedCellAfter);

          // -2 is because of fictive rows/columns.
          const pointedCellAfterPos = [
            rows.indexOf(getRowId(pointedCellAfter.id)) - 2,
            columns.indexOf(getColumnId(pointedCellAfter.id)) - 2,
          ];

          // TODO: in Chromium on 125 and 175% zoom correct value is 4.5 for some reason. Seems unfixable.
          if (
            (isScrolledIntoViewBefore.x && !isScrolledIntoViewAfter.x) ||
            (isScrolledIntoViewBefore.y && !isScrolledIntoViewAfter.y)
          ) {
            // slice() with -2 deletes 'px'.
            const borderSpacingNormalized = Number(this.css.borderSpacing.slice(0, -2));
            shiftScrollbar(evt.key, pointedCellAfter, pointedCellAfterPos, borderSpacingNormalized * 2);
          }
        },
      },
      {
        key: 'Escape',
        action: () => {
          this.props.actions.clearPointer();
          this.props.actions.clearClipboard();
        },
      },
      {
        keys: ['Delete', 'Backspace'],
        action: () => {
          const cells = this.table.data.cells;
          const pointer = this.table.session.pointer;
          const cell = cells[pointer.cellId];
          if (cell && cell.value) {
            // Prevents going back in history for Backspace.
            evt.preventDefault();

            this.props.actions.deleteProp(pointer.cellId, 'value');
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

          // TODO: handle many selected cells.
          const cells = this.table.data.cells;
          const pointer = this.table.session.pointer;
          clipboardCells[pointer.cellId] = cells[pointer.cellId];

          if (evt.which === 88) { // 'x'
            this.props.actions.deleteProp(pointer.cellId, 'value');
          }

          this.props.actions.setClipboard({
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

          const clipboard = this.table.session.clipboard;

          // TODO: handle many selected cells.
          const srcCellsIds = Object.keys(clipboard.cells);
          if (srcCellsIds.length !== 1) {
            return;
          }

          const srcCellId = srcCellsIds[0];
          const value = clipboard.cells[srcCellId] && clipboard.cells[srcCellId].value;
          if (value) {
            // TODO: copy all props.
            const pointer = this.table.session.pointer;
            this.props.actions.setProp(pointer.cellId, 'value', value);
          }

          switch (clipboard.operation) {
            case 'COPY': {
              break;
            }
            case 'CUT': {
              // TODO: cut all props.
              this.props.actions.deleteProp(srcCellId, 'value');
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
    // TODO: draw some kind of spinner if table is empty.
    // -2 because fictive rows.
    if (this.table.data.rows.length - 2 === 0) {
      return <div />;
    }

    // TODO: add optional header row without number.

    // Table map:
    //
    // TECCCC...A // actions row (fictive)
    // EENNNN...N // addressing row (fictive)
    // ANDDDD...D //
    // ANDDDD...D //
    // ..........
    // CADDDD...D //
    //
    // T - table actions
    // E - empty
    // A - line actions
    // N - line addressing
    // D - data cell

    const { actions, requests } = this.props;
    const dialog = this.props.dialog.toJS();
    const clipboard = this.table.session.clipboard;
    const columns = this.table.data.columns;
    const pointer = this.table.session.pointer;
    const rows = this.table.data.rows;
    const updateTriggers = this.table.updateTriggers;

    const outputRows = [];

    // ActionsRow.
    outputRows.push(
      <ActionsRow
        actions={actions}
        columns={columns}
        firstActionsCellIsOnly={columns.length - 2 === 1}
        hoverColumnId={this.table.session.hover && getColumnId(this.table.session.hover)}
        key={rows[0]}
        requests={requests.toJS()}
        requestsQueueSize={requests.toJS().queue.length}
        rowId={rows[0]}
      />
    );

    // AddressingRow.
    outputRows.push(
      <AddressingRow
        actions={actions}
        columns={columns}
        key={rows[1]}
        rowId={rows[1]}
      />
    );

    // The rest.
    const cells = this.table.data.cells;
    for (let rowIndex = 2; rowIndex < rows.length; rowIndex += 1) {
      const rowId = rows[rowIndex];

      // Uses in shouldComponentUpdate().
      let isPointerOnRow;
      if (pointer.cellId) {
        isPointerOnRow = (getRowId(pointer.cellId) === rowId);
      }
      let localPointerColumnId;
      let localPointerModifiers;
      if (isPointerOnRow) {
        localPointerColumnId = getColumnId(pointer.cellId);
        localPointerModifiers = { ...pointer.modifiers };
      }

      const isRowInClipboard = !!Object.keys(clipboard.cells).some((cellId) => {
        let match;
        if (getRowId(cellId) === rowId) {
          match = true;
        }

        return match;
      });

      outputRows.push(
        <DataRow
          actions={actions}
          cells={cells}
          clipboard={clipboard}
          columns={columns}
          firstActionsCellIsOnly={rows.length - 2 === 1}
          isPointerOnRow={isPointerOnRow}
          isRowInClipboard={isRowInClipboard}
          key={rowId}
          localPointerColumnId={localPointerColumnId}
          localPointerModifiers={localPointerModifiers}
          originalRowIndex={rowIndex - 2}
          pointer={pointer}
          rowId={rowId}
          rowUpdateTrigger={updateTriggers.data.rows[rowId]}
        />
      );
    }

    // TODO: show requests queue.
    // TODO: handle click ouside table.
    // TODO: scroll to top/bottom buttons.
    // TODO: store pointer coordinates in URL and scroll to pointer on load.
    return (
      <div>
        <div
          className="table"
          onMouseLeave={() => { actions.setHover(null); }}
          style={this.css}
        >
          {outputRows}
        </div>
        <Dialog
          actions={actions}
          variant={dialog.variant}
          visibility={dialog.visibility}
        />
      </div>
    );
  }
}

Spreadsheet.propTypes = propTypes;
Spreadsheet.defaultProps = defaultProps;

export default Spreadsheet;
