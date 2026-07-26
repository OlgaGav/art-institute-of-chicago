const searchInput = document.querySelector("#search-input");
const searchArtworkButton = document.querySelector("#search-artwork-button");
const searchArtistButton = document.querySelector("#search-artist-button");
const clearButton = document.querySelector("#clear-button");
const resultsContainer = document.querySelector("#artworks");
const artistsContainer = document.querySelector("#artists");
const statusMessage = document.querySelector("#status");
const paginationContainer = document.querySelector("#pagination");
const defaultImg = "default.png";
const artworkURL = "https://api.artic.edu/api/v1/artworks";
const arstistURL = "https://api.artic.edu/api/v1/agents";
const itemsPerPage = 24;
const pageNumber = 1;

async function fetchArtworks(searchTerm, pageNumber = 1) {
  try {
    statusMessage.textContent = "Loading ...";
    resultsContainer.innerHTML = "";

    const url = `${artworkURL}/search?q=${encodeURIComponent(searchTerm)}&fields=id,title,artist_display,image_id&page=${pageNumber}&limit=${itemsPerPage}
`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const result = await response.json();
    statusMessage.textContent = `Top ${itemsPerPage} results for "${searchTerm}"`;
    displayArtworks(result);
  } catch (error) {
    console.error(error);
    statusMessage.textContent = error;
  }
}

// fetch the details of the artwork by id: /artworks/{id}
async function fetchArtwork(id) {
  try {
    const url = `${artworkURL}/${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      tch;
      throw new Error(`Request failed: ${response.status}`);
    }
    const result = await response.json();
    displayArtwork(result);
  } catch (error) {
    console.error(error);
    statusMessage.textContent = error;
  }
}

async function fetchArtistSearch(searchTerm) {
  statusMessage.textContent = "Loading ...";
  resultsContainer.innerHTML = "";
  try {
    const url = `${arstistURL}/search?q=${searchTerm}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const result = await response.json();
    statusMessage.textContent = "Click on the artist name to learn more";
    displayArtists(result.data);
  } catch (error) {
    console.error(error);
    statusMessage.textContent = error;
  }
}

//fetch the details of the artist by id
async function fetchArtist(id) {
  try {
    const url = `${arstistURL}/${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const result = await response.json();
    displayArtist(result);
  } catch (error) {
    console.error(error);
    statusMessage.textContent = error;
  }
}

function displayArtworks(artworks) {
  if (artworks.data.length === 0) {
    statusMessage.textContent = "No artwork found.";
    return;
  }
  // conifgure the image link per documentation https://api.artic.edu/docs/#iiif-image-api
  const imageLinkBase = artworks.config.iiif_url;

  artworks.data.forEach((artwork) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = artwork.id;
    const title = document.createElement("h2");
    title.classList.add("artwork-card-title");
    title.textContent = artwork.title
      ? artwork.title
      : "Title is not available in catalog";

    const artist = document.createElement("p");
    artist.classList.add("artist-card-description");
    artist.textContent = artwork.artist_display
      ? artwork.artist_display
      : "Artist information is not available in catalog";

    const image = document.createElement("img");
    image.classList.add("art-image-card");
    image.src = artwork.image_id
      ? `${imageLinkBase}/${artwork.image_id}/full/400,/0/default.jpg`
      : defaultImg;

    card.append(title);
    card.append(artist);
    card.append(image);

    resultsContainer.append(card);
  });
}

function displayArtwork(artwork) {
  // TODO
}

function displayArtists(artists) {
  if (artists.length === 0) {
    statusMessage.textContent = "No artists found.";
    return;
  }
  const artistsList = document.createElement("ul");
  artists.map((artist) => {
    const artistLi = document.createElement("li");
    artistLi.textContent = artist.title;
    artistLi.dataset.id = artist.id;
    artistLi.classList.add("artist-item");
    artistsList.append(artistLi);
  });
  artistsContainer.append(artistsList);
}

function displayArtist(artist) {
  //TODO
}

function clearSearchResults() {
  resultsContainer.innerHTML = "";
  artistsContainer.innerHTML = "";
}

function handleArtworkSearch() {
  const searchTerm = searchInput.value.trim();

  if (searchTerm === "") {
    clearSearchResults();
    statusMessage.textContent = "Please enter a search term.";
    return;
  }
  fetchArtworks(searchTerm);
}

function handleArtistSearch() {
  const searchTerm = searchInput.value.trim();
  if (searchTerm === "") {
    clearSearchResults();
    statusMessage.textContent = "Please enter a search term.";
    return;
  }
  fetchArtistSearch(searchTerm);
}

function clearSearchHandle() {
  searchInput.value = "";
  statusMessage.textContent = "";
  clearSearchResults();
}

searchArtworkButton.addEventListener("click", handleArtworkSearch);
searchArtistButton.addEventListener("click", handleArtistSearch);
clearButton.addEventListener("click", clearSearchHandle);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleArtworkSearch();
    // handleArtistSearch();
  }
});
