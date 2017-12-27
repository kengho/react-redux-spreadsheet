import React from 'react';
import { Link } from 'react-router-dom';

import getRootPath from '../lib/getRootPath';
import './ErrorPageNotFound.css';

const ErrorPageNotFound = () => (
  <div className="error-404">
    <div className="error-404-main-text">404</div>
    <p>Error: page not found.</p>
    <p><Link to={getRootPath()}>Proceed to main page.</Link></p>
  </div>
);

export default ErrorPageNotFound;
