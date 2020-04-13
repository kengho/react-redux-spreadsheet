import { throttle } from 'lodash';
// import Grid from '../Grid/lib';
import Grid from 'react-infinite-2d-grid';
import PropTypes from 'prop-types';
import React from 'react';

import {
  BODY,
  CELL,
  EDITING_CELL,
  COLUMN,
  GRID_HEADER,
  LINE_HEADER,
  ROW,
} from '../../constants';
import { getBoundaryProps } from '../../core';
import bodyKeyDownHandler from './bodyKeyDownHandler';
import Cell from './Cell';
import cellClickHandler from './cellClickHandler';
import cellKeyDownHandler from './cellKeyDownHandler';
import getComponentName from '../../lib/getComponentName';
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
  }

  componentDidMount() {
    document.title = this.props.settings.spreadsheetName;

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('click', this.clickHandler);
    window.addEventListener('mousedown', this.clickHandler);
    window.addEventListener('dblclick', this.clickHandler);
    window.addEventListener('mouseup', this.clickHandler);
    window.addEventListener('mouseover', this.clickHandler);
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
      () => this.props.actions.setScreenSize(window.innerHeight, window.innerWidth),
    );
  }

  componentDidUpdate() {
    document.title = this.props.settings.spreadsheetName;

    if (!this.props.table.session.pointer.edit) {
      document.activeElement.blur();
      window.focus();
      window.getSelection().removeAllRanges();
    }

    const vision = this.props.table.vision;
    document.documentElement.scrollTop = vision[ROW].scrollSize;
    document.documentElement.scrollLeft = vision[COLUMN].scrollSize;
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.keyDownHandler);
    window.removeEventListener('click', this.clickHandler);
    window.removeEventListener('mousedown', this.clickHandler);
    window.removeEventListener('dblclick', this.clickHandler);
    window.removeEventListener('mouseup', this.clickHandler);
    window.removeEventListener('mouseover', this.clickHandler);
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
    const componentName = getComponentName(evt);

    // test_636
    if (componentName === BODY) {
      evt.preventDefault();
      this.props.actions.pasteUserSpecifiedArea(evt.clipboardData.getData('text'));
    }
  };

  onScrollHandler = (evt) => {
    this.props.actions.setScrollSize(
      document.documentElement.scrollTop,
      document.documentElement.scrollLeft
    );
  };

  keyDownHandler = (evt) => {
    const componentName = getComponentName(evt);

    switch (componentName) {
      case BODY:
        this.bodyKeyDownHandler(evt);
        break;

      case EDITING_CELL:
        this.cellKeyDownHandler({ evt });
        break;

      default:
    }
  }

  clickHandler = (evt) => {
    const componentName = getComponentName(evt);

    switch (componentName) {
      case CELL:
        this.cellClickHandler({ evt });
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

    const cellPosition = {
      [ROW]: {
        index: rowIndex,
      },
      [COLUMN]: {
        index: columnIndex,
      },
    };
    const firstSelectionBoundary = table.session.selection[0].boundary;
    const {
      isInBoundary: isInSelection,
      isOnBoundaryTop: isOnSelectionTop,
      isOnBoundaryRight: isOnSelectionRight,
      isOnBoundaryBottom: isOnSelectionBottom,
      isOnBoundaryLeft: isOnSelectionLeft,
    } = getBoundaryProps(firstSelectionBoundary, cellPosition);
    Object.assign(cellProps, {
      isInSelection,
      isOnSelectionTop,
      isOnSelectionRight,
      isOnSelectionBottom,
      isOnSelectionLeft,
    });

    const firstClipboardBoundary = table.session.clipboard[0].boundary;
    const {
      isInBoundary: isInClipboard,
      isOnBoundaryTop: isOnClipboardTop,
      isOnBoundaryRight: isOnClipboardRight,
      isOnBoundaryBottom: isOnClipboardBottom,
      isOnBoundaryLeft: isOnClipboardLeft,
    } = getBoundaryProps(firstClipboardBoundary, cellPosition);
    Object.assign(cellProps, {
      isInClipboard,
      isOnClipboardTop,
      isOnClipboardRight,
      isOnClipboardBottom,
      isOnClipboardLeft,
    });

    if (isReal) {
      const rowId = table.layout[ROW].list[rowIndex].id;
      const columnId = table.layout[COLUMN].list[columnIndex].id;
      cellProps.key = `cell-${rowId}/${columnId}`;
    } else {
      cellProps.key = `cell-c${rowIndex}/c${columnIndex}`;
    }

    if (isReal) {
      cellProps.value = table.layout[ROW].list[rowIndex].cells[columnIndex].value;
    } else {
      // TODO: in firefox cursor don't behave according to padding,
      //   unless default value is '<br />', but <br> leads to even more problems,
      //   and there are no better solution yet.
      // cellProps.value = `${rowIndex}/${columnIndex}`;
      cellProps.value = '';
    }

    const pointer = table.session.pointer;
    cellProps.isPointed = (
      rowIndex === pointer[ROW].index &&
      columnIndex === pointer[COLUMN].index
    );

    cellProps.selectOnFocus = cellProps.isPointed && (pointer.selectOnFocus === true);
    cellProps.inOnHeader = this.props.settings.tableHasHeader && (rowIndex === 0);

    // HACK (?): stringifying style is the easiest way to make use of
    //   PureComponent Cell regarding desirably "independence" from styles
    //   returned by Grid (we don't want to deconstruct them).
    return (
      <Cell
        styleJSON={JSON.stringify(style)}
        {...cellProps}
      />
    );
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
        const lineKey = this.props.table.layout[lineType].list[index].id;
        lineHeaderProps.key = `line-header-${lineType}-${lineKey}`;
      } else {
        lineHeaderProps.key = `line-header-c${lineType}-${index}`;
      }

      const pointer = this.props.table.session.pointer;
      lineHeaderProps.isPointed = (index === pointer[lineType].index);

      if (lineType === ROW) {
        lineHeaderProps.tableHasHeader = this.props.settings.tableHasHeader;
      }

      return <LineHeader {...lineHeaderProps} />;
    }
  }

  onSectionRendered = (linesDivision) => {
    // TODO: PERF: figure out, isn't this slowing down app.
    //   Maybe we should run it only if offsets changed?
    this.props.actions.setLinesOffsets({
      [ROW]: linesDivision.rows.offsets,
      [COLUMN]: linesDivision.columns.offsets,
    });
  }

  linesSizes = lineType => lineIndex => {
    try {
      return this.props.table.layout[lineType].list[lineIndex].size;
    } catch (e) {
      return undefined;
    }
  };

  render() {
    const table = this.props.table;
    const layout = table.layout;
    const rows = layout[ROW];
    const columns = layout[COLUMN];
    const vision = table.vision;
    const defaultCellHeight = rows.defaultSize;
    const defaultCellWidth = columns.defaultSize;

    return (
      <Grid
        cellRenderer={this.cellRenderer}
        id="table"
        columnHeaderRenderer={this.columnHeaderRenderer}
        columnsNumber={columns.list.length}
        columnsSizes={this.columnsSizes}
        defaultCellHeight={defaultCellHeight}
        defaultCellWidth={defaultCellWidth}
        extraHeight={'100vh'}
        extraWidth={'100vw'}
        gridHeaderRenderer={this.gridHeaderRenderer}
        gridRoundingLength={3}
        hasHeader={true}
        headerHeight={rows.marginSize}
        headerWidth={columns.marginSize}
        onSectionRendered={this.throttledOnSectionRendered}
        rowHeaderRenderer={this.rowHeaderRenderer}
        rowsNumber={rows.list.length}
        rowsSizes={this.rowsSizes}
        screenHeight={vision[ROW].screenSize}
        screenWidth={vision[COLUMN].screenSize}
        scrollLeft={vision[COLUMN].scrollSize}
        scrollTop={vision[ROW].scrollSize}
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
