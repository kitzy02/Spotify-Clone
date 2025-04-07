
console.log("hi this is script section")
const token = 'BQDDm6AbWoEAuC9Ns4-SQQFTMQsTXDM-_A5RznZGUDeqF4ZiF4cCZOddSsObLiebon9F7fB6AzAt7aSRtFCccWvNlXZqzCboaZatuwO1AKUAy8XmMjoyXwMHJP-xN29XPL6TqJC1b0XPYB2_0hlbB_Ux2IUivFSfZVRoitYZQJ89lkE9RpHQ1JWowKROwbjfLjnUSQXJkJDlvo-jv9wNrhPFWLfnJVQbNXbjAs2-FaCPgVXNbLdwmGDdyzAEZNaLZUUQlYgDpk4Zg7EurO3r0aPyf71dFZavJlmRb4wp0aNv8al30LTC_QDZ';

async function fetchWebApi(endpoint, method, body) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Spotify API error:', res.status, errorText);
    throw new Error('Failed to fetch data from Spotify API');
  }

  return await res.json();
}

async function getTopTracks() {
  const data = await fetchWebApi(
    'v1/me/top/tracks?time_range=long_term&limit=5',
    'GET'
  );
  console.log("Fetched top tracks:", data);
  return data.items || [];
}

function createCard(track) {
  const card = document.createElement("div");
  card.classList.add("card");

  const imageUrl = track.album?.images?.[0]?.url || "";
  const trackUrl = track.external_urls?.spotify || "#";
  const artistLinks = track.artists?.map(artist => {
    return `<a href="${artist.external_urls.spotify}" target="_blank">${artist.name}</a>`;
  }).join(", ") || "Unknown Artist";

  card.innerHTML = `
     <div class="image">
       <img src="${imageUrl}" alt="${track.name}">
       <div class="play-button">
         <button class="circle-green"><img src="css/svg/play.svg" alt=""></button>
       </div>
     </div>
     <div class="track-title">
       <a href="${trackUrl}" target="_blank">${track.name}</a>
     </div>
     <div class="track-artists">${artistLinks}</div>
   `;

  console.log("Created card for:", track.name);
  return card;
}

async function loadCards() {
  const container = document.querySelector(".card-container");
  const tracks = await getTopTracks();

  tracks.forEach((track, index) => {
    const card = createCard(track);
    if (card instanceof Node) {
      container.appendChild(card);
    } else {
      console.error(`Card at index ${index} is not a Node`, card);
    }
  });

}

async function getSongs(folder = "songs") {
  const res = await fetch(`./${folder}/`);
  const html = await res.text();


  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  const links = Array.from(tempDiv.querySelectorAll("a"));

  const cards = [];

  for (const link of links) {
    const href = link.getAttribute("href");

    if (href.endsWith(".mp3")) {

      const rawName = decodeURIComponent(href.replace(/^.*[\\/]/, "").replace(".mp3", "").trim());


      const [titlePart, artistPart] = rawName.split(" - ");
      const songName = titlePart?.trim() || rawName;
      const artists = artistPart ? artistPart.split(",").map(a => a.trim()).join(", ") : "Unknown Artist";

      const imageUrl = `./${folder}/img/${songName}.jpg`;

      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <div class="image">
          <img src="${imageUrl}" alt="${songName}">
          <div class="play-button">
            <button class="circle-green">
              <img src="css/svg/play.svg" alt="Play">
            </button>
          </div>
        </div>
        <div class="track-title"><a href="">${songName}</a></div>
                        <div class="track-artists">
                            <a href="">${artists}</a> 
                        </div>
      `;

      console.log("Created card for:", songName);
      cards.push(card);
    }
  }

  return cards;
}


async function loadCardsLocal() {
  const container = document.querySelector(".card-container");
  if (!container) {
    console.error("Missing .card-container in HTML!");
    return;
  }

  const cards = await getSongs("songs");
  cards.forEach(card => container.appendChild(card));
}

function formatTime(time){
  const min=Math.floor(time/60);
  const sec=Math.floor(time%60).toString().padStart(2,'0');
  return `${min}:${sec}`;
}
let currentAudio = null;
let currentIndex = 0;
let songsList = [];
function playAudio(url, trackTitle, trackArtists) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const audio = new Audio(url);
  audio.autoplay = true;
  currentAudio = audio;
  currentAudio.autoplay=true;

  currentIndex = songsList.findIndex(song => 
    song.title === trackTitle && song.artist === trackArtists
  );

  const footer = document.querySelector("footer");
  footer.style.setProperty("background-image", "none", "important");
  footer.style.setProperty("background-color", "gray", "important");
  footer.innerHTML = '';
  footer.innerHTML = `
    <div class="player-controls">
      <div class="track-image"><img src="./songs/img/${trackTitle}.jpg"></div>
      <div class="track-details">
        <div class="track-title1"><a href="#">${trackTitle}</a></div>
        <div class="track-artists1"><a href="#">${trackArtists}</a></div>
      </div>

      <div class="seekbar-control-btns">
        <div class="controls-img">
          <img src="css/svg/previous.svg" alt="Previous" class="control-btn" id="prev">
          <img src="css/svg/pause.svg" alt="Pause" class="control-btn" id="play">
          <img src="css/svg/next.svg" alt="Next" class="control-btn" id="next">
        </div>
        <div class="seekbar-container">
          <div class="songtime current">0:00</div>
          <div class="seekbar" style="position: relative; width: 655px; height: 1px; background: #ccc; cursor: pointer; margin-top: 8px;">
            <div class="circle" style="position: absolute; top: -4px; left: 0; width: 6px; height: 6px; background: #333; border-radius: 50%;"></div>
          </div>
          <div class="songtime duration">0:00</div>
        </div>
      </div>
    </div>
  `;

  const playBtn = document.querySelector("#play");
  const seekbar = document.querySelector(".seekbar");
  const circle = document.querySelector(".circle");
  const current = document.querySelector(".current");
  const duration = document.querySelector(".duration");


  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playBtn.src = "css/svg/pause.svg";
      
    } else {
      audio.pause();
      playBtn.src = "css/svg/play-white.svg";
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    const percent = (audio.currentTime / audio.duration) * 100;
    circle.style.left = `${percent}%`;
    current.textContent = `${formatTime(audio.currentTime)}` 
  });

  
  prev.addEventListener("click", () => {
    currentAudio.pause();
    console.log("Previous clicked");

    if (currentIndex > 0) {
        currentIndex -= 1;
    } else {
        currentIndex = songsList.length - 1; 
    }

    const prevSong = songsList[currentIndex];
    playAudio(prevSong.url, prevSong.title, prevSong.artist);
});

next.addEventListener("click", () => {
    currentAudio.pause();
    console.log("Next clicked");

    currentIndex = (currentIndex + 1) % songsList.length; 
    const nextSong = songsList[currentIndex];
    playAudio(nextSong.url, nextSong.title, nextSong.artist);
});
}


async function main(){
  loadCardsLocal();
  document.querySelector('.card-container').addEventListener('click', function (event) {
    const button = event.target.closest('.circle-green');
    if (!button) return;
    let card = button.closest('.card');
    let trackTitle = card.querySelector(".track-title").innerText;
    let trackArtists = card.querySelector(".track-artists").innerText;
  
    let fileName = `${trackTitle} - ${trackArtists}`;
    let encodedFileName = encodeURIComponent(fileName);
    const audioUrl = `./songs/${encodedFileName}.mp3`;

    const exists = songsList.some(song => song.title === trackTitle && song.artist === trackArtists);
    if (!exists) {
      songsList.push({ title: trackTitle, artist: trackArtists, url: audioUrl });
    }

    playAudio(audioUrl, trackTitle, trackArtists);
  
  });

}
main()




