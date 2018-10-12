import Raven from "raven-js";

const filterState = state => {
  return {
    songs: state.songs,
    playlist: state.playlist,
    play_next_list: state.play_next_list,
    search_song_value: state.search_song_value,
    search_artist_value: state.search_artist_value,
    artists: state.artists,
    no_songs: state.no_songs,
    filter_tag_value: state.filter_tag_value,
    ordering_type: state.ordering_type,
    active_song: state.active_song,
    is_author_search: state.is_author_search,
    is_repeat: state.is_repeat,
    progress: state.progress,
  };
};

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("reduxState");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveState = state => {
  try {
    const filteredState = filterState(state);
    const serializedState = JSON.stringify(filteredState);
    localStorage.setItem("reduxState", serializedState);
  } catch (err) {
    Raven.captureException(err);
  }
};
