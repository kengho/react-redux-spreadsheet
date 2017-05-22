import dialogPolyfill from 'dialog-polyfill';
import PropTypes from 'prop-types';
import React from 'react';
import uuid from 'uuid/v4';

import {
  cellId,
  columnId,
  rowId,
} from '../core';
import activateDialogButton from '../lib/activateDialogButton';
import DataCell from './Cell/DataCell';
import Dialog from '../components/Dialog';
import isScrolledIntoView from '../lib/isScrolledIntoView';
import LineActionsCell from './Cell/LineActionsCell';
import LineAddressingCell from './Cell/LineAddressingCell';
import scrollbarShift from '../lib/scrollbarShift';
import TableActionsCell from './Cell/TableActionsCell';

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

    this.cellClickHandler = this.cellClickHandler.bind(this);
    this.cellDoubleClickHandler = this.cellDoubleClickHandler.bind(this);
    this.cellKeyDownHandler = this.cellKeyDownHandler.bind(this);
    this.cellMouseOverHandler = this.cellMouseOverHandler.bind(this);
    this.documentKeyDownHandler = this.documentKeyDownHandler.bind(this);

    this.fictiveRows = [`r${uuid()}`, `r${uuid()}`];
    this.fictiveColumns = [`c${uuid()}`, `c${uuid()}`];

    this.prepareTable = (somePops) => {
      this.table = somePops.table.toJS();

      // Add 2 fictive rows and columns for actions and addressing.
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

  // REVIEW: shouldn't all Cell-related handlers be defined in Cell component?
  cellMouseOverHandler(e, currentCellId) {
    this.props.actions.setHover(currentCellId);
  }

  cellClickHandler(e, currentCellId) {
    // Save currently editing Cell's data if needed.
    // REVIEW: this is probably not React-way.
    //   But pointer shouldn't contain nor React element or DOM ref.
    //   http://web.archive.org/web/20150419023006/http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html
    //   (What Shouldn’t Go in State?)
    //   How to get currently editing Cell's data right?
    const editingTextarea = document.querySelector('.editing textarea'); // eslint-disable-line no-undef
    if (editingTextarea) {
      // const pointerRowNumber = rowNumber(this.table.pointer.pos);
      // const pointerColumnNumber = columnNumber(this.table.pointer.pos);
      const cell = this.table.data.cells[this.table.session.pointer.cellId];
      const previousValue = cell ? cell.value : '';
      const nextValue = editingTextarea.value;

      if (nextValue !== previousValue) {
        this.props.actions.setProp(this.table.session.pointer.cellId, 'value', nextValue);
      }
    }

    this.props.actions.setPointer({ cellId: currentCellId, modifiers: {} });
  }

  cellDoubleClickHandler(e, currentCellId) {
    this.props.actions.setPointer({ cellId: currentCellId, modifiers: { edit: true } });
  }

  cellKeyDownHandler(e, args) {
    // REVIEW: is it OK to create arrow functions which uses outer context vars?
    const movePointerAndSaveValueIfNeeded = (movePointerKey) => {
      // Prevents pressing key immediately after changing pointer.
      e.preventDefault();

      // REVIEW: double render and sending request here.
      this.props.actions.movePointer(movePointerKey);
      if (args.nextValue !== args.previousValue) {
        this.props.actions.setProp(args.currentCellId, 'value', args.nextValue);
      }
    };

    // No switch/case because of keys modifiers.
    // TODO: create and apply some universal keyHandler everywhere.
    //   Or maybe find one in npm. Or maybe create one and push to npm.
    const keyActions = [
      {
        key: 'Enter',
        handler: () => movePointerAndSaveValueIfNeeded('ArrowDown'),
      },
      {
        key: 'Enter',
        shiftKey: true,
        handler: () => movePointerAndSaveValueIfNeeded('ArrowUp'),
      },
      {
        key: 'Enter',
        ctrlKey: true,
        handler: () => {
          // HACK: adds new line to textarea and forces it to update it's size.

          // Some code from:
          // http://stackoverflow.com/a/11077016/6376451
          const textarea = e.target;
          const textToInsert = '\n';
          if (textarea.selectionStart || textarea.selectionStart === 0) {
            const startPos = textarea.selectionStart;
            const endPos = textarea.selectionEnd;
            const textBeforeCursor = textarea.value.substring(0, startPos);
            const textAfterCursor = textarea.value.substring(endPos, textarea.value.length);
            textarea.value = `${textBeforeCursor}${textToInsert}${textAfterCursor}`;

            // Update cursor.
            textarea.selectionStart = startPos + textToInsert.length;
            textarea.selectionEnd = endPos + textToInsert.length;
          } else {
            textarea.value += textToInsert;
          }

          args.textareaOnChange();
        },
      },
      {
        key: 'Tab',
        handler: () => movePointerAndSaveValueIfNeeded('ArrowRight'),
      },
      {
        key: 'Tab',
        shiftKey: true,
        handler: () => {
          movePointerAndSaveValueIfNeeded('ArrowLeft');
        },
      },
      {
        key: 'Escape',
        handler: () => {
          const currentPointer = this.table.session.pointer;
          delete currentPointer.modifiers.edit;
          this.props.actions.setPointer(currentPointer);
        },
      },
    ];

    const action = keyActions.find((item) => {
      const { key, shiftKey, ctrlKey, altKey } = e;
      return (
        key === (item.key || false) &&
        shiftKey === (item.shiftKey || false) &&
        ctrlKey === (item.ctrlKey || false) &&
        altKey === (item.altKey || false)
      );
    });

    if (action) {
      action.handler();
    }
  }

  documentKeyDownHandler(e) {
    // Custom Cell keydown handler.
    if (this.table.session.pointer.modifiers.edit === true) {
      return;
    }

    // Custom Dialog keydown handler.
    const dialog = document.querySelector('dialog'); // eslint-disable-line no-undef
    if (dialog.getAttribute('open') !== null) {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          activateDialogButton(dialog, e.key);
          break;
        default:
      }

      return;
    }

    // Custom Munu keydown handler.
    // TODO: ArrowLeft and ArrowRight to jump to adjacent menu.
    const currentMenu = document.querySelector('.mdl-menu__container.is-visible'); // eslint-disable-line no-undef
    if (currentMenu) {
      return;
    }

    // TODO: handle Ctrl+C, Ctrl+V, etc.
    //   This is tmp dummy.
    if (e.altKey || e.ctrlKey || e.shiftKey) {
      return;
    }

    // Here actual Cell-related keydown handler starts.
    const pointer = { ...this.table.session.pointer };

    // Regular key.
    if (e.key.length === 1) {
      // 'input' renders after 'keydown', and symbols appears after 'keyup',
      // thus after `setState` input's value is already 'e.key'.

      // Default pointer on [0, 0].
      if (!pointer.cellId) {
        // 2 is for fictive rows/columns.
        pointer.cellId = cellId(this.table.data.rows[2], this.table.data.columns[2]);
      }
      pointer.modifiers = { edit: true, select_on_focus: true };
      this.props.actions.setPointer(pointer);

    // Special key.
    } else {
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'PageUp':
        case 'PageDown':
        case 'Home':
        case 'End': {
          // Prevents native scrollbar movement.
          e.preventDefault();

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
          this.props.actions.movePointer(e.key);

          // Figure out, should we move scrollbars to align with pointer movement.
          const pointedCellAfter = document.querySelector('.pointed'); // eslint-disable-line no-undef
          const isScrolledIntoViewAfter = isScrolledIntoView(pointedCellAfter);

          // REVIEW: '4' (extra) is .table's border-spacing x2.
          //   Figure out how to sync those values.
          if (
            (isScrolledIntoViewBefore.x && !isScrolledIntoViewAfter.x) ||
            (isScrolledIntoViewBefore.y && !isScrolledIntoViewAfter.y)
          ) {
            scrollbarShift(e.key, pointedCellAfter, 4);
          }
          break;
        }

        case 'Enter': {
          // Prevents immediately pressing Enter and deletes selected text after focus.
          e.preventDefault();

          // Default pointer on [0, 0].
          if (!pointer.cellId) {
            // 2 is for fictive rows/columns.
            pointer.cellId = cellId(this.table.data.rows[2], this.table.data.columns[2]);
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
          }
          break;
        }

        case 'Tab': {
          // Prevents error when user press Tab 2 times on document.
          e.preventDefault();
          break;
        }

        default:
      }
    }
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

    const isHover = (currentCellId, hover) => {
      if (!hover) {
        return false;
      }

      // If hover on first fictive row/column.
      if (
        this.fictiveRows.indexOf(rowId(hover)) === 0 ||
        this.fictiveColumns.indexOf(columnId(hover)) === 0
      ) {
        // Hover only one cell.
        return (
          columnId(hover) === columnId(currentCellId) &&
          rowId(hover) === rowId(currentCellId)
        );
      }

      // Else hover appropriate fictive row/column cell.
      if (
        rowId(hover) === rowId(currentCellId) ||
        columnId(hover) === columnId(currentCellId)
      ) {
        return true;
      }

      return false;
    };

    const dataCellProps = (currentCellId, cell, pointer) => {
      const effectiveCell = cell || {};

      const value = effectiveCell.value;
      const isPointed = currentCellId === pointer.cellId;
      const isEditing = isPointed && pointer.modifiers.edit === true;
      const isSelectingOnFocus = isPointed && pointer.modifiers.select_on_focus === true;

      return { value, isPointed, isEditing, isSelectingOnFocus };
    };

    const rows = this.table.data.rows;
    const columns = this.table.data.columns;

    // TODO [PERF]: rendering by rows may improve performance.
    const outputRows = [];
    rows.forEach((currentRowId, rowIndex) => {
      // There are 2 more fictive rows and columns for actions and addressing.
      // See constructor()
      const effectiveRowIndex = rowIndex - 2;
      const outputRow = [];
      columns.forEach((currentColumnId, columnIndex) => {
        const currentCellId = cellId(currentRowId, currentColumnId);
        const effectiveColumnIndex = columnIndex - 2;

        const pos = [effectiveRowIndex, effectiveColumnIndex];
        const commonProps = {
          id: currentCellId,
          key: currentCellId,
          onMouseOverHandler: (evt) => this.cellMouseOverHandler(evt, currentCellId),
        };

        if (effectiveRowIndex === -2 && effectiveColumnIndex === -2) {
          outputRow.push(
            <TableActionsCell
              {...commonProps}
              actions={this.props.actions}
              requests={this.props.requests}
            />
          );
        } else if (effectiveRowIndex < 0 && effectiveColumnIndex < 0) {
          outputRow.push(
            <div
              className="td empty"
              id={currentCellId}
              key={currentCellId}
            />
          );
        } else if (
          effectiveRowIndex === -2 ||
          effectiveColumnIndex === -2
        ) {
          // -2 is because of fictive columns.
          let isOnly;
          if (effectiveRowIndex === -2) {
            isOnly = columns.length - 2 === 1;
          } else if (effectiveColumnIndex === -2) {
            isOnly = rows.length - 2 === 1;
          }

          const actionsProps = {
            actions: this.props.actions,
            isHover: isHover(currentCellId, this.table.session.hover),
            isOnly,
            pos,
          };

          outputRow.push(
            <LineActionsCell
              {...actionsProps}
              {...commonProps}
            />
          );
        } else if (
          effectiveRowIndex === -1 ||
          effectiveColumnIndex === -1
        ) {
          outputRow.push(
            <LineAddressingCell
              {...commonProps}
              pos={pos}
            />
          );
        } else {
          const cell = this.table.data.cells[currentCellId];
          const currentDataCellProps = dataCellProps(
            currentCellId,
            cell,
            this.table.session.pointer
          );
          outputRow.push(
            <DataCell
              {...commonProps}
              {...currentDataCellProps}
              onClickHandler={(evt) => this.cellClickHandler(evt, currentCellId)}
              onDoubleClickHandler={(evt) => this.cellDoubleClickHandler(evt, currentCellId)}
              onKeyDownHandler={(evt, args) => this.cellKeyDownHandler(
                evt,
                { ...args, currentCellId }
              )}
            />
          );
        }
      });

      outputRows.push(
        <div className="tr" key={currentRowId}>
          {outputRow}
        </div>
      );
    });

    // TODO: show requests queue.
    // TODO: handle click ouside table.
    return (
      <div>
        <div
          className="table"
          onMouseLeave={() => { this.props.actions.setHover(null); }}
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
