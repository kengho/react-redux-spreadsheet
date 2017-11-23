import PropTypes from 'prop-types';
import React from 'react';

import './LineMenu.css';
import Menu from './Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  isLineHover: PropTypes.bool,
  isLineOnly: PropTypes.bool.isRequired,
  lineNumber: PropTypes.number.isRequired,
  place: PropTypes.string.isRequired,
};

const defaultProps = {
  isLineHover: false,
};

class LineMenu extends React.PureComponent {
  render() {
    // Extracting props.
    const {
      isLineHover,
      isLineOnly,
      lineNumber,
      ...other,
    } = this.props;

    // Non-extracting props (should be passed to children as well).
    const {
      actions, // uses in Menu
      place, // uses in Menu
    } = this.props;

    const cellsMenuItems = [];
    if (place === 'ROW') {
      // Don't allow to delete first row/column if there are only one row/column left.
      if (!isLineOnly) {
        cellsMenuItems.push({
          action: () => actions.deleteLine(lineNumber, place),
          icon: 'Close',

          // TODO: i18n.
          label: 'Delete row',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.addLine(lineNumber, place),
          icon: 'KeyboardArrowUp',
          label: 'Insert row above',
        },
        {
          action: () => actions.addLine(lineNumber + 1, place),
          icon: 'KeyboardArrowDown',
          label: 'Insert row below',
        }
      );
    } else if (place === 'COLUMN') {
      if (!isLineOnly) {
        cellsMenuItems.push({
          action: () => actions.deleteLine(lineNumber, place),
          icon: 'Close',
          label: 'Delete column',
        });
      }
      cellsMenuItems.push(
        {
          action: () => actions.addLine(lineNumber, place),
          icon: 'ChevronLeft',
          label: 'Insert column at left',
        },
        {
          action: () => actions.addLine(lineNumber + 1, place),
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
          icon="MoreVert"
          menuItems={cellsMenuItems}
          {...other}
        />
      </div>
    );
  }
}

LineMenu.propTypes = propTypes;
LineMenu.defaultProps = defaultProps;

export default LineMenu;
