import React from 'react';
import PropTypes from 'prop-types';
import domready from 'domready';

// TODO: create own package or pull request to existing.
import TextareaAutosize from '../../lib/react-textarea-autosize/TextareaAutosize';
// import TextareaAutosize from 'react-textarea-autosize';

const propTypes = {
  isEditing: PropTypes.bool.isRequired,
  isPointed: PropTypes.bool.isRequired,
  isSelectingOnFocus: PropTypes.bool.isRequired,
  onClickHandler: PropTypes.func.isRequired,
  onDoubleClickHandler: PropTypes.func.isRequired,
  onKeyDownHandler: PropTypes.func.isRequired,
  onMouseOverHandler: PropTypes.func.isRequired,
  posJSON: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
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
    const importantProps = ['value', 'isEditing', 'isPointed', 'isSelectingOnFocus', 'posJSON'];

    const importantCellPropsAreNotEqual = importantProps.some((prop) => {
      return nextProps[prop] !== currentProps[prop];
    });

    if (importantCellPropsAreNotEqual) {
      return true;
    }
    return false;
  }

  render() {
    const { value, isPointed, isEditing, isSelectingOnFocus } = this.props;
    const disabled = !isEditing;

    return (
      <div
        className={`td data ${isPointed ? 'pointed' : ''} ${isEditing ? 'editing' : ''}`}
        onMouseOver={this.props.onMouseOverHandler}
        onClick={disabled && this.props.onClickHandler}
        onDoubleClick={disabled && this.props.onDoubleClickHandler}
        onKeyDown={(e) => this.props.onKeyDownHandler(e, {
          previousValue: value,
          nextValue: this.textarea.value,
          textareaOnChange: this.textarea._onChange, // eslint-disable-line no-underscore-dangle
        })}
      >
        {/* HACK: key uptates textarea value after changing some props. */}
        {/*   Also it allows autoFocus to work. */}
        {/*   http://stackoverflow.com/a/41717743/6376451 */}

        {/* onHeightChange fixes Chromium Linux zoom scrollbar issue.*/}
        {/* https://github.com/andreypopp/react-textarea-autosize/issues/147*/}
        <div className="data-wrapper">
          <TextareaAutosize
            className="data-textarea"
            key={JSON.stringify({ value, isPointed, isEditing, isSelectingOnFocus })}
            defaultValue={value}
            ref={(c) => { this.textarea = c; }}
            inputRef={(c) => { this.textareaInput = c; }}
            onFocus={isSelectingOnFocus && ((e) => e.target.select())}
            autoFocus={!disabled}
            autosizeWidth
            maxWidth="512px"
            disabled={disabled}
            onHeightChange={() => {
              const currentHeightPx = this.textareaInput.style.height;
              const currentHeight = Number(currentHeightPx.slice(0, currentHeightPx.length - 2));
              this.textareaInput.style.height = `${currentHeight + 1}px`;
            }}
          />
        </div>
      </div>
    );
  }
}

DataCell.propTypes = propTypes;
DataCell.defaultProps = defaultProps;

export default DataCell;
