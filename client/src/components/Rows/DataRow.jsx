import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../../core';
import { FICTIVE_LINES_NUMBER } from '../../containers/Spreadsheet';
import DataCell from './Cells/DataCell';
import LineActionsCell from './Cells/LineActionsCell';
import LineAddressingCell from './Cells/LineAddressingCell';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cells: PropTypes.object.isRequired,
  clipboard: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
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
  isPointerOnRow: false,
  isRowInClipboard: false,
  localPointerColumnId: '',
  localPointerModifiers: {},
  rowUpdateTrigger: false,
};

class DataRow extends React.Component {
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
      menu,
    } = this.props;

    const getDataCellId = (columnIndex) => {
      return getCellId(rowId, columns[columnIndex]);
    };

    const outputCells = [];

    outputCells.push(
      <LineActionsCell
        {...this.props}
        cellId={getDataCellId(0)}
        isOnly={columns.length === FICTIVE_LINES_NUMBER + 1}
        key={getDataCellId(0)}
        menuVisibility={menu[getDataCellId(0)]}
        pos={[rowIndex - FICTIVE_LINES_NUMBER, - FICTIVE_LINES_NUMBER]}
      />
    );

    // LineAddressingCell.
    outputCells.push(
      <LineAddressingCell
        {...this.props}
        id={getDataCellId(1)}
        key={getDataCellId(1)}
        pos={[rowIndex - FICTIVE_LINES_NUMBER, -1]}
      />
    );

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

    // The rest.
    for (let columnIndex = FICTIVE_LINES_NUMBER; columnIndex < columns.length; columnIndex += 1) {
      const dataCellId = getDataCellId(columnIndex);
      const dataCellProps = getDataCellProps(
        dataCellId,
        cells[dataCellId],
        pointer,
        clipboard
      );

      outputCells.push(
        <DataCell
          {...this.props}
          {...dataCellProps}
          cellId={dataCellId}
          key={dataCellId}
        />
      );
    }

    return (
      <div className="tr action-cells-hover">
        {outputCells}
      </div>
    );
  }
}

DataRow.propTypes = propTypes;
DataRow.defaultProps = defaultProps;

export default DataRow;
