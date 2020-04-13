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
    const currentIsEditing = this.props.table.session.pointer.edit;
    const nextIsEditing = nextProps.table.session.pointer.edit;

    return (currentIsEditing !== nextIsEditing);
  }

  componentDidUpdate(prevProps) {
    if (!this.cell) {
      return;
    }

    const pointer = this.props.table.session.pointer;
    const isEditing = pointer.edit;
    const selectOnFocus = pointer.selectOnFocus;

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

    const vision = this.props.table.vision;
    const pointer = table.session.pointer;
    const value = pointer.value;

    const isEditing = pointer.edit;
    if (!isEditing) {
      return <div></div>;
    }

    // NOTE: due to shouldComponentUpdate those values "saving" until EditingCell
    //   isn't visible so scroll won't shift position of component.
    const scrollTop = vision[ROW].scrollSize;
    const scrollLeft = vision[COLUMN].scrollSize;
    const rowIndex = pointer[ROW].index;
    const columnIndex = pointer[COLUMN].index;
    const headerHeight = table.layout[ROW].marginSize;
    const headerWidth = table.layout[COLUMN].marginSize;
    const defaultCellHeight = table.layout[ROW].defaultSize;
    const defaultCellWidth = table.layout[COLUMN].defaultSize;
    const rowOffset = getLineOffset({
      linesOffests: linesOffsets[ROW],
      index: rowIndex,
      defaultLineSize: defaultCellHeight,
    });
    const columnOffset = getLineOffset({
      linesOffests: linesOffsets[COLUMN],
      index: columnIndex,
      defaultLineSize: defaultCellWidth,
    });
    let top = Math.max(rowOffset - scrollTop, 0);
    let left = Math.max(columnOffset - scrollLeft, 0);
    top += headerHeight;
    left += headerWidth;

    let height;
    let width;
    try {
      // NOTE: size could be null, whitch won't raise error.
      height = table.layout[ROW].list[rowIndex].size || defaultCellHeight;
    } catch (e) {
      height = defaultCellHeight;
    }
    try {
      width = table.layout[COLUMN].list[columnIndex].size || defaultCellWidth;
    } catch (e) {
      width = defaultCellWidth;
    }

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
              // NOTE: HACK: REVIEW: fsr in Firefox innerText doesn't represent value correctly,
              //   the last line is missing (after pressing Ctlr+Enter).
              //   Using innerHTML fixes it, but how we need to replace <br> to '\n'...
              //   Also, after that in Chrome wild unbreakable space appears at the end,
              //   got to remove it... It's a mess overall. Sure it's buggy.
              //   Btw, document.execCommand apparently is obsolete, don't know
              //   what to use instead.
              const value = evt.nativeEvent.target.innerHTML
                .replace(new RegExp('<br>', 'g'), '\n')
                .replace('&nbsp;', '');
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
