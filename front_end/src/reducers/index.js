import { combineReducers } from "redux";
import { songReducer, activeSongReducer, noSongsReducer } from "./song";
import { isPlayingReducer, isLoadingReducer } from "./player";
import {
  setPlaylistReducer,
  setSearchSongValueReducer,
  setFilterTagValueReducer,
  setOrderingTypeReducer,
  playNextListReducer,
  setAutorSearchValueReducer,
  setSearchSongLoadingReducer,
  scrollToSongReducer,
} from "./playlist";
import { menuOpenReducer } from "./menu";
import { artistReducer, setSearchArtistValueReducer, setSearchArtistLoadingReducer } from "./artist";

const rootReducer = combineReducers({
  filter_tag_value: setFilterTagValueReducer,
  play_next_list: playNextListReducer,
  ordering_type: setOrderingTypeReducer,
  artists: artistReducer,
  no_songs: noSongsReducer,
  songs: songReducer,
  search_artist_value: setSearchArtistValueReducer,
  search_song_value: setSearchSongValueReducer,
  playlist: setPlaylistReducer,
  active_song: activeSongReducer,
  is_playing: isPlayingReducer,
  is_loading: isLoadingReducer,
  is_menu_open: menuOpenReducer,
  is_author_search: setAutorSearchValueReducer,
  is_search_song_loading: setSearchSongLoadingReducer,
  is_search_artist_loading: setSearchArtistLoadingReducer,
  scroll_to_song: scrollToSongReducer,
});

export default rootReducer;
