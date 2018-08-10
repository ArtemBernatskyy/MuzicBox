import * as types from "actions/action_types";
import initialState from "./initial_state";

export function artistReducer(state = initialState.artists, action) {
  switch (action.type) {
    case types.SET_ARTISTS:
      return action.artists_object;
    case types.MERGE_ARTISTS:
      action.artists_object.results = action.old_artists_object.results.concat(action.artists_object.results);
      return action.artists_object;
    default:
      return state;
  }
}

export function setSearchArtistValueReducer(state = initialState.search_artist_value, action) {
  switch (action.type) {
    case types.SET_SEARCH_ARTIST_VALUE:
      return action.payload;
    default:
      return state;
  }
}

export function setSearchArtistLoadingReducer(state = initialState.is_search_artist_loading, action) {
  switch (action.type) {
    case types.TOGGLE_SEARCH_ARTIST_LOADING:
      return action.payload;
    default:
      return state;
  }
}
