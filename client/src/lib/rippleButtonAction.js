const DELAY_BEFORE_ACTION = 200;

// Delaying action until ripple animation isn't finished.
const rippleButtonAction = (action) => {
  return (evt) => {
    // Prevents firing documentClickHandler().
    evt.nativeEvent.stopImmediatePropagation();

    setTimeout(
      action,
      DELAY_BEFORE_ACTION
    );
  };
};

export default rippleButtonAction;
