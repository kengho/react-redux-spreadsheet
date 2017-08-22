import { intToExcelCol } from 'excel-column-name';
import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getColumnNumber,
  getLineRef,
  getRowNumber,
} from '../../../core';

const propTypes = {
  actions: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  pos: PropTypes.array.isRequired,
};

const defaultProps = {
};

class LineAddressingCell extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, ['pos']);
  }

  render() {
    const {
      actions,
      id,
      pos,
    } = this.props;
    const lineRef = getLineRef(pos);

    let address;
    if (lineRef === 'ROW') {
      address = getRowNumber(pos) + 1;
    } else if (lineRef === 'COLUMN') {
      address = intToExcelCol(getColumnNumber(pos) + 1);
    }

    return (
      <div
        className={`td line-addressing ${lineRef.toLowerCase()}`}
        id={id}
        onMouseOver={() => { actions.setHover(id); }}
      >
        {address}
      </div>
    );
  }
}

LineAddressingCell.propTypes = propTypes;
LineAddressingCell.defaultProps = defaultProps;

export default LineAddressingCell;
