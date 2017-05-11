import React from 'react';
import PropTypes from 'prop-types';
import dialogPolyfill from 'dialog-polyfill';

import Dialog from '../components/Dialog';
import LineAddressingCell from './Cell/LineAddressingCell';
import TableActionsCell from './Cell/TableActionsCell';
import LineActionsCell from './Cell/LineActionsCell';
import DataCell from './Cell/DataCell';
import { rowNumber, columnNumber } from '../core';
import scrollbarShift from '../lib/scrollbarShift';
import isScrolledIntoView from '../lib/isScrolledIntoView';

const propTypes = {
  actions: PropTypes.object.isRequired,
  requests: PropTypes.object.isRequired,
  table: PropTypes.object.isRequired,
};

const defaultProps = {
};

class Spreadsheet extends React.Component {
  constructor(props) {
    super(props);

    this.dataCellProps = (pos, pointer) => {
      const currentRowNumber = rowNumber(pos);
      const currentColumnNumber = columnNumber(pos);
      const data = this.table.data[currentRowNumber][currentColumnNumber];
      const value = data.value;

      // TODO: improve.
      const isPointed = (
        pos.length > 0 &&
        JSON.stringify(pos) === JSON.stringify(pointer.pos)
      );
      const isEditing = isPointed && pointer.modifiers.indexOf('EDIT') !== -1;
      const isSelectingOnFocus = isPointed && pointer.modifiers.indexOf('SELECT_ON_FOCUS') !== -1;

      return { value, isPointed, isEditing, isSelectingOnFocus };
    };

    this.isHover = (pos, hover) => {
      const currentRowNumber = rowNumber(pos);
      const currentColumnNumber = columnNumber(pos);
      const currentHoverRowNumber = rowNumber(hover);
      const currentHoverColumnNumber = columnNumber(hover);

      if (currentRowNumber === -2) {
        return (currentHoverColumnNumber === currentColumnNumber);
      }

      if (currentColumnNumber === -2) {
        return (currentHoverRowNumber === currentRowNumber);
      }

      return false;
    };

    this.cellMouseOverHandler = this.cellMouseOverHandler.bind(this);
    this.cellClickHandler = this.cellClickHandler.bind(this);
    this.cellDoubleClickHandler = this.cellDoubleClickHandler.bind(this);
    this.cellKeyDownHandler = this.cellKeyDownHandler.bind(this);
    this.documentKeyDownHandler = this.documentKeyDownHandler.bind(this);
    this.table = props.table.toJS();
  }

  componentDidMount() {
    const dialog = document.querySelector('dialog'); // eslint-disable-line no-undef
    if (!dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }

    document.addEventListener('keydown', this.documentKeyDownHandler); // eslint-disable-line no-undef
  }

  componentWillReceiveProps(nextProps) {
    this.table = nextProps.table.toJS();
  }

  shouldComponentUpdate(nextProps, nextState) { // eslint-disable-line no-unused-vars
    // TODO: handle double rerenders.
    return true;
  }

  // REVIEW: shouldn't all Cell-related handlers be defined in Cell component?
  cellMouseOverHandler(e, pos) {
    this.props.actions.setHover(pos);
  }

  cellClickHandler(e, pos) {
    // Save currently editing Cell's data if needed.
    // REVIEW: this is probably not React-way.
    //   But pointer shouldn't contain nor React element or DOM ref.
    //   http://web.archive.org/web/20150419023006/http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html
    //   (What Shouldn’t Go in State?)
    //   How to get currently editing Cell's data right?
    const editingTextarea = document.querySelector('.editing textarea'); // eslint-disable-line no-undef
    if (editingTextarea) {
      const pointerRowNumber = rowNumber(this.table.pointer.pos);
      const pointerColumnNumber = columnNumber(this.table.pointer.pos);
      const cellData = this.table.data[pointerRowNumber][pointerColumnNumber];
      const previousValue = cellData.value; // may be undefined, but we don't care
      const nextValue = editingTextarea.value;

      if (nextValue !== previousValue) {
        this.props.actions.setProp(this.table.pointer.pos, 'value', nextValue);
      }
    }

    this.props.actions.setPointer(pos, []);
  }

  cellDoubleClickHandler(e, pos) {
    this.props.actions.setPointer(pos, ['EDIT']);
  }

  cellKeyDownHandler(e, args) {
    // REVIEW: is it OK to create arrow functions which uses outer context vars?
    const movePointerAndSaveValueIfNeeded = (movePointerKey) => {
      // Prevents pressing key immediately after changing pointer.
      e.preventDefault();

      // REVIEW: double render and sending request here.
      this.props.actions.movePointer(movePointerKey);
      if (args.nextValue !== args.previousValue) {
        this.props.actions.setProp(args.pos, 'value', args.nextValue);
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
          this.props.actions.setPointer(undefined, []);
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
    if (this.table.pointer.modifiers.indexOf('EDIT') !== -1) {
      return;
    }

    // TODO: custom dialog keydown handler.
    // if () {
    //   return;
    // }

    // Custom Munu keydown handler.
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
    if (e.key.length === 1) {
      // 'input' renders after 'keydown', and symbols appears after 'keyup',
      // thus after `setState` input's value is already 'e.key'.
      this.props.actions.setPointer(undefined, ['EDIT', 'SELECT_ON_FOCUS']);

    // Special key is pressed.
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

          // Figure out, should we move scrollbars to align with poinger movement.
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
          this.props.actions.setPointer(undefined, ['EDIT', 'SELECT_ON_FOCUS']);
          break;
        }
        case 'F2': {
          this.props.actions.setPointer(undefined, ['EDIT']);
          break;
        }

        case 'Escape': {
          this.props.actions.setPointer([]);
          break;
        }

        case 'Delete': {
          const pointer = this.table.pointer;
          this.props.actions.deleteProp(pointer.pos, 'value');
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
    // TODO: unite data cells in one table, and attach special cells to it somehow.
    // Table map:
    //
    // TECCCC...A // actions row
    // EENNNN...N // addressing row
    // ANDDDD...D // data[0]
    // ANDDDD...D // data[1]
    // ..........
    // CADDDD...D // data[data.length - 1]
    //
    // T - table actions
    // E - empty
    // A - line actions
    // N - line addressing
    // D - data cell

    const tableMap = [];
    for (let rowIndex = -2; rowIndex < this.table.data.length; rowIndex += 1) {
      let rowsFirstDataCell;
      if (this.table.data[rowIndex]) {
        rowsFirstDataCell = this.table.data[rowIndex][0];
      }

      const rowMap = { key: undefined, cells: [] };
      for (let columnIndex = -2; columnIndex < this.table.data[0].length; columnIndex += 1) {
        const columnFirstDataCell = this.table.data[0][columnIndex];
        let currentCell;
        if (this.table.data[rowIndex]) {
          currentCell = this.table.data[rowIndex][columnIndex];
        }
        const pos = [rowIndex, columnIndex];

        if (rowIndex === -2 && columnIndex === -2) {
          rowMap.cells.push({ pos, type: 'T', key: 'cell-table-actions' });
        } else if (rowIndex < 0 && columnIndex < 0) {
          rowMap.cells.push({ pos, type: 'E', key: `cell-empty-${rowIndex}-${columnIndex}` });
        } else if (rowIndex === -2) {
          rowMap.cells.push({ pos, type: 'A', key: `line-actions-column-${columnFirstDataCell.id}` });
        } else if (rowIndex === -1) {
          rowMap.cells.push({ pos, type: 'N', key: `line-addressing-column-${columnFirstDataCell.id}` });
        } else if (columnIndex === -2) {
          rowMap.cells.push({ pos, type: 'A', key: `line-actions-row-${rowsFirstDataCell.id}` });
        } else if (columnIndex === -1) {
          rowMap.cells.push({ pos, type: 'N', key: `line-addressing-row-${rowsFirstDataCell.id}` });
        } else {
          rowMap.cells.push({ pos, type: 'D', key: `cell-data-${currentCell.id}` });
        }
      }

      rowMap.key = `row-${rowMap.cells[2].key}`;
      tableMap.push(rowMap);
    }

    const pointer = this.table.pointer;
    const rows = [];
    tableMap.forEach((rowMap) => {
      const row = [];
      const rowKey = rowMap.key;
      rowMap.cells.forEach((cellMap) => {
        const pos = cellMap.pos;
        const typeMap = cellMap.type;
        const cellKey = cellMap.key;

        const commonProps = {
          key: cellKey,
          onMouseOverHandler: (e) => this.cellMouseOverHandler(e, pos),
        };

        switch (typeMap) {
          case 'T': {
            row.push(
              <TableActionsCell
                {...commonProps}
                actions={this.props.actions}
                requests={this.props.requests}
              />
          );
            break;
          }
          case 'E': {
            row.push(<div key={cellKey} className="td empty" />);
            break;
          }
          case 'A': {
            row.push(
              <LineActionsCell
                {...commonProps}
                actions={this.props.actions}
                isHover={this.isHover(pos, this.table.hover)}
                id={cellKey}
                pos={pos}
              />
            );
            break;
          }
          case 'N': {
            row.push(<LineAddressingCell {...commonProps} pos={pos} />);
            break;
          }
          case 'D': {
            const currentDataCellProps = this.dataCellProps(pos, pointer);

            row.push(
              // posJSON is using in shouldComponentUpdate in case new row/cell added/deleted.
              <DataCell
                {...commonProps}
                {...currentDataCellProps}
                onClickHandler={(e) => this.cellClickHandler(e, pos)}
                onDoubleClickHandler={(e) => this.cellDoubleClickHandler(e, pos)}
                onKeyDownHandler={(e, args) => this.cellKeyDownHandler(e, { ...args, pos })}
                posJSON={JSON.stringify(pos)}
              />
            );
            break;
          }
          default:
        }
      });

      rows.push(
        <div className="tr" key={rowKey}>
          {row}
        </div>
      );
    });

    // TODO: show requests queue.
    // TODO: handle click ouside table.
    return (
      <div>
        <div
          className="table"
          onMouseLeave={() => { this.props.actions.setHover([]); }}
        >
          {rows}
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
