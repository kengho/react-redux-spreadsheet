import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const replacer = (key, value) => (typeof value === 'undefined') ? null : value;
process.log = (x) => console.log(JSON.stringify(x, replacer, 2));
process.clog = (x) => {
  if (process.logBelow) {
    process.log(x);
  }
};
