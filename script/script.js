async function getSongs(){
    let songUrl=fetch('http://127.0.0.1:3000/songs');
    for (const songs of songUrl) {
        console.log(songs)
    }
}
getSongs();