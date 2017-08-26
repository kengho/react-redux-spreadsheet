const datetime = () => {
  const pad2 = (number) => ('00' + number).slice(-2);
  const date = new Date();
  const formattedDateTime =
    date.getFullYear() + '-' +
    pad2((date.getMonth() + 1)) + '-' +
    pad2(date.getDate()) + ' ' +
    pad2(date.getHours()) + '-' +
    pad2(date.getMinutes()) + '-' +
    pad2(date.getSeconds());

  return formattedDateTime;
};

export default datetime;
