import { combineReducers } from "redux";
import { songs, active_song, noSongs } from "./song";
import { isPlaying, isLoading, is_repeat, progress } from "./player";
import {
  playlist,
  searchSongValue,
  filterTagValue,
  orderingType,
  play_next_list,
  isAuthorSearch,
  is_search_song_loading,
  scroll_to_song,
} from "./playlist";
import { isMenuOpen } from "./menu";
import { artists, searchArtistValue, isSearchArtistLoading } from "./artist";

const rootReducer = combineReducers({
  filterTagValue,
  play_next_list,
  orderingType,
  artists,
  noSongs,
  songs,
  searchArtistValue,
  searchSongValue,
  playlist,
  active_song,
  isPlaying,
  isLoading,
  is_repeat,
  isMenuOpen,
  isAuthorSearch,
  is_search_song_loading,
  isSearchArtistLoading,
  scroll_to_song,
  progress,
});

export default rootReducer;
