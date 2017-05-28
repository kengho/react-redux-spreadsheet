import React from 'react';

import activateDialogButton from '../lib/activateDialogButton';

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

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const buttonsMap = [
      {
        idPostfix: 'yes',
        label: 'Yes',
      },
      {
        idPostfix: 'no',
        label: 'No, go back',
      },
    ];

    const outputButtons = [];
    buttonsMap.forEach((buttonMap) => {
      outputButtons.push(
        // id uses in lib/confirmAction.js
        <button
          className="mdl-button"
          id={`dialog-button--${buttonMap.idPostfix}`}
          key={`dialog-button--${buttonMap.idPostfix}`}
          onClick={(evt) => evt.target.parentNode.parentNode.close()}
          type="button"
        >
          {buttonMap.label}
        </button>
      );
    });

    return (
      <dialog
        className="mdl-dialog"
        onKeyDown={(evt) => this.keyDownHandler(evt)}
        ref={(c) => { this.dialog = c; }}
      >
        <h4 className="mdl-dialog__title">Confirm action</h4>
        <div className="mdl-dialog__content">
          <p>Are you sure?</p>
        </div>
        <div className="mdl-dialog__actions">
          {outputButtons}
        </div>
      </dialog>
    );
  }
}

export default Dialog;
