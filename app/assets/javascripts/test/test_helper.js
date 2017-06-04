import chai from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import chaiImmutable from 'chai-immutable'; // eslint-disable-line import/no-extraneous-dependencies

chai.use(chaiImmutable);

// eslint-disable-next-line no-undef, no-console
process.log = (x) => console.log(JSON.stringify(x, null, 2));
