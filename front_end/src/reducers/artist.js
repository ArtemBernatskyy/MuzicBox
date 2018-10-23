import * as types from "actions/action_types";
import initialState from "constants/initial_state";

export const artists = (state = initialState.artists, action) => {
  switch (action.type) {
    case types.SET_ARTISTS:
      return action.artistsObject;
    case types.MERGE_ARTISTS:
      action.artistsObject.results = action.oldArtistsObject.results.concat(action.artistsObject.results);
      return action.artistsObject;
    default:
      return state;
  }
};

export const searchArtistValue = (state = initialState.searchArtistValue, action) => {
  switch (action.type) {
    case types.SET_SEARCH_ARTIST_VALUE:
      return action.payload;
    default:
      return state;
  }
};

export const isSearchArtistLoading = (state = initialState.isSearchArtistLoading, action) => {
  switch (action.type) {
    case types.TOGGLE_SEARCH_ARTIST_LOADING:
      return action.payload;
    default:
      return state;
  }
};
