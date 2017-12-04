import domready from 'domready';
import PropTypes from 'prop-types';
import React from 'react';
import TextareaAutosize from '@kengho/react-textarea-autosize';

import './Data.css';
import cssToNumber from '../lib/cssToNumber';
import findKeyAction from '../lib/findKeyAction';
import insertText from '../lib/insertText';
import numberToCss from '../lib/numberToCss';

// TODO: consider conditional require.
import { getDataWrapperTestKey } from './../testHelpers';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isOnClipboard: PropTypes.bool.isRequired,
  isPointed: PropTypes.bool.isRequired,
  isSelectingOnFocus: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
};

const defaultProps = {
};

class Data extends React.PureComponent {
  constructor(props) {
    super(props);

    this.clickHandler = this.clickHandler.bind(this);
    this.doubleClickHandler = this.doubleClickHandler.bind(this);
    this.onFocusHandler = this.onFocusHandler.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
    this.onChangeHandler = this.onChangeHandler.bind(this);
  }

  componentDidMount() {
    // HACK: updates textarea on mount.
    //   (Doesn't work all the times without domready.)
    //   http://stackoverflow.com/a/31373835/6376451
    domready(() => {
      if (this.textarea) {
        this.textarea._onChange(); // eslint-disable-line no-underscore-dangle
      }
    });
  }

  clickHandler(evt) {
    // Prevents firing documentClickHandler().
    evt.nativeEvent.stopImmediatePropagation();

    if (this.props.isEditing) {
      return;
    }

    // Letting user to select disabled cell's value.
    // Doesn't work in firefox (https://bugzilla.mozilla.org/show_bug.cgi?id=195361).
    // "readonly" breaks hotkeyes.
    // TODO: make workaround for firefox.
    //   Approaches:
    //   1. div for unediting cell
    //   Issue: it is unreal to sync view of autowized textarea and div.
    const cursorStart = this.textareaInputEl.selectionStart;
    const cursorEnd = this.textareaInputEl.selectionEnd;
    if (cursorEnd !== cursorStart) {
      return;
    }

    this.props.actions.saveEditingCellValueIfNeeded();
    this.props.actions.setPointer({ cellId: this.props.cellId, modifiers: {} });
  }

  doubleClickHandler(evt) {
    if (this.props.isEditing) {
      return;
    }

    // TODO: should set correct cursor position.
    //   This approach:
    //   https://stackoverflow.com/a/17966995
    //   with
    //   // range = window.getSelection().getRangeAt(0),
    //   allows to do it when you click on active textrea (duh),
    //   but we have disabled.
    //
    //   Re-dispatching event also doesn't seems to work:
    //   // const newEvent = new MouseEvent('click', { ...evt.nativeEvent, bubbles: true });
    //   // evt.target.dispatchEvent(newEvent);
    //
    //   Catching 'mousedown' after 'mouseup' in 400ms interval and changind pointer
    //   even before real doubleclick fired should work, but it seems really hacky and
    //   ignores system doubleclick interval settings.
    this.props.actions.setPointer({ cellId: this.props.cellId, modifiers: { edit: true } });
  }

  onFocusHandler(evt) {
    if (this.props.isSelectingOnFocus) {
      evt.target.select();
    } else {
      // Move cursor to the end.
      evt.target.selectionEnd = evt.target.value.length;
      evt.target.selectionStart = evt.target.selectionEnd;
    }
  }

  onHeightChangeHandler(textareaInputEl) {
    const heightNumber = cssToNumber(textareaInputEl.style.height);
    textareaInputEl.style.height = numberToCss(heightNumber + 1);
  }

  onChangeHandler(evt) {
    if (!evt) {
      return;
    }

    const value = evt.target.value;
    this.props.actions.setCurrentCellValue(value);
  }

  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler().
    evt.nativeEvent.stopImmediatePropagation();

    const setPropIfNeeded = () => {
      const nextValue = this.textareaInputEl.value;
      const previousValue = this.props.value;
      if (nextValue !== previousValue) {
        this.props.actions.setProp(this.props.cellId, 'value', nextValue);
      }
    };

    const setPropIfNeededAndMovePointer = (key) => {
      setPropIfNeeded();
      this.props.actions.movePointer(key);
    };

    const action = findKeyAction(evt, [
      {
        key: 'Enter',
        action: () => setPropIfNeededAndMovePointer('ArrowDown'),
      },
      {
        key: 'Enter',
        shiftKey: true,
        action: () => setPropIfNeededAndMovePointer('ArrowUp'),
      },
      {
        key: 'Enter',
        ctrlKey: true,
        action: () => {
          // Add new line to textarea.
          const textarea = evt.target;
          insertText(textarea, '\n');

          // HACK: force textarea to update it's size.
          this.textarea._onChange(); // eslint-disable-line no-underscore-dangle
        },
      },
      {
        key: 'Tab',
        action: () => setPropIfNeededAndMovePointer('ArrowRight'),
      },
      {
        key: 'Tab',
        shiftKey: true,
        action: () =>  setPropIfNeededAndMovePointer('ArrowLeft'),
      },
      {
        key: 'Escape',
        action: () => {
          const previousValue = this.props.value;
          this.props.actions.setCurrentCellValue(previousValue);
          this.props.actions.setPointer({ modifiers: {} });
        },
      },
    ]);

    if (action) {
      // Prevents pressing key immediately after changing pointer.
      evt.preventDefault();
      action();
    }
  }

  render() {
    const {
      cellId,
      isEditing,
      isOnClipboard,
      isPointed,
      value,
     } = this.props;

    const textareaWrapperClassnames = ['data'];
    if (isPointed) { textareaWrapperClassnames.push('pointed'); }
    if (isEditing) { textareaWrapperClassnames.push('editing'); }
    if (isOnClipboard) { textareaWrapperClassnames.push('clipboard'); }

    let textareaOutput;
    if (value || isEditing) {
      // HACK: key allows autoFocus to work.
      //   http://stackoverflow.com/a/41717743/6376451
      //   WARNING! DON'T DELETE VALUE FROM KEY!
      //   DATACELL WON'T UPGRADE IMMEDIATELY AFTER CTRL+C IF YOU DO THIS!
      // HACK: onHeightChange() is workaround for Chromium Linux zoom scrollbar issue.
      //   https://github.com/andreypopp/react-textarea-autosize/issues/147
      textareaOutput = (
        <TextareaAutosize
          autoFocus={isEditing}
          autosizeWidth
          className="textarea"
          defaultValue={value}
          disabled={!isEditing}
          inputRef={(c) => { this.textareaInputEl = c; }}
          key={JSON.stringify({ value, cellId, isEditing })}
          maxWidth="512px"
          onChange={this.onChangeHandler}
          onFocus={this.onFocusHandler}
          onHeightChange={() => this.onHeightChangeHandler(this.textareaInputEl)}
          onKeyDown={this.keyDownHandler}
          ref={(c) => { this.textarea = c; }}
        />
      );
    } else {
      // '22px' is TextareaAutosize's (above) height with empty value.
      // TODO: find a way to calculate this value.
      //   (Create one invisible TextareaAutosize somewhere?)
      textareaOutput = (
        <textarea
          className="textarea"
          disabled
          style={{ height: '22px', width: '0' }}
          ref={(c) => { this.textareaInputEl = c; }}
        />
      );
    }

    return (
      <div
        className={textareaWrapperClassnames.join(' ')}
        onClick={this.clickHandler}
        onDoubleClick={this.doubleClickHandler}
        test-key={process.env.NODE_ENV === 'test' ? getDataWrapperTestKey(cellId) : undefined}
      >
        {textareaOutput}
      </div>
    );
  }
}

Data.propTypes = propTypes;
Data.defaultProps = defaultProps;

export default Data;
