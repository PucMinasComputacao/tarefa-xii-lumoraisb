const API_KEY = "dbb146d02e66cc1a0c876b40c6257928";
const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const FALLBACK_POSTER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="#18141c"/><text x="50%" y="50%" fill="#5a525f" font-family="sans-serif" font-size="18" text-anchor="middle">sem pôster</text></svg>'
  );

const searchInput = document.getElementById("search");
const searchButton = document.getElementById("btnSearch");
const movieList = document.getElementById("movie-list");
const message = document.getElementById("message");

let searchTimer;

async function fetchMovies(query = "") {
  const endpoint = query
    ? `${API_BASE}/search/movie?api_key=${API_KEY}&language=pt-BR&include_adult=false&query=${encodeURIComponent(query)}`
    : `${API_BASE}/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Resposta inesperada da API (${response.status})`);
  }

  const data = await response.json();
  return data.results || [];
}

function createMovieCard(movie) {
  const card = document.createElement("article");
  card.classList.add("movie-card");

  const posterWrap = document.createElement("div");
  posterWrap.classList.add("card-poster-wrap");

  const poster = document.createElement("img");
  poster.classList.add("card-poster");
  poster.src = movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : FALLBACK_POSTER;
  poster.alt = movie.title || "Pôster do filme";
  poster.loading = "lazy";
  poster.addEventListener("error", () => {
    poster.src = FALLBACK_POSTER;
  });

  const rating = document.createElement("span");
  rating.classList.add("card-rating");
  rating.textContent = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

  posterWrap.appendChild(poster);
  posterWrap.appendChild(rating);

  const body = document.createElement("div");
  body.classList.add("card-body");

  const title = document.createElement("h2");
  title.classList.add("card-title");
  title.textContent = movie.title || "Título indisponível";

  const year = document.createElement("span");
  year.classList.add("card-year");
  year.textContent = movie.release_date ? movie.release_date.slice(0, 4) : "Sem data";

  body.appendChild(title);
  body.appendChild(year);

  if (movie.overview) {
    const overview = document.createElement("p");
    overview.classList.add("card-overview");
    overview.textContent = movie.overview;
    body.appendChild(overview);
  }

  card.appendChild(posterWrap);
  card.appendChild(body);

  return card;
}

function renderMovies(movies) {
  movieList.innerHTML = "";

  if (!movies.length) {
    showMessage("Nenhum filme encontrado para essa busca.", "empty");
    return;
  }

  clearMessage();

  movies.forEach((movie, index) => {
    const card = createMovieCard(movie);
    card.style.animationDelay = `${Math.min(index, 12) * 0.04}s`;
    movieList.appendChild(card);
  });
}

function showMessage(text, type = "") {
  message.className = "status-message";
  if (type) {
    message.classList.add(`is-${type}`);
  }
  message.textContent = text;
}

function clearMessage() {
  message.className = "status-message";
  message.textContent = "";
}

async function loadMovies() {
  const query = searchInput.value.trim();
  showMessage(query ? `Buscando "${query}"...` : "Carregando filmes populares...");

  try {
    const movies = await fetchMovies(query);
    renderMovies(movies);
  } catch (error) {
    movieList.innerHTML = "";
    showMessage("Não foi possível carregar os filmes. Verifique sua API key e a conexão.", "error");
  }
}

function init() {
  if (API_KEY === "SUA_CHAVE_AQUI") {
    showMessage("Adicione sua API key do TMDB na constante API_KEY do script.js.", "error");
    return;
  }

  loadMovies();

  searchButton.addEventListener("click", loadMovies);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      loadMovies();
    }
  });

  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadMovies, 450);
  });
}

init();