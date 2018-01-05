import FileSaver from 'file-saver';
import IconButton from 'material-ui/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import SyncProblem from 'material-ui-icons/SyncProblem';

import './TableMenu.css';
import { convert } from '../core';
import * as convertFormats from '../convertFormats';
import datetime from '../lib/datetime';
import Menu from './Menu/Menu';
import SpreadsheetCreator from './SpreadsheetCreator';

const propTypes = {
  actions: PropTypes.object.isRequired,
  canRedo: PropTypes.bool.isRequired,
  canUndo: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  newSpreadsheetButtonIsDisabled: PropTypes.bool,
  newSpreadsheetPath: PropTypes.string,
  requestsQueueLength: PropTypes.number.isRequired,
  settings: PropTypes.object.isRequired,
  shortId: PropTypes.string.isRequired,
};

const defaultProps = {
  newSpreadsheetButtonIsDisabled: false,
  newSpreadsheetPath: '',
};

class TableMenu extends React.PureComponent {
  exportTo(outputFormat) {
    const {
      data,
      settings,
      shortId,
    } = this.props;

    const formattedDate = datetime();

    const convertedData = convert({ data, settings, outputFormat });

    const blob = new Blob([convertedData], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `${formattedDate} ${shortId}.${outputFormat.toLowerCase()}`);
  }

  render() {
    // Extracting props.
    const {
      canRedo,
      canUndo,
      newSpreadsheetButtonIsDisabled,
      newSpreadsheetPath,
      requestsQueueLength,
      ...other,
    } = this.props;

    // Non-extracting props (should be passed to children as well).
    const {
      actions, // uses in Menu
    } = this.props;

    let output;

    // TODO: this check shouldn't be here.
    //   Components should be distinguished before this component renders.
    if (requestsQueueLength > 0) {
      // TODO: return tooltip.
      //   tooltip="Data sync error. Please don't close tab until data is saved"
      //   NOTE: Use wrapper to solve issue with disabled button.
      //     https://github.com/angular-ui/bootstrap/issues/1025
      output = (
        <IconButton disabled>
          <SyncProblem size={24} />
        </IconButton>
      );
    } else {
      let newSpreadsheetLink;
      if (newSpreadsheetPath) {
        newSpreadsheetLink = (
          <a
            href={newSpreadsheetPath}
            target="_blank"
            onClick={() => {
              actions.disableNewSpreadsheetButton(false);
              actions.setNewSpreadsheetPath(null);
            }}
          >
            Open in new tab
          </a>
        );
      }

      const tableMenuItems = [
        {
          // key for MenuItem in Menu.
          component: (
            // TODO: recaptcha files reloading on every single table menu click now.
            <SpreadsheetCreator
              actions={actions}
              beforeRecaptchaExecute={() => actions.disableNewSpreadsheetButton(true)}
              disabled={newSpreadsheetButtonIsDisabled}
              key="New"
              openInNewTab={true}
              recaptchaSitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
            >
              <div className="new-spreadsheet-item">
                {newSpreadsheetPath ? newSpreadsheetLink : 'New'}
              </div>
            </SpreadsheetCreator>
          ),
        },
        // TODO: nested menu.
        //   https://github.com/callemall/material-ui/issues/8152
        {
          action: () => this.exportTo(convertFormats.CSV),
          label: 'Export to CSV',
        },
        {
          action: () => this.exportTo(convertFormats.JSON),
          label: 'Export to JSON',
        },
        {
          dialogDisableYesButton: true,
          dialogVariant: 'IMPORT',
          label: 'Import from file...',
        },
        {
          action: () => actions.undo(),
          label: 'Undo (Ctrl+Z)',
          disabled: !canUndo,
        },
        {
          action: () => actions.redo(),
          label: 'Redo (Ctrl+Y)',
          disabled: !canRedo,
        },
        {
          dialogVariant: 'SETTINGS',
          label: 'Settings...',
        },
        {
          dialogVariant: 'INFO',
          label: 'Help...',
        },
        {
          dialogVariant: 'DESTROY_SPREADSHEET',
          label: 'Delete...',
        },
      ];

      output = (
        <Menu
          icon="Menu"
          menuItems={tableMenuItems}
          place="TABLE"
          {...other}
        />
      );
    }

    return (
      <div className="table-menu">
        {output}
      </div>
    );
  }
}

TableMenu.propTypes = propTypes;
TableMenu.defaultProps = defaultProps;

export default TableMenu;
