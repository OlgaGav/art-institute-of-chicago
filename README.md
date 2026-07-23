# The Art Institute of Chicago — Artwork Explorer

A small web app for browsing and searching artworks from the Art Institute of Chicago's public API. Search by artist, keyword, or collection, browse results, and click through to see more details on individual pieces.

Built as pre-work for Code the Dream.

## Features

- Search artworks by term or artist name
- Browse a results list 
- Click into an artwork to see more detail (TBU)
- Basic error handling for failed searches, empty results, and failed requests

## Tech stack
- HTML5
- CSS3
- Vanilla JavaScript (ES modules, fetch API)
- Art Institute of Chicago API — no API key required

## Running the project locally

This project uses no build step or dependencies — it's plain HTML/CSS/JS.
- Clone or download this repository
- Open index.html in your browser

**Notes**
- If a search returns no results, the app displays a friendly "no results found" message rather than an empty screen
- If a request to the API fails (e.g. network issue), the app displays an error message instead of breaking silently