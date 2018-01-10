import { connect } from 'react-redux';
import shallowEqualWithSkippingProps from './shallowEqualWithSkippingProps';

const connectWithSkippingProps = (
  mapStateToProps,
  mapDispatchToProps,
  skippingProps = []
) => {
  return connect(
    mapStateToProps,
    mapDispatchToProps,
    undefined,
    {
      areStatePropsEqual: (nextStateProps, stateProps) => {
        return shallowEqualWithSkippingProps(
          nextStateProps,
          stateProps,
          skippingProps
        );
      },
    }
  );
};

export default connectWithSkippingProps;
