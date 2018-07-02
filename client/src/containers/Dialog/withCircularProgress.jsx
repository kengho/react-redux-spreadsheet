import { CircularProgress } from 'material-ui/Progress';
import React from 'react';

export default function withCircularProgress(
  WrappedComponent,
  progress,
  circlularProgressSize = 32,
) {
  return (
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
}
