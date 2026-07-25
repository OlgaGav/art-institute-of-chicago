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
const itemsPerPage = 10;
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
    displayArtworks(result);
    displayPagination();
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
  try {
    const url = `${arstistURL}/search?q=${searchTerm}`
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const result = await response.json();
    displayArtists(result);
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
      tch;
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
  const totalResults = artworks.pagination.total;
  statusMessage.textContent = `Found ${totalResults} artworks`;

  artworks.data.forEach((artwork) => {
    const card = document.createElement("div");
    card.classList.add("card");
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

function displayPagination() {
  //TODO
}

function displayArtwork(artwork) {
  // TODO
}

function displayArtists(artists) {
  //TODO
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
clearButton.addEventListener("click", clearSearchHandle);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleArtworkSearch();
    handleArtistSearch();
  }
});
