import PropTypes from 'prop-types';
import React from 'react';

import './CellMenu.css';
import Menu from './Menu/Menu';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  cellValue: PropTypes.string.isRequired,
  historyVisibility: PropTypes.bool.isRequired,
  isHistoryAvailable: PropTypes.bool.isRequired,
};

const defaultProps = {
};

class CellMenu extends React.PureComponent {
  render() {
    const {
      actions, // uses in both CellMenu and Menu
      cellId, // uses in both CellMenu and Menu
      cellValue,
      historyVisibility,
      isHistoryAvailable,
      ...other,
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
      disabled: (cellValue === ''),
    });

    const output = (
      <Menu
        {...other}
        actions={actions}
        cellId={cellId}
        icon="MoreVert"
        iconScale="small"
        menuItems={cellMenuItems}
        place="CELL"
      />
    );

    return (
      <div className="cell-menu">
        {output}
      </div>
    );
  }
}

CellMenu.propTypes = propTypes;
CellMenu.defaultProps = defaultProps;

export default CellMenu;
