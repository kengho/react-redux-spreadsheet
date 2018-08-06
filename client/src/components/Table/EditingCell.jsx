import PropTypes from 'prop-types';
import React from 'react';

import { getLineOffset } from 'react-infinite-2d-grid';

import './Cell.css';
import {
  ROW,
  COLUMN,
  EDITING_CELL,
} from '../../constants';

const propTypes = {
  table: PropTypes.object.isRequired,
  linesOffsets: PropTypes.object.isRequired,
};

const defaultProps = {
};

class EditingCell extends React.Component {
  constructor(props) {
    super(props);

    this.cell = null;
  }

  shouldComponentUpdate(nextProps, nextState) {
    const currentIsEditing = this.props.table.getIn(['session', 'pointer', 'edit']);
    const nextIsEditing = nextProps.table.getIn(['session', 'pointer', 'edit']);

    return (currentIsEditing !== nextIsEditing);
  }

  componentDidUpdate(prevProps) {
    if (!this.cell) {
      return;
    }

    const pointer = this.props.table.getIn(['session', 'pointer']);
    const isEditing = pointer.get('edit');
    const selectOnFocus = pointer.get('selectOnFocus');

    // Set selection and caret if cell is editing.
    if (isEditing && this.cell) {
      const cellValue = this.cell.innerText;
      let textContainer
      if (this.cell.firstChild) {
        textContainer = this.cell.firstChild;
      } else {
        textContainer = this.cell;
      }

      if (textContainer) {
        const range = document.createRange();
        const sel = window.getSelection();
        if (selectOnFocus) {
          // Select all.
          range.setStart(textContainer, 0);
          range.setEnd(textContainer, cellValue.length);
        } else {
          // Move caret to the end.
          range.setStart(textContainer, cellValue.length);
          range.collapse();
        }

        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  render() {
    const {
      table,
      linesOffsets,
    } = this.props;

    const vision = this.props.table.get('vision');
    const pointer = table.getIn(['session', 'pointer']);
    const value = pointer.get('value');

    const isEditing = pointer.get('edit');
    if (!isEditing) {
      return <div></div>;
    }

    // NOTE: due to shouldComponentUpdate those values "saving" until EditingCell
    //   isn't visible so scroll won't shift position of component.
    const scrollTop = vision.getIn([ROW, 'scrollSize']);
    const scrollLeft = vision.getIn([COLUMN, 'scrollSize']);
    const rowIndex = pointer.getIn([ROW, 'index']);
    const columnIndex = pointer.getIn([COLUMN, 'index']);
    const headerHeight = table.getIn(['layout', ROW, 'marginSize']);
    const headerWidth = table.getIn(['layout', COLUMN, 'marginSize']);
    const defaultCellHeight = table.getIn(['layout', ROW, 'defaultSize']);
    const defaultCellWidth = table.getIn(['layout', COLUMN, 'defaultSize']);
    const rowOffset = getLineOffset({
      linesOffests: linesOffsets.get(ROW).toJS(),
      index: rowIndex,
      defaultLineSize: defaultCellHeight,
    });
    const columnOffset = getLineOffset({
      linesOffests: linesOffsets.get(COLUMN).toJS(),
      index: columnIndex,
      defaultLineSize: defaultCellWidth,
    });
    let top = Math.max(rowOffset - scrollTop, 0);
    let left = Math.max(columnOffset - scrollLeft, 0);
    top += headerHeight;
    left += headerWidth;

    // NOTE: don't use second arg of getIn() so it won't fix null value (works only for undefined).
    const height = table.getIn(['layout', ROW, 'list', rowIndex, 'size']) || defaultCellHeight;
    const width = table.getIn(['layout', COLUMN, 'list', columnIndex, 'size']) || defaultCellWidth;

    // NOTE: "minHeight: height" and "white-space: pre-line" so user can edit overflowing text.
    // TODO: allow to edit really long strings that cannot be wrapped using spaces.
    //   "white-space: normal", for example, breaks new lines.
    const style = {
      top,
      left,
      minHeight: height,
      width,
      position: 'fixed',
    };

    // TODO: add label like "A1" (see Goodle Spreadsheets).
    return (
      <div
        className="cell editing"
        data-component-name={EDITING_CELL}
        style={style}
        title={value}
      >
        {/*
          HACK: additional wrapper div fixes bug in Firefox when after deleteing
            all text in cell and pressing enter regardless of what was in handler
            internal div was deleted.
          NOTE: wrapper for value is required in order to fill overflowing text
            while editing cell so it overlap nearby cellls' text.
        */}
        <div>
          <div
            autoFocus={true}
            onInput={(evt) => {
              const value = evt.nativeEvent.target.innerText;
              this.props.actions.setPointer({ value });
            }}
            className="cell-content"
            contentEditable="true"
            data-component-name={EDITING_CELL}
            ref={(c) => this.cell = c}
            suppressContentEditableWarning={true}
          >
            {value}
          </div>
        </div>
      </div>
    );
  }
}

EditingCell.propTypes = propTypes;
EditingCell.defaultProps = defaultProps;

export default EditingCell;
