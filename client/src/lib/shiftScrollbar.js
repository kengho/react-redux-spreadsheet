/* eslint-disable no-undef */
import {
  getColumnNumber,
  getRowNumber,
} from '../core';

const shiftScrollbar = (key, cellElem, cellPos, extra, relapse = false) => {
  let relShift;
  let absShift;
  switch (key) {
    case 'ArrowUp':
      if (relapse) {
        relShift = { y: cellElem.getBoundingClientRect().top };
      } else if (getRowNumber(cellPos) === 0) {
        // Make absolute jump if cellElem is on first row/column.
        absShift = { y: 0 };
      } else {
        relShift = { y: -(cellElem.scrollHeight + extra) };
      }
      break;
    case 'ArrowDown':
      if (relapse) {
        // NOTE: 10 is the size of scrollbar, adding just in case.
        relShift = { y: cellElem.getBoundingClientRect().bottom - window.innerHeight + 10};
      } else {
        relShift = { y: cellElem.scrollHeight + extra };
      }
      break;
    case 'ArrowLeft':
      if (relapse) {
        relShift = { x: cellElem.getBoundingClientRect().left };
      } else if (getColumnNumber(cellPos) === 0) {
        absShift = { x: 0 };
      } else {
        relShift = { x: -(cellElem.scrollWidth + extra) };
      }
      break;
    case 'ArrowRight':
      if (relapse) {
        relShift = { x: cellElem.getBoundingClientRect().right - window.innerWidth + 10 };
      } else {
        relShift = { x: cellElem.scrollWidth + extra };
      }
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

export default shiftScrollbar;
