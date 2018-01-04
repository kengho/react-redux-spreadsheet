import { intToExcelCol } from 'excel-column-name';
import PropTypes from 'prop-types';
import React from 'react';

import './Address.css'

const propTypes = {
  effectiveLineNumber: PropTypes.number.isRequired,
  lineRef: PropTypes.string.isRequired,
};

class Address extends React.PureComponent {
  render() {
    const {
      effectiveLineNumber,
      lineRef,
    } = this.props;

    let address;
    if (lineRef === 'ROW') {
      address = effectiveLineNumber;
    } else if (lineRef === 'COLUMN') {
      address = intToExcelCol(effectiveLineNumber);
    }

    return (
      <div className="address">
        {address}
      </div>
    );
  }
}

Address.propTypes = propTypes;

export default Address;
