import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../../core';
import DataCell from './../Cells/DataCell';
import LineAddressingCell from './../Cells/LineAddressingCell';
import LineActionsCell from './../Cells/LineActionsCell';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cells: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  firstActionsCellIsOnly: PropTypes.bool.isRequired,
  isPointerOnRow: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  localPointerColumnId: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
  localPointerModifiers: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
  originalRowIndex: PropTypes.number.isRequired,
  pointer: PropTypes.object.isRequired,
  rowId: PropTypes.string.isRequired,
};

const defaultProps = {
  isPointerOnRow: false,
  localPointerColumnId: '',
  localPointerModifiers: {},
};

class DataRow extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, [
      'isPointerOnRow', // pointer movement up/down
      'localPointerColumnId', // pointer movement left/right
      'localPointerModifiers', // edit/unedit cell
      'originalRowIndex', // add/remove rows
      'columns', // add/remove columns
    ]);
  }

  render() {
    const {
      actions,
      cells,
      columns,
      firstActionsCellIsOnly,
      originalRowIndex,
      pointer,
      rowId,
    } = this.props;

    const getDataCellId = (columnIndex) => {
      return getCellId(rowId, columns[columnIndex]);
    };

    const outputCells = [];

    // LineActionsCell.
    outputCells.push(
      <LineActionsCell
        actions={actions}
        id={getDataCellId(0)}
        isOnly={firstActionsCellIsOnly}
        key={getDataCellId(0)}
        pos={[originalRowIndex, -2]}
      />
    );

    // LineAddressingCell.
    outputCells.push(
      <LineAddressingCell
        actions={actions}
        id={getDataCellId(1)}
        key={getDataCellId(1)}
        pos={[originalRowIndex, -1]}
      />
    );

    const getDataCellProps = (cellId, cell, somePointer) => {
      const effectiveCell = cell || {};

      const value = effectiveCell.value;
      const isPointed = cellId === somePointer.cellId;
      const isEditing = isPointed && somePointer.modifiers.edit === true;
      const isSelectingOnFocus = isPointed && somePointer.modifiers.select_on_focus === true;

      return { value, isPointed, isEditing, isSelectingOnFocus };
    };

    // The rest.
    for (let columnIndex = 2; columnIndex < columns.length; columnIndex += 1) {
      const dataCellId = getDataCellId(columnIndex);
      const dataCellProps = getDataCellProps(
        dataCellId,
        cells[dataCellId],
        pointer
      );

      outputCells.push(
        <DataCell
          {...dataCellProps}
          actions={actions}
          id={dataCellId}
          key={dataCellId}
          pointer={pointer}
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
