import {
  DialogActions as MaterialDialogActions,
  DialogContent as MaterialDialogContent,
  DialogTitle as MaterialDialogTitle,
} from 'material-ui/Dialog';
import { FormControlLabel, FormGroup } from 'material-ui/Form';
import Button from 'material-ui/Button';
import PropTypes from 'prop-types';
import React from 'react';
import Switch from 'material-ui/Switch';

import './SettingsDialog.css';
import { initialSettings } from '../../core';

const propTypes = {
  actions: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
};

class SettingsDialog extends React.PureComponent {
  render() {
    const {
      actions,
      settings,
    } = this.props;

    const SWITCH = 'SWITCH';

    const settingsMap = [
      { group: 'General' },
      {
        // TODO: 'clear all history' button if false.
        param: 'autoSaveHistory',
        type: SWITCH,
        checked: settings.get('autoSaveHistory'),
        label: 'Automatically save cells\' history',
      },
      {
        param: 'tableHasHeader',
        type: SWITCH,
        checked: settings.get('tableHasHeader'),
        label: 'Table has header',
      },
    ];

    const boolRenderMap = { true: 'on', false: 'off' };

    // TODO: reset to defaults button.
    return ([
      <MaterialDialogTitle key="dialog-title">
        Settings
      </MaterialDialogTitle>,
      <MaterialDialogContent key="dialog-content">
        <FormGroup>
          {settingsMap.map((item) => {
            if (item.group) {
              return <span key={item.group}>{item.group}</span>;
            }

            if (item.param && item.type === SWITCH) {
              const defaulValue = boolRenderMap[initialSettings[item.param]];
              const label = [
                <span key="label-main">
                  {item.label}
                </span>,
                <span key="label-default-value" className="settings-default-value">
                  {`(default: ${defaulValue})`}
                </span>
              ];

              return (
                <FormControlLabel
                  key={item.param}
                  control={
                    <Switch
                      checked={item.checked}
                      onChange={(evt, checked) => actions.setSettingsParam(item.param, checked)}
                    />
                  }
                  label={label}
                />
              );
            }

            return '';
          })}
        </FormGroup>
      </MaterialDialogContent>,
      <MaterialDialogActions key="dialog-actions" className="dialog-buttons">
        <Button
          onClick={() => actions.closeUi()}
        >
          Close
        </Button>
      </MaterialDialogActions>,
    ]);
  }
}

SettingsDialog.propTypes = propTypes;

export default SettingsDialog;
