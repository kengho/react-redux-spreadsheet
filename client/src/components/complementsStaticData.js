// Complements are something to be drawn along with cell.

const defaultComplementPosition = {
  top: '-9999px',
  left: '-9999px',
};

// NOTE: This object could be derived just from its ROW part,
//   but it would look to complicated, also should be calculated for each cell.
//   Code for this transformation may be found below.
const complementsStaticData = {
  lines: {
    'ROW': {
      'ADDRESS': {
        style: {
          width: '32px',
          height: '64px',
          ...defaultComplementPosition,
        },
        ref: undefined,
      },
      'MENU': {
        style: {
          width: '48px',
          height: '64px',
          ...defaultComplementPosition,
        },
        ref: undefined,
      },
    },
    'COLUMN': {
      'ADDRESS': {
        // Values are just reverse of that for ROW.
        style: {
          width: '64px',
          height: '32px',
          ...defaultComplementPosition,
        },
        ref: undefined,
      },
      'MENU': {
        style: {
          width: '64px',
          height: '48px',
          ...defaultComplementPosition,
        },
        ref: undefined,
      },
    },
  },
  order: ['ADDRESS', 'MENU'],
};

// Add ROW using deep clone of COLUMN.
// https://stackoverflow.com/a/5344074/6376451
// this.complements.lines['ROW'] = JSON.parse(JSON.stringify(this.complements.lines['COLUMN']));
//
// // Prepare complements object.
// // There are up to 4 complements because of [0, 0] cell which have them all.
// Object.keys(this.complements.lines).forEach((lineRef) => {
//   this.complements.order.forEach((complementName) => {
//     const complement = this.complements.lines[lineRef][complementName];
//
//     // Swap width and height for ROW.
//     if (lineRef === 'ROW') {
//       const styleNum = complement.styleNum;
//
//       let tmp = styleNum.width;
//       styleNum.width = styleNum.height;
//       styleNum.height = tmp;
//     }
//
//     // Apply getStyle().
//     complement.style = getStyle(complement.styleNum);
//   });
// });

export default complementsStaticData;
