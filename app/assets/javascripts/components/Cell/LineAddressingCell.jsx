import { intToExcelCol } from 'excel-column-name';
import PropTypes from 'prop-types';
import React from 'react';

import { lineRef, rowNumber, columnNumber } from '../../core';

const propTypes = {
  id: PropTypes.string.isRequired,
  onMouseOverHandler: PropTypes.func.isRequired,
  pos: PropTypes.array.isRequired,
};

const defaultProps = {
};

class LineAddressingCell extends React.Component {
  // TODO: recompose/pure?
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    // Updates only on row/column insert/delete.
    if (
      (rowNumber(nextProps.pos) !== rowNumber(currentProps.pos)) ||
      (columnNumber(nextProps.pos) !== columnNumber(currentProps.pos))
    ) {
      return true;
    }

    return false;
  }

  render() {
    const pos = this.props.pos;
    const currentLineRef = lineRef(pos);

    let address;
    if (currentLineRef === 'ROW') {
      address = rowNumber(pos) + 1;
    } else if (currentLineRef === 'COLUMN') {
      address = intToExcelCol(columnNumber(pos) + 1);
    }

    return (
      <div
        className={`td line-addressing ${currentLineRef.toLowerCase()}`}
        id={this.props.id}
        onMouseOver={this.props.onMouseOverHandler}
      >
        {address}
      </div>
    );
  }
}

LineAddressingCell.propTypes = propTypes;
LineAddressingCell.defaultProps = defaultProps;

export default LineAddressingCell;
