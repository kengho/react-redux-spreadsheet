/* eslint-disable no-undef */
import {
  getColumnNumber,
  getRowNumber,
} from '../core';

const scrollbarShift = (key, pointedCellAfter, pointedCellAfterPos, extra) => {
  let relShift;
  let absShift;
  switch (key) {
    case 'ArrowUp':
      // Make absolute jump if pointedCellAfter is on first row/column.
      if (getRowNumber(pointedCellAfterPos) === 0) {
        absShift = { y: 0 };
      } else {
        relShift = { y: -(pointedCellAfter.scrollHeight + extra) };
      }
      break;
    case 'ArrowDown':
      relShift = { y: pointedCellAfter.scrollHeight + extra };
      break;
    case 'ArrowLeft':
      if (getColumnNumber(pointedCellAfterPos) === 0) {
        absShift = { x: 0 };
      } else {
        relShift = { x: -(pointedCellAfter.scrollWidth + extra) };
      }
      break;
    case 'ArrowRight':
      relShift = { x: pointedCellAfter.scrollWidth + extra };
      break;
    case 'PageUp':
      absShift = { y: 0 };
      break;
    case 'PageDown':
      absShift = { y: document.body.scrollHeight };
      break;
    case 'Home':
      absShift = { x: 0 };
      break;
    case 'End':
      absShift = { x: document.body.scrollWidth };
      break;
    default:
      break;
  }

  const effectiveShift = {};
  if (relShift) {
    effectiveShift.x = relShift.x || 0;
    effectiveShift.y = relShift.y || 0;

    window.scrollBy(effectiveShift.x, effectiveShift.y);
  } else if (absShift) {
    const currentScrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    effectiveShift.x = absShift.x || (absShift.x === 0 ? 0 : currentScrollLeft);
    effectiveShift.y = absShift.y || (absShift.y === 0 ? 0 : currentScrollTop);

    window.scrollTo(effectiveShift.x, effectiveShift.y);
  }
};

export default scrollbarShift;
