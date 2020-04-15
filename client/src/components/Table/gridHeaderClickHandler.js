import {
  COLUMN,
  GRID_HEADER,
  MENU,
  ROW,
} from '../../constants';
import { composeCellProps } from '../../lib/getCellProps';
import getMousePosition from '../../lib/getMousePosition';

const RIGHT_BUTTON = 2;

export default function gridHeaderClickHandler({ evt }) {
  const actions = this.props.actions;

  // test_845
  if (evt.type !== 'mouseover') {
    actions.setPointerProps({ edit: false });
  }

  // test_2000
  if ((evt.type === 'mousedown') && (evt.button === RIGHT_BUTTON)) {
    actions.setPopupPlace(GRID_HEADER);
    actions.setPopupCellProps({
      ...composeCellProps(
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
