import domready from 'domready';
import PropTypes from 'prop-types';
import React from 'react';

import { arePropsEqual } from '../../../core';
import findKeyAction from '../../../lib/findKeyAction';

// TODO: create own package or pull request to existing.
import TextareaAutosize from '../../../lib/react-textarea-autosize/TextareaAutosize';
// import TextareaAutosize from 'react-textarea-autosize';

const propTypes = {
  actions: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
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

class DataCell extends React.Component {
  constructor(props) {
    super(props);

    this.textarea = null;
    this.textareaInput = null;

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
    this.props.actions.setPointer({ cellId, modifiers: {} });
  }

  doubleClickHandler(evt, cellId) {
    if (this.props.pointer.modifiers.edit === true) {
      return;
    }

    this.props.actions.setPointer({ cellId, modifiers: { edit: true } });
  }

  onFocusHandler(evt, isSelectingOnFocus) {
    if (isSelectingOnFocus) {
      evt.target.select();
    } else {
      evt.target.selectionEnd = evt.target.value.length;
      evt.target.selectionStart = evt.target.selectionEnd;
    }
  }

  onHeightChangeHandler(textareaInput) {
    const heightPx = textareaInput.style.height;
    const height = Number(heightPx.slice(0, -'px'.length));
    textareaInput.style.height = `${height + 1}px`;
  }

  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler().
    evt.nativeEvent.stopImmediatePropagation();

    const movePointer = (movePointerKey) => {
      // Prevents pressing key immediately after changing pointer.
      evt.preventDefault();
      this.props.actions.movePointer(movePointerKey);
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
        action: () => this.props.actions.setPointerModifiers({}),
      },
    ]);

    action();
  }

  render() {
    const {
      actions,
      id,
      isEditing,
      isOnClipboard,
      isPointed,
      isSelectingOnFocus,
      value,
     } = this.props;
    const disabled = !isEditing;

    const classnames = ['td', 'data'];
    if (isPointed) { classnames.push('pointed'); }
    if (isEditing) { classnames.push('editing'); }
    if (isOnClipboard) { classnames.push('clipboard'); }

    let textareaOutput;
    if (value || isEditing) {
      // HACK: key uptates textarea after changing some props.
      //   Also it allows autoFocus to work.
      //   http://stackoverflow.com/a/41717743/6376451
      // HACK: onHeightChange() is workaround for Chromium Linux zoom scrollbar issue.
      //   https://github.com/andreypopp/react-textarea-autosize/issues/147
      textareaOutput = (
        <TextareaAutosize
          autoFocus={isEditing}
          autosizeWidth
          className="data-textarea"
          defaultValue={value}
          disabled={disabled}
          inputRef={(c) => { this.textareaInput = c; }}
          key={JSON.stringify({ id, value, isPointed, isEditing, isSelectingOnFocus })}
          maxWidth="512px"
          onFocus={(evt) => this.onFocusHandler(evt, isSelectingOnFocus)}
          onHeightChange={() => this.onHeightChangeHandler(this.textareaInput)}
          onKeyDown={(evt) => this.keyDownHandler(evt)}
          ref={(c) => { this.textarea = c; }}
        />
    );
    } else {
      // '22px' is TextareaAutosize's (above) height with empty value.
      // TODO: find a way to calculate this value
      //   (create one invisible TextareaAutosize somewhere?).
      textareaOutput = (
        <textarea
          className="data-textarea"
          disabled
          style={{ height: '22px', width: '0' }}
        />
      );
    }

    return (
      <div
        className={classnames.join(' ')}
        id={id}
        onClick={disabled && ((evt) => this.clickHandler(evt, id))}
        onDoubleClick={(evt) => this.doubleClickHandler(evt, id)}
        onMouseOver={() => { actions.setHover(id); }}
      >
        <div className="data-wrapper">{textareaOutput}</div>
      </div>
    );
  }
}

DataCell.propTypes = propTypes;
DataCell.defaultProps = defaultProps;

export default DataCell;
