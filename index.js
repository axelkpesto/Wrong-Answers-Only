const http = require('http').createServer();

const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

let userNum = 0;

io.on('connection', (socket) => {
    console.log('a user connected');
    userNum++;
    io.emit('userNumber',userNum);

    socket.on('message', (message) =>     {
        console.log(message);
        io.emit('message', `${socket.id.substr(0,2)} said ${message}` );
    });
});

http.listen((process.env.PORT || 8080), () => console.log('listening on http://localhost:8080'));


//on connection means every time someone joins the game it does what is in the function
//Can keep track of users with a variable and increment the variable every time someone connects
//Can also do disconnect and decrement the number


//every time backend sends something, front end needs to listen for it