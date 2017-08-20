import PropTypes from 'prop-types';
import React from 'react';

import {
  arePropsEqual,
  getColumnNumber,
  getLineRef,
  getRowNumber,
} from '../../core';
import Menu from '../Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  isHover: PropTypes.bool,
  isOnly: PropTypes.bool.isRequired,
  pos: PropTypes.array.isRequired,
};

const defaultProps = {
  isHover: false,
};

class LineActionsCell extends React.Component {
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, ['isHover', 'isOnly', 'pos']);
  }

  render() {
    const cellsButtonId = `line-actions-button-${this.props.id}`;
    const {
      actions,
      id,
      isHover,
      isOnly,
      pos,
    } = this.props;
    const lineRef = getLineRef(pos);

    const cellsMenuItems = [];
    if (lineRef === 'ROW') {
      // Don't allow to delete first row/column if there are only one row/column left.
      if (!isOnly) {
        cellsMenuItems.push({
          action: () => actions.reduce(pos),
          icon: 'close',

          // TODO: i18n.
          label: 'Delete row',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.expand(pos),
          icon: 'keyboard-arrow-up',
          label: 'Insert row above',
        },
        {
          action: () => actions.expand([getRowNumber(pos) + 1, getColumnNumber(pos)]),
          icon: 'keyboard-arrow-down',
          label: 'Insert row below',
        }
      );
    } else if (lineRef === 'COLUMN') {
      if (!isOnly) {
        cellsMenuItems.push({
          action: () => actions.reduce(pos),
          icon: 'close',
          label: 'Delete column',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.expand(pos),
          icon: 'chevron-left',
          label: 'Insert column at left',
        },
        {
          action: () => actions.expand([getRowNumber(pos), getColumnNumber(pos) + 1]),
          icon: 'chevron-right',
          label: 'Insert column at right',
        }
      );
    }

    return (
      <div
        className={`td line-actions ${lineRef.toLowerCase()} ${isHover ? 'hover' : ''}`}
        onMouseOver={() => { actions.setHover(id); }}
      >
        <Menu
          actions={actions}
          buttonIcon="more-vert"
          buttonId={cellsButtonId}
          isOnly={isOnly}
          menuItems={cellsMenuItems}
          pos={pos}
        />
      </div>
    );
  }
}

LineActionsCell.propTypes = propTypes;
LineActionsCell.defaultProps = defaultProps;

export default LineActionsCell;