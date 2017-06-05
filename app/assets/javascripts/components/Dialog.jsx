import dialogPolyfill from 'dialog-polyfill';
import PropTypes from 'prop-types';
import React from 'react';

import { arePropsEqual } from '../core';
import activateDialogButton from '../lib/activateDialogButton';

const propTypes = {
  variant: PropTypes.string,
};

const defaultProps = {
  variant: 'CONFIRM',
};

class Dialog extends React.Component {
  constructor(props) {
    super(props);

    this.keyDownHandler = (evt) => {
      // Prevents firing documentKeyDownHandler().
      evt.nativeEvent.stopImmediatePropagation();

      switch (evt.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
          activateDialogButton(this.dialog, evt.key);
          break;
        default:
      }
    };
  }

  componentDidMount() {
    if (!this.dialog.showModal) {
      dialogPolyfill.registerDialog(this.dialog);
    }
  }

  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, ['variant']);
  }

  render() {
    const { variant } = this.props;

    let buttonsMap;
    let title;
    let content;
    switch (variant) {
      case 'CONFIRM': {
        buttonsMap = [
          {
            idSuffix: 'yes',
            label: 'Yes',
          },
          {
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
      default:
    }

    const outputButtons = [];
    buttonsMap.forEach((buttonMap) => {
      outputButtons.push(
        // id uses in lib/confirmAction.js
        <button
          className="mdl-button"
          id={`dialog-button--${buttonMap.idSuffix}`}
          key={`dialog-button--${buttonMap.idSuffix}`}
          onClick={(evt) => evt.target.parentNode.parentNode.close()}
          type="button"
        >
          {buttonMap.label}
        </button>
      );
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
