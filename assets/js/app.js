// Initialize Firebase
let config = {
    apiKey: "AIzaSyCB6g0I2W26NmFzI94hfxk6Oquk1FKM8Sg",
    authDomain: "gtbc-rps.firebaseapp.com",
    databaseURL: "https://gtbc-rps.firebaseio.com",
    projectId: "gtbc-rps",
    storageBucket: "gtbc-rps.appspot.com",
    messagingSenderId: "400515423205"
};

firebase.initializeApp(config);

const db = firebase.database();
const player1ref = db.ref('rps/players/player1');
const player2ref = db.ref('rps/players/player2');

let usr, usrKey, player;
let wins = 0;
let losses = 0;
$("#player2").hide();
$("#join-chat").hide();
$("#scores").hide();

const connectedUsers = db.ref('users');
const connectedRef = db.ref(".info/connected");
connectedRef.on('value', function(snap) {
    if (snap.val() === true) {
        let con = connectedUsers.push(true);
        usrKey = con.key;
        con.onDisconnect().remove();
    }
});

connectedUsers.on('child_removed', function(snap) {
    let player1Key;
    let player2Key; 
    db.ref('rps/players/player1').once('value', function(snap) {
        player1Key = snap.val().player1key;
    });
    db.ref('rps/players/player2').once('value', function(snap) {
        player2Key = snap.val().player2key;
    });
    if (snap.key === player1Key) {
        db.ref('rps/players/player1').remove();
    }
    if (snap.key === player2Key) {
        db.ref('rps/players/player2').remove();
    }
});

// db.ref().update({games:0});

db.ref().once('value', function(snap) {
    if (!snap.hasChild("rps")) {
        db.ref().update({rps: ""});
    }
});
// Username and Players
db.ref('rps').on('value', function(data) {
    const val = data.val();

    if (data.hasChild("players")) {
        
        if (data.child("players/player1").exists()) {
            $("#Player-1").hide();
            $("#player1").text(val.players.player1.username);
            $("#player1").show();
        } else {
            if (player === 2) {
                $("#player1").text("Waiting for player 1...");
            } else {
                $("#Player-1").show();
                $("#player1").hide();
            }
            $("#player1-moves > div").addClass("disabled");
        }

        if (data.child("players/player2").exists()) {
            $("#Player-2").hide();
            $("#player2").text(val.players.player2.username);
            $("#player2").show();
        } else {
            if (player === 1) {
                $("#player2").text("Waiting for player 2...");
            } else {
                $("#Player-2").show();
                $("#player2").hide();
            }
            $("#player2-moves > div").addClass("disabled");
        }

        if ((data.child("players/player1").exists()) && (!data.child("players/player2"))) {
            $("#player2").text("Waiting for Player 2");
            if (!$("#player1-moves > div").hasClass("disabled")) {
                $("#player1-moves > div").addClass("disabled");
            }
        }

        if ((data.child("players/player2").exists()) && (!data.child("players/player1"))) {
            $("#player1").text("Waiting for Player 1");
            if (!$("#player2-moves > div").hasClass("disabled")) {
                $("#player2-moves > div").addClass("disabled");
            }
        }

        if ((data.child("players/player1").exists()) && (data.child("players/player2").exists())) {
            if (player == 1) {
                $("#player1-moves > div").removeClass("disabled");
            } else if (player == 2) {
                $("#player2-moves > div").removeClass("disabled");
            }
            $("#scores").show();

        }

        if ((data.child("players/player1/choice").exists()) && (data.child("players/player2/choice").exists())) {
            if (player === 1) {
                let result = RPS(val.players.player1.choice, val.players.player2.choice)
                console.log("You "+result);
                if (result == "Win") {
                    wins++;
                } else if (result == "Lose") {
                    losses++;
                }
                $("#wins").text("Wins: " + wins);
                $("#losses").text("Losses: " + losses);
                $("#result").text("You " + result);
                db.ref("rps/players/player1/choice").remove();
                setTimeout(function() {
                    $("#player1-moves > div").removeClass("disabled");
                    $("#player1-moves > div").css({ "background-color": "#fff", "color":"#333" });
                    $("#result").text("");
                }, 2000);
            }
            if (player === 2) {
                let result = RPS(val.players.player2.choice, val.players.player1.choice);
                console.log("You "+result);
                if (result == "Win") {
                    wins++;
                } else if (result == "Lose") {
                    losses++;
                }
                $("#wins").text("Wins: " + wins);
                $("#losses").text("Losses: " + losses);
                $("#result").text("You " + result);
                db.ref("rps/players/player2/choice").remove();
                setTimeout(function() {
                    $("#player2-moves > div").removeClass("disabled");
                    $("#player2-moves > div").css({ "background-color": "#fff", "color":"#333" });
                    $("#result").text("");
                }, 2000);
            }
        }

    } else {
        $("#Player-1").show();
        $("#player1").hide();
        $("#player1-moves > div").addClass("disabled");
        $("#Player-2").show();
        $("#player2").hide();
        $("#player2-moves > div").addClass("disabled");
    }

});


function RPS (player1, player2) {
    let result = {
        "Paper": {
            "Rock": "Win",
            "Paper": "Tie",
            "Scissors": "Lose"
        },
        "Rock": {
            "Rock": "Tie",
            "Paper": "Lose",
            "Scissors": "Win"
        },
        "Scissors": {
            "Rock": "Lose",
            "Paper": "Win",
            "Scissors": "Tie"
        }
    };
    return result[player1][player2]
}


//Player 1 and 2 joining events
$("#Player-1 > button").on("click", function(e){
    e.preventDefault();

    player = 1;
    usr = $("#Player-1 > input").val().trim();
    db.ref('rps/players/player1').update({
        username: usr,
        player1key: usrKey
    });
    $("#Player-1 > input").val("");

    $("#Player-1").hide();
    $("#Player-2").hide();
    $("#player2").show();
});

$("#Player-2 > button").on("click", function(e){
    e.preventDefault();

    player = 2;
    usr = $("#Player-2 > input").val().trim();
    db.ref('rps/players/player2').update({
        username: usr,
        player2key: usrKey
    });
    $("#Player-2 > input").val("");

    $("#Player-2").hide();
    $("#Player-1").hide();
    $("#player1").show();
});

//Player 1 and 2 moves events
$("#player1-moves > div").on("click", function() {
    $(this).css({ "background-color": "red", "color": "white"});
    let choice = $(this).text();
    player1ref.update({choice: choice});
});

$("#player2-moves > div").on("click", function() {
    $(this).css({ "background-color": "red", "color": "white"});
    let choice = $(this).text();
    player2ref.update({choice: choice});
});

const showWinner = function() {

};



// Chat Functionality

$("#user-input > button").on("click", function(e) {
    e.preventDefault();

    usr = $("#user-input > input").val().trim();
    $("#join-chat").hide();
});


const messagesRef = db.ref('messages');

const messageList = $("#messages");
const submitButton = $("#submit");

const displayMessage = function (key, username, msgText) {
    let div = $("#" + key).length;
    // If an element for that message does not exists yet we create it.
    if (div === 0) {

        let msgContainer = $('<div>');
        $(msgContainer).attr('id', key);
        $(msgContainer).addClass("message-container");

        let msg = $('<div>');
        $(msg).addClass("message");

        let name = $('<div>');
        $(name).addClass("name")

        $(msgContainer).append(msg);
        $(msgContainer).append(name);

        $(msgContainer).appendTo(messageList);

        $(msg).text(msgText)
        $(name).text(username);
        $(messageList).scrollTop($(messageList).prop("scrollHeight"));
    }
};

// Loads messages
const setMessage = function (data) {
    let val = data.val();
    displayMessage(data.key, val.name, val.text);
};

// Saves a new message on the Firebase DB.
const saveMessage = function (e) {
    e.preventDefault();

    if (usr === undefined) usr = "anonymous";
    const msgText = $("#message").val().trim();
    // Check that the user entered a message
    if ($("#message").val().length > 0) {
        messagesRef.push({
            name: usr,
            text: msgText
        }).then(function () {
            $("#message").val("");
        }).catch(function (error) {
            console.error('Error writing new message to Firebase Database', error);
        });
    }
};

// Clears messages

const clearMessage = function (data) {
    let val = data.val();
    let div = $("#" + data.key).length;
        if (div !== 0) {
            $("#" + data.key).remove();
    }
};

messagesRef.limitToLast(3).on('child_added', setMessage);
messagesRef.limitToLast(3).on('child_changed', setMessage);
messagesRef.limitToLast(3).on('child_removed', clearMessage);

$(submitButton).on("click", saveMessage);