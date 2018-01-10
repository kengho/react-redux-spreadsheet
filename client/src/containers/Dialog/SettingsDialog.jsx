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
import TextField from 'material-ui/TextField';

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
    const STRING = 'STRING';

    const settingsMap = [
      // { group: 'General' },
      {
        label: 'Spreadsheet name',
        param: 'spreadsheetName',
        type: STRING,
        value: settings.get('spreadsheetName'),
      },
      {
        // TODO: 'clear all history' button if false.
        label: 'Automatically save cells\' history',
        param: 'autoSaveHistory',
        type: SWITCH,
        value: settings.get('autoSaveHistory'),
      },
      {
        label: 'Table has header',
        param: 'tableHasHeader',
        type: SWITCH,
        value: settings.get('tableHasHeader'),
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
            // if (item.group) {
            //   return <span key={item.group}>{item.group}</span>;
            // }

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
                      checked={item.value}
                      onChange={(evt, value) => actions.setSettingsParam(item.param, value)}
                    />
                  }
                  label={label}
                />
              );
            }

            if (item.param && item.type === STRING) {
              return (
                <TextField
                  helperText={`(default: ${initialSettings[item.param]})`}
                  key={item.param}
                  label={item.label}
                  margin="dense"
                  onChange={(evt) => actions.setSettingsParam(item.param, evt.target.value)}
                  value={item.value}
                />
              );
            }

            return '';
          })}
        </FormGroup>
      </MaterialDialogContent>,
      <MaterialDialogActions key="dialog-actions" className="dialog-buttons">
        <Button onClick={() => actions.closeUi()}>
          Close
        </Button>
      </MaterialDialogActions>,
    ]);
  }
}

SettingsDialog.propTypes = propTypes;

export default SettingsDialog;
