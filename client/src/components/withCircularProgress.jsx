import CircularProgress from '@material-ui/core/CircularProgress';
import React from 'react';

export default (
  WrappedComponent,
  progress,
  circlularProgressSize = 32,
) => (
  <div style={{ position: 'relative' }}>
    {WrappedComponent}
    {progress &&
      <CircularProgress
        size={circlularProgressSize}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: -circlularProgressSize/2,
          marginLeft: -circlularProgressSize/2,
        }}
      />
    }
  </div>
);
