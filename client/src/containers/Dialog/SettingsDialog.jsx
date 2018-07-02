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

import './Dialog.css';
import { initialSettings } from '../../core';

const propTypes = {
  actions: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
};

const SWITCH = 'SWITCH';
const STRING = 'STRING';

class SettingsDialog extends React.PureComponent {
  constructor(props) {
    super(props);

    this.settingsMap = [
      {
        label: 'Spreadsheet name',
        param: 'spreadsheetName',
        type: STRING,
        value: props.settings.get('spreadsheetName'),
      },
      {
        // TODO: "clear all history" button if false.
        label: 'Automatically save cells\' history',
        param: 'autoSaveHistory',
        type: SWITCH,
        value: props.settings.get('autoSaveHistory'),
      },
      {
        label: 'Table has header',
        param: 'tableHasHeader',
        type: SWITCH,
        value: props.settings.get('tableHasHeader'),
      },
    ];

    const initialSettings = {};
    this.settingsMap.forEach((item) => initialSettings[item.param] = item.value);
    this.state = {
      settings: initialSettings,
    };
  }

  render() {
    const actions = this.props.actions;

    const boolRenderMap = { true: 'on', false: 'off' };

    // TODO: reset to defaults button.
    return (
      <React.Fragment>
        <MaterialDialogTitle>
          Settings
        </MaterialDialogTitle>
        <MaterialDialogContent>
          <FormGroup>
            {this.settingsMap.map((item) => {
              switch (item.type) {
                case SWITCH: {
                  const defaulValue = boolRenderMap[initialSettings.get(item.param)];
                  const label = (
                    <React.Fragment>
                      <span>{item.label}</span>
                      <span className="dialog-settings-default-value">{`(default: ${defaulValue})`}</span>
                    </React.Fragment>
                  );

                  return (
                    <FormControlLabel
                      key={item.param}
                      control={
                        <Switch
                          checked={this.state.settings[item.param]}
                          onChange={(evt, value) => this.setState(
                            (prevState) => ({
                              settings: {
                                ...prevState.settings,
                                [item.param]: value,
                              }
                            })
                          )}
                          color="primary"
                        />
                      }
                      label={label}
                    />
                  );
                }

                case STRING: {
                  // TODO: PERF: fix lag when user types fast.
                  //   Possible approach: save settings on close or using throttle.
                  return (
                    <TextField
                      helperText={`(default: ${initialSettings.get(item.param)})`}
                      key={item.param}
                      label={item.label}
                      margin="dense"
                      onChange={(evt) => {
                        // NOTE: this is required.
                        //   https://stackoverflow.com/a/48075517/6376451
                        const value = evt.target.value;

                        this.setState(
                          (prevState) => ({
                            settings: {
                              ...prevState.settings,
                              [item.param]: value,
                            }
                          })
                        )
                      }}
                      value={this.state.settings[item.param]}
                    />
                  );
                }

                default:
                  return '';
              }
            })}
          </FormGroup>
        </MaterialDialogContent>
        <MaterialDialogActions>
          <Button onClick={() => actions.closeDialog()}>
            Cancel
          </Button>
          <Button
            variant="raised"
            color="primary"
            onClick={() => {
              actions.setSettings(this.state.settings);
              actions.closeDialog();
            }}
          >
            OK
          </Button>
        </MaterialDialogActions>
      </React.Fragment>
    );
  }
}

SettingsDialog.propTypes = propTypes;

export default SettingsDialog;
