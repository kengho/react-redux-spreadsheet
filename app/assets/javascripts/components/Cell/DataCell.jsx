import domready from 'domready';
import PropTypes from 'prop-types';
import React from 'react';

// TODO: create own package or pull request to existing.
import TextareaAutosize from '../../lib/react-textarea-autosize/TextareaAutosize';
// import TextareaAutosize from 'react-textarea-autosize';

const propTypes = {
  id: PropTypes.string.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isPointed: PropTypes.bool.isRequired,
  isSelectingOnFocus: PropTypes.bool.isRequired,
  onClickHandler: PropTypes.func.isRequired,
  onDoubleClickHandler: PropTypes.func.isRequired,
  onKeyDownHandler: PropTypes.func.isRequired,
  onMouseOverHandler: PropTypes.func.isRequired,
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
  }

  componentDidMount() {
    // HACK: updates textarea on mount.
    //   (Doesn't work all the times without domready.)
    //   http://stackoverflow.com/a/31373835/6376451
    domready(() => {
      this.textarea._onChange(); // eslint-disable-line no-underscore-dangle
    });
  }

  // TODO: recompose/pure?
  shouldComponentUpdate(nextProps) {
    const currentProps = this.props;
    const importantProps = ['value', 'isEditing', 'isPointed', 'isSelectingOnFocus'];

    const importantCellPropsAreNotEqual = importantProps.some((prop) => {
      return nextProps[prop] !== currentProps[prop];
    });

    if (importantCellPropsAreNotEqual) {
      return true;
    }
    return false;
  }

  render() {
    const { id, value, isPointed, isEditing, isSelectingOnFocus } = this.props;
    const disabled = !isEditing;

    return (
      <div
        className={`td data ${isPointed ? 'pointed' : ''} ${isEditing ? 'editing' : ''}`}
        onClick={disabled && this.props.onClickHandler}
        onDoubleClick={disabled && this.props.onDoubleClickHandler}
        onKeyDown={(e) => this.props.onKeyDownHandler(e, {
          previousValue: value,
          nextValue: this.textarea.value,
          textareaOnChange: this.textarea._onChange, // eslint-disable-line no-underscore-dangle
        })}
        onMouseOver={this.props.onMouseOverHandler}
      >
        {/* HACK: key uptates textarea after changing some props. */}
        {/*   Also it allows autoFocus to work. */}
        {/*   http://stackoverflow.com/a/41717743/6376451 */}

        {/* HACK: onHeightChange fixes Chromium Linux zoom scrollbar issue. */}
        {/*   https://github.com/andreypopp/react-textarea-autosize/issues/147 */}

        {/* TODO [PERF]: don't print TextareaAutosize when value is empty */}
        {/*   Caveat: Cell's size. */}
        <div className="data-wrapper">
          <TextareaAutosize
            autoFocus={!disabled}
            autosizeWidth
            className="data-textarea"
            defaultValue={value}
            disabled={disabled}
            inputRef={(c) => { this.textareaInput = c; }}
            key={JSON.stringify({ id, value, isPointed, isEditing, isSelectingOnFocus })}
            maxWidth="512px"
            onFocus={isSelectingOnFocus && ((e) => e.target.select())}
            onHeightChange={() => {
              const currentHeightPx = this.textareaInput.style.height;
              const currentHeight = Number(currentHeightPx.slice(0, currentHeightPx.length - 'px'.length));
              this.textareaInput.style.height = `${currentHeight + 1}px`;
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
