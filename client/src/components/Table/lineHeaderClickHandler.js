import {
  COLUMN,
  LINE_HEADER,
  MENU,
  ROW,
} from '../../constants';

import {
  getCellPosition,
  composeCellProps,
} from '../../lib/getCellProps';
import getMousePosition from '../../lib/getMousePosition';

const RIGHT_BUTTON = 2;

export default function lineHeaderClickHandler({ evt }) {
  const actions = this.props.actions;

  // test_845
  if (evt.type !== 'mouseover') {
    this.props.actions.setPointerProps({ edit: false });
  }

  if ((evt.type === 'mousedown') && (evt.button === RIGHT_BUTTON)) {
    const cellPosition = getCellPosition({ evt, allowPartial: true });

    actions.setPopupPlace(LINE_HEADER);
    actions.setPopupCellProps({
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
    });
    actions.openPopup(MENU);
  }
}
