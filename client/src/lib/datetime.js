const datetime = (date = new Date(), format = { timeDelim: '-' } ) => {
  const pad2 = (number) => ('00' + number).slice(-2);
  const formattedDateTime =
    date.getFullYear() + '-' +
    pad2((date.getMonth() + 1)) + '-' +
    pad2(date.getDate()) + ' ' +
    pad2(date.getHours()) + format.timeDelim +
    pad2(date.getMinutes()) + format.timeDelim +
    pad2(date.getSeconds());

  return formattedDateTime;
};

export default datetime;
