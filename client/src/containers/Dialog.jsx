import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Button from 'material-ui/Button';
import MaterialDialog, {
  DialogActions as MaterialDialogActions,
  DialogContent as MaterialDialogContent,
  DialogTitle as MaterialDialogTitle,
} from 'material-ui/Dialog';
import React from 'react';
import List, { ListItem, ListItemText } from 'material-ui/List';

import './Dialog.css';
import { arePropsEqual } from '../core';
import { convert } from '../core';
import { setTableFromJSON } from '../actions/table';
import * as UiActions from '../actions/ui';
import getDOM from '../lib/getDOM';

const mapStateToProps = (state) => {
  let errors = state.getIn(['ui', 'dialog', 'errors']);
  if (errors) {
    errors = errors.toJS();
  }

  return {
    disableYesButton: state.getIn(['ui', 'dialog', 'disableYesButton']),
    errors,
    variant: state.getIn(['ui', 'dialog', 'variant']),
    open: state.getIn(['ui', 'dialog', 'open']),
  }
};

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...UiActions,
    }, dispatch),
  },
});

class Dialog extends React.Component {
  constructor(props) {
    super(props);

    this.activateDialogButton = this.activateDialogButton.bind(this);
    this.handleCSVFileImport = this.handleCSVFileImport.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);

    // HACK: we are trying to focus Dialog buttons using hotkeys.
    //   This doesn't work (on Button):
    //   // style={{ keyboardFocused: (buttonMap.type === 'ACTION') }}
    this.buttons = {};
    this.getButtonId = (type) => `dialog-button-${type}`;
    this.getButtonDOM = (type) => getDOM(this.getButtonId(type));
  }

  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, [
      'disableYesButton',
      'errors',
      'variant',
      'open',
    ]);
  }

  componentDidUpdate() {
    ['ACTION', 'CANCEL'].forEach((buttonType) => {
      this.buttons[buttonType] = this.getButtonDOM(buttonType);
    });

    // TODO: make it work (now it works only after Alt+Tab; setTimeout doesn't help.)
    this.activateDialogButton('ArrowLeft');
  }

  activateDialogButton(key) {
    // Makes no sense if there are one or less buttons ('INFO' dialog e.g.).
    if (!(this.buttons['CANCEL'] && this.buttons['ACTION'])) {
      return;
    }

    let nextActiveButton;
    if (key === 'ArrowLeft') {
      nextActiveButton = this.buttons['CANCEL'];
    } else if (key === 'ArrowRight') {
      nextActiveButton = this.buttons['ACTION'];
    }

    nextActiveButton.focus();
  }

  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler().
    evt.nativeEvent.stopImmediatePropagation();

    switch (evt.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
      this.activateDialogButton(evt.key);
      break;
      case 'Escape':
      this.props.actions.closeDialog();
      break;
      default:
    }
  }

  handleCSVFileImport(evt) {
    // TODO: drag-and-drop.
    const input = evt.target;
    const reader = new FileReader();

    reader.onload = (file) => {
      const csv = reader.result;
      const tableData = convert(csv, { inputFormat: 'csv', outputFormat: 'object' });

      this.fileFakeInput.value = input.files[0].name;

      const importAction = setTableFromJSON(JSON.stringify({ data: tableData.data }), true);
      this.props.actions.setDialog({
        action: importAction,
        disableYesButton: false,
        errors: tableData.errors,
        variant: 'IMPORT',
        open: true,
      });

      // Fixind error
      // "Failed to execute 'readAsText' on 'FileReader': parameter 1 is not of type 'Blob'."
      input.value = null;
    };

    reader.readAsText(input.files[0]);
  }

  render() {
    const {
      actions,
      disableYesButton,
      errors,
      variant,
      open,
    } = this.props;

    let buttonsMap;
    let title;
    let content;
    switch (variant) {
      case 'CONFIRM': {
        buttonsMap = [
          {
            action: () => actions.closeDialog(),
            type: 'CANCEL',
            label: 'No, go back',
          },
          {
            action: () => {
              actions.dispatchDialogAction();
              actions.closeDialog();
            },
            disabled: disableYesButton,
            type: 'ACTION',
            label: 'Yes',
          },
        ];
        title = 'Confirm action';
        content = 'Are you sure?';
        break;
      }

      case 'INFO': {
        buttonsMap = [{
          action: () => {
            actions.dispatchDialogAction();
            actions.closeDialog();
          },
          disabled: disableYesButton,
          type: 'ACTION',
          label: 'OK',
        }];
        title = 'Help';

        const hotkeysMap = [
          ['Ctrl+Z', 'undo'],
          ['Ctrl+Y', 'redo'],
          ['Ctrl+X', 'cut'],
          ['Ctrl+C', 'copy'],
          ['Ctrl+V', 'paste'],
          ['Enter / Shift+Enter', 'save and move cursor down/up'],
          ['Tab / Tab+Enter', 'save and move cursor to the right/left'],
          ['Escape or Backspace', 'delete cell\'s value'],
          ['Arrow keys, Home, End, PgUp, PgDn', 'move cursor'],
          ['Ctrl+Enter (while editing)', 'insert new line'],
        ];

        content = (
          <div className="info">
            <List>
              {hotkeysMap.map(hotkeyMap =>
                <ListItem key={hotkeyMap[0]}>
                  <ListItemText
                    primary={hotkeyMap[0]}
                    secondary={hotkeyMap[1]}
                  />
                </ListItem>
              )}
            </List>
          </div>
        );

        break;
      }

      case 'IMPORT': {
        buttonsMap = [
          {
            action: () => {
              actions.closeDialog();
              this.fileFakeInput.value = '';
            },
            type: 'CANCEL',
            label: 'Cancel',
          },
          {
            action: () => {
              actions.dispatchDialogAction();
              actions.closeDialog();
            },
            disabled: disableYesButton,
            type: 'ACTION',
            label: 'Import',
          },
        ];
        title = 'Select CSV file';

        content = (
          <div className="dialog-import">
            <input
              accept="csv,CSV"
              id="file"
              onChange={this.handleCSVFileImport}
              type="file"
            />
            <label htmlFor="file">
              <Button
                color="primary"
                raised
                component="span"
              >
                Choose file
              </Button>
            </label>
            <input
              className="fake-input"
              disabled
              ref={(c) => { this.fileFakeInput = c; }}
            />
          </div>
        );
        break;
      }

      default:
    }

    let outputErrors;
    if (errors) {
      outputErrors = errors.map((error) =>
        <li key={error.code}>{error.message}</li>
      );
    }
    outputErrors = <ul>{outputErrors}</ul>;

    return (
      <MaterialDialog
        className="dialog"
        onKeyDown={this.keyDownHandler}
        onRequestClose={actions.closeDialog}
        open={open}
      >
        <MaterialDialogTitle>
          {title}
        </MaterialDialogTitle>
        <MaterialDialogContent>
          {content}
          {errors && errors.length > 0 &&
            <div className="dialog-errors">
              {outputErrors}
            </div>
          }
        </MaterialDialogContent>
        <MaterialDialogActions className="dialog-buttons">
          {buttonsMap && buttonsMap.map(buttonMap =>
            <Button
              disabled={buttonMap.disabled}
              id={`${this.getButtonId(buttonMap.type)}`}
              key={buttonMap.label}
              onClick={buttonMap.action}
            >
              {buttonMap.label}
            </Button>
          )}
        </MaterialDialogActions>
      </MaterialDialog>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dialog);
