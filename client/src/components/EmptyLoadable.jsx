import Loadable from 'react-loadable';
import React from 'react';

// TODO: make it work.
export default (path) => Loadable({
  loader: () => import(path),
  loading: () => <div />,
});
