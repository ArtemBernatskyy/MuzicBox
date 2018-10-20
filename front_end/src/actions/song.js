import SongApi from "api/song_api";
import * as types from "./action_types";
import { setPlaylist } from "./playlist";
import { playNext } from "./player";
import { getParameterByName } from "utils/misc";

export const noSongs = bool => ({
  type: types.NO_SONGS,
  payload: bool,
});

export const loadSongDetailsSuccess = song => ({
  type: types.PLAY_NEXT,
  payload: song,
});

export const setSongs = songs_object => ({
  type: types.SET_SONGS,
  songs_object: songs_object,
});

export const mergeSongs = (songs_object, old_songs_object) => ({
  type: types.MERGE_SONGS,
  songs_object: songs_object,
  old_songs_object: old_songs_object,
});

export function initialLoadSongs() {
  return (dispatch, getState) => {
    const old_active_song = getState().active_song;
    const search = getParameterByName("search");
    const isAuthorSearch = getParameterByName("author");
    const tagSlug = getParameterByName("tag");
    const ordering = getParameterByName("o");
    const hasUrlParams = search || isAuthorSearch || tagSlug || ordering;
    // if we have old_active_song then it means that we have localStorage
    const isLocalStorage = old_active_song ? old_active_song.id !== "" : false;

    if (hasUrlParams) {
      // because we don't know name of tag then we will populate it with slug )
      SongApi.fetchSongs(ordering, search, { name: tagSlug, slug: tagSlug }, isAuthorSearch)
        .then(songs_object => {
          dispatch(setSongs(songs_object));
          if (songs_object.results.length > 0) {
            // checking if user has at least one song
            dispatch(setPlaylist(songs_object)); // loading songs in to playlist
            dispatch(playNext(songs_object.results[0])); // setting active first song during onLoad
          } else {
            dispatch(noSongs(true));
          }
        })
        .catch(error => {
          throw error;
        });
    } else if (!isLocalStorage) {
      SongApi.getNextSongs()
        .then(songs_object => {
          dispatch(setSongs(songs_object));
          if (songs_object.results.length > 0) {
            // checking if user has at least one song
            dispatch(setPlaylist(songs_object)); // loading songs in to playlist
            dispatch(playNext(songs_object.results[0])); // setting active first song during onLoad
          } else {
            dispatch(noSongs(true));
          }
        })
        .catch(error => {
          throw error;
        });
    } else {
      dispatch(playNext(old_active_song)); // setting song from localStorage
    }
  };
}

export function mergeNextSongs(page_url) {
  return (dispatch, getState) => {
    const old_songs_object = getState().songs;
    SongApi.getNextSongs(page_url)
      .then(songs_object => {
        dispatch(mergeSongs(songs_object, old_songs_object));
      })
      .catch(error => {
        throw error;
      });
  };
}
