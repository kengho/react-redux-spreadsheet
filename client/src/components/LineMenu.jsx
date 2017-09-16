import PropTypes from 'prop-types';
import React from 'react';

import Menu from './Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  isHover: PropTypes.bool,
  isOnly: PropTypes.bool.isRequired,
  lineNumber: PropTypes.number.isRequired,
  lineRef: PropTypes.string.isRequired,
  menuId: PropTypes.string.isRequired,
  menuVisibility: PropTypes.bool,
  nextMenuId: PropTypes.string,
  previousMenuId: PropTypes.string,
};


const defaultProps = {
  isHover: false,
  menuVisibility: false,
};

class LineMenu extends React.PureComponent {
  render() {
    const {
      actions, // uses in both LineMenu and Menu
      isHover,
      isOnly,
      lineNumber,
      lineRef,
      nextMenuId,
      previousMenuId,
      ...other,
    } = this.props;

    const cellsMenuItems = [];
    if (lineRef === 'ROW') {
      // Don't allow to delete first row/column if there are only one row/column left.
      if (!isOnly) {
        cellsMenuItems.push({
          action: () => actions.tableReduce(lineNumber, lineRef),
          icon: 'Close',

          // TODO: i18n.
          label: 'Delete row',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.tableExpand(lineNumber, lineRef),
          icon: 'KeyboardArrowUp',
          label: 'Insert row above',
        },
        {
          action: () => actions.tableExpand(lineNumber + 1, lineRef),
          icon: 'KeyboardArrowDown',
          label: 'Insert row below',
        }
      );
    } else if (lineRef === 'COLUMN') {
      if (!isOnly) {
        cellsMenuItems.push({
          action: () => actions.tableReduce(lineNumber, lineRef),
          icon: 'Close',
          label: 'Delete column',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.tableExpand(lineNumber, lineRef),
          icon: 'ChevronLeft',
          label: 'Insert column at left',
        },
        {
          action: () => actions.tableExpand(lineNumber + 1, lineRef),
          icon: 'ChevronRight',
          label: 'Insert column at right',
        }
      );
    }

    const classnames = ['line-menu'];
    if (lineRef === 'COLUMN' && isHover) { classnames.push('hover'); }

    // For rows we detecting hover using css.
    if (lineRef === 'ROW') { classnames.push('line-menu-hover'); }

    return (
      <div className={classnames.join(' ')}>
        <Menu
          {...other}
          actions={actions}
          icon="MoreVert"
          menuItems={cellsMenuItems}
          nextMenuId={nextMenuId}
          previousMenuId={previousMenuId}
        />
      </div>
    );
  }
}

LineMenu.propTypes = propTypes;
LineMenu.defaultProps = defaultProps;

export default LineMenu;
