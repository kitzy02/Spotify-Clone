
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

loadCards();




                    
                   
                