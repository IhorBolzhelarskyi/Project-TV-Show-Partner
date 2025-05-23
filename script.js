"use strict";
//Create episode card
const episodeCardTemplate = document.getElementById("episode-card");
const showCardTemplate = document.getElementById("show-card");
const main = document.querySelector(`#main`);
const header = document.querySelector("#header");
const inputSearch = document.querySelector("input");
const OccurrenceOfAValue = document.querySelector("#OccurrenceOfAValue");
const episodesSelect = document.querySelector("#episodes-select");
const errorMessage = document.querySelector("#errorMessage");
const loadingMessage = document.querySelector("#loadingMessage");
const showsSelect = document.querySelector("#show-select");
const pageHead = document.querySelector("h1");

// Define state
const state = {
  shows: [],
  episodes: {},
  searchTerm: "",
  showsListing: true,
};

const createEpisodeCard = (episode) => {
  const card = episodeCardTemplate.content.cloneNode(true);
  // Now we are querying our cloned fragment, not the entire page.
  const { name, season, number, image, summary } = episode;
  const title = `${name} - S${String(season).padStart(2, "0")}E${String(
    number
  ).padStart(2, "0")}`;
  card.querySelector("h3").textContent = title;
  card.querySelector("summary").textContent = summary?.replace(
    /<\/?p>|<\/?br>|<\/?b>|<\/?i>|<br \/> /g,
    ""
  );
  card
    .querySelector("img")
    // added default img in case image:null on few tvShows
    .setAttribute(
      "src",
      image?.medium ??
        "https://thumbs.dreamstime.com/b/%D0%B7%D0%BD%D0%B0%D0%BA-%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%D0%B0-%D0%BA%D1%80%D0%B0%D1%81%D0%BD%D1%8B%D0%B9-%D0%B8%D0%BB%D0%BB%D1%8E%D1%81%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F-%D0%B2%D0%B5%D0%BA%D1%82%D0%BE%D1%80%D0%B0-%D0%BA%D0%BD%D0%BE%D0%BF%D0%BA%D0%B0-%D0%BA%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B3%D0%BE-%D1%86%D0%B2%D0%B5%D1%82%D0%B0-%D0%B7%D0%BD%D0%B0%D0%BA%D0%B0-156620179.jpg"
    );
  // Return the card, rather than directly appending it to the page
  return card;
};

const createShowCard = (show) => {
  const showCard = showCardTemplate.content.cloneNode(true);
  const { id, name, image, summary, rating, genres, status, runtime } = show;
  showCard.querySelector("article").setAttribute("id", `${id}`);
  showCard.querySelector("h2").textContent = name;
  showCard
    .querySelector("img")
    // added default img in case image:null on few tvShows
    .setAttribute(
      "src",
      image?.medium ??
        "https://thumbs.dreamstime.com/b/%D0%B7%D0%BD%D0%B0%D0%BA-%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%D0%B0-%D0%BA%D1%80%D0%B0%D1%81%D0%BD%D1%8B%D0%B9-%D0%B8%D0%BB%D0%BB%D1%8E%D1%81%D1%82%D1%80%D0%B0%D1%86%D0%B8%D1%8F-%D0%B2%D0%B5%D0%BA%D1%82%D0%BE%D1%80%D0%B0-%D0%BA%D0%BD%D0%BE%D0%BF%D0%BA%D0%B0-%D0%BA%D1%80%D0%B0%D1%81%D0%BD%D0%BE%D0%B3%D0%BE-%D1%86%D0%B2%D0%B5%D1%82%D0%B0-%D0%B7%D0%BD%D0%B0%D0%BA%D0%B0-156620179.jpg"
    );

  if (showCard.querySelector("summary")) {
    showCard.querySelector("summary").textContent = summary?.replace(
      /<\/?p>|<\/?br>|<\/?b>|<\/?i>|<br \/> /g,
      ""
    );
  }
  showCard.querySelector(".score").textContent = `Rated: ${rating.average}`;
  showCard.querySelector(".genre").textContent = `Genres: ${genres}`;
  showCard.querySelector(".status").textContent = `Status: ${status}`;
  showCard.querySelector(".runtime").textContent = `Runtime: ${runtime}`;
  return showCard;
};

function createSelectorEpisodes(episodes) {
  episodes.forEach((episode) => {
    const option = document.createElement(`option`);
    option.classList.add(`options`);
    option.value = episode.id;
    option.textContent = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")} - ${episode.name}`;
    episodesSelect.appendChild(option);
  });
}
function createSelectorShows(shows) {
  shows.forEach((show) => {
    const option = document.createElement(`option`);
    option.classList.add(`options`);
    option.value = show.id;
    option.textContent = show.name;
    showsSelect.appendChild(option);
  });
}

//fetch shows data
const fetchShows = async () => {
  try {
    errorMessage.style.display = `none`;
    loadingMessage.textContent = "loading";
    const response = await fetch(`https://api.tvmaze.com/shows`);
    const data = await response.json();
    return data;
  } catch (error) {
    errorMessage.style.display = `contents`;
    errorMessage.textContent = error;
  }
};

const fetchEpisodes = async (showId) => {
  try {
    errorMessage.style.display = `none`;
    loadingMessage.textContent = "loading";
    const response = await fetch(
      `https://api.tvmaze.com/shows/${showId}/episodes`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    errorMessage.style.display = `contents`;
    errorMessage.textContent = error;
  }
};

function fetchAndAddEpisodes(id) {
  fetchEpisodes(id).then((data) => {
    //add received list of episodes to the state
    state.episodes[id] = data;
    //now we have list of episodes, so we can render them
    renderEpisodes(state.episodes[id]);
  });
}


function renderEpisodes(episodes) {
  if (state.searchTerm == "") {
    OccurrenceOfAValue.textContent = `Displaying ${
      state.episodes[showsSelect.value].length
    }/${state.episodes[showsSelect.value].length} episodes`;
    const episodeCard =
      state.episodes[showsSelect.value].map(createEpisodeCard);
    main.innerHTML = "";
    main.append(...episodeCard);
  } else {
    const filteredEpisodes = filterEpisodes();

    //Rendering number of filtered episodes
    OccurrenceOfAValue.textContent = `Displaying ${filteredEpisodes.length}/${
      state.episodes[showsSelect.value].length
    } episodes`;
    const episodeCard = filteredEpisodes.map(createEpisodeCard);
    main.innerHTML = "";
    // Remember we need to append the card to the DOM for it to appear.
    main.append(...episodeCard);
  }
  createSelectorEpisodes(episodes)
  episodesSelect.style.display = `inline`
}

function renderShows() {
  episodesSelect.style.display = `none`;
  let filteredShows = state.shows.filter((show) => {
    return (
      show.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      show.summary
        .toLowerCase()
        .replace(/<\/?p>|<\/?br>|<\/?b>|<\/?i>|<br \/>/g, "")
        .includes(state.searchTerm.toLowerCase())
    );
  });
  OccurrenceOfAValue.textContent = `Displaying ${filteredShows.length}/${
    state.shows.length
  } shows`;
  main.innerHTML = "";
  let showCard = filteredShows.map(createShowCard);
  main.append(...showCard);
}

function filterEpisodes() {
  const showId = showsSelect.value;
  const notNullEpisodes = state.episodes[showId].filter((episode) => {
    return episode.summary != null;
  });
  const filteredEpisodes = notNullEpisodes.filter((episode) => {
    return (
      episode.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      episode.summary
        .toLowerCase()
        .replace(/<\/?p>|<\/?br>|<\/?b>|<\/?i>|<br \/>/g, "")
        .includes(state.searchTerm.toLowerCase())
    );
  });
  return filteredEpisodes;
}

function handleShowSelect() {
  if (showsSelect.value == "all") {
      inputSearch.value = ""
    state.searchTerm = ""
    state.showsListing = true;
    renderShows();
  } else {
    episodesSelect.innerHTML = "<option value=1111>All episodes</option>";
    state.showsListing = false;
    inputSearch.value = ""
    state.searchTerm = ""
    if (Object.keys(state.episodes).includes(showsSelect.value)) {
      renderEpisodes(state.episodes[showsSelect.value]);
    } else {
      fetchAndAddEpisodes(showsSelect.value);
    }
  }
}

function handleShowTitleClick(event) {
  if (event.target.classList.contains("showTitle") && state.showsListing) {
    showsSelect.value = event.target.closest("article").id;
    episodesSelect.innerHTML = "<option value=1111>All episodes</option>";
    state.showsListing = false;
    const showValue = showsSelect.value;
    inputSearch.value = ""
    state.searchTerm = ""
    if (Object.keys(state.episodes).includes(showValue)) {
      renderEpisodes(state.episodes[showValue]);
    } else {
      fetchAndAddEpisodes(showValue);
    }
  }
}

function setup() {

  // fetch shows, sort and render them
  fetchShows().then((shows) => {
    // When the fetchShows Promise resolves, this callback will be called.
    state.shows = shows.sort((a, b) => a.name.localeCompare(b.name));
    createSelectorShows(state.shows);
    loadingMessage.style.display = `none`;
    renderShows();
  });

  // Implementing live search filtering
  inputSearch.addEventListener("keyup", () => {
    state.searchTerm = inputSearch.value;
    // if we are on the shows page, search and render shows
    if (state.showsListing) {
      renderShows();
    } else {
      // if search bar is empty, render all episodes of the show, even if they doesn't has summary or title
      if (state.searchTerm.length == 0) {
        renderEpisodes(state.episodes[showsSelect.value]);
      } else {
        const filteredEpisodes = filterEpisodes();
        renderEpisodes(filteredEpisodes);
      }
    }
  });

  episodesSelect.addEventListener("change", () => {
    const episodeValue = +episodesSelect.value;
    if (episodeValue === 1111) {
      renderEpisodes(state.episodes[showsSelect.value]);
    } else {
      main.innerHTML = "";

      const selectedEpisode = state.episodes[showsSelect.value].find(
        (episode) => episode.id == episodeValue
      );
      if (!selectedEpisode) {
        return;
      }
      const selectedEpisodeCard = createEpisodeCard(selectedEpisode);
      OccurrenceOfAValue.textContent = `Displaying ${1}/${
        state.episodes.length
      } episodes`;
      main.append(selectedEpisodeCard);
    }
  });

  showsSelect.addEventListener(`change`, handleShowSelect);
  main.addEventListener("click", (event) => handleShowTitleClick(event));
}

pageHead.addEventListener(`click`, () => {
  state.showsListing = true;
  showsSelect.value = "all";
  inputSearch.value = ""
  state.searchTerm = ""
  renderShows();
});

window.onload = setup;
