import SongApi from 'api/song_api';
import * as types from './action_types';

export const setPlaylist = songs => ({
  type: types.SET_PLAYLIST,
  payload: songs,
});

export const scrollToSong = songId => ({
  type: types.SCROLL_TO_SONG,
  payload: songId,
});

export const togglePlayNextItemAction = (song, oldPlayNext) => ({
  type: types.TOGGLE_PLAYNEXT_ITEM,
  song,
  oldPlayNext,
});

export function togglePlayNextItem(song) {
  return (dispatch, getState) => {
    const oldPlayNext = getState().playNextList;
    dispatch(togglePlayNextItemAction(song, oldPlayNext));
  };
}

export const mergePlaylist = (playlistObject, oldPlaylistObject) => ({
  type: types.MERGE_PLAYLIST,
  playlistObject,
  oldPlaylistObject,
});

export function mergeNextPlaylist(pageUrl) {
  return (dispatch, getState) => {
    const oldPlaylistObject = getState().playlist;
    SongApi.getNextSongs(pageUrl)
      .then((playlistObject) => {
        dispatch(mergePlaylist(playlistObject, oldPlaylistObject));
      })
      .catch((error) => {
        throw error;
      });
  };
}
