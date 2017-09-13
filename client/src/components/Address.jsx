import { intToExcelCol } from 'excel-column-name';
import PropTypes from 'prop-types';
import React from 'react';

import { arePropsEqual } from '../core';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  lineNumber: PropTypes.number.isRequired,
  lineRef: PropTypes.string.isRequired,
};

class Address extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, ['lineNumber']);
  }

  render() {
    const {
      actions,
      cellId,
      lineNumber,
      lineRef,
    } = this.props;

    let address;
    if (lineRef === 'ROW') {
      address = lineNumber + 1;
    } else if (lineRef === 'COLUMN') {
      address = intToExcelCol(lineNumber + 1);
    }

    return (
      <div
        className="address"
        onMouseOver={() => { actions.setHover(cellId); }}
      >
        {address}
      </div>
    );
  }
}

Address.propTypes = propTypes;

export default Address;
