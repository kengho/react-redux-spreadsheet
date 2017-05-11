import React from 'react';
import PropTypes from 'prop-types';

import Menu from '../Menu/Menu';
import { lineRef, rowNumber, columnNumber } from '../../core';

const propTypes = {
  actions: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  isHover: PropTypes.bool.isRequired,
  maxPos: PropTypes.array.isRequired,
  onMouseOverHandler: PropTypes.func.isRequired,
  pos: PropTypes.array.isRequired,
};

const defaultProps = {
};

class LineActionsCell extends React.Component {
  // TODO: recompose/pure?
  constructor(props) {
    super(props);

    this.currentRowNumber = rowNumber(props.pos);
    this.currentColumnNumber = columnNumber(props.pos);
  }

  shouldComponentUpdate(nextProps) {
    // Update if hover changed to adjust visibility\.
    const currentProps = this.props;
    if (nextProps.isHover !== currentProps.isHover) {
      return true;
    }

    // Update if 'delete' option is added/deleted.
    const isFirstRow = this.currentRowNumber === 0;
    const isFirstColumn = this.currentColumnNumber === 0;
    const isMaxPosRowRumberWasOrIsZero =
      (rowNumber(nextProps.maxPos) === 0 && rowNumber(currentProps.maxPos) !== 0) ||
      (rowNumber(nextProps.maxPos) !== 0 && rowNumber(currentProps.maxPos) === 0);
    const isMaxPosColumnNumberWasOrIsZero =
      (columnNumber(nextProps.maxPos) === 0 && columnNumber(currentProps.maxPos) !== 0) ||
      (columnNumber(nextProps.maxPos) !== 0 && columnNumber(currentProps.maxPos) === 0);
    if (
      (isFirstRow && isMaxPosRowRumberWasOrIsZero) ||
      (isFirstColumn && isMaxPosColumnNumberWasOrIsZero)
    ) {
      return true;
    }

    return false;
  }

  render() {
    const cellsButtonId = `line-actions-button-${this.props.id}`;
    const { reduce, expand } = this.props.actions;
    const currentLineRef = lineRef(this.props.pos);

    const cellsMenuItems = [];
    if (currentLineRef === 'row') {
      // Don't allow to delete first row/column if there are only one row/column left.
      // TODO: repeat check in reducer.
      if (!(this.currentRowNumber === 0 && rowNumber(this.props.maxPos) === 0)) {
        cellsMenuItems.push({
          icon: 'close',

          // TODO: i18n.
          label: 'Delete row',
          action: () => reduce(this.props.pos),
        });
      }
      cellsMenuItems.push(
        {
          icon: 'keyboard_arrow_up',
          label: 'Insert row above',
          action: () => expand(this.props.pos),
        },
        {
          icon: 'keyboard_arrow_down',
          label: 'Insert row below',
          action: () => expand([this.currentRowNumber + 1, this.currentColumnNumber]),
        }
      );
    } else if (currentLineRef === 'column') {
      if (!(this.currentColumnNumber === 0 && columnNumber(this.props.maxPos) === 0)) {
        cellsMenuItems.push({
          icon: 'close',
          label: 'Delete column',
          action: () => reduce(this.props.pos),
        });
      }
      cellsMenuItems.push(
        {
          icon: 'chevron_left',
          label: 'Insert column at left',
          action: () => expand(this.props.pos),
        },
        {
          icon: 'chevron_right',
          label: 'Insert column at right',
          action: () => expand([this.currentRowNumber, this.currentColumnNumber + 1]),
        }
      );
    }

    return (
      <div
        className={`td line-actions ${currentLineRef} ${this.props.isHover ? 'hover' : ''}`}
        onMouseOver={this.props.onMouseOverHandler}
      >
        <Menu
          buttonId={cellsButtonId}
          buttonIcon="more_vert"
          menuItems={cellsMenuItems}
        />
      </div>
    );
  }
}

LineActionsCell.propTypes = propTypes;
LineActionsCell.defaultProps = defaultProps;

export default LineActionsCell;
