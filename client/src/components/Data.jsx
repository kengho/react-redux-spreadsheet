import domready from 'domready';
import PropTypes from 'prop-types';
import React from 'react';
import TextareaAutosize from '@kengho/react-textarea-autosize';

import { arePropsEqual } from '../core';
import cssToNumber from '../lib/cssToNumber';
import numberToCss from '../lib/numberToCss';
import findKeyAction from '../lib/findKeyAction';

const propTypes = {
  actions: PropTypes.object.isRequired,
  cellId: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isOnClipboard: PropTypes.bool.isRequired,
  isPointed: PropTypes.bool.isRequired,
  isSelectingOnFocus: PropTypes.bool.isRequired,
  pointer: PropTypes.object.isRequired,
  value: PropTypes.string,
};

const defaultProps = {
  value: '',
};

class Data extends React.Component {
  constructor(props) {
    super(props);

    this.clickHandler = this.clickHandler.bind(this);
    this.doubleClickHandler = this.doubleClickHandler.bind(this);
    this.keyDownHandler = this.keyDownHandler.bind(this);
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

  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;

    return !arePropsEqual(currentProps, nextProps, [
      'value',
      'isEditing',
      'isPointed',
      'isSelectingOnFocus',
      'isOnClipboard',
    ]);
  }

  clickHandler(evt, cellId) {
    // FIXME: doesn't work.
    // // Prevents firing documentClickHandler().
    // evt.nativeEvent.stopImmediatePropagation();

    this.props.actions.tableSetPointer({ cellId, modifiers: {} });
  }

  doubleClickHandler(evt, cellId) {
    if (this.props.pointer.modifiers.edit === true) {
      return;
    }

    this.props.actions.tableSetPointer({ cellId, modifiers: { edit: true } });
  }

  onFocusHandler(evt, isSelectingOnFocus) {
    if (isSelectingOnFocus) {
      evt.target.select();
    } else {
      evt.target.selectionEnd = evt.target.value.length;
      evt.target.selectionStart = evt.target.selectionEnd;
    }
  }

  onHeightChangeHandler(textareaInputEl) {
    const heightNumber = cssToNumber(textareaInputEl.style.height);
    textareaInputEl.style.height = numberToCss(heightNumber + 1);
  }

  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler().
    evt.nativeEvent.stopImmediatePropagation();

    const movePointer = (tableMovePointerKey) => {
      // Prevents pressing key immediately after changing pointer.
      evt.preventDefault();
      this.props.actions.tableMovePointer(tableMovePointerKey);
    };

    const action = findKeyAction(evt, [
      {
        key: 'Enter',
        action: () => movePointer('ArrowDown'),
      },
      {
        key: 'Enter',
        shiftKey: true,
        action: () => movePointer('ArrowUp'),
      },
      {
        key: 'Enter',
        ctrlKey: true,
        action: () => {
          // HACK: adds new line to textarea and forces it to update it's size.
          // Some code from:
          // http://stackoverflow.com/a/11077016/6376451
          const textarea = evt.target;
          const textToInsert = '\n';
          if (textarea.selectionStart || textarea.selectionStart === 0) {
            const startPos = textarea.selectionStart;
            const endPos = textarea.selectionEnd;
            const textBeforeCursor = textarea.value.substring(0, startPos);
            const textAfterCursor = textarea.value.substring(endPos, textarea.value.length);
            textarea.value = `${textBeforeCursor}${textToInsert}${textAfterCursor}`;

            // Update cursor.
            textarea.selectionStart = startPos + textToInsert.length;
            textarea.selectionEnd = endPos + textToInsert.length;
          } else {
            textarea.value += textToInsert;
          }

          this.textarea._onChange(); // eslint-disable-line no-underscore-dangle
        },
      },
      {
        key: 'Tab',
        action: () => movePointer('ArrowRight'),
      },
      {
        key: 'Tab',
        shiftKey: true,
        action: () =>  movePointer('ArrowLeft'),
      },
      {
        key: 'Escape',
        action: () => {
          this.textareaInputEl.value = this.props.value;
          this.props.actions.tableSetPointer({ modifiers: {} });
        },
      },
    ]);

    action();
  }

  render() {
    const {
      actions,
      cellId,
      isEditing,
      isOnClipboard,
      isPointed,
      isSelectingOnFocus,
      value,
     } = this.props;
    const disabled = !isEditing;

    const textareaWrapperClassnames = ['data'];
    if (isPointed) { textareaWrapperClassnames.push('pointed'); }
    if (isEditing) { textareaWrapperClassnames.push('editing'); }
    if (isOnClipboard) { textareaWrapperClassnames.push('clipboard'); }

    let textareaOutput;
    if (value || isEditing) {
      // HACK: key uptates textarea after changing some props.
      //   Also it allows autoFocus to work.
      //   http://stackoverflow.com/a/41717743/6376451
      // HACK: onHeightChange() is workaround for Chromium Linux zoom scrollbar issue.
      //   https://github.com/andreypopp/react-textarea-autosize/issues/147
      // onWidthChange={this.alignComplements}
      textareaOutput = (
        <TextareaAutosize
          autoFocus={isEditing}
          autosizeWidth
          className="textarea"
          defaultValue={value}
          disabled={disabled}
          inputRef={(c) => { this.textareaInputEl = c; }}
          key={JSON.stringify({ cellId, value, isPointed, isEditing, isSelectingOnFocus })}
          maxWidth="512px"
          onFocus={(evt) => this.onFocusHandler(evt, isSelectingOnFocus)}
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
        id={cellId}
        onClick={disabled && ((evt) => this.clickHandler(evt, cellId))}
        onDoubleClick={(evt) => this.doubleClickHandler(evt, cellId)}
        onMouseOver={() => { actions.tableSetHover(cellId); }}
      >
        {textareaOutput}
      </div>
    );
  }
}

Data.propTypes = propTypes;
Data.defaultProps = defaultProps;

export default Data;
