class SongApi {
  static getNextSongs(pageUrl) {
    let fetch_url;
    if (pageUrl) {
      fetch_url = pageUrl;
    } else {
      fetch_url = "/api/v0/audio/";
    }
    return fetch(fetch_url, { cache: "no-cache", credentials: "same-origin" })
      .then(response => response.json())
      .catch(error => {
        throw error;
      });
  }

  static getTags() {
    return fetch("/api/v0/tags/", { cache: "no-cache", credentials: "same-origin" })
      .then(response => response.json())
      .catch(error => {
        throw error;
      });
  }

  static fetchSongs(o_type, searchSongValue, filterObject, author) {
    let fetch_url = "";
    if (o_type) {
      fetch_url += `o=${o_type}&`;
    }
    if (searchSongValue) {
      fetch_url += `search=${searchSongValue}&`;
    }
    if (author) {
      fetch_url += `author=true&`;
    }
    if (filterObject && filterObject.slug) {
      fetch_url += `tag=${filterObject.slug}&`;
    }
    // keep url in sync to allow loading state from Url
    history.pushState(null, "", `?${fetch_url}`);
    fetch_url = "/api/v0/audio/?" + fetch_url;
    return fetch(fetch_url, { cache: "no-cache", credentials: "same-origin" })
      .then(response => response.json())
      .catch(error => {
        throw error;
      });
  }

  static getSongLyrics(songId) {
    return fetch(`/api/v0/audio/${songId}/lyrics/`, {
      cache: "no-cache",
      credentials: "same-origin",
    })
      .then(response => response.json())
      .catch(error => {
        throw error;
      });
  }
}

export default SongApi;
