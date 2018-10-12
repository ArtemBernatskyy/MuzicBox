import * as types from "actions/action_types";
import initialState from "./initial_state";

export const songs = (state = initialState.songs, action) => {
  switch (action.type) {
    case types.SET_SONGS:
      return action.songs_object;
    case types.MERGE_SONGS:
      action.songs_object.results = action.old_songs_object.results.concat(action.songs_object.results);
      return action.songs_object;
    default:
      return state;
  }
};

export const active_song = (state = initialState.active_song, action) => {
  switch (action.type) {
    case types.PLAY_NEXT:
      document.title = `${action.payload.artist.name} - ${action.payload.name}`;
      return action.payload;
    default:
      return state;
  }
};

export const no_songs = (state = initialState.no_songs, action) => {
  switch (action.type) {
    case types.NO_SONGS:
      return action.payload;
    default:
      return state;
  }
};
