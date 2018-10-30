import React from 'react';
import Hammer from 'react-hammerjs';
import { connect } from 'react-redux';
import classNames from 'classnames/bind';
import { DIRECTION_LEFT } from 'hammerjs';
import { bindActionCreators } from 'redux';
import CSSModules from 'react-css-modules';
import { NavLink, withRouter } from 'react-router-dom';

import { toggleMenu } from 'actions';
import styles from './menu.css';

const cx = classNames.bind(styles);

const Menu = (props) => {
  const { isMenuOpen, toggleMenu, location } = props;
  const appLeftClass = cx({
    'scrollbar-custom': true,
    app__left: true,
    'app__left--open': isMenuOpen,
  });
  return (
    <Hammer
      options={{
        recognizers: {
          swipe: { direction: DIRECTION_LEFT },
        },
      }}
      onTap={() => toggleMenu(false)}
      onSwipe={() => toggleMenu(false)}
    >
      <div className={appLeftClass}>
        <div className="app__left__container">
          <NavLink
            exact
            to="/"
            onClick={() => toggleMenu(false)}
            styleName="menu"
            activeClassName={styles['menu--active']}
          >
            <i styleName="menu__border" />
            <div styleName="menu__container">
              <div styleName="menu__item">
                <span className="fa fa-play-circle-o" styleName="menu__icon" />
                <div>Songs</div>
              </div>
            </div>
          </NavLink>

          <NavLink
            exact
            to="/upload/"
            onClick={() => toggleMenu(false)}
            styleName="menu"
            activeClassName={styles['menu--active']}
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
            onClick={() => toggleMenu(false)}
            styleName="menu"
            activeClassName={styles['menu--active']}
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
            onClick={() => toggleMenu(false)}
            styleName="menu"
            activeClassName={styles['menu--active']}
          >
            <i styleName="menu__border" />
            <div styleName="menu__container">
              <div styleName="menu__item">
                <span className="fa fa-question-circle-o" styleName="menu__icon" />
                <div>FAQ</div>
              </div>
            </div>
          </NavLink>

          {window.opts.is_authenticated ? (
            <a
              href={`/api/v0/accounts/logout/?nextPage=${location.pathname}`}
              onClick={() => toggleMenu(false)}
              styleName="menu menu--hidden-sm"
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
              onClick={() => toggleMenu(false)}
              styleName="menu menu--hidden-sm"
              activeClassName={styles['menu--active']}
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

        </div>
      </div>
    </Hammer>
  );
};

function mapStateToProps(state) {
  return { isMenuOpen: state.isMenuOpen };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ toggleMenu }, dispatch);
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(CSSModules(Menu, styles, { allowMultiple: true })),
);
