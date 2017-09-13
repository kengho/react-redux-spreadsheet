import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../core';
import Cell from './Cell';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cells: PropTypes.object.isRequired,
  clipboard: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  hoverColumnId: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  hoverRowId: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  isPointerOnRow: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  isRowInClipboard: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  localPointerColumnId: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  localPointerModifiers: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
  pointer: PropTypes.object.isRequired,
  rowId: PropTypes.string.isRequired,
  rowIndex: PropTypes.number.isRequired,
  rowUpdateTrigger: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
};

const defaultProps = {
  hoverColumnId: '',
  hoverRowId: '',
  isPointerOnRow: false,
  isRowInClipboard: false,
  localPointerColumnId: '',
  localPointerModifiers: {},
  rowUpdateTrigger: false,
};

class Row extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, [
      'rowUpdateTrigger', // some cells' value changed
      'isRowInClipboard', // clipboard changes
      'isPointerOnRow', // pointer movement up/down
      'localPointerColumnId', // pointer movement left/right
      'localPointerModifiers', // edit/unedit cell
      'rowIndex', // add/remove rows
      'columns', // add/remove columns
      'menu', // click on menu
      'hoverColumnId',
      'hoverRowId',
    ]);
  }

  render() {
    const {
      cells,
      clipboard,
      columns,
      rowIndex,
      pointer,
      rowId,
    } = this.props;

    const getDataCellId = (columnIndex) => {
      return getCellId(rowId, columns[columnIndex].id);
    };

    const getDataCellProps = (cellId, cell, somePointer, someClipboard) => {
      const effectiveCell = cell || {};

      const value = effectiveCell.value;
      const isPointed = cellId === somePointer.cellId;
      const isEditing = isPointed && somePointer.modifiers.edit === true;
      const isSelectingOnFocus =
        isPointed &&
        (somePointer.modifiers.selectOnFocus === true);

      // !!someClipboard.cells[cellId] gives false if value under key exists but is undefined.
      const isOnClipboard = Object.keys(someClipboard.cells).indexOf(cellId) !== -1;

      return {
        isEditing,
        isOnClipboard,
        isPointed,
        isSelectingOnFocus,
        value,
      };
    };

    const outputCells = [];
    for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
      const dataCellId = getDataCellId(columnIndex);
      const dataCellProps = getDataCellProps(
        dataCellId,
        cells[dataCellId],
        pointer,
        clipboard
      );

      outputCells.push(
        <Cell
          {...this.props}
          {...dataCellProps}
          cellId={dataCellId}
          columnNumber={columnIndex}
          key={dataCellId}
          rowNumber={rowIndex}
        />
      );
    }

    return (
      <div className="tr">
        {outputCells}
      </div>
    );
  }
}

Row.propTypes = propTypes;
Row.defaultProps = defaultProps;

export default Row;
