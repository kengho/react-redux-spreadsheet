const DELAY_BEFORE_ACTION = 100;

// Delaying action until ripple animation isn't finished.
export default (action) => {
  return (evt) => {
    setTimeout(
      action,
      DELAY_BEFORE_ACTION
    );
  };
};
