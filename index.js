//git add .
//git status
//git commit -m "message"
//git push -u origin master

const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

let currentQuestion = "";
let currentAnswer = "";

let allReady = false;
let allVoted = false;

let currentSet = [];

let answerList = [];

let questions = {
    "What color binder is Math?":[["BLUE"],false],
    "What is the worst subject?":[["COMPUTER SCIENCE"],false],
    "What is the best global cuisine?":[["MEXICAN","ITALIAN","INDIAN"],false],
    "What is the best season?":[["SPRING"],false],
    "Most common mothers day gift?":[["FLOWERS"],false],
    "Why is fire hot?":[["because of the THERMAL ENERGY released due to a COMBUSTION REACTION"], false],
    "Why is a pineapple called a pineapple?":[["because of its resemblance to a PINE CONE"], false],
    "What toppings belong on pizza?": [["PEPPERONI", "SAUSAGE", "OLIVES", "ANCHOVIES", "MUSHROOMS", "CHICKEN", "ARTICHOKES", "SPINACH", "GREEN PEPPERS", "CHEESE", "ONION", "GARLIC", "BASIL"], false],
    "Which is the best browser?": [["GOOGLE", "GOOGLE.COM", "DUCKDUCKGO", "DUCKDUCKGO.COM", "GOOGLE CHROME", "BRAVE", "BRAVE.COM"], false],
    "What is the easiest coding language?": [["BLOCK", "HTML", "CSS", "PYTHON"], false],
    "What is the best filling for a sandwich?": [["BACON", "HAM", "CHEESE", "LETTUCE", "TURKEY", "CHICKEN", "PASTRAMI", "KETCHUP", "MUSTARD"], false],
    "Why is there a hole in a donut?":[["FULLY COOK", "COOK THROUGH", "COOK ALL THE WAY", "THROUGH"], false],   
    "why are manhole covers round?":[["so it DOESNT FALL into a hole" ,"so they don't need to be ROTATED"], false],   
    "1+1=":[["2","TWO"], false],   
    "why does lemon tastes sour?":[["they contain CITRIC ACID"], false],
    "What is a synonym for 'fleeting'?":[["SHORT TIME", "SPARSE"],false],
    "Why is your brain wrinkled?":[["to make them more EFFICIENT"],false],
    "What is celebrated on the fourth of July?":[["INDEPENDANCE DAY"],false],
    "What is the best wood in Minecraft?":[["OAK"],false],
    "Why can't T-Rex's clap their hands?":[["they're EXTINCT"],false],
}

//Want to limit number of people to 10

io.on('connection', async (socket) => {

    console.log('a user connected');
    console.log("UserCount: " + io.engine.clientsCount);
    newQuestion();


    io.emit('userNumber',io.engine.clientsCount);

    socket.on('name', async (message) => {
        if(message==="Username") {
            message = socket.id;
        }
        socket.data.username = message;
        console.log(socket.data.username);
    });

    socket.on('readyCheck', async (ready) => {
        socket.data.ready = ready;
        io.emit('allReady',(checkReady()));
    });

    socket.on("answer", async (answer) => {
        socket.data.answer = answer;
        answerList.push([socket.data.answer,socket.data.username]);
        io.emit("answerFromUser",(answerList));
        console.log(answerList);
    });

    socket.on('vote', async (vote) => {
        let clients = await io.fetchSockets();
        socket.data.voted = true;
        for(client of clients) {
            if(vote===client.data.username) {
                client.data.votes += 1;
            }
        }
    });

    socket.on('kicked', (time) => {
        socket.disconnect();
        io.emit('userNumber',io.engine.clientsCount);
        console.log("UserCount: " + io.engine.clientsCount) + ". Player kicked.";
    });

    socket.on('disconnect',(socket) => {
        console.log("UserCount: " + io.engine.clientsCount + ". Player Disconnected.");
    });
});

//If everyones ready"
//stop people from connecting
//Sends out the question
//People answer
//As they answer the questions show up on the tiles
//Once everyone answers the button for voting shows up
//Once everyone votes the next question appears
//Once 10 questions go by the tally for points is calculated
//Leaderboard


function isUpperCase(str) {
    return str === str.toUpperCase();
}

async function checkReady() {
    let clients = await io.fetchSockets();
    for(client of clients) {
        if(!client.data.ready) {
            allReady = false;
            return allReady;
        }
    } 
    
    console.log("everyone is ready");
    newQuestion();
    allReady = true;
    return allReady;
}

async function checkVoted() {
    let clients = await io.fetchSockets();
    for(client of clients) {
        if(!client.data.voted) {
            return;
        }
    } 
    
    newQuestion();
}

async function tally() {
    let clients = await io.fetchSockets();
    for(client of clients) {
        client.data.poits = client.data.votes * 100;
        console.log(client.data.poits);
    }
}

function checkAnswer(answer) {
    for(let i=0; i<currentAnswer.length; i++) {
        let words = currentAnswer[i].split(" ");
        for(let i=0; i<words.length; i++) {
            if(isUpperCase(words[i]) && answer.contains(words[i])) {
                return false;
            }
        }
    } return true;
}

function newQuestion() {
    answerList= [];
    currentSet = getRandQuestion()
    currentQuestion = currentSet[0];
    currentAnswer = currentSet[1];
    io.emit('currentQuestion',currentQuestion);
    console.log(currentQuestion);
}

function getRandQuestion() {
    const values = Object.keys(questions);
    let random = Math.floor(Math.random() * values.length)
    let randomQuestion = values[random];
    if(questions[randomQuestion][1]) {
        getRandQuestion();
    } else {
        questions[randomQuestion][1] = true;
        return [randomQuestion, questions[randomQuestion][0]];
    }
}

http.listen((process.env.PORT || 8080), () => console.log('listening on http://localhost:8080'));

