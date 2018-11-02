import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import CSSModules from 'react-css-modules';

import ArtistApi from 'api/artist_api';
import styles from './artist_detail.css';

class ArtistsDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: '#8c8c8c',
      borderTopColor: '#2c2c2c',
      // playcount: 0,
      name: '',
      isLoading: true,
      image: '/static/img/artist_default_small.png',
    };
  }

  componentDidMount() {
    this.loadArtistInfo();
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    const { location: oldLocation } = prevProps;
    // checking if user clicked on other artist being on artist's page
    // we'r detecting this via location change
    if (oldLocation !== location) {
      this.loadArtistInfo();
    }
  }

  loadArtistInfo() {
    const { match, history } = this.props;
    const { image, backgroundColor, borderTopColor } = this.state;
    // get slug from url
    const artistSlug = match.params.slug;
    // get artist info
    ArtistApi.getArtist(artistSlug)
      .then((artistObject) => {
        this.setState({
          // playcount: artistObject.playcount,
          name: artistObject.name,
          image: artistObject.image || image,
          isLoading: false,
          backgroundColor: artistObject.background_color || backgroundColor,
          borderTopColor: artistObject.top_background_color || borderTopColor,
        });
      })
      .catch(() => {
        // redirecting to 404 page if Artist isn't visible for user
        history.push('/404/');
      });
  }

  render() {
    const {
      image, backgroundColor, borderTopColor, name, isLoading,
    } = this.state;
    return (
      <React.Fragment>
        <div
          style={{
            backgroundColor, borderTopColor,
          }}
          styleName="artist__background"
        />
        <div styleName="artist__info">
          <img src={isLoading ? '/static/img/loader.gif' : image} styleName="artist__image" alt="artist cover" />
          <div styleName="artist__description">
            <h2>{name}</h2>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

function mapStateToProps(state) {
  return { artists: state.artists };
}

export default connect(
  mapStateToProps,
)(CSSModules(ArtistsDetail, styles, { allowMultiple: true }));
