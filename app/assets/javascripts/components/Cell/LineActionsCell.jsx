import React from 'react';
import PropTypes from 'prop-types';

import Menu from '../Menu/Menu';
import { lineRef, rowNumber, columnNumber } from '../../core';

const propTypes = {
  actions: PropTypes.object.isRequired,
  isHover: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  onMouseOverHandler: PropTypes.func.isRequired,
  pos: PropTypes.array.isRequired,
};

const defaultProps = {
};

class LineActionsCell extends React.Component {
  // TODO: recompose/pure?
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;
    if (nextProps.isHover === currentProps.isHover) {
      return false;
    }

    return true;
  }

  render() {
    const currentRowNumber = rowNumber(this.props.pos);
    const currentColumnNumber = columnNumber(this.props.pos);

    const cellsButtonId = `line-actions-button-${this.props.id}`;
    const { reduce, expand } = this.props.actions;
    const currentLineRef = lineRef(this.props.pos);

    const cellsMenuItems = [];
    if (currentLineRef === 'row') {
      // Don't allow to delete first row/column.
      // TODO: repeat check in reducer.
      if (currentRowNumber !== 0) {
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
          action: () => expand([currentRowNumber + 1, currentColumnNumber]),
        }
      );
    } else if (currentLineRef === 'column') {
      if (currentColumnNumber !== 0) {
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
          action: () => expand([currentRowNumber, currentColumnNumber + 1]),
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
