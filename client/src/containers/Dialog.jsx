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
import { convert } from '../core';
import * as RequestsActions from '../actions/requests';
import * as TableActions from '../actions/table';
import * as UiActions from '../actions/ui';

const mapStateToProps = (state) => ({
  disableYesButton: state.getIn(['ui', 'current', 'disableYesButton']),
  errors: state.getIn(['ui', 'current', 'errors']),
  variant: state.getIn(['ui', 'current', 'variant']),
  open: state.getIn(['ui', 'current', 'kind']) === 'DIALOG' &&
    state.getIn(['ui', 'current', 'visibility']),
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    ...bindActionCreators({
      ...RequestsActions, // requestsPush
      ...TableActions, // tableSetFromJSON
      ...UiActions,
    }, dispatch),
  },
});

class Dialog extends React.Component {
  constructor(props) {
    super(props);

    this.handleCSVFileImport = this.handleCSVFileImport.bind(this);

    this.importAction = null;
    // TODO: focus Dialog buttons using hotkeys.
    //   This doesn't work (on Button):
    //   // style={{ keyboardFocused: (buttonMap.type === 'ACTION') }}
    //   'ref' on buttons also returns strange results.
  }

  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler().
    evt.nativeEvent.stopImmediatePropagation();
  }

  onClickHandler(evt) {
    // Prevents firing documentClickHandler().
    evt.nativeEvent.stopImmediatePropagation();
  }

  handleCSVFileImport(evt) {
    // TODO: drag-and-drop.
    const input = evt.target;
    const reader = new FileReader();

    reader.onload = (file) => {
      const csv = reader.result;
      const tableData = convert(csv, { inputFormat: 'csv', outputFormat: 'object' });

      const fileName = input.files[0].name
      this.fileFakeInput.value = fileName;
      this.fileFakeInput.title = fileName;

      this.importAction = () => {
        this.props.actions.tableSetFromJSON(
          JSON.stringify({ data: tableData.data }), true
        );
      };

      this.props.actions.uiOpen('DIALOG', {
        disableYesButton: false,
        errors: tableData.errors,
        variant: 'IMPORT_FROM_CSV',
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
      open,
      variant,
    } = this.props;

    let buttonsMap;
    let title;
    let content;
    switch (variant) {
      case 'DESTROY_SPREADSHEET': {
        buttonsMap = [
          {
            action: () => actions.uiClose(),
            type: 'CANCEL',
            label: 'No, go back',
          },
          {
            action: () => {
              actions.requestsPush('DELETE', 'destroy');
              actions.uiClose();
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
            actions.uiClose();
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

      case 'IMPORT_FROM_CSV': {
        buttonsMap = [
          {
            action: () => {
              actions.uiClose();
              this.fileFakeInput.value = '';
            },
            type: 'CANCEL',
            label: 'Cancel',
          },
          {
            action: () => {
              // NOTE: importAction should be not null if we press yes button,
              //   because otherwise yes button would be inactive.
              //   See handleCSVFileImport().
              this.importAction();
              actions.uiClose();
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
        <li key={error.get('code')}>{error.get('message')}</li>
      );
    }
    outputErrors = <ul>{outputErrors}</ul>;

    return (
      <MaterialDialog
        className="dialog"
        onClick={this.onClickHandler}
        onKeyDown={this.keyDownHandler}
        onRequestClose={actions.uiClose}
        open={open}
      >
        <MaterialDialogTitle>
          {title}
        </MaterialDialogTitle>
        <MaterialDialogContent>
          {content}
          {errors && errors.size > 0 &&
            <div className="dialog-errors">
              {outputErrors}
            </div>
          }
        </MaterialDialogContent>
        <MaterialDialogActions className="dialog-buttons">
          {buttonsMap && buttonsMap.map(buttonMap =>
            <Button
              disabled={buttonMap.disabled}
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
