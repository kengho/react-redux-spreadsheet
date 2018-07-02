import {
  COLUMN,
  ROW,
} from '../../constants';

export default function lineHeaderMenuItems(props) {
  const {
    actions,
    ui,
  } = props;
  const popup = ui.get('popup');

  let lineType;
  if (Number.isInteger(ui.getIn(['popup', ROW, 'index']))) {
    lineType = ROW;
  } else {
    lineType = COLUMN;
  }

  if (lineType === ROW) {
    return [
      {
        label: 'Insert row above',
        action: () => actions.insertLines({
          lineType: ROW,
          index: popup.getIn([ROW, 'index']),
          number: 1,
        }),
      },
      {
        label: 'Insert row below',
        action: () => actions.insertLines({
          lineType: ROW,
          index: popup.getIn([ROW, 'index']) + 1,
          number: 1,
        }),
      },
      {
        label: 'Delete row',
        action: () => actions.deleteLines({
          lineType: ROW,
          index: popup.getIn([ROW, 'index']),
          number: 1,
        }),
      },
    ];
  } else {
    return [
      {
        label: 'Insert column at left',
        action: () => actions.insertLines({
          lineType: COLUMN,
          index: popup.getIn([COLUMN, 'index']),
          number: 1,
        }),
      },
      {
        label: 'Insert column at right',
        action: () => actions.insertLines({
          lineType: COLUMN,
          index: popup.getIn([COLUMN, 'index']) + 1,
          number: 1,
        }),
      },
      {
        label: 'Delete column',
        action: () => actions.deleteLines({
          lineType: COLUMN,
          index: popup.getIn([COLUMN, 'index']),
          number: 1,
        }),
      }
    ];
  }
};
