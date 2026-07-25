const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const clearButton = document.querySelector("#clear-button");
const resultsContainer = document.querySelector("#results");
const statusMessage = document.querySelector("#status");
const paginationContainer = document.querySelector("#pagination");
const defaultImg = "default.png"
const searchURL = "https://api.artic.edu/api/v1/artworks/search";
const itemsPerPage = 10;
const pageNumber = 1;

async function fetchArtWorks(searchTerm, pageNumber = 1) {
  try {
    statusMessage.textContent = "Loading ...";
    resultsContainer.innerHTML = "";

    const url = `${searchURL}?q=${encodeURIComponent(searchTerm)}&fields=id,title,artist_display,image_id&page=${pageNumber}&limit=${itemsPerPage}
`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const result = await response.json();
    displayArtWork(result);
    displayPagination();
  } catch (error) {
    console.error(error);
    statusMessage.textContent = error;
  }
}

function displayArtWork(artworks) {
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
    title.textContent = artwork.title ? artwork.title : "Title is not available in catalog";

    const artist = document.createElement("p");
    artist.classList.add("artist-card-description");
    artist.textContent = artwork.artist_display ? artwork.artist_display : "Artist information is not available in catalog";

    const image = document.createElement("img");
    image.classList.add("art-image-card");
    image.src = artwork.image_id ? `${imageLinkBase}/${artwork.image_id}/full/400,/0/default.jpg` : defaultImg;

    card.append(title);
    card.append(artist);
    card.append(image);

    resultsContainer.append(card);
  });

  /* TODO: add License underneath
   "info": {
        "license_text": "The `description` field in this response is licensed under a Creative Commons Attribution 4.0 Generic License (CC-By) and the Terms and Conditions of artic.edu. All other data in this response is licensed under a Creative Commons Zero (CC0) 1.0 designation and the Terms and Conditions of artic.edu.",
        "license_links": [
            "https://creativecommons.org/publicdomain/zero/1.0/",
            "https://www.artic.edu/terms"
        ],
  */
}

function displayPagination() {
}

function clearSearchResults() {
  resultsContainer.innerHTML = "";
}

function handleSearch() {
    const searchTerm = searchInput.value.trim();

  if (searchTerm === "") {
    clearSearchResults();
    statusMessage.textContent = "Please enter a search term.";
    return;
  }
  fetchArtWorks(searchTerm);
}

function clearSearchHandle() {
    searchInput.value = "";
    statusMessage.textContent = "";
    clearSearchResults();
}

searchButton.addEventListener("click", handleSearch);
clearButton.addEventListener("click", clearSearchHandle);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        handleSearch();
    }
})


