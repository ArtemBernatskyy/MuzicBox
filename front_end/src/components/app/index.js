import React, { Component } from "react";
import { connect } from "react-redux";
import classNames from "classnames/bind";
import CSSModules from "react-css-modules";
import { bindActionCreators } from "redux";
import { Route, Switch, BrowserRouter } from "react-router-dom";
import debounce from "lodash/debounce";
import Hammer from "react-hammerjs";
import { DIRECTION_LEFT, DIRECTION_RIGHT } from "hammerjs";

import { toggleMenu } from "actions";

import Menu from "components/menu";
import NotFound from "components/404";
import Header from "components/header";
import Player from "components/player";
import Upload from "components/upload";
import Playlist from "components/playlist";
import ArtistsPage from "components/artists";
import ArtistsDetail from "components/artist_detail";
import AuthPage from "components/registration";
import FAQPage from "components/faq";

import styles from "./base.css";
let cx = classNames.bind(styles);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scroll_visible: false,
    };
    this.handleScroll = debounce(this.handleScroll, 200);
  }

  handleScroll() {
    if (this.main_div.scrollTop > 300) {
      this.setState({
        scroll_visible: true,
      });
    } else {
      this.setState({
        scroll_visible: false,
      });
    }
  }

  scrollToTop() {
    this.main_div.scrollTop = 0;
  }

  render() {
    let backgroundClass = cx({
      menu__background: true,
      "menu__background--open": this.props.is_menu_open,
    });
    let scrollClass = cx({
      scroll: true,
      hidden_opacity: !this.state.scroll_visible,
    });

    return (
      <BrowserRouter>
        <div>
          <Header />

          <div onScroll={e => this.handleScroll(e)} className="app">
            <Hammer
              options={{
                recognizers: {
                  swipe: { direction: DIRECTION_LEFT },
                },
              }}
              onTap={this.props.toggleMenu.bind(this, false)}
              onSwipe={this.props.toggleMenu.bind(this, false)}
            >
              <div className={backgroundClass} />
            </Hammer>
            <Menu />

            <Hammer
              options={{
                recognizers: {
                  swipe: { direction: DIRECTION_RIGHT },
                },
              }}
              onSwipe={this.props.toggleMenu.bind(this, true)}
            >
              <div ref={ref => (this.main_div = ref)} className="app__center scrollbar-custom bg-white">
                <Switch>
                  <Route exact path="/" component={Playlist} />
                  <Route exact path="/upload/" component={Upload} />
                  <Route exact path="/auth/" component={AuthPage} />
                  <Route exact path="/artists/" component={ArtistsPage} />
                  <Route path="/artist/:slug" component={ArtistsDetail} />
                  <Route exact path="/faq/" component={FAQPage} />
                  <Route component={NotFound} />
                </Switch>
              </div>
            </Hammer>

            <button
              title="Back to top"
              className={scrollClass}
              onClick={() => {
                this.scrollToTop();
              }}
            >
              <span className="arrow-up glyphicon fa fa-chevron-up" />
            </button>
          </div>

          <Player />
        </div>
      </BrowserRouter>
    );
  }
}

function mapStateToProps(state) {
  return {
    is_menu_open: state.is_menu_open,
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

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(CSSModules(App, { allowMultiple: true }));
