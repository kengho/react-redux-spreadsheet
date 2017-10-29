import PropTypes from 'prop-types';
import React from 'react';

import './CellMenu.css';
import Menu from './Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  historyVisibility: PropTypes.bool.isRequired,
  isHistoryAvailable: PropTypes.bool.isRequired,
};

const defaultProps = {
};

class CellMenu extends React.PureComponent {
  render() {
    // Extracting props.
    const {
      value,
      historyVisibility,
      isHistoryAvailable,
      ...other,
    } = this.props;

    // Non-extracting props (should be passed to children as well).
    const {
      actions, // used in Menu
      cellId, // used in Menu
    } = this.props;

    const cellMenuItems = [];
    if (historyVisibility) {
      cellMenuItems.push({
        action: () => actions.uiClose(),
        icon: 'History',
        label: 'Hide history',
      });
    } else {
      cellMenuItems.push({
        action: () => actions.uiOpen('HISTORY', cellId),
        icon: 'History',
        label: 'View history',
        disabled: !isHistoryAvailable,
      });
    }
    cellMenuItems.push({
      action: () => actions.tableDeleteProp(cellId, 'value'),
      icon: 'Close',
      label: 'Clear',
      disabled: (value === ''),
    });

    return (
      <div className="cell-menu">
        <Menu
          {...other}
          icon="MoreVert"
          iconScale="small"
          menuItems={cellMenuItems}
          place="CELL"
        />
      </div>
    );
  }
}

CellMenu.propTypes = propTypes;
CellMenu.defaultProps = defaultProps;

export default CellMenu;
