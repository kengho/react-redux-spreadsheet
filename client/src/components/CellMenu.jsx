import PropTypes from 'prop-types';
import React from 'react';

import './CellMenu.css';
import Menu from './Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  historyVisibility: PropTypes.bool.isRequired,
  historyAvailability: PropTypes.bool.isRequired,
};

const defaultProps = {
};

class CellMenu extends React.PureComponent {
  render() {
    // Extracting props.
    const {
      value,
      historyVisibility,
      historyAvailability,
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
        action: () => actions.closeUi(),
        label: 'Hide history',
      });
    } else {
      cellMenuItems.push({
        action: () => actions.openUi('HISTORY', { cellId }),
        label: 'View history...',
        disabled: !historyAvailability,
      });
    }
    cellMenuItems.push({
      action: () => actions.tableDeleteProp(cellId, 'value'),
      label: 'Clear',
      disabled: (value === ''),
    });

    return (
      <div className="cell-menu">
        <Menu
          icon="MoreVert"
          iconScale="small"
          menuItems={cellMenuItems}
          place="CELL"
          {...other}
        />
      </div>
    );
  }
}

CellMenu.propTypes = propTypes;
CellMenu.defaultProps = defaultProps;

export default CellMenu;
