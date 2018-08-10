import ArtistApi from "api/artist_api";
import * as types from "./action_types";

export const mergeArtists = (artists_object, old_artists_object) => {
  return {
    type: types.MERGE_ARTISTS,
    artists_object: artists_object,
    old_artists_object: old_artists_object,
  };
};

export function mergeNextArtists(page_url) {
  return (dispatch, getState) => {
    const old_artists_object = getState().artists;
    ArtistApi.getNextArtists(page_url)
      .then(artists_object => {
        dispatch(mergeArtists(artists_object, old_artists_object));
      })
      .catch(error => {
        throw error;
      });
  };
}

export const setArtists = artists_object => {
  return {
    type: types.SET_ARTISTS,
    artists_object: artists_object,
  };
};

export const setSearchArtistValue = value => {
  return {
    type: types.SET_SEARCH_ARTIST_VALUE,
    payload: value,
  };
};

export const setSearchArtistLoading = bool => {
  return {
    type: types.TOGGLE_SEARCH_ARTIST_LOADING,
    payload: bool,
  };
};

export function searchArtists(artist) {
  return dispatch => {
    dispatch(setSearchArtistLoading(true)); // setting search artist loading to ON
    dispatch(setSearchArtistValue(artist));
    ArtistApi.searchArtist(artist)
      .then(artists => {
        dispatch(setArtists(artists));
      })
      .catch(error => {
        throw error;
      })
      .finally(() => {
        dispatch(setSearchArtistLoading(false)); // setting search artist loading to OFF
      });
  };
}
