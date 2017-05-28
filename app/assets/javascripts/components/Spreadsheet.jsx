import dialogPolyfill from 'dialog-polyfill';
import PropTypes from 'prop-types';
import React from 'react';
import uuid from 'uuid/v4';

import {
  getCellId,
  getColumnId,
  getRowId,
} from '../core';
import Dialog from '../components/Dialog';
import isScrolledIntoView from '../lib/isScrolledIntoView';
import scrollbarShift from '../lib/scrollbarShift';
import ActionsRow from './Rows/ActionsRow';
import AddressingRow from './Rows/AddressingRow';
import DataRow from './Rows/DataRow';

const propTypes = {
  actions: PropTypes.object.isRequired,
  requests: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
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
    const dialog = document.querySelector('dialog'); // eslint-disable-line no-undef
    if (!dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }

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
    // TODO: handle Ctrl+C, Ctrl+V, etc.
    //   This is tmp dummy.
    if (evt.altKey || evt.ctrlKey || evt.shiftKey) {
      return;
    }

    const pointer = { ...this.table.session.pointer };

    // Regular key.
    if (evt.key.length === 1) {
      // 'input' renders after 'keydown', and symbols appears after 'keyup',
      // thus after `setState` input's value is already 'evt.key'.

      // Default pointer on [0, 0].
      if (!pointer.cellId) {
        // 2 is for fictive rows/columns.
        pointer.cellId = getCellId(this.table.data.rows[2], this.table.data.columns[2]);
      }
      pointer.modifiers = { edit: true, select_on_focus: true };
      this.props.actions.setPointer(pointer);

    // Special key.
    } else {
      switch (evt.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'PageUp':
        case 'PageDown':
        case 'Home':
        case 'End': {
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
          if (
            (isScrolledIntoViewBefore.x && !isScrolledIntoViewAfter.x) ||
            (isScrolledIntoViewBefore.y && !isScrolledIntoViewAfter.y)
          ) {
            scrollbarShift(evt.key, pointedCellAfter, 4);
          }
          break;
        }

        case 'Enter': {
          // Prevents immediately pressing Enter and deletes selected text after focus.
          evt.preventDefault();

          // Default pointer on [0, 0].
          if (!pointer.cellId) {
            // 2 is for fictive rows/columns.
            pointer.cellId = getCellId(this.table.data.rows[2], this.table.data.columns[2]);
          }
          pointer.modifiers = { edit: true, select_on_focus: true };
          this.props.actions.setPointer(pointer);
          break;
        }

        case 'F2': {
          pointer.modifiers = { edit: true };
          this.props.actions.setPointer(pointer);
          break;
        }

        case 'Escape': {
          pointer.cellId = null;
          pointer.modifiers = {};
          this.props.actions.setPointer(pointer);
          break;
        }

        case 'Delete': {
          const cell = this.table.data.cells[pointer.cellId];
          if (cell && cell.value) {
            this.props.actions.deleteProp(pointer.cellId, 'value');

            // toggleDeleteProp uses in DataRow's shouldComponentUpdate().
            if (pointer.modifiers.toggleDeleteProp) {
              delete pointer.modifiers.toggleDeleteProp;
            } else {
              pointer.modifiers.toggleDeleteProp = true;
            }
            this.props.actions.setPointer(pointer);
          }
          break;
        }

        case 'Tab': {
          // Prevents error when user press Tab 2 times on document.
          evt.preventDefault();
          break;
        }

        default:
      }
    }
  }

  render() {
    // TODO: manual or automatic tests.

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
    const pointer = this.table.session.pointer;
    const rows = this.table.data.rows;
    const columns = this.table.data.columns;

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

      outputRows.push(
        <DataRow
          actions={actions}
          cells={cells}
          columns={columns}
          firstActionsCellIsOnly={rows.length - 2 === 1}
          isPointerOnRow={isPointerOnRow}
          key={rowId}
          localPointerColumnId={localPointerColumnId}
          localPointerModifiers={localPointerModifiers}
          originalRowIndex={rowIndex - 2}
          pointer={pointer}
          rowId={rowId}
        />
      );
    }

    // TODO: show requests queue.
    // TODO: handle click ouside table.
    return (
      <div>
        <div
          className="table"
          onMouseLeave={() => { actions.setHover(null); }}
        >
          {outputRows}
        </div>
        <div className="dialog">
          <Dialog />
        </div>
      </div>
    );
  }
}

Spreadsheet.propTypes = propTypes;
Spreadsheet.defaultProps = defaultProps;

export default Spreadsheet;
