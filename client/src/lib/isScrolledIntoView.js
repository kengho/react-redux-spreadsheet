/* eslint-disable no-undef */
const isScrolledIntoView = (el) => {
  const elemTop = el.getBoundingClientRect().top;
  const elemBottom = el.getBoundingClientRect().bottom;
  const elemCenterY = (elemBottom + elemTop) / 2;
  const isVisibleY = (elemCenterY >= 0) && (elemCenterY <= window.innerHeight) ;

  const elemLeft = el.getBoundingClientRect().left;
  const elemRight = el.getBoundingClientRect().right;
  const elemCenterX = (elemLeft + elemRight) / 2;
  const isVisibleX = (elemCenterX >= 0) && (elemCenterX <= window.innerWidth);

  return { x: isVisibleX, y: isVisibleY };
};

export default isScrolledIntoView;
