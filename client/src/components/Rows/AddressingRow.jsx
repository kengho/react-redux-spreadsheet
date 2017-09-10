import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getCellId,
} from '../../core';
import LineAddressingCell from './Cells/LineAddressingCell';


const propTypes = {
  columns: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired,
  rowId: PropTypes.string.isRequired,
};

const defaultProps = {
};

class AddressingRow extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, ['columns']);
  }

  render() {
    const {
      actions,
      columns,
      rowId,
    } = this.props;

    const getAddressingCellId = (columnIndex) => {
      return getCellId(rowId, columns[columnIndex].id);
    };

    const outputCells = [];

    // 2 empty cells.
    outputCells.push(
      <div
        className="td empty"
        id={getAddressingCellId(0)}
        key={getAddressingCellId(0)}
      />,
      <div
        className="td empty"
        id={getAddressingCellId(1)}
        key={getAddressingCellId(1)}
      />
    );

    // The rest.
    for (let columnIndex = 2; columnIndex < columns.length; columnIndex += 1) {
      const addressingCellId = getAddressingCellId(columnIndex);
      const originalColumnIndex = columnIndex - 2;

      outputCells.push(
        <LineAddressingCell
          id={addressingCellId}
          key={addressingCellId}
          actions={actions}
          pos={[-1, originalColumnIndex]}
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

AddressingRow.propTypes = propTypes;
AddressingRow.defaultProps = defaultProps;

export default AddressingRow;
