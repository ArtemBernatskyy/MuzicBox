import * as types from 'constants/action_types';
import initialState from 'constants/initial_state';

export const playlist = (state = initialState.playlist, action) => {
  switch (action.type) {
    case types.SET_PLAYLIST:
      return action.payload;
    case types.MERGE_PLAYLIST: {
      const newPlaylistObject = { ...action.playlistObject };
      newPlaylistObject.results = action.oldPlaylistObject.results.concat(action.playlistObject.results);
      return newPlaylistObject;
    }
    default:
      return state;
  }
};

export const playNextList = (state = initialState.playNextList, action) => {
  switch (action.type) {
    case types.TOGGLE_PLAYNEXT_ITEM: {
      const newPlayNext = [...action.oldPlayNext];
      const songInPlaylistId = newPlayNext.findIndex(song => song.id === action.song.id);
      if (songInPlaylistId !== -1) {
        // removing item if it present in playNextList
        newPlayNext.splice(songInPlaylistId, 1);
      } else {
        // if no such item in playNextList then adding it
        newPlayNext.push(action.song);
      }
      return newPlayNext;
    }
    default:
      return state;
  }
};

export const scrollIntoViewSong = (state = initialState.scrollIntoViewSong, action) => {
  switch (action.type) {
    case types.SCROLL_TO_SONG:
      return action.payload;
    default:
      return state;
  }
};
