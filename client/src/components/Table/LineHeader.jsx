import { intToExcelCol } from 'excel-column-name';
import PropTypes from 'prop-types';
import React from 'react';

import './LineHeader.css'
import {
  COLUMN,
  LINE_HEADER,
  ROW,
} from '../../constants';
import LineSizer from './LineSizer';

const propTypes = {
  index: PropTypes.number.isRequired,
  isPointed: PropTypes.bool.isRequired,
  lineType: PropTypes.string.isRequired,
  style: PropTypes.object.isRequired,
  tableHasHeader: PropTypes.bool,
};

const defaultProps = {
  tableHasHeader: false,
};

class LineHeader extends React.PureComponent {
  render() {
    // Extracting props.
    const {
      index,
      isPointed,
      lineType,
      style,
      tableHasHeader,
      ...other
    } = this.props;

    let address;
    const effectiveLineNumber = index + 1;
    if (lineType === ROW) {
      if (tableHasHeader) {
        if (index === 0) {
          address = '';
        } else {
          address = effectiveLineNumber - 1;
        }
      } else {
        address = effectiveLineNumber;
      }
    } else if (lineType === COLUMN) {
      address = intToExcelCol(effectiveLineNumber);
    }

    const classNames = ['line-header'];
    if (isPointed) {
      classNames.push('pointed');
    }

    // NOTE: pointerEvents prevents clicking on div
    //   for getComponentName() to work properly.
    return (
      <React.Fragment>
        <div
          className={classNames.join(' ')}
          style={{ ...style, position: 'relative' }}
          data-component-name={LINE_HEADER}
          data-row-index={(lineType === ROW) ? index : undefined}
          data-column-index={(lineType === COLUMN) ? index : undefined}
        >
          <div className="line-header-address" style={{ pointerEvents: 'none' }}>
            {address}
          </div>

          {/* NOTE: key resets internal LineSizer'r Draggable state. */}
          <LineSizer
            columnsHeaderHeight={style.height}
            rowsHeaderWidth={style.width}
            columnWidth={style.minWidth}
            rowHeight={style.height}
            index={index}
            key={`${style.minWidth},${style.height}`}
            lineType={lineType}
            {...other}
          />
        </div>
      </React.Fragment>
    );
  }
}

LineHeader.propTypes = propTypes;
LineHeader.defaultProps = defaultProps;

export default LineHeader;
