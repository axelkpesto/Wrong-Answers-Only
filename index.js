const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

//Strings
let currentQuestion = "";
let currentAnswer = "";

//Booleans
let allReady = false;
let allVoted = false;

//Integers
let askedQuestions = 0;

//Arrays
let currentSet = [];
let answerList = [];

//Objects
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

//Upon connection, 
io.on('connection', async (socket) => {

    console.log('a user connected');
    console.log("UserCount: " + io.engine.clientsCount);

    io.emit('userNumber',io.engine.clientsCount);

    //Set username to passed through message
    socket.on('name', async (message) => {
        if(message==="Username") {
            message = socket.id;
        }
        socket.data.username = message;
        answerList = [];
        console.log(socket.data.username);
    });

    //set user readyness to passed through variable
    socket.on('readyCheck', async (ready) => {
        socket.data.ready = ready;
        io.emit('allReady',(checkReady()));
    });

    //set user answer to passed through variable
    socket.on("answer", async (answer) => {
        socket.data.answer = answer;
        answerList.push([socket.data.answer,socket.data.username]);
        if(checkAnswer(socket.data.answer)) {
            socket.data.passed++;
        }
        io.emit("answerFromUser",(answerList));
    });

    //set user vote to passed through variable
    socket.on('vote', async (vote) => {
        let clients = await io.fetchSockets();
        socket.data.voted = true;
        for(client of clients) {
            if(vote===client.data.username) {
                client.data.votes += 1;
                console.log(client.data.votes);
            }
        }

        checkVoted();

        
    });

    //kick user
    socket.on('kicked', (time) => {
        socket.disconnect();
    });

    //disconnect user
    socket.on('disconnect',(socket) => {
        io.emit('userNumber',io.engine.clientsCount);
        console.log("UserCount: " + io.engine.clientsCount + ". Player Disconnected.");
    });
});

//Check if passed through string is uppercase
function isUpperCase(str) {
    return str === str.toUpperCase();
}

//Check if all users are ready
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

//Check if all users voted
async function checkVoted() {
    let clients = await io.fetchSockets();
    for(client of clients) {
        if(!client.data.voted) {
            return;
        }
    } 
    
    newQuestion();
}

//Tally points
async function tally() {
    let clients = await io.fetchSockets();
    for(client of clients) {
        client.data.points = (client.data.passed * client.data.votes * 100);
        console.log(client.data.username);
        console.log(client.data.points);
        io.emit('points',([client.data.username,client.data.points]));
    }
}

//Check passed through answer
function checkAnswer(answer) {
    for(let i=0; i<currentAnswer.length; i++) {
        let words = currentAnswer[i].split(" ");
        for(let i=0; i<words.length; i++) {
            if(isUpperCase(words[i]) && answer === words[i]) {
                return false;
            }
        }
    } return true;
}

//Reset data for all users
async function resetData() {
    let clients = await io.fetchSockets();
    for(client of clients) {
        client.data.voted = false;
        client.data.answer = "";
    } 
    answerList = [];
}

//Send out question
async function newQuestion() {
    if(askedQuestions < 5) {
        askedQuestions++;
        resetData();
        currentSet = getRandQuestion()
        if(currentSet != undefined && currentSet[0]!=undefined && currentSet[1]!=undefined) {
            currentQuestion = currentSet[0];
            currentAnswer = currentSet[1];
            io.emit('currentQuestion',currentQuestion);
            console.log(currentQuestion);
        } else {
            tally();
        }
    } else {
        tally();
    }
}

//Get a question at random from questions
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

