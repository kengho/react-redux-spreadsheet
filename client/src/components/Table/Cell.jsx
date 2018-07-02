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

    // Focus cell.
    if (isEditing && this.cell && this.cell.focus) {
      this.cell.focus();
    }

    // Set selection and caret if cell is editing.
    if (isEditing && this.cell.firstChild) {
      const cellValue = this.cell.innerText;
      const textContainer = this.cell.firstChild;
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
    if (tableHasHeader && (rowIndex === 0)) { classNames.push('header'); }
    if (value !== '') { classNames.push('non-empty'); }

    let cellBody;
    if (isEditing) {
      cellBody = value;
    } else {
      // NOTE: without wrapper with pointer-events css prop user
      //   can click on overflowing text instead of other cells.
      //   Making it permanent messes with code that relies
      //   on Cell having no childern.
      cellBody = (
        <div style={{ pointerEvents: 'none' }}>
          {value}
        </div>
      );
    }

    // HACK: z-index making Cells' borders at left not to overlap text of Cells at right.
    //   Why 900?
    //     900 is z-index of line headers in Grid, Cell's z-index should be less.
    //   Why not (someKindOfvisibleColumnsNumber - columnIndex) instead of 900?
    //     If we make z-indexes relative to visible columns, too many updates will occur at scroll.
    //     With this attempt we have broken overlapping for each 900 columns, whih is probably acceptable.
    //   Why "- rowIndex"?
    //     Issue persists in vertical direction without it.
    //   Why "%"?
    //     If we don't cycle z-indexes, Cells became unclickable at the moment z-index reaches -1.
    const zIndex = (900 - columnIndex - rowIndex - 1) % 900;

    // NOTE: events handeled in Table.
    return (
      <div
        contentEditable={isEditing.toString()}
        autoFocus={isEditing}
        className={classNames.join(' ')}
        data-column-index={columnIndex}
        data-component-name={CELL}
        data-row-index={rowIndex}
        ref={(c) => {
          this.cell = c;

          if (bubbleCellRef !== false) {
            bubbleCellRef(c);
          }
        }}
        style={{ ...style, zIndex }}
        suppressContentEditableWarning={true}
      >
        {cellBody}
      </div>
    );
  }
}

Cell.propTypes = propTypes;
Cell.defaultProps = defaultProps;

export default Cell;
