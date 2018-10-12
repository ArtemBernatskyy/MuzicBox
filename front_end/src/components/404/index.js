import React from "react";
import { Link } from "react-router-dom";
import CSSModules from "react-css-modules";

import styles from "./404.css";

const NotFound = () => (
  <div styleName="error-page">
    <div>
      <p styleName="code">
        4<span>0</span>
        <span>4</span>
      </p>
      <span styleName="code">
        G<span>0</span>
      </span>
      <Link to="/" styleName="error">
        B<span>A</span>
        <span>C</span>
        <span>K</span>
      </Link>
    </div>
  </div>
);

export default CSSModules(NotFound, styles, { allowMultiple: true });
