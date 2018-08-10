import React from "react";

import "./loader.css";

const Loader = () => (
  <div>
    <div className="sk-folding-cube">
      <div className="sk-cube1 sk-cube" />
      <div className="sk-cube2 sk-cube" />
      <div className="sk-cube4 sk-cube" />
      <div className="sk-cube3 sk-cube" />
    </div>
  </div>
);

const BottomLoader = () => (
  <div className="loader__bottom__container">
    <i className="fa fa-circle-o-notch fa-spin loader__bottom" />
  </div>
);

export { Loader, BottomLoader };
