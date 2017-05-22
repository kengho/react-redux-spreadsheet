import PropTypes from 'prop-types';
import React from 'react';

import { lineRef, rowNumber, columnNumber } from '../../core';
import Menu from '../Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  isHover: PropTypes.bool.isRequired,
  isOnly: PropTypes.bool.isRequired,
  onMouseOverHandler: PropTypes.func.isRequired,
  pos: PropTypes.array.isRequired,
};

const defaultProps = {
};

class LineActionsCell extends React.Component {
  shouldComponentUpdate(nextProps) {
    // TODO: to lib (see DataCell).
    const currentProps = this.props;
    const importantProps = ['isHover', 'isOnly', 'pos'];

    const importantCellPropsAreNotEqual = importantProps.some((prop) => {
      let result;
      if (typeof currentProps[prop] === 'object') { // pos
        result =
          rowNumber(nextProps[prop]) !== rowNumber(currentProps[prop]) ||
          columnNumber(nextProps[prop]) !== columnNumber(currentProps[prop]);
      } else {
        result = nextProps[prop] !== currentProps[prop];
      }

      return result;
    });

    if (importantCellPropsAreNotEqual) {
      return true;
    }
    return false;
  }

  render() {
    const cellsButtonId = `line-actions-button-${this.props.id}`;
    const { reduce, expand } = this.props.actions;
    const pos = this.props.pos;
    const currentLineRef = lineRef(pos);

    const cellsMenuItems = [];
    if (currentLineRef === 'ROW') {
      // Don't allow to delete first row/column if there are only one row/column left.
      // TODO: repeat check in reducer.
      if (!this.props.isOnly) {
        cellsMenuItems.push({
          action: () => reduce(pos),
          icon: 'close',

          // TODO: i18n.
          label: 'Delete row',
        });
      }
      cellsMenuItems.push(
        {
          action: () => expand(pos),
          icon: 'keyboard_arrow_up',
          label: 'Insert row above',
        },
        {
          action: () => expand([rowNumber(pos) + 1, columnNumber(pos)]),
          icon: 'keyboard_arrow_down',
          label: 'Insert row below',
        }
      );
    } else if (currentLineRef === 'COLUMN') {
      if (!this.props.isOnly) {
        cellsMenuItems.push({
          action: () => reduce(pos),
          icon: 'close',
          label: 'Delete column',
        });
      }
      cellsMenuItems.push(
        {
          action: () => expand(pos),
          icon: 'chevron_left',
          label: 'Insert column at left',
        },
        {
          action: () => expand([rowNumber(pos), columnNumber(pos) + 1]),
          icon: 'chevron_right',
          label: 'Insert column at right',
        }
      );
    }

    return (
      <div
        className={`td line-actions ${currentLineRef.toLowerCase()} ${this.props.isHover ? 'hover' : ''}`}
        onMouseOver={this.props.onMouseOverHandler}
      >
        <Menu
          buttonIcon="more_vert"
          buttonId={cellsButtonId}
          menuItems={cellsMenuItems}
        />
      </div>
    );
  }
}

LineActionsCell.propTypes = propTypes;
LineActionsCell.defaultProps = defaultProps;

export default LineActionsCell;
