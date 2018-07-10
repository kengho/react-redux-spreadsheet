import PropTypes from 'prop-types';
import React from 'react';

import './Cell.css';
import { CELL } from '../../constants';

const propTypes = {
  bubbleCellRef: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.func,
  ]).isRequired,
  columnIndex: PropTypes.number.isRequired,
  isEditing: PropTypes.bool.isRequired,
  isInClipboard: PropTypes.bool.isRequired,
  isPointed: PropTypes.bool.isRequired,
  rowIndex: PropTypes.number.isRequired,
  selectOnFocus: PropTypes.bool.isRequired,
  styleJSON: PropTypes.string.isRequired,
  tableHasHeader: PropTypes.bool,
  value: PropTypes.string,
};

const defaultProps = {
  tableHasHeader: false,
  value: '',
};

class Cell extends React.PureComponent {
  constructor(props) {
    super(props);

    this.cell = null;
  }

  componentDidUpdate(prevProps) {
    if (!this.cell) {
      return;
    }

    const {
      isEditing,
      selectOnFocus,
    } = this.props;

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
      bubbleCellRef,
      columnIndex,
      isEditing,
      isInClipboard,
      isInSelection,
      isPointed,
      rowIndex,
      styleJSON,
      tableHasHeader,
      value,
    } = this.props;

    const style = JSON.parse(styleJSON);
    if ((value !== '') || isEditing) {
      // NOTE: required relative, fixed or absolute in order to show overflowing content.
      //   But if empty cell at right have it too, value in cell at left won't show as expected.
      style.position = 'relative';
    }

    const classNames = ['cell'];
    if (isPointed) { classNames.push('pointed'); }
    if (isEditing) { classNames.push('editing'); }
    if (isInClipboard) { classNames.push('clipboard'); }
    if (isInSelection) { classNames.push('selection'); }
    if (tableHasHeader && (rowIndex === 0)) { classNames.push('header'); }
    if (value !== '') { classNames.push('non-empty'); }

    // NOTE: events handeled in Table.
    // TODO: delete duplicating "data-" props using to
    //   handle click in both empty and nonempty cells.
    return (
      <div
        className={classNames.join(' ')}
        data-column-index={columnIndex}
        data-component-name={CELL}
        data-row-index={rowIndex}
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
            className="cell-content"
            autoFocus={isEditing}
            contentEditable={isEditing.toString()}
            data-column-index={columnIndex}
            data-component-name={CELL}
            data-row-index={rowIndex}
            ref={(c) => {
              this.cell = c;

              if (bubbleCellRef !== false) {
                bubbleCellRef(c);
              }
            }}
            suppressContentEditableWarning={true}
          >
            {value}
          </div>
        </div>
      </div>
    );
  }
}

Cell.propTypes = propTypes;
Cell.defaultProps = defaultProps;

export default Cell;
