import domready from 'domready';
import PropTypes from 'prop-types';
import React from 'react';

import { arePropsEqual } from '../../core';
import findKeyAction from '../../lib/findKeyAction';

// TODO: create own package or pull request to existing.
import TextareaAutosize from '../../lib/react-textarea-autosize/TextareaAutosize';
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
    // Save currently editing Cell's data if needed.
    // REVIEW: this is probably not React-way.
    //   But pointer shouldn't contain nor React element or DOM ref.
    //   http://web.archive.org/web/20150419023006/http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html
    //   (What Shouldn’t Go in State?)
    //   For this to work there are 'id' props added to div,
    //   because not every pointer movement updates DataRow and thus DataCell.
    //   So, how to get currently editing Cell's data right?
    //   Also, classname in DataCell should be synced with this selector.
    const editingCell = document.querySelector('.editing'); // eslint-disable-line no-undef
    if (editingCell) {
      const editingTextarea = editingCell.querySelector('textarea');
      const previousValue = this.props.value;
      const nextValue = editingTextarea.value;

      if (nextValue !== previousValue) {
        this.props.actions.setProp(editingCell.id, 'value', nextValue);
      }
    }

    // TODO: store pointer coordinates in URL and scroll to pointer on load.
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

  keyDownHandler(evt) {
    // Prevents firing documentKeyDownHandler().
    evt.nativeEvent.stopImmediatePropagation();

    const movePointerAndSaveValueIfNeeded = (movePointerKey) => {
      // Prevents pressing key immediately after changing pointer.
      evt.preventDefault();

      // REVIEW: double render and sending request here.
      if (this.textarea.value !== this.props.value) {
        this.props.actions.setProp(this.props.id, 'value', this.textarea.value);
      }
      this.props.actions.movePointer(movePointerKey);
    };

    const action = findKeyAction(evt, [
      {
        key: 'Enter',
        action: () => movePointerAndSaveValueIfNeeded('ArrowDown'),
      },
      {
        key: 'Enter',
        shiftKey: true,
        action: () => movePointerAndSaveValueIfNeeded('ArrowUp'),
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
        action: () => movePointerAndSaveValueIfNeeded('ArrowRight'),
      },
      {
        key: 'Tab',
        shiftKey: true,
        action: () =>  movePointerAndSaveValueIfNeeded('ArrowLeft'),
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
          onHeightChange={() => {
            const heightPx = this.textareaInput.style.height;
            const height = Number(heightPx.slice(0, -'px'.length));
            this.textareaInput.style.height = `${height + 1}px`;
          }}
          ref={(c) => { this.textarea = c; }}
        />
    );
    } else {
      // '22px' is TextareaAutosize's (above) height with empty value.
      // TODO: find a way to calculate this value (create one invisible TextareaAutosize somewhere?).
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
        onKeyDown={(evt) => this.keyDownHandler(evt)}
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
