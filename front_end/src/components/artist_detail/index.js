import React, { Component } from "react";
import CSSModules from "react-css-modules";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { mergeNextArtists } from "actions";
import ArtistApi from "api/artist_api";

import styles from "./artist_detail.css";

class ArtistsDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      background_color: "#8c8c8c",
      top_color: "#2c2c2c",
      playcount: 0,
      name: "",
      isLoading: true,
      image: "/static/img/artist_default_small.png",
    };
  }

  loadArtistInfo(nextProps = null) {
    // get slug from url
    let artistSlug = this.props.match.params.slug;
    if (nextProps) {
      artistSlug = nextProps.match.params.slug;
    }
    // get artist info
    ArtistApi.getArtist(artistSlug)
      .then(artist_object => {
        this.setState({
          playcount: artist_object.playcount,
          name: artist_object.name,
          image: artist_object.image || this.state.image,
          isLoading: false,
          background_color: artist_object.background_color || this.state.background_color,
          top_color: artist_object.top_background_color || this.state.top_color,
        });
      })
      .catch(() => {
        // redirecting to 404 page if Artist isn't visible for user
        this.props.history.push("/404/");
      });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // checking if user clicked on other artist being on artist's page
    // we'r detecting this via location change
    if (!(nextProps.location.pathname == this.props.location.pathname)) {
      this.loadArtistInfo(nextProps);
    }
  }

  componentDidMount() {
    this.loadArtistInfo();
  }

  render() {
    return (
      <React.Fragment>
        <div
          style={{
            backgroundColor: this.state.background_color,
            borderTopColor: this.state.top_color,
          }}
          styleName="artist__background"
        />
        <div styleName="artist__info">
          <img
            src={this.state.isLoading ? "/static/img/loader.gif" : this.state.image}
            styleName="artist__image"
            alt="artist's image"
          />
          <div styleName="artist__description">
            <h2>{this.state.name}</h2>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    artists: state.artists,
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      mergeNextArtists,
    },
    dispatch
  );
}

let ArtistsPageWithStyles = CSSModules(ArtistsDetail, styles, {
  allowMultiple: true,
});

export default connect(
  mapStateToProps,
  matchDispatchToProps
)(ArtistsPageWithStyles);
