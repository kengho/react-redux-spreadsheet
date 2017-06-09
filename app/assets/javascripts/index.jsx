import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom'; // eslint-disable-line no-unused-vars
import domready from 'domready';
import mountComponents from './lib/mountComponents';

import Landing from './components/Landing';
import Root from './containers/Root';

domready(() => {
  mountComponents({
    Landing,
    Root,
  });
});
