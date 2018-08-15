import PropTypes from 'prop-types';
import React from 'react';

import './GridHeader.css'
import { GRID_HEADER } from '../../constants';

const propTypes = {
  style: PropTypes.object.isRequired,
};

const GridHeader = (props) =>
  <div
    id="grid-header"
    style={props.style}
    data-component-name={GRID_HEADER}
  />;

GridHeader.propTypes = propTypes;

export default GridHeader;
