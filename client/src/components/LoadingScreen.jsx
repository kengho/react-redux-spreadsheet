import { LinearProgress } from 'material-ui/Progress';
import React from 'react';

const LoadingScreen = () => (
  <LinearProgress style={{ width: 'calc(100% + 8px * 2)' }} />
);

export default LoadingScreen;
