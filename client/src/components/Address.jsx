import { intToExcelCol } from 'excel-column-name';
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
  lineNumber: PropTypes.number.isRequired,
  lineRef: PropTypes.string.isRequired,
};

class Address extends React.PureComponent {
  render() {
    const {
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
      <div className="address">
        {address}
      </div>
    );
  }
}

Address.propTypes = propTypes;

export default Address;
