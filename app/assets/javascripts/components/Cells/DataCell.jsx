import domready from 'domready';
import PropTypes from 'prop-types';
import React from 'react';

import { arePropsEqual } from '../../core';

// TODO: create own package or pull request to existing.
import TextareaAutosize from '../../lib/react-textarea-autosize/TextareaAutosize';
// import TextareaAutosize from 'react-textarea-autosize';

const propTypes = {
  actions: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isPointed: PropTypes.bool.isRequired,
  pointer: PropTypes.object.isRequired,
  isSelectingOnFocus: PropTypes.bool.isRequired,
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
      this.textarea._onChange(); // eslint-disable-line no-underscore-dangle
    });
  }

  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;
    const importantProps = ['value', 'isEditing', 'isPointed', 'isSelectingOnFocus'];

    return !arePropsEqual(currentProps, nextProps, importantProps);
  }

  clickHandler(evt, cellId) {
    // Save currently editing Cell's data if needed.
    // REVIEW: this is probably not React-way.
    //   But pointer shouldn't contain nor React element or DOM ref.
    //   http://web.archive.org/web/20150419023006/http://facebook.github.io/react/docs/interactivity-and-dynamic-uis.html
    //   (What Shouldn’t Go in State?)
    //   How to get currently editing Cell's data right?
    //   Also, classname in DataCell should be synced with this selector.

    // NOTE: until those actions batched somehow, place setPointer below setProp
    //   because shouldComponentUpdate() in DataRow doesn't know when cells' props changes.
    const editingTextarea = document.querySelector('.editing textarea'); // eslint-disable-line no-undef
    if (this.props.pointer && editingTextarea) {
      const previousValue = this.props.value;
      const nextValue = editingTextarea.value;

      if (nextValue !== previousValue) {
        this.props.actions.setProp(this.props.pointer.cellId, 'value', nextValue);
      }
    }

    this.props.actions.setPointer({ cellId, modifiers: {} });
  }

  doubleClickHandler(evt, cellId) {
    if (this.props.pointer.modifiers.edit !== true) {
      this.props.actions.setPointer({ cellId, modifiers: { edit: true } });
    }
  }

  keyDownHandler(evt, args) {
    // Prevents firing documentKeyDownHandler().
    evt.nativeEvent.stopImmediatePropagation();

    const movePointerAndSaveValueIfNeeded = (movePointerKey) => {
      // Prevents pressing key immediately after changing pointer.
      evt.preventDefault();

      // REVIEW: double render and sending request here.
      // NOTE: until those actions batched somehow, place movePointer below setProp
      //   because shouldComponentUpdate() in DataRow doesn't know when cells' props changes.
      if (args.nextValue !== args.previousValue) {
        this.props.actions.setProp(this.props.id, 'value', args.nextValue);
      }
      this.props.actions.movePointer(movePointerKey);
    };

    // No switch/case because of keys modifiers.
    // TODO: create and apply some universal keyHandler everywhere.
    //   Or maybe find one in npm. Or maybe create one and push to npm.
    const keyActions = [
      {
        key: 'Enter',
        handler: () => movePointerAndSaveValueIfNeeded('ArrowDown'),
      },
      {
        key: 'Enter',
        shiftKey: true,
        handler: () => movePointerAndSaveValueIfNeeded('ArrowUp'),
      },
      {
        key: 'Enter',
        ctrlKey: true,
        handler: () => {
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

          args.textareaOnChange();
        },
      },
      {
        key: 'Tab',
        handler: () => movePointerAndSaveValueIfNeeded('ArrowRight'),
      },
      {
        key: 'Tab',
        shiftKey: true,
        handler: () => {
          movePointerAndSaveValueIfNeeded('ArrowLeft');
        },
      },
      {
        key: 'Escape',
        handler: () => {
          const pointer = { ...this.props.pointer };
          delete pointer.modifiers.edit;
          this.props.actions.setPointer(pointer);
        },
      },
    ];

    const action = keyActions.find((item) => {
      const { key, shiftKey, ctrlKey, altKey } = evt;

      return (
        key === (item.key || false) &&
        shiftKey === (item.shiftKey || false) &&
        ctrlKey === (item.ctrlKey || false) &&
        altKey === (item.altKey || false)
      );
    });

    if (action) {
      action.handler();
    }
  }

  render() {
    const {
      actions,
      id,
      isEditing,
      isPointed,
      isSelectingOnFocus,
      value,
     } = this.props;
    const disabled = !isEditing;

    return (
      <div
        className={`td data ${isPointed ? 'pointed' : ''} ${isEditing ? 'editing' : ''}`}
        onMouseOver={() => { actions.setHover(id); }}
        onClick={disabled && ((evt) => this.clickHandler(evt, id))}
        onDoubleClick={(evt) => this.doubleClickHandler(evt, id)}
        onKeyDown={(evt) => this.keyDownHandler(evt, {
          previousValue: value,
          nextValue: this.textarea.value,
          textareaOnChange: this.textarea._onChange, // eslint-disable-line no-underscore-dangle
        })}
      >
        {/* HACK: key uptates textarea after changing some props. */}
        {/*   Also it allows autoFocus to work. */}
        {/*   http://stackoverflow.com/a/41717743/6376451 */}

        {/* HACK: onHeightChange is workaround for Chromium Linux zoom scrollbar issue. */}
        {/*   https://github.com/andreypopp/react-textarea-autosize/issues/147 */}

        {/* TODO [PERF]: don't print TextareaAutosize when value is empty */}
        {/*   Caveat: Cell's size. */}
        <div className="data-wrapper">
          <TextareaAutosize
            autoFocus={isEditing}
            autosizeWidth
            className="data-textarea"
            defaultValue={value}
            disabled={disabled}
            inputRef={(c) => { this.textareaInput = c; }}
            key={JSON.stringify({ id, value, isPointed, isEditing, isSelectingOnFocus })}
            maxWidth="512px"
            onFocus={isSelectingOnFocus && ((evt) => evt.target.select())}
            onHeightChange={() => {
              const heightPx = this.textareaInput.style.height;
              const height = Number(heightPx.slice(0, heightPx.length - 'px'.length));
              this.textareaInput.style.height = `${height + 1}px`;
            }}
            ref={(c) => { this.textarea = c; }}
          />
        </div>
      </div>
    );
  }
}

DataCell.propTypes = propTypes;
DataCell.defaultProps = defaultProps;

export default DataCell;
