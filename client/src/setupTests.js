import chai from 'chai';
import chaiImmutable from 'chai-immutable';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

chai.use(chaiImmutable);

// eslint-disable-next-line no-undef, no-console
process.log = (x) => console.log(JSON.stringify(x, null, 2));
