/* eslint-disable no-undef */
// http://stackoverflow.com/a/22480938/6376451
// (+-)
const isScrolledIntoView = (el) => {
  const elemTop = el.getBoundingClientRect().top;
  const elemBottom = el.getBoundingClientRect().bottom;
  const isVisibleY = (elemTop >= 0) && (elemBottom <= window.innerHeight);

  const elemLeft = el.getBoundingClientRect().left;
  const elemRight = el.getBoundingClientRect().right;
  const isVisibleX = (elemLeft >= 0) && (elemRight <= window.innerWidth);

  return { x: isVisibleX, y: isVisibleY };
};

export default isScrolledIntoView;
