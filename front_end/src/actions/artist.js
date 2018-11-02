import ArtistApi from 'api/artist_api';
import * as types from 'constants/action_types';

export const mergeArtists = (artistsObject, oldArtistsObject) => ({
  type: types.MERGE_ARTISTS,
  artistsObject,
  oldArtistsObject,
});

export const setArtists = artistsObject => ({
  type: types.SET_ARTISTS,
  artistsObject,
});

export const setSearchArtistValue = value => ({
  type: types.SET_SEARCH_ARTIST_VALUE,
  payload: value,
});

export const setSearchArtistLoading = bool => ({
  type: types.TOGGLE_SEARCH_ARTIST_LOADING,
  payload: bool,
});

export function mergeNextArtists(pageUrl) {
  return (dispatch, getState) => {
    const oldArtistsObject = getState().artists;
    ArtistApi.getNextArtists(pageUrl)
      .then((artistsObject) => {
        dispatch(mergeArtists(artistsObject, oldArtistsObject));
      })
      .catch((error) => {
        throw error;
      });
  };
}

export function searchArtists(artist) {
  return (dispatch) => {
    dispatch(setSearchArtistLoading(true)); // setting search artist loading to ON
    dispatch(setSearchArtistValue(artist));
    ArtistApi.searchArtist(artist)
      .then((artists) => {
        dispatch(setArtists(artists));
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        dispatch(setSearchArtistLoading(false)); // setting search artist loading to OFF
      });
  };
}
