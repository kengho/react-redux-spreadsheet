// https://gist.github.com/branneman/fc66785c082099298955
export default (evt) => {
  var pageX = evt.pageX;
  var pageY = evt.pageY;
  if (pageX === undefined) {
    pageX = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    pageY = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }

  var rect = evt.target.getBoundingClientRect();
  var offsetX = evt.clientX - rect.left;
  var offsetY = evt.clientY - rect.top;

  return {
    client: { x: evt.clientX, y: evt.clientY }, // relative to the viewport
    screen: { x: evt.screenX, y: evt.screenY }, // relative to the physical screen
    offset: { x: offsetX,     y: offsetY },     // relative to the event target
    page:   { x: pageX,       y: pageY }        // relative to the html document
  };
};
