import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { NavLink } from "react-router-dom";
import classNames from "classnames/bind";
import CSSModules from "react-css-modules";
import { withRouter } from "react-router-dom";
import Hammer from "react-hammerjs";
import { DIRECTION_LEFT } from "hammerjs";

import { toggleMenu } from "actions";
import styles from "./menu.css";

let cx = classNames.bind(styles);

class Menu extends Component {
  render() {
    let appLeftClass = cx({
      "scrollbar-custom": true,
      app__left: true,
      "app__left--open": this.props.isMenuOpen,
    });
    return (
      <Hammer
        options={{
          recognizers: {
            swipe: { direction: DIRECTION_LEFT },
          },
        }}
        onTap={this.props.toggleMenu.bind(this, false)}
        onSwipe={this.props.toggleMenu.bind(this, false)}
      >
        <div className={appLeftClass}>
          <div className="app__left__container">
            <NavLink
              exact
              to="/"
              onClick={this.props.toggleMenu.bind(this, false)}
              styleName="menu"
              activeClassName={styles["menu--active"]}
            >
              <i styleName="menu__border" />
              <div styleName="menu__container">
                <div styleName="menu__item">
                  <span className="fa fa-play-circle-o" styleName="menu__icon" />
                  <div>Songs</div>
                </div>
              </div>
            </NavLink>

            {window.opts.is_authenticated ? (
              <a
                href={`/api/v0/accounts/logout/?next_page=${this.props.location.pathname}`}
                onClick={this.props.toggleMenu.bind(this, false)}
                styleName="menu"
              >
                <i styleName="menu__border" />
                <div styleName="menu__container">
                  <div styleName="menu__item">
                    <span className="fa fa-sign-in" styleName="menu__icon" />
                    <div>Logout</div>
                  </div>
                </div>
              </a>
            ) : (
              <NavLink
                exact
                to="/auth/"
                onClick={this.props.toggleMenu.bind(this, false)}
                styleName="menu"
                activeClassName={styles["menu--active"]}
              >
                <i styleName="menu__border" />
                <div styleName="menu__container">
                  <div styleName="menu__item">
                    <span className="fa fa-sign-in" styleName="menu__icon" />
                    <div>Login/Register</div>
                  </div>
                </div>
              </NavLink>
            )}

            <NavLink
              exact
              to="/upload/"
              onClick={this.props.toggleMenu.bind(this, false)}
              styleName="menu"
              activeClassName={styles["menu--active"]}
            >
              <i styleName="menu__border" />
              <div styleName="menu__container">
                <div styleName="menu__item">
                  <span className="fa fa-file-o" styleName="menu__icon" />
                  <div>Upload</div>
                </div>
              </div>
            </NavLink>

            <NavLink
              exact
              to="/artists/"
              onClick={this.props.toggleMenu.bind(this, false)}
              styleName="menu"
              activeClassName={styles["menu--active"]}
            >
              <i styleName="menu__border" />
              <div styleName="menu__container">
                <div styleName="menu__item">
                  <span className="fa fa-users" styleName="menu__icon" />
                  <div>Artists</div>
                </div>
              </div>
            </NavLink>

            <div styleName="menu">
              <i styleName="menu__border" />
              <div styleName="menu__container">
                <div styleName="menu__item">
                  <span className="fa fa-fast-backward" styleName="menu__icon" />
                  <div>Playlists</div>
                  <small>(coming soon)</small>
                </div>
              </div>
            </div>

            <div styleName="menu">
              <i styleName="menu__border" />
              <div styleName="menu__container">
                <div styleName="menu__item">
                  <span className="fa fa-music" styleName="menu__icon" />
                  <div>I&#39;m lucky</div>
                  <small>(coming soon)</small>
                </div>
              </div>
            </div>

            <NavLink
              exact
              to="/faq/"
              onClick={this.props.toggleMenu.bind(this, false)}
              styleName="menu"
              activeClassName={styles["menu--active"]}
            >
              <i styleName="menu__border" />
              <div styleName="menu__container">
                <div styleName="menu__item">
                  <span className="fa fa-question-circle-o" styleName="menu__icon" />
                  <div>FAQ</div>
                </div>
              </div>
            </NavLink>
          </div>
        </div>
      </Hammer>
    );
  }
}

function mapStateToProps(state) {
  return {
    isMenuOpen: state.isMenuOpen,
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      toggleMenu,
    },
    dispatch
  );
}

export default withRouter(
  connect(
    mapStateToProps,
    matchDispatchToProps,
    null,
    {
      pure: false,
    }
  )(CSSModules(Menu, styles, { allowMultiple: true }))
);
