import {
  COLUMN,
  ROW,
  GRID_HEADER,
} from '../../constants';
import { composeCellProps } from '../../lib/getCellProps';
import getMousePosition from '../../lib/getMousePosition';

export default function gridHeaderClickHandler({ evt }) {
  if ((evt.type === 'mousedown') && (evt.button === 2)) { // right click
    this.props.actions.setMenu({
      place: GRID_HEADER,
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
    })
    this.props.actions.openPopup();
  }
}
