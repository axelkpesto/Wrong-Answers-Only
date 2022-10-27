const socket = io('https://wrong-answers-only.herokuapp.com/');

//Booleans
let ready = false;
let allReady = false;
let answered = false;
let voted = false;

//Variable
var interval;

//Integers
let phase = 1;
let playerCounter = 0;

//Queryselectors and elements
let readyButton = document.querySelector("#readyButton");
let textBar = document.getElementById("textBar");
const answerTiles = document.querySelectorAll(".tile .is-child");
const voteButtons = document.querySelectorAll("#voteButton");

//Arrays
let answerList = [];

//Strings
let username = "";


resetTimer();
updateReadyButton();

//Socket functions
socket.on('userNumber', userNum => {
  playerCounter = userNum;
  updatePlayerIcons();
});

socket.on('answerFromUser', (answerList) => {
  for (let i = 0; i < answerList.length; i++) {
    answerTiles[i].parentNode.classList.remove("is-hidden");
    answerTiles[i].querySelector(".title").innerHTML = answerList[i][0];
    answerTiles[i].querySelector(".subtitle").innerHTML = answerList[i][1];
  }
});

socket.on('currentQuestion', currentQuestion => {
  question.innerHTML = currentQuestion;
  resetTiles();
  answered = false;
  voted = false;
});

socket.on('points', (infoList) => {
  resetTiles();
  question.innerHTML = "";
  console.log("User " + infoList[0] + " had " + infoList[1] + " points");
});

socket.on('allReady', check => {
  allReady = check;
});

socket.on('kicked', () => {
  socket.disconnect();
});

//Butten eventlisteners
voteButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    if (!voted) {
      socket.emit('vote', (button.parentNode.childNodes[1].value));
      voted = true;
    }
  });
});

readyButton.addEventListener("click", (e) => {
  ready = true;
  socket.emit('readyCheck', ready);
  updateReadyButton();
});

btn.addEventListener("click", (e) => {
  if (phase === 1 || !ready) {
    updateUsername();
  } else if (allReady) {
    submit();
  }
  updateReadyButton();
});

//Functions
function updateUsername() {
  textbarText = document.getElementById("textBar").value;
  if (textbarText != "") {
    username = textbarText;
    socket.emit('name', username);
    usernameIcon.innerHTML = username;
    phase = 2;
  }
}

function updateReadyButton() {
  if (!ready && phase === 2) {
    if (playerCounter >= 3 && username != "") {
      document.getElementById("readyButton").style.visibility = "visible";
    } else {
      document.getElementById("readyButton").style.visibility = "hidden";
    }
  } else {
    document.getElementById("readyButton").style.visibility = "hidden";
  }
}

function submit() {
  textbarText = document.getElementById("textBar").value;
  if (textbarText != "" && !answered) {
    socket.emit('answer', textbarText);
    textBar.innerHTML = "";
    answered = true;
  }
}

function updatePlayerIcons() {
  if (playerCounter <= 3) {
    playerIcons.innerHTML = playerCounter + "/3 Players";
  } else {
    playerIcons.innerHTML = playerCounter + " Players";
  }
}

function resetTiles() {
  for (let i = 0; i < answerTiles.length; i++) {
    answerTiles[i].parentNode.classList.add("is-hidden");
  }
}



//Timeout timer
function countdown(time) {

  clearInterval(interval);
  let seconds = time * 60;
  interval = setInterval(function() {

    seconds--;

    if (seconds == 0) {
      clearInterval(interval);
      socket.emit('kicked', seconds);
    }
  }, 1000);
}

function resetTimer() {
  countdown(3);
}

window.addEventListener("click", (e) => {
  resetTimer();
});

window.addEventListener("keypress", (e) => {
  resetTimer();
});