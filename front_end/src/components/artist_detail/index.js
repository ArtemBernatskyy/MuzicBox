import React, { Component } from "react";
import CSSModules from "react-css-modules";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { mergeNextArtists } from "actions";
import * as Vibrant from "node-vibrant";
import ArtistApi from "api/artist_api";
import { shadeColor } from "utils/misc";

import styles from "./artist_detail.css";

class ArtistsDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      background_color: "#8c8c8c",
      top_color: "#2c2c2c",
      playcount: 0,
      name: "",
      is_loading: true,
      image: "/static/img/artist_default_small.png",
    };
  }

  loadArtistInfo(nextProps = null) {
    // get slug from url
    let artist_slug = this.props.match.params.slug;
    if (nextProps) {
      artist_slug = nextProps.match.params.slug;
    }
    let top_color = this.state.top_color;
    let background_color = this.state.background_color;
    // get artist info
    ArtistApi.getArtist(artist_slug).then(artist_object => {
      this.setState({
        playcount: artist_object.playcount,
        name: artist_object.name,
        image: artist_object.image || this.state.image,
        is_loading: false,
      });
      // set color based on artist info
      if (artist_object.image) {
        Vibrant.from(artist_object.image, 64, 5)
          .getPalette()
          .then(response => {
            if (response["LightVibrant"]) {
              background_color = response["LightVibrant"].getHex();
              top_color = shadeColor(background_color, -65);
              this.setState({
                background_color: background_color,
                top_color: top_color,
              });
            } else {
              this.setState({
                background_color: "#8c8c8c",
                top_color: "#2c2c2c",
              });
            }
          });
      }
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
      <div>
        <div
          style={{
            backgroundColor: this.state.background_color,
            borderTopColor: this.state.top_color,
          }}
          styleName="artist__background"
        />
        <div styleName="artist__info">
          <img
            src={this.state.is_loading ? "/static/img/loader.gif" : this.state.image}
            styleName="artist__image"
            alt="artist's image"
          />
          <div styleName="artist__description">
            <h2>{this.state.name}</h2>
          </div>
        </div>
      </div>
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
