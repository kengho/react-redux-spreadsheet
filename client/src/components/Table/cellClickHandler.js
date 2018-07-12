import {
  CELL,
  COLUMN,
  ROW,
  BEGIN,
  END,
} from '../../constants';
import getCellProps, {
  composeCellProps,
  getCellOffsets,
  getCellPosition,
  getCellSize,
} from '../../lib/getCellProps';
import * as TableActions from '../../actions/table';
import getMousePosition from '../../lib/getMousePosition';

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

export default function cellClickHandler({ evt, pointedCell }) {
  // TODO: PERF: batch all actions here.

  const {
    actions,
    table,
    currentSelectionVisibility,
  } = this.props;

  if (evt.type === 'mousedown') {
    this.props.actions.setSearchBarFocus(false);
  }

  const cellPosition = getCellPosition({ evt });
  if (!cellPosition) {
    return;
  }

  const cellSelector =
    `[data-component-name="${CELL}"]` +
    `[data-row-index="${cellPosition[ROW].index}"]` +
    `[data-column-index="${cellPosition[COLUMN].index}"]`;
  const cell = document.querySelector(cellSelector);
  const cellOffsets = getCellOffsets(cell);
  const cellSize = getCellSize(cell);

  // NOTE: cellPosition here is required for fixateCurrentSelection().
  const cellPlacement = composeCellProps(cellOffsets, cellSize, cellPosition);

  // Selection.
  // console.time('selection');
  // TODO: add ability to select several boundaries with ctrl.
  if (!currentSelectionVisibility && (evt.type === 'mousedown') && (evt.button === LEFT_BUTTON)) {
    actions.clearSelection();
    actions.setCurrentSelectionAnchor({
      selectionAnchorType: BEGIN,
      anchor: cellPlacement,
    });
    actions.setCurrentSelectionAnchor({
      selectionAnchorType: END,
      anchor: cellPlacement,
    });
    actions.setCurrentSelectionVisibility(true);
  } else if (currentSelectionVisibility && (evt.type === 'mouseover') && (evt.button === LEFT_BUTTON)) {
    actions.setCurrentSelectionAnchor({
      selectionAnchorType: END,
      anchor: cellPlacement,
    });
  } else if (currentSelectionVisibility && (evt.type === 'mouseup') && (evt.button === LEFT_BUTTON)) {
    actions.fixateCurrentSelection();
    actions.setCurrentSelectionVisibility(false);
  }
  // console.timeEnd('selection');

  // Clicks.
  // HACK: in Chrome "click" not fired when user rightclicks,
  //   so we just call menu not on click, but mousedown.
  //   Should probably catch calling context menu instead.
  if ((evt.type === 'mousedown') && (evt.button === RIGHT_BUTTON)) {
    const cellPosition = getCellPosition({ evt });

    actions.setMenu({
      place: CELL,
      ...composeCellProps(
        cellPosition,
        {
          [ROW]: {
            offset: getMousePosition(evt).page.y,
          },
          [COLUMN]: {
            offset: getMousePosition(evt).page.x,
          },
        },
      ),
    })
    actions.openPopup();

    // TODO: don't set pointer if there are selection (when there is code for selection).
    actions.setPointer(composeCellProps(
      // NOTE: if we don't wipe lines' sizes, if we set pointer on non-default size cell,
      //   scroll it out of sight, and then point some empty cell, it's size will change.
      {
        [ROW]: {
          size: null,
        },
        [COLUMN]: {
          size: null,
        },
      },
      {
        edit: false,
        selectOnFocus: false,
      },
      cellPosition,
    ));

  // Leftclick.
  // NOTE: we catch "mousedown" instead of "click" for faster UI response.
  //   Ditching regular click just not to fire this action twice.
  // TODO: break this apart somehow, it's hard to read.
  } else if ((['dblclick', 'mousedown'].includes(evt.type)) && evt.button === LEFT_BUTTON) {
    const pointer = table.getIn(['session', 'pointer']);

    const userWantsToEditCell = (evt.type === 'dblclick');
    const userWantsToPointCell = (evt.type === 'mousedown');
    const isCellPointed = (
      cellPosition[ROW].index === pointer.getIn([ROW, 'index']) &&
      cellPosition[COLUMN].index === pointer.getIn([COLUMN, 'index'])
    );
    if (userWantsToPointCell && isCellPointed) {
      return;
    }
    const isCellEditing = (isCellPointed && pointer.get('edit') === true);
    if (userWantsToEditCell && isCellEditing) {
      return;
    }

    // HACK: saving previously pointed cell's value if it changed.
    // NOTE: order of actions is important: at first we save value is necessary,
    //   then we move pointer (otherwise pointed cell changes and value is lost).
    let pointedCellProps;
    if (pointedCell) {
      pointedCellProps = getCellProps(pointedCell);
    }
    // HACK: if cell was editing, when scrolled out of sight
    //   and then scrolled back again, cell.innerText (see getCellValue())
    //   is '' despite being not empty, so we getting data from store.
    if (!pointedCellProps || (pointedCellProps && pointedCellProps.value === '')) {
      const savedPointedCell = table.getIn(['session', 'pointer']);
      pointedCellProps = savedPointedCell.toJS();
    }
    if (pointedCellProps) {
      const previousPointedCellValue = table.getIn([
        'layout',
        ROW,
        'list',
        pointedCellProps[ROW].index,
        'cells',
        pointedCellProps[COLUMN].index,
        'value',
      ], '');

      if (pointedCellProps.value !== previousPointedCellValue) {
        // NOTE: PERF: without batchActions: ~300ms. With batchActions: ~100ms.
        // console.time('cellClickHandler');
        actions.batchActions([
          TableActions.insertRows(pointedCellProps[ROW]),
          TableActions.insertColumns(pointedCellProps[COLUMN]),
          TableActions.setProp({
            ...pointedCellProps,
            prop: 'value',
          }),
        ]);
        // console.timeEnd('cellClickHandler');
      }
    }

    // Main action.
    actions.setPointer(composeCellProps(
      {
        [ROW]: {
          size: null,
        },
        [COLUMN]: {
          size: null,
        },
      },
      {
        edit: userWantsToEditCell,
        selectOnFocus: false,
      },
      cellPosition,
    ));
  }
}
