
let currentSong = new Audio();

let SongLibrary;
let currFolder;

let parts;
let artist;
let songTitle;

function secondsToMinutesSeconds(seconds) {
    // Round seconds to the nearest whole number
    seconds = Math.round(seconds);

    // Calculate minutes and seconds
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;

    // Format minutes and seconds with leading zeros if necessary
    var formattedMinutes = minutes < 10? "0" + minutes : minutes;
    var formattedSeconds = remainingSeconds < 10? "0" + remainingSeconds : remainingSeconds;

    // Combine minutes and seconds with a colon and return the result
    return formattedMinutes + ":" + formattedSeconds;
}

async function getsongs(folder) {
    currFolder = folder
    let a  = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text()
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as =  div.getElementsByTagName("a")
    SongLibrary = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            
            let songName = decodeURIComponent(element.href.split(`/${folder}/`)[1].replace(".mp3", ""));
            console.log("Decoded File Name:",songName)
            // Extract artist name from the filename or metadata (assuming it's separated by '-')
            parts = songName.split(' - ');
            console.log(parts)
            songTitle = parts.length > 1 ? parts[1].trim() : parts[0].trim();
            artist = parts.length > 1 ? parts[0].trim() : "Unknown Artist";
            SongLibrary.push({  title: songTitle, artist: artist  });
        }
        

        
        
    // console.log(as)    
    }


    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of SongLibrary) {
        
        songUl.innerHTML += `<li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
          <div>${song.title.replaceAll("%20"," ")}</div>
          <div>${song.artist.replaceAll("%20"," ")}</div>
          
        </div>
        <div class="playnow">
          <span>Play </span>
          <img class="invert" src="playSong.svg" alt="">
         </div></li>`

  
    }
    //attach each song with an event listner
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener( 'click',element =>{
            // console.log(e)
            // console.log(e.querySelector(".info").children.innerHTML)
            playMusic([e.querySelector(".info").children[0].innerHTML, e.querySelector(".info").children[1].innerHTML])

        })
    });

    return SongLibrary
    
}
const playMusic = (track, pause = false) => {

    artist = track[1]; // Get the artist name
    console.log(artist)
    songTitle = track[0]; // Get the song name

    // Construct the file path with both artist and song
    let originalTrack = (artist=="Unknown Artist"? `${songTitle}`:`${artist} - ${songTitle}`);
    console.log(originalTrack)
    

    // Set the new source for the audio element
    currentSong.src = `/${currFolder}/${originalTrack}.mp3`;
    console.log(originalTrack)

    
    
        if (!pause) {
            // If pause is false, play the new song
            currentSong.play();
            play.src = "pause.svg";
        }
    

    // Update the song info display
    document.querySelector(".songinfo").innerHTML = track[0];
    console.log(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};



async function displayAlbums(){
    let a  = await fetch(`/SongLibrary/`)
    let response = await a.text()
    
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName('a') 

    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
            
        
        if(e.href.includes("/SongLibrary/") && !e.href.includes(".htaccess")){
            
            let folder = e.href.split("/").slice(-1)[0];
            //get the metaa data of the folder
            let a  = await fetch(`/SongLibrary/${folder}/info.json`)
            let response = await a.json()
            console.log(response)

            cardContainer.innerHTML += ` 
            <div data-folder = "${folder}" class="cards ">
                <div class="play">
                    <img class = "play-icon"src="playButton.svg" alt="">
                </div>
                <img src="/SongLibrary/${folder}/cover.jpg" alt="">
                <h2 class = "card-title">${response.title}</h2>
                <p>${response.description}</p>

            </div>`
        }
    }
    //load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("cards")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(`SongLibrary/${item.currentTarget.dataset.folder}`);
            // console.log(Object.values(SongLibrary[0]))
            playMusic(Object.values(SongLibrary[0]));
        });
    });



    // console.log(anchors)
}
async function main(){
    //get the list of all songs
    await getsongs("SongLibrary/cs");
    // playMusic(Object.values(SongLibrary[0]),true);
    console.log(SongLibrary)

    //display all the albums on the page
    await displayAlbums()

    
    //attach an event listner to play, next and previous

    play.addEventListener('click', ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src="/pause.svg"
        }
        else{
            currentSong.pause()
            play.src="/playSong.svg"
        }
    })
    //listen for timeupdate event
    currentSong.addEventListener("timeupdate",()=>{
        
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} 
        / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + '%' 
        
    })

    // add an eventlistner to seekbar
    document.querySelector('.seekbar').addEventListener('click',e =>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = (percent * (currentSong.duration))/100;
    }) 

    //add an eventListner for hamburger
    document.querySelector(".hamburgerContainer").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".logo").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-100%"
    })
    
    //add an eventlistner to previous
    previous.addEventListener("click", () => {
        let index = SongLibrary.findIndex(song => song.title === document.querySelector(".songinfo").innerHTML);
        if (index >= 0) {
            playMusic(Object.values(SongLibrary[index - 1]));
        }
    });

    //add an eventlistner to next
    next.addEventListener("click", () => {
        let index = SongLibrary.findIndex(song => song.title === document.querySelector(".songinfo").innerHTML);
        if ((index + 1) < SongLibrary.length ) {
            playMusic(Object.values(SongLibrary[index + 1]));
        }
    });
    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener('change',(e)=>{
        
        currentSong.volume = parseInt(e.target.value)/100
        if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
        }
    })

    document.querySelector(".volume>img").addEventListener('click',(e)=>{
        if(e.target.src.includes ("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentSong.volume = .10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

}
main()