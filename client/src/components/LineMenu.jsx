import PropTypes from 'prop-types';
import React from 'react';

import './LineMenu.css';
import Menu from './Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  isLineHover: PropTypes.bool,
  isLineOnly: PropTypes.bool.isRequired,
  lineNumber: PropTypes.number.isRequired,
  nextMenuId: PropTypes.string,
  place: PropTypes.string.isRequired,
  previousMenuId: PropTypes.string,
};

const defaultProps = {
  isLineHover: false,
};

class LineMenu extends React.PureComponent {
  render() {
    const {
      actions, // uses in LineMenu and Menu
      isLineHover,
      isLineOnly,
      lineNumber,
      place, // used in LineMenu and
      ...other,
    } = this.props;

    const cellsMenuItems = [];
    if (place === 'ROW') {
      // Don't allow to delete first row/column if there are only one row/column left.
      if (!isLineOnly) {
        cellsMenuItems.push({
          action: () => actions.tableReduce(lineNumber, place),
          icon: 'Close',

          // TODO: i18n.
          label: 'Delete row',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.tableExpand(lineNumber, place),
          icon: 'KeyboardArrowUp',
          label: 'Insert row above',
        },
        {
          action: () => actions.tableExpand(lineNumber + 1, place),
          icon: 'KeyboardArrowDown',
          label: 'Insert row below',
        }
      );
    } else if (place === 'COLUMN') {
      if (!isLineOnly) {
        cellsMenuItems.push({
          action: () => actions.tableReduce(lineNumber, place),
          icon: 'Close',
          label: 'Delete column',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.tableExpand(lineNumber, place),
          icon: 'ChevronLeft',
          label: 'Insert column at left',
        },
        {
          action: () => actions.tableExpand(lineNumber + 1, place),
          icon: 'ChevronRight',
          label: 'Insert column at right',
        }
      );
    }

    const classnames = ['line-menu'];
    if (place === 'COLUMN' && isLineHover) { classnames.push('hover'); }

    // For rows we detecting hover using css.
    if (place === 'ROW') { classnames.push('line-menu-hover'); }

    return (
      <div className={classnames.join(' ')}>
        <Menu
          {...other}
          actions={actions}
          icon="MoreVert"
          menuItems={cellsMenuItems}
          place={place}
        />
      </div>
    );
  }
}

LineMenu.propTypes = propTypes;
LineMenu.defaultProps = defaultProps;

export default LineMenu;
