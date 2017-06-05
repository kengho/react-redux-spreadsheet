import PropTypes from 'prop-types';
import React from 'react';
import uuid from 'uuid/v4';

import {
  getCellId,
  getColumnId,
  getRowId,
} from '../core';
import ActionsRow from './Rows/ActionsRow';
import AddressingRow from './Rows/AddressingRow';
import DataRow from './Rows/DataRow';
import Dialog from '../components/Dialog';
import findKeyAction from '../lib/findKeyAction';
import isScrolledIntoView from '../lib/isScrolledIntoView';
import scrollbarShift from '../lib/scrollbarShift';

const propTypes = {
  actions: PropTypes.object.isRequired,
  dialog: PropTypes.object.isRequired,
  requests: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  undo: PropTypes.object.isRequired,
};

const defaultProps = {
};

class Spreadsheet extends React.Component {
  constructor(props) {
    super(props);

    this.documentKeyDownHandler = this.documentKeyDownHandler.bind(this);

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
  }

  componentDidMount() {
    document.addEventListener('keydown', this.documentKeyDownHandler); // eslint-disable-line no-undef
  }

  componentWillReceiveProps(nextProps) {
    this.prepareTable(nextProps);
  }

  shouldComponentUpdate(nextProps, nextState) { // eslint-disable-line no-unused-vars
    // TODO: handle double rerenders.
    return true;
  }

  documentKeyDownHandler(evt) {
    const pointer = { ...this.table.session.pointer };
    const clipboard = this.table.session.clipboard;
    const cells = this.table.data.cells;

    const action = findKeyAction(evt, [
      {
        condition: () => evt.key.length === 1,
        altKey: false,
        ctrlKey: false,
        shiftKey: false,
        action: () => {
          // 'input' renders after 'keydown', and symbols appears after 'keyup',
          // thus after `setState` input's value is already 'evt.key'.

          // Default pointer on [0, 0].
          if (!pointer.cellId) {
            // 2 is for fictive rows/columns.
            pointer.cellId = getCellId(this.table.data.rows[2], this.table.data.columns[2]);
          }
          pointer.modifiers = { edit: true, select_on_focus: true };
          this.props.actions.setPointer(pointer);
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

          // REVIEW: 'querySelector' is probably not React-way.
          // Save previous pointed Cell's on-page visibility.
          // TODO: scroll to the very left when archiving it from right, etc.
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

          // REVIEW: '4' (extra) is .table's border-spacing x2.
          //   Figure out how to sync those values.
          // TODO: in Chromium on 125 and 175% zoom correct value is 4.5 for some reason. Seems unfixable.
          if (
            (isScrolledIntoViewBefore.x && !isScrolledIntoViewAfter.x) ||
            (isScrolledIntoViewBefore.y && !isScrolledIntoViewAfter.y)
          ) {
            scrollbarShift(evt.key, pointedCellAfter, 4);
          }
        },
      },
      {
        key: 'Enter',
        action: () => {
          // Prevents immediately pressing Enter and deletes selected text after focus.
          evt.preventDefault();

          // Default pointer on [0, 0].
          if (!pointer.cellId) {
            // 2 is for fictive rows/columns.
            pointer.cellId = getCellId(this.table.data.rows[2], this.table.data.columns[2]);
          }
          pointer.modifiers = { edit: true, select_on_focus: true };
          this.props.actions.setPointer(pointer);
        },
      },
      {
        key: 'F2',
        action: () => {
          pointer.modifiers = { edit: true };
          this.props.actions.setPointer(pointer);
        },
      },
      {
        key: 'Escape',
        action: () => {
          pointer.cellId = null;
          pointer.modifiers = {};
          this.props.actions.setPointer(pointer);
          this.props.actions.clearClipboard();
        },
      },
      {
        keys: ['Delete', 'Backspace'],
        action: () => {
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
          // REVIEW: shouldn't Ctrl+X cut cell immediately?
          clipboardCells[pointer.cellId] = cells[pointer.cellId];

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

          // TODO: handle many selected cells.
          const srcCellsIds = Object.keys(clipboard.cells);
          if (srcCellsIds.length !== 1) {
            return;
          }

          const srcCellId = srcCellsIds[0];
          const value = clipboard.cells[srcCellId] && clipboard.cells[srcCellId].value;
          if (value) {
            // TODO: copy all props.
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
    ]);

    action();
  }

  render() {
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
    return (
      <div>
        <div
          className="table"
          onMouseLeave={() => { actions.setHover(null); }}
        >
          {outputRows}
        </div>
        <Dialog
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
