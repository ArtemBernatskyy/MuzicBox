import * as types from 'constants/action_types';
import initialState from 'constants/initial_state';

export const songs = (state = initialState.songs, action) => {
  switch (action.type) {
    case types.SET_SONGS:
      return action.songObjects;
    case types.MERGE_SONGS: {
      const newsongObjects = { ...action.songObjects };
      newsongObjects.results = action.oldSongObjects.results.concat(action.songObjects.results);
      return newsongObjects;
    }
    default:
      return state;
  }
};

export const activeSong = (state = initialState.activeSong, action) => {
  switch (action.type) {
    case types.PLAY_NEXT:
      document.title = `${action.payload.artist.name} - ${action.payload.name}`;
      return action.payload;
    default:
      return state;
  }
};

export const noSongs = (state = initialState.noSongs, action) => {
  switch (action.type) {
    case types.NO_SONGS:
      return action.payload;
    default:
      return state;
  }
};

export const searchSongValue = (state = initialState.searchSongValue, action) => {
  switch (action.type) {
    case types.SET_SEARCH_SONG_VALUE:
      return action.payload;
    default:
      return state;
  }
};

export const filterTagValue = (state = initialState.filterTagValue, action) => {
  switch (action.type) {
    case types.SET_FILTER_TAG_VALUE:
      return action.payload;
    default:
      return state;
  }
};

export const orderingType = (state = initialState.orderingType, action) => {
  switch (action.type) {
    case types.SET_ORDER_TYPE:
      return action.payload;
    default:
      return state;
  }
};

export const isAuthorSearch = (state = initialState.isAuthorSearch, action) => {
  switch (action.type) {
    case types.IS_AUTHOR_SEARCH:
      return action.payload;
    default:
      return state;
  }
};

export const isSearchSongLoading = (state = initialState.isSearchSongLoading, action) => {
  switch (action.type) {
    case types.TOGGLE_SEARCH_SONG_LOADING:
      return action.payload;
    default:
      return state;
  }
};
