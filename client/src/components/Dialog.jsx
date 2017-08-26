import dialogPolyfill from 'dialog-polyfill';
import PropTypes from 'prop-types';
import React from 'react';

import './Dialog.css';
import { arePropsEqual } from '../core';
import { convert } from '../core';
import { setDialog } from '../actions/dialog';
import { setTableFromJSON } from '../actions/table';

const propTypes = {
  actions: PropTypes.object.isRequired,
  disableYesButton: PropTypes.bool,
  errors: PropTypes.array,
  variant: PropTypes.string,
  visibility: PropTypes.bool,
};

const defaultProps = {
  disableYesButton: false,
  errors: [],
  variant: 'CONFIRM',
  visibility: false,
};

class Dialog extends React.Component {
  constructor(props) {
    super(props);

    this.buttons = {};

    this.activateDialogButton = (key) => {
      // Makes no sense if there are one or less buttons ('INFO' dialog e.g.).
      if (!(this.buttons.yes && this.buttons.no)) {
        return;
      }

      let nextActiveButton;
      if (key === 'ArrowLeft') {
        nextActiveButton = this.buttons.no;
      } else if (key === 'ArrowRight') {
        nextActiveButton = this.buttons.yes;
      }

      nextActiveButton.focus();
    };

    // TODO: keyHandler doesn't work after click on document,
    //   and correct focus never returns.
    //   Most notable in IMPORT.
    this.keyDownHandler = (evt) => {
      // Prevents firing documentKeyDownHandler().
      evt.nativeEvent.stopImmediatePropagation();

      switch (evt.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          this.activateDialogButton(evt.key);
          break;
        case 'Escape':
          this.props.actions.setDialogVisibility(false);
          break;
        default:
      }
    };

    this.handleCSVFileImport = this.handleCSVFileImport.bind(this);
  }

  componentDidMount() {
    if (!this.dialog.showModal) {
      dialogPolyfill.registerDialog(this.dialog);
    }

    if (this.fileInputLabel) {
      componentHandler.upgradeElement(this.fileInputLabel); // eslint-disable-line no-undef
    }
  }

  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, [
      'disableYesButton',
      'errors',
      'variant',
      'visibility',
    ]);
  }

  componentDidUpdate() {
    if (this.dialog && !this.dialog.open && this.props.visibility) {
      this.dialog.showModal();
    } else if (this.dialog && this.dialog.open && !this.props.visibility) {
      this.dialog.close();
    }

    if (this.fileInputLabel) {
      componentHandler.upgradeElement(this.fileInputLabel); // eslint-disable-line no-undef
    }
  }

  handleCSVFileImport(evt) {
    const input = evt.target;
    const reader = new FileReader();

    reader.onload = (file) => {
      const csv = reader.result;
      const data = convert(csv, { inputFormat: 'csv', outputFormat: 'object' });

      if (data.errors) {
        this.fileFakeInput.value = '';

        this.props.actions.setDialog({
          disableYesButton: true,
          errors: data.errors,
          variant: 'IMPORT',
          visibility: true,
        });
      } else {
        this.fileFakeInput.value = input.files[0].name;

        const importAction = setTableFromJSON(JSON.stringify({ data }), true);
        this.props.actions.setDialog({
          action: importAction,
          disableYesButton: false,
          variant: 'IMPORT',
          visibility: true,
        });
      }

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
    } = this.props;

    let buttonsMap;
    let title;
    let content;
    switch (variant) {
      case 'CONFIRM': {
        buttonsMap = [
          {
            action: () => {
              actions.dispatchDialogAction();
              actions.setDialogVisibility(false);
            },
            disabled: disableYesButton,
            idSuffix: 'yes',
            label: 'Yes',
          },
          {
            action: () => actions.setDialogVisibility(false),
            idSuffix: 'no',
            label: 'No, go back',
          },
        ];
        title = 'Confirm action';
        content = <p>Are you sure?</p>;
        break;
      }

      case 'INFO': {
        buttonsMap = [{
          action: () => {
            actions.dispatchDialogAction();
            actions.setDialogVisibility(false);
          },
          disabled: disableYesButton,
          idSuffix: 'yes',
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
        const hotkeysOutput = hotkeysMap.map((hotkey) => {
          return (
            <li
              className="mdl-list__item mdl-list__item--two-line"
              key={hotkey[0]}
            >
              <span className="mdl-list__item-primary-content">
                <span>{hotkey[0]}</span>
                <span className="mdl-list__item-sub-title">{hotkey[1]}</span>
              </span>
            </li>
          );
        });

        content = (
          <div className="info">
            <ul className="mdl-list">
              {hotkeysOutput}
            </ul>
          </div>
        );
        break;
      }

      case 'IMPORT': {
        buttonsMap = [
          {
            action: () => {
              actions.dispatchDialogAction();
              actions.setDialogVisibility(false);
            },
            disabled: disableYesButton,
            idSuffix: 'yes',
            label: 'Import',
          },
          {
            action: () => {
              actions.setDialogVisibility(false);
              this.fileFakeInput.value = '';
            },
            idSuffix: 'no',
            label: 'Cancel',
          },
        ];
        title = 'Select CSV file';
        content = (
          <div className="dialog-import">
            <label
              className="mdl-button mdl-js-button mdl-button--raised mdl-button--colored mdl-js-ripple-effect"
              ref={(c) => { this.fileInputLabel = c; }}
            >
              Choose file
              <input
                type='file'
                onChange={this.handleCSVFileImport}
              />
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

    const outputButtons = [];
    buttonsMap.forEach((buttonMap) => {
      outputButtons.push(
        <button
          className="mdl-button"
          disabled={buttonMap.disabled}
          key={`dialog-button--${buttonMap.idSuffix}`}
          onClick={() => buttonMap.action()}
          ref={(c) => { this.buttons[buttonMap.idSuffix] = c; }}
          type="button"
        >
          {buttonMap.label}
        </button>
      );
    });

    const outputErrors = [];
    errors.forEach((error) => {
      outputErrors.push(<li key={error.code}>{error.message}</li>);
    });

    return (
      <div className="dialog">
        <dialog
          className="mdl-dialog"
          onKeyDown={(evt) => this.keyDownHandler(evt)}
          ref={(c) => { this.dialog = c; }}
        >
          <h4 className="mdl-dialog__title">
            {title}
          </h4>
          <div className="mdl-dialog__content">
            {content}
            {errors.length > 0 &&
              <div className="dialog-errors">
                <span>Errors occurred:</span>
                <ul>
                  {outputErrors}
                </ul>
              </div>
            }
          </div>
          <div className="mdl-dialog__actions">
            {outputButtons}
          </div>
        </dialog>
      </div>
    );
  }
}

Dialog.propTypes = propTypes;
Dialog.defaultProps = defaultProps;

export default Dialog;
