import { Link } from 'react-router-dom';
import React from 'react';

import './ErrorPageNotFound.css';
import getRootPath from '../lib/getRootPath';

const ErrorPageNotFound = () =>
  <div id="error-404">
    <div id="error-404-main-text">404</div>
    <p>Error: page not found.</p>
    <p><Link to={getRootPath()}>Proceed to main page.</Link></p>
  </div>;

export default ErrorPageNotFound;
