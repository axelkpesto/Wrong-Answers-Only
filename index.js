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
let readyList = [];

let userList = [];

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

//Socket io keeps track, should assign ids automatically


//We have the client send their answer to the question
//Server recieves who sent and what their their answer was
//When its time to vote:
//Every client recieves username

io.on('connection', async (socket) => {

    console.log('a user connected');
    console.log("UserCount: " + io.engine.clientsCount);


    io.emit('userNumber',io.engine.clientsCount);

    socket.on('name', async (message) => {
        socket.data.username = message;
        console.log(socket.data.username);
        console.log(socket.id);

    });

    socket.on('readyCheck', async (ready) => {
        if(ready) {
            readyList.push(ready);
        }

        if(readyList.length===io.engine.clientsCount) {
            allReady = true;
        }

        let clientSockets = await io.fetchSockets();
        for(clientSocket of clientSockets) {
            console.log(clientSocket.id);
            console.log(clientSocket.data);
        }
    });

    socket.on('disconnect',(socket) => {
        io.emit('userNumber',io.engine.clientsCount);
    });
});

function newID() {
    let random = Math.floor(Math.random() * 127);
    for(let i=0; i<userList.length; i++) {
        if(userList[i]===random) {
            newID();
        }
    } return random;
}


function isUpperCase(str) {
    return str === str.toUpperCase();
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
    currentSet = getRandQuestion()
    currentQuestion = currentSet[0];
    currentAnswer = currentSet[1];
}

//Returns an unused random question
function getRandQuestion() {
    const values = Object.keys(questions);
    let random = Math.floor(Math.random() * values.length)
    let randomQuestion = values[random]
    if(currentSet[randomQuestion][1]) {
        getRandQuestion();
    } else {
        currentSet[randomQuestion][1] = true;
        return [randomQuestion, currentSet[randomQuestion][0]];
    }
}

http.listen((process.env.PORT || 8080), () => console.log('listening on http://localhost:8080'));



