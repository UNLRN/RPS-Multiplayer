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

let usr;
$("#Player-2").hide();
$("#join-chat").hide();

// Username and Players
db.ref('players').on('value', function(data) {
    const val = data.val();

    //display for users and players joining
    if (val.player1.username === "") {
        $("#join-chat").hide();
        $("#Player-1").show();
        $("#me").hide();
    }
    if ((val.player1.username === "") && (val.player2.username === "")) {
        $("#join-chat").hide();
        $("#Player-2").hide();
        $("#opponent").show();
    }

    if (val.player1.username !== "") {
        $("#Player-1").hide();
        $("#me").text(val.player1.username);
        $("#me").show();
    }
    if (val.player2.username !== "") {
        $("#Player-2").hide();
        $("#opponent").text(val.player2.username);
        $("#opponent").show();
    }

    if ((val.player1.username !== "") && (val.player2.username === "")){
        $("#join-chat").hide();
        $("#Player-2").show();
        $("#opponent").hide();
    }

    if ((val.player1.username === "") && (val.player2.username !== "")){
        $("#join-chat").hide();
        $("#Player-1").show();
        $("#me").hide();
    }

    if ((val.player1.username !== "") && (val.player2.username !== "") && (usr === undefined)) {
        $("#join-chat").show();
    }

    if ((val.player1.username === usr) || (val.player2.username === usr)) {
        $("#join-chat").hide();
    }

    //display of players
    

});

$("#Player-1 > button").on("click", function(e){
    e.preventDefault();

    usr = $("#Player-1 > input").val().trim();
    db.ref('players/player1').set({username: usr});

});

$("#Player-2 > button").on("click", function(e){
    e.preventDefault();

    usr = $("#Player-2 > input").val().trim();
    db.ref('players/player2').update({username: usr});
});


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