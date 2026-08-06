const searchInput = document.querySelector("#search-input");
const searchArtworkButton = document.querySelector("#search-artwork-button");
const searchArtistButton = document.querySelector("#search-artist-button");
const clearButton = document.querySelector("#clear-button");
const searchResultsSection = document.querySelector(".results-panel");
const artworksContainer = document.querySelector("#artworks");
const artistsContainer = document.querySelector("#artists");
const statusMessage = document.querySelector("#status");
const detailView = document.querySelector("#detail-view");
const detailContent = document.querySelector("#detail-content");
const backButton = document.querySelector("#back-button");
const defaultImg = "default.png";
const artworkURL = "https://api.artic.edu/api/v1/artworks";
const arstistURL = "https://api.artic.edu/api/v1/agents";
const itemsPerPage = 8;
const pageNumber = 1;
const proxyBase = "https://corsproxy.io/?url=";

async function fetchArtworks(searchTerm, pageNumber = 1) {
  try {
    showSearchResults();
    statusMessage.textContent = "Loading ...";

    const url = `${artworkURL}/search?q=${encodeURIComponent(searchTerm)}&query[term][is_public_domain]=true&fields=id,title,artist_display,image_id,thumbnail&page=${pageNumber}&limit=${itemsPerPage}`;

    // Added header per documentation https://api.artic.edu/docs/#authentication
    const response = await fetch(url, {
      headers: {
        "AIC-User-Agent": "art-institute-explorer (ogavby@gmail.com)",
      },
    });

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
    // Added header per documentation https://api.artic.edu/docs/#authentication
    const response = await fetch(url, {
      headers: {
        "AIC-User-Agent": "art-institute-explorer (ogavby@gmail.com)",
      },
    });
    if (!response.ok) {
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
    showSearchResults();
    statusMessage.textContent = "Loading ...";
    // Added header per documentation https://api.artic.edu/docs/#authentication
    const url = `${arstistURL}/search?q=${searchTerm}`;
    const response = await fetch(url, {
      headers: {
        "AIC-User-Agent": "art-institute-explorer (ogavby@gmail.com)",
      },
    });
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
async function fetchArtist(id, { inline = false } = {}, afterElement = {}) {
  try {
    const url = `${arstistURL}/${id}`;
    // Added header per documentation https://api.artic.edu/docs/#authentication
    const response = await fetch(url, {
      headers: {
        "AIC-User-Agent": "art-institute-explorer (ogavby@gmail.com)",
      },
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const result = await response.json();
    if (inline) {
      displayArtistInline(result.data, afterElement);
    } else {
      displayArtist(result.data);
    }
  } catch (error) {
    console.error(error);
    statusMessage.textContent = error;
  }
}

// fetch artworks filtered by artist ID
async function fetchArtworkByArtist(
  artistId,
  { inline = false },
  afterElement = {},
) {
  try {
    const url = `${artworkURL}/search?query[term][artist_id]=${artistId}&fields=id,title,artist_display,image_id,thumbnail&limit=8`;
    const response = await fetch(url, {
      headers: {
        "AIC-User-Agent": "art-institute-explorer (ogavby@gmail.com)",
      },
    });
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    const result = await response.json();
    displayArtistArtworks(result, afterElement);
  } catch (error) {
    console.error(error);
    statusMessage.textContent = error;
  }
}

function displayArtworks(artworks) {
  artworksContainer.innerHTML = "";
  artistsContainer.innerHTML = "";
  detailContent.innerHTML = "";

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
    image.loading = "lazy";
    image.src = artwork.image_id
      ? `${imageLinkBase}/${artwork.image_id}/full/400,/0/default.jpg`
      : defaultImg;
    image.onerror = () => {
      image.onerror = null;
      image.src = artwork.thumbnail?.lqip || defaultImg;
      image.alt = artwork.thumbnail?.alt_text || "Image not available";
    };
    card.append(title, artist, image);
    artworksContainer.append(card);
  });
}

function displayArtwork(artwork) {
  const data = artwork.data;
  const imageLinkBase = artwork.config.iiif_url;
  const rawImageUrl = `${imageLinkBase}/${data.image_id}/full/600,/0/default.jpg`

  //   clear the previous details if any
  detailContent.innerHTML = "";

  // generate new detail view
  const title = document.createElement("h2");
  title.textContent = data.title;

  const artist = document.createElement("p");
  artist.textContent = data.artist_display || "Artist unknown";
  if (data.artist_id) {
    const viewArtistDetails = document.createElement("span");
    viewArtistDetails.textContent = "View artist details";
    viewArtistDetails.classList.add("artist-link");
    viewArtistDetails.dataset.id = data.artist_id;
    artist.append(viewArtistDetails);
  }

  const gallery_title = document.createElement("p");
  gallery_title.textContent = data.gallery_title
    ? `Gallery: ${data.gallery_title}`
    : "";

  const image = document.createElement("img");
  image.classList.add("art-image-card");
  image.loading = "lazy";
  image.src = data.image_id
    ? `${imageLinkBase}/${data.image_id}/full/600,/0/default.jpg`
    : defaultImg;

  image.onerror = () => {
    image.onerror = null;
    image.src = data.thumbnail?.lqip || defaultImg;
    image.alt = data.thumbnail?.alt_text || "Image not available";
  };

  const medium = document.createElement("p");
  medium.textContent = data.medium_display
    ? `Medium: ${data.medium_display}`
    : "";

  const date = document.createElement("p");
  date.textContent = data.date_display
    ? `Date of display: ${data.date_display}`
    : "";

  const description = document.createElement("div");
  description.innerHTML = data.description || "";

  const inscriptions = document.createElement("div");
  inscriptions.innerHTML = data.inscriptions || "";

  const credit_line = document.createElement("p");
  credit_line.textContent = data.credit_line
    ? `Credit line: ${data.credit_line}`
    : "";

  const publication_history = document.createElement("div");
  publication_history.innerHTML = data.publication_history || "";

  detailContent.append(
    title,
    gallery_title,
    artist,
    image,
    medium,
    date,
    credit_line,
    description,
    inscriptions,
    publication_history,
  );

  searchResultsSection.classList.add("hidden");
  detailView.classList.remove("hidden");
}

function displayArtists(artists) {
  artistsContainer.innerHTML = "";
  artworksContainer.innerHTML = "";
  detailContent.innerHTML = "";

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
  detailContent.innerHTML = "";

  const name = document.createElement("h2");
  name.textContent = artist.title || "Unknown artist";

  const dates = document.createElement("p");
  const birth = artist.birth_date || "?";
  const death = artist.death_date || "present";
  dates.textContent = `${birth} - ${death}`;

  const viewArtworksForArtist = document.createElement("p");
  viewArtworksForArtist.textContent = "View artworks for this artist";
  viewArtworksForArtist.classList.add("artwork-for-artist-link");
  viewArtworksForArtist.dataset.id = artist.id;

  const description = document.createElement("div");
  description.innerHTML =
    artist.description || `<p>No biography available.</p>`;

  detailContent.append(name, dates, viewArtworksForArtist, description);

  searchResultsSection.classList.add("hidden");
  detailView.classList.remove("hidden");
}

function displayArtistInline(artist, afterElement) {
  // generate div with Artist Details
  const dates = document.createElement("p");
  const birth = artist.birth_date || "?";
  const death = artist.death_date || "present";
  dates.textContent = `${birth} - ${death}`;
  const bio = document.createElement("p");
  bio.textContent = "Biography: ";
  const bioDetails = document.createElement("div");
  bioDetails.innerHTML = artist.description || "Information Not Available";

  const wrapper = document.createElement("div");
  wrapper.classList.add("artist-online-details");
  wrapper.append(dates, bio, bioDetails);

  afterElement.insertAdjacentElement("afterend", wrapper);
}

function displayArtistArtworks(artworks, afterElement) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("artist-artworks");

  const heading = document.createElement("h3");
  heading.textContent = "Artworks by this artist";

  const grid = document.createElement("div");
  grid.classList.add("cards-grid");
  grid.id = "artist-work";

  if (artworks.data.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No artworks found for this artist";
    wrapper.append(heading, empty);
  } else {
    const imageLinkBase = artworks.config.iiif_url;
    artworks.data.forEach((artwork) => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.dataset.id = artwork.id;

      const title = document.createElement("h2");
      title.classList.add("artwork-card-title");
      title.textContent = artwork.title || "Title unavailable";

      const image = document.createElement("img");
      image.classList.add("art-image-card");
      image.loading = "lazy";
      image.src = artwork.image_id
        ? `${imageLinkBase}/${artwork.image_id}/full/400,/0/default.jpg`
        : defaultImg;
      image.onerror = () => {
        image.onerror = null;
        image.src = artwork.thumbnail?.lqip || defaultImg;
        image.alt = artwork.thumbnail?.alt_text || "Image not available";
      };

      card.append(title, image);
      grid.append(card);
    });
    wrapper.append(heading, grid);
  }
  afterElement.insertAdjacentElement("afterend", wrapper);
}

function clearSearchResults() {
  artworksContainer.innerHTML = "";
  artistsContainer.innerHTML = "";
  detailContent.innerHTML = "";
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
  showSearchResults();
}

function showSearchResults() {
  detailView.classList.add("hidden");
  searchResultsSection.classList.remove("hidden");
}

searchArtworkButton.addEventListener("click", handleArtworkSearch);
searchArtistButton.addEventListener("click", handleArtistSearch);
clearButton.addEventListener("click", clearSearchHandle);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleArtworkSearch();
  }
});

artworksContainer.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (!card) return;
  fetchArtwork(card.dataset.id);
});

artistsContainer.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) return;
  fetchArtist(item.dataset.id);
});

backButton.addEventListener("click", () => {
  detailView.classList.add("hidden");
  detailContent.innerHTML = "";
  searchResultsSection.classList.remove("hidden");
});

detailContent.addEventListener("click", (event) => {
  const artistLink = event.target.closest(".artist-link");
  if (artistLink) {
    // validate if inline Artist Details already displayed, to avoid duplicate the details
    const existing = artistLink.nextElementSibling;
    if (existing && existing.classList.contains("artist-online-details")) {
      existing.remove();
      return;
    }
    fetchArtist(artistLink.dataset.id, { inline: true }, artistLink);
  }

  const artworksPerArtistLink = event.target.closest(
    ".artwork-for-artist-link",
  );
  if (artworksPerArtistLink) {
    // check if links was clicked and artworks already displayed on the page
    const existing = artworksPerArtistLink.nextElementSibling;
    if (existing && existing.classList.contains("artist-artworks")) {
      existing.remove();
      return;
    }
    fetchArtworkByArtist(
      artworksPerArtistLink.dataset.id,
      { inline: true },
      artworksPerArtistLink,
    );
  }
});
