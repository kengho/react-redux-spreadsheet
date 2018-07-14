import { throttle } from 'lodash';
// import Grid from '../Grid/lib';
import Grid from 'react-infinite-2d-grid';
import PropTypes from 'prop-types';
import React from 'react';

import getCellProps from '../../lib/getCellProps';
import {
  BODY,
  CELL,
  COLUMN,
  GRID_HEADER,
  LINE_HEADER,
  ROW,
  BEGIN,
  END,
} from '../../constants';
import bodyKeyDownHandler from './bodyKeyDownHandler';
import Cell from './Cell';
import cellClickHandler from './cellClickHandler';
import cellKeyDownHandler from './cellKeyDownHandler';
import GridHeader from './GridHeader';
import gridHeaderClickHandler from './gridHeaderClickHandler';
import LineHeader from './LineHeader';
import lineHeaderClickHandler from './lineHeaderClickHandler';
import onElementPropsChange from '../../lib/onElementPropsChange';

const propTypes = {
  table: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
};

class Table extends React.PureComponent {
  constructor(props) {
    super(props);

    this.rowHeaderRenderer = this.lineHeaderRenderer(ROW);
    this.columnHeaderRenderer = this.lineHeaderRenderer(COLUMN);
    this.rowsSizes = this.linesSizes(ROW);
    this.columnsSizes = this.linesSizes(COLUMN);

    // REVIEW: it wouldn't be necessary to throttle onSectionRendered()
    //   if we batch all actions leading to saving cell value and moving pointer.
    //   Should it be done?
    const onSectionRenderedThrottleTimeout = 500;
    this.throttledOnSectionRendered = throttle(
      this.onSectionRendered,
      onSectionRenderedThrottleTimeout,
      { leading: false }
    );

    const scrollThrottleTimeout = 200;
    this.throttledOnScrollHandler = throttle(
      this.onScrollHandler,
      scrollThrottleTimeout,
      { leading: false }
    );

    // HACK: pointedCellRefSetter uses to "pop" current pointed cell ref here.
    this.pointedCellRefSetter = (ref) => this.pointedCell = ref;
    this.pointedCell = null;
  }

  componentDidMount() {
    document.title = this.props.settings.get('spreadsheetName');

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('click', this.clickHandler);
    window.addEventListener('mousedown', this.clickHandler);
    window.addEventListener('dblclick', this.clickHandler);
    window.addEventListener('mouseup', this.clickHandler);
    window.addEventListener('mouseover', this.clickHandler);
    window.addEventListener('input', this.throttledInputHandler);
    window.addEventListener('scroll', this.throttledOnScrollHandler);

    // NOTE: preventing browser's regular context menu.
    //   https://stackoverflow.com/a/9214499/6376451
    window.addEventListener('contextmenu', this.contextMenuHandler, false);
    document.addEventListener('paste', this.pasteHandler);

    // TODO: catch page zoom event via VisualViewport API when available.
    // TODO: to settings.
    const windowResizeWatchTimeout = 1000;
    this.cancelWindowResizeHandler = onElementPropsChange(
      window,
      ['innerHeight', 'innerWidth'],
      windowResizeWatchTimeout,
      () => {
        this.props.actions.setScreenSize({
          ROW: {
            screenSize: window.innerHeight,
          },
          COLUMN: {
            screenSize: window.innerWidth,
          },
        });
      }
    );
  }

  componentDidUpdate() {
    document.title = this.props.settings.get('spreadsheetName');

    if (!this.props.table.getIn(['session', 'pointer', 'edit'])) {
      document.activeElement.blur();
      window.focus();
      window.getSelection().removeAllRanges();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('click', this.clickHandler);
    window.removeEventListener('mousedown', this.clickHandler);
    window.removeEventListener('dblclick', this.clickHandler);
    window.removeEventListener('mouseup', this.clickHandler);
    window.removeEventListener('mouseover', this.clickHandler);
    window.removeEventListener('input', this.throttledInputHandler);
    window.removeEventListener('scroll', this.throttledOnScrollHandler);
    window.removeEventListener('contextmenu', this.contextMenuHandler);
    document.removeEventListener('paste', this.pasteHandler);

    this.cancelWindowResizeHandler();

    // NOTE: makes dialog disappear after going back in history,
    this.props.actions.closeDialog();
  }

  contextMenuHandler(evt) {
    evt.preventDefault();
  }

  pasteHandler = (evt) => {
    this.props.actions.pasteUserSpecifiedArea(evt.clipboardData.getData('text'));
  };

  onScrollHandler = (evt) => {
    const cellProps = getCellProps(this.pointedCell);
    if (cellProps) {
      this.props.actions.setPointer(cellProps);
    }

    this.props.actions.setScrollSize({
      ROW: {
        scrollSize: document.documentElement.scrollTop,
      },
      COLUMN: {
        scrollSize: document.documentElement.scrollLeft,
      },
    });
  };

  getComponentName(evt) {
    if (!evt.target || !evt.target.dataset) {
      return;
    }

    return evt.target.dataset.componentName || BODY;
  }

  keyDownHandler = (evt) => {
    const componentName = this.getComponentName(evt);

    switch (componentName) {
      case BODY:
        this.bodyKeyDownHandler(evt);
        break;

      case CELL:
        this.cellKeyDownHandler({ evt, elem: this.pointedCell });
        break;

      default:
    }
  }

  clickHandler = (evt) => {
    const componentName = this.getComponentName(evt);

    switch (componentName) {
      case CELL:
        this.cellClickHandler({ evt, pointedCell: this.pointedCell });
        break;

      case LINE_HEADER:
        this.lineHeaderClickHandler({ evt });
        break;

      case GRID_HEADER:
        this.gridHeaderClickHandler({ evt });
        break;

      default:
    }
  }

  cellRenderer = ({
    columnIndex,
    isOnTopRow,
    isReal,
    rowIndex,
    style,
  }) => {
    const table = this.props.table;
    const cellProps = { rowIndex, columnIndex };

    // REVIEW: this probably could be simplified.
    //   We're not grouping props in objects in order to take advantage
    //   of PureComponent Cell (proven to be faster benchmarkably).
    const getBoundaryProps = (rowIndex, columnIndex, boundary) => {
      if (boundary && boundary.get(ROW) && boundary.get(COLUMN)) {
        const rowInBoundary = (
          (rowIndex >= boundary.getIn([ROW, BEGIN, 'index'], -1)) &&
          (rowIndex <= boundary.getIn([ROW, END, 'index'], -1))
        );
        const columnInBoundary = (
          (columnIndex >= boundary.getIn([COLUMN, BEGIN, 'index'], -1)) &&
          (columnIndex <= boundary.getIn([COLUMN, END, 'index'], -1))
        );
        const isInBoundary = rowInBoundary && columnInBoundary;

        return {
          isInBoundary,
          isOnBoundaryTop: isInBoundary && (rowIndex === boundary.getIn([ROW, BEGIN, 'index'])),
          isOnBoundaryRight: isInBoundary && (columnIndex === boundary.getIn([COLUMN, END, 'index'])),
          isOnBoundaryBottom: isInBoundary && (rowIndex === boundary.getIn([ROW, END, 'index'])),
          isOnBoundaryLeft: isInBoundary && (columnIndex === boundary.getIn([COLUMN, BEGIN, 'index'])),
        };
      } else {
        return {
          isInBoundary: false,
          isOnBoundaryTop: false,
          isOnBoundaryRight: false,
          isOnBoundaryBottom: false,
          isOnBoundaryLeft: false,
        };
      }
    };

    const firstSelectionBoundary = table.getIn(['session', 'selection', 0, 'boundary']);
    const {
      isInBoundary: isInSelection,
      isOnBoundaryTop: isOnSelectionTop,
      isOnBoundaryRight: isOnSelectionRight,
      isOnBoundaryBottom: isOnSelectionBottom,
      isOnBoundaryLeft: isOnSelectionLeft,
    } = getBoundaryProps(rowIndex, columnIndex, firstSelectionBoundary);
    Object.assign(cellProps, {
      isInSelection,
      isOnSelectionTop,
      isOnSelectionRight,
      isOnSelectionBottom,
      isOnSelectionLeft,
    });

    const firstClipboardBoundary = table.getIn(['session', 'clipboard', 0, 'boundary']);
    const {
      isInBoundary: isInClipboard,
      isOnBoundaryTop: isOnClipboardTop,
      isOnBoundaryRight: isOnClipboardRight,
      isOnBoundaryBottom: isOnClipboardBottom,
      isOnBoundaryLeft: isOnClipboardLeft,
    } = getBoundaryProps(rowIndex, columnIndex, firstClipboardBoundary);
    Object.assign(cellProps, {
      isInClipboard,
      isOnClipboardTop,
      isOnClipboardRight,
      isOnClipboardBottom,
      isOnClipboardLeft,
    });

    if (isReal) {
      const rowId = table.getIn(['layout', ROW, 'list', rowIndex, 'id']);
      const columnId = table.getIn(['layout', COLUMN, 'list', columnIndex, 'id']);
      cellProps.key = `cell-${rowId}/${columnId}`;
    } else {
      cellProps.key = `cell-c${rowIndex}/c${columnIndex}`;
    }

    if (isReal) {
      cellProps.value = table.getIn(['layout', ROW, 'list', rowIndex, 'cells', columnIndex, 'value']);
    } else {
      // TODO: in firefox cursor don't behave according to padding,
      //   unless default value is '<br />', but <br> leads to even more problems,
      //   and there are no better solution yet.
      // cellProps.value = `${rowIndex}/${columnIndex}`;
      cellProps.value = '';
    }

    const pointer = table.getIn(['session', 'pointer']);
    cellProps.isPointed = (
      rowIndex === pointer.getIn([ROW, 'index']) &&
      columnIndex === pointer.getIn([COLUMN, 'index'])
    );
    // HACK
    const pointedCellValue = table.getIn(['session', 'pointer', 'value']);
    if (cellProps.isPointed && pointedCellValue !== '' && pointedCellValue !== null) {
      cellProps.value = pointedCellValue;
    }

    cellProps.isEditing = (cellProps.isPointed && pointer.get('edit') === true);
    cellProps.selectOnFocus = (cellProps.isPointed && pointer.get('selectOnFocus') === true);
    cellProps.tableHasHeader = this.props.settings.get('tableHasHeader');

    // HACK (?): stringifying style is the easiest way to make use of
    //   PureComponent Cell regarding desirably "independence" from styles
    //   returned by Grid (we don't want to deconstruct them).
    return (
      <Cell
        bubbleCellRef={cellProps.isPointed && this.pointedCellRefSetter}
        styleJSON={JSON.stringify(style)}
        {...cellProps}
      />
    );
  }

  rowRenderer = ({
    cells,
    index,
    isReal,
    style,
  }) => {
    let key;
    if (isReal) {
      const rowKey = this.props.table.getIn(['layout', ROW, 'list', index, 'id']);
      key = `row-${rowKey}`;
    } else {
      key = `row-c${index}`;
    }

    return <div key={key} style={style}>{cells}</div>;
  }

  gridHeaderRenderer = ({ style }) => <GridHeader style={style} />;

  // TODO: figure out convention about variables' names
  //   (especially for functions that returns functions).
  lineHeaderRenderer = (lineType) => {
    return ({
      index,
      isReal,
      style,
    }) => {
      const lineHeaderProps = {
        lineType,
        index,
        style,
        actions: this.props.actions,
      };

      if (isReal) {
        const lineKey = this.props.table.getIn(['layout', lineType, 'list', index, 'id']);
        lineHeaderProps.key = `line-header-${lineType}-${lineKey}`;
      } else {
        lineHeaderProps.key = `line-header-c${lineType}-${index}`;
      }

      const pointer = this.props.table.getIn(['session', 'pointer']);
      lineHeaderProps.isPointed = (index === pointer.getIn([lineType, 'index']));

      if (lineType === ROW) {
        lineHeaderProps.tableHasHeader = this.props.settings.get('tableHasHeader');
      }

      return <LineHeader {...lineHeaderProps} />;
    }
  }

  onSectionRendered = (linesDivision) => {
    this.props.actions.setLinesOffsets({
      ROW: linesDivision.rows.offsets,
      COLUMN: linesDivision.columns.offsets,
    });
  }

  linesSizes = lineType => lineIndex => this.props.table.getIn(['layout', lineType, 'list', lineIndex, 'size'])

  render() {
    const table = this.props.table;
    const layout = table.get('layout');
    const rows = layout.get(ROW);
    const columns = layout.get(COLUMN);
    const vision = table.get('vision');
    const defaultCellHeight = rows.get('defaultSize');
    const defaultCellWidth = columns.get('defaultSize');

    return (
      <Grid
        cellRenderer={this.cellRenderer}
        className="table"
        columnHeaderRenderer={this.columnHeaderRenderer}
        columnsNumber={columns.get('list').size}
        columnsSizes={this.columnsSizes}
        defaultCellHeight={defaultCellHeight}
        defaultCellWidth={defaultCellWidth}
        extraHeight={'300vh'}
        extraWidth={'200vw'}
        gridHeaderRenderer={this.gridHeaderRenderer}
        gridRoundingLength={3}
        hasHeader={true}
        headerHeight={rows.get('marginSize')}
        headerWidth={columns.get('marginSize')}
        onSectionRendered={this.throttledOnSectionRendered}
        rowHeaderRenderer={this.rowHeaderRenderer}
        rowRenderer={this.rowRenderer}
        rowsNumber={rows.get('list').size}
        rowsSizes={this.rowsSizes}
        screenHeight={vision.getIn([ROW, 'screenSize'])}
        screenWidth={vision.getIn([COLUMN, 'screenSize'])}
        scrollLeft={vision.getIn([COLUMN, 'scrollSize'])}
        scrollTop={vision.getIn([ROW, 'scrollSize'])}
      />
    );
  }
}

Table.propTypes = propTypes;

Table.prototype.bodyKeyDownHandler = bodyKeyDownHandler;
Table.prototype.cellClickHandler = cellClickHandler;
Table.prototype.cellKeyDownHandler = cellKeyDownHandler;
Table.prototype.gridHeaderClickHandler = gridHeaderClickHandler;
Table.prototype.lineHeaderClickHandler = lineHeaderClickHandler;

export default Table;
