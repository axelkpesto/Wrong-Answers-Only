//git add .
//git status
//git commit -m "message"
//git push -u origin master

const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

let userNum = 0;
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

io.on('connection', (socket) => {
    console.log('a user connected');

    io.emit('userID',(newID()));
    userNum++;
    io.emit('userNumber',userNum);
    io.emit('currentQuestion',currentQuestion);

    socket.on('name', (message) => {
        // userList.push([message,userNum]);
    });

    socket.on('readyCheck',(ready) => {
        if(ready) {
            readyList.push(ready);
        }

        if(readyList.length===userNum) {
            allReady = true;
        }
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

//Never calling disconnection from socket
//https://stackoverflow.com/questions/17287330/socket-io-handling-disconnect-event
//Here are some good stackoverflow ideas, most likely disconnect function needs to be called inside of the original one
io.on('disconnection',(socket) => {

    userNum--;
    io.emit('userNumber',userNum);
    //Console log doesnt appear, impossible to debug
    console.log('a user connected, current number is at' + userNum);
});

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



