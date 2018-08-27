import { toggleMenu } from "./menu";
import {
  searchSong,
  setPlaylist,
  setSearchSongValue,
  filterSongByTag,
  orderSongByValue,
  togglePlayNextItem,
  mergeNextPlaylist,
  scrollToSong,
} from "./playlist";
import { setIsPlaying, playNext, emitIsLoading } from "./player";
import { initialLoadSongs, setSongs, loadSongs, mergeNextSongs, noSongs } from "./song";
import { loadArtists, mergeNextArtists, searchArtists, setSearchArtistValue, setArtists } from "./artist";

export {
  initialLoadSongs,
  setSongs,
  setIsPlaying,
  playNext,
  loadSongs,
  toggleMenu,
  searchSong,
  togglePlayNextItem,
  setPlaylist,
  setSearchSongValue,
  loadArtists,
  mergeNextArtists,
  mergeNextPlaylist,
  mergeNextSongs,
  searchArtists,
  setSearchArtistValue,
  filterSongByTag,
  noSongs,
  setArtists,
  orderSongByValue,
  scrollToSong,
  emitIsLoading,
};
