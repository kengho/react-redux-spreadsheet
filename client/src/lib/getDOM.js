// REVIEW: maybe don't use comma in ids, so we don't need this?
//
// #cell-r1209ca6e-35e6-4e10-b461-2c9a896d0e8f,c5ebc4c1b-d2b5-4ee9-b5a7-85e343db394d-menu
// =>
// #cell-r1209ca6e-35e6-4e10-b461-2c9a896d0e8f\2c c5ebc4c1b-d2b5-4ee9-b5a7-85e343db394d-menu
const replaceQueryComma = (str) => str.replace(',', '\\2c ');

const getDOM = (id) => document.querySelector(`#${replaceQueryComma(id)}`);

export default getDOM;
