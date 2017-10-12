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
      cellId,
      cellValue,
      historyVisibility,
      isHistoryAvailable,
      ...other,
    } = this.props;

    const cellMenuItems = [];
    if (historyVisibility) {
      cellMenuItems.push({
        action: () => actions.uiClose('history', cellId),
        icon: 'History',
        label: 'Hide history',
      });
    } else {
      cellMenuItems.push({
        action: () => actions.uiOpen('history',cellId),
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
        icon="MoreVert"
        iconScale="small"
        menuItems={cellMenuItems}
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
