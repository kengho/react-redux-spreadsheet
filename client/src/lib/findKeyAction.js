const findKeyAction = (evt, options) => {
  const option = options.find((item) => {
    let keyMatch;
    if (item.condition) {
      keyMatch = item.condition();
    } else if (item.keys) {
      keyMatch = (item.keys.includes(evt.key));
    } else if (item.key) {
      keyMatch = (item.key === evt.key);
    } else if (item.which) {
      keyMatch = (item.which === evt.which);
    } else if (item.whichs) {
      keyMatch = (item.whichs.includes(evt.which));
    }

    return (
      keyMatch &&
      (evt.altKey || false) === (item.altKey || false) &&
      (evt.ctrlKey || false) === (item.ctrlKey || false) &&
      (evt.shiftKey || false)  === (item.shiftKey || false)
    );
  });

  let action = null;
  if (option) {
    action = option.action;
  }

  return action;
};

export default findKeyAction;
