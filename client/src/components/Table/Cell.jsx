import PropTypes from 'prop-types';
import React from 'react';

import './Cell.css';
import { CELL } from '../../constants';

const propTypes = {
  columnIndex: PropTypes.number.isRequired,
  inOnHeader: PropTypes.bool,
  isInClipboard: PropTypes.bool,
  isInSelection: PropTypes.bool,
  isOnClipboardBottom: PropTypes.bool,
  isOnClipboardLeft: PropTypes.bool,
  isOnClipboardRight: PropTypes.bool,
  isOnClipboardTop: PropTypes.bool,
  isOnSelectionBottom: PropTypes.bool,
  isOnSelectionLeft: PropTypes.bool,
  isOnSelectionRight: PropTypes.bool,
  isOnSelectionTop: PropTypes.bool,
  isPointed: PropTypes.bool.isRequired,
  rowIndex: PropTypes.number.isRequired,
  selectOnFocus: PropTypes.bool.isRequired,
  styleJSON: PropTypes.string.isRequired,
  value: PropTypes.string,
};

const defaultProps = {
  inOnHeader: false,
  isInClipboard: false,
  isInSelection: false,
  isOnClipboardBottom: false,
  isOnClipboardLeft: false,
  isOnClipboardRight: false,
  isOnClipboardTop: false,
  isOnSelectionBottom: false,
  isOnSelectionLeft: false,
  isOnSelectionRight: false,
  isOnSelectionTop: false,
  value: '',
};

class Cell extends React.PureComponent {
  render() {
    const {
      columnIndex,
      inOnHeader,
      isInClipboard,
      isInSelection,
      isOnClipboardBottom,
      isOnClipboardLeft,
      isOnClipboardRight,
      isOnClipboardTop,
      isOnSelectionBottom,
      isOnSelectionLeft,
      isOnSelectionRight,
      isOnSelectionTop,
      isPointed,
      rowIndex,
      styleJSON,
      value,
    } = this.props;

    const style = JSON.parse(styleJSON);

    const classNames = ['cell'];
    if (isPointed) { classNames.push('pointed'); }
    if (inOnHeader) { classNames.push('header'); }

    if (isInSelection) { classNames.push('selection'); }
    if (isOnSelectionTop) { classNames.push('selection-top'); }
    if (isOnSelectionRight) { classNames.push('selection-right'); }
    if (isOnSelectionBottom) { classNames.push('selection-bottom'); }
    if (isOnSelectionLeft) { classNames.push('selection-left'); }

    if (isInClipboard) { classNames.push('clipboard'); }
    if (isOnClipboardTop) { classNames.push('clipboard-top'); }
    if (isOnClipboardRight) { classNames.push('clipboard-right'); }
    if (isOnClipboardBottom) { classNames.push('clipboard-bottom'); }
    if (isOnClipboardLeft) { classNames.push('clipboard-left'); }

    if (value !== '') { classNames.push('non-empty'); }

    // NOTE: events handeled in Table.
    // TODO: delete duplicating "data-" props using to
    //   handle click in both empty and nonempty cells.
    return (
      <div
        className={classNames.join(' ')}
        data-column-index={columnIndex}
        data-component-name={CELL}
        data-row-index={rowIndex}
        style={style}
        title={value}
      >
        <div
          className="cell-content"
          data-column-index={columnIndex}
          data-component-name={CELL}
          data-row-index={rowIndex}
        >
          {value}
        </div>
      </div>
    );
  }
}

Cell.propTypes = propTypes;
Cell.defaultProps = defaultProps;

export default Cell;
