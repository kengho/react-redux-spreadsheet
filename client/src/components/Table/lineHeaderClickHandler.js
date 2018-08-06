import {
  COLUMN,
  LINE_HEADER,
  ROW,
} from '../../constants';

import {
  getCellPosition,
  composeCellProps,
} from '../../lib/getCellProps';
import getMousePosition from '../../lib/getMousePosition';

export default function lineHeaderClickHandler({ evt }) {
  // test_845
  if (evt.type !== 'mouseover') {
    this.props.actions.setPointer({ edit: false });
  }

  if ((evt.type === 'mousedown') && (evt.button === 2)) { // right click
    const cellPosition = getCellPosition({ evt, allowPartial: true });

    this.props.actions.setMenu({
      place: LINE_HEADER,
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
    this.props.actions.openPopup();
  }
}
