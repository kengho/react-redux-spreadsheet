import React from 'react';
import PropTypes from 'prop-types';
import { intToExcelCol } from 'excel-column-name';

import { lineRef, rowNumber, columnNumber } from '../../core';

const propTypes = {
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
    const currentLineRef = lineRef(this.props.pos);

    let address;
    if (currentLineRef === 'row') {
      address = rowNumber(this.props.pos) + 1;
    } else if (currentLineRef === 'column') {
      address = intToExcelCol(columnNumber(this.props.pos) + 1);
    }

    return (
      <div className={`td line-addressing ${currentLineRef}`} onMouseOver={this.props.onMouseOverHandler}>
        {address}
      </div>
    );
  }
}

LineAddressingCell.propTypes = propTypes;
LineAddressingCell.defaultProps = defaultProps;

export default LineAddressingCell;
