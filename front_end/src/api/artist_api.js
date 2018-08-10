class ArtistApi {
  static getNextArtists(page_url) {
    let fetch_url;
    if (page_url) {
      fetch_url = page_url;
    } else {
      fetch_url = "/api/v0/artists/";
    }
    return fetch(fetch_url, { credentials: "same-origin" })
      .then(response => response.json())
      .catch(error => {
        throw error;
      });
  }
  static searchArtist(artist_name) {
    return fetch(`/api/v0/artists/?search=${artist_name}`, {
      credentials: "same-origin",
    })
      .then(response => response.json())
      .catch(error => {
        throw error;
      });
  }
  static getArtist(artist_slug) {
    return fetch(`/api/v0/artists/${artist_slug}/`, {
      credentials: "same-origin",
    })
      .then(response => response.json())
      .catch(error => {
        throw error;
      });
  }
}

export default ArtistApi;
