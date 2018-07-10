import {
  CELL,
  COLUMN,
  ROW,
  BEGIN,
  END,
} from '../../constants';
import getCellProps, {
  getCellPosition,
  composeCellProps,
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
  } = this.props;

  if (evt.type === 'mousedown') {
    this.props.actions.setSearchBarFocus(false);
  }

  const cellPosition = getCellPosition({ evt });
  if (!cellPosition) {
    return;
  }

  // Selection.
  console.time('selection');
  // TODO: add ability to select several rectangles with ctrl.
  const firstSelectionRectangle = table.getIn(['session', 'selection', 'rectangles', 0]);
  const selectingInProgress = this.state.selectingInProgress;
  if (!selectingInProgress && (evt.type === 'mousedown') && (evt.button === LEFT_BUTTON)) {
    this.setState({ selectingInProgress: true });
    actions.clearSelection();
    actions.setSelectionRectangleAnchor({
      rectangleIndex: 0,
      selectionAnchorType: BEGIN,
      anchor: cellPosition,
    });
  } else if (selectingInProgress && (evt.type === 'mouseover') && (evt.button === LEFT_BUTTON)) {
    actions.setSelectionRectangleAnchor({
      rectangleIndex: 0,
      selectionAnchorType: END,
      anchor: cellPosition,
    });
  } else if (selectingInProgress && (evt.type === 'mouseup') && (evt.button === LEFT_BUTTON)) {
    this.setState({ selectingInProgress: false });

    // Clear single-cell selection.
    if (
      (
        firstSelectionRectangle.getIn([BEGIN, ROW, 'index']) ===
        firstSelectionRectangle.getIn([END,   ROW, 'index'])
      ) &&
      (
        firstSelectionRectangle.getIn([BEGIN, COLUMN, 'index']) ===
        firstSelectionRectangle.getIn([END,   COLUMN, 'index'])
      )
    ) {
      actions.clearSelection();
    }
  }
  console.timeEnd('selection');

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
    // if (!cellPosition) {
    //   return;
    // }

    // const {
    //   table,
    // } = this.props;
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
