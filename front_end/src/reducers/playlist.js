import * as types from "actions/action_types";
import initialState from "constants/initial_state";

export const playlist = (state = initialState.playlist, action) => {
  switch (action.type) {
    case types.SET_PLAYLIST:
      return action.payload;
    case types.MERGE_PLAYLIST:
      action.playlistObject.results = action.oldPlaylistObject.results.concat(action.playlistObject.results);
      return action.playlistObject;
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

export const isAuthorSearch = (state = initialState.isAuthorSearch, action) => {
  switch (action.type) {
    case types.IS_AUTHOR_SEARCH:
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

export const is_search_song_loading = (state = initialState.is_search_song_loading, action) => {
  switch (action.type) {
    case types.TOGGLE_SEARCH_SONG_LOADING:
      return action.payload;
    default:
      return state;
  }
};

export const playNextList = (state = initialState.playNextList, action) => {
  switch (action.type) {
    case types.TOGGLE_PLAYNEXT_ITEM: {
      let new_play_next = [...action.oldPlayNext];
      let songInPlaylistId = new_play_next.findIndex(song => song.id == action.song.id);
      if (songInPlaylistId !== -1) {
        // removing item if it present in playNextList
        new_play_next.splice(songInPlaylistId, 1);
      } else {
        // if no such item in playNextList then adding it
        new_play_next.push(action.song);
      }
      return new_play_next;
    }
    default:
      return state;
  }
};

export const scroll_to_song = (state = initialState.scroll_to_song, action) => {
  switch (action.type) {
    case types.SCROLL_TO_SONG:
      return action.payload;
    default:
      return state;
  }
};
