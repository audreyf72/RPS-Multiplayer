// Initialize Firebase
var config = {
	apiKey: "AIzaSyASuLVWTU7fUwdSoR4A-cQkfyiKamD8Wu0",
	authDomain: "rps-multiplayer-b5850.firebaseapp.com",
	databaseURL: "https://rps-multiplayer-b5850.firebaseio.com",
	projectId: "rps-multiplayer-b5850",
	storageBucket: "",
	messagingSenderId: "1062833058483"
};
firebase.initializeApp(config);

var database = firebase.database();

//Global variables
var PlayerName = '';
var user_1_Name = "";
var user_2_Name = "";
var user_1_Choice = "";
var user_2_Choice = "";
var newMessage = "";
var player_1_win = 0;
var player_1_lose = 0;
var player_2_win = 0;
var player_2_lose = 0;
var turns = 1;
var delayTimer;
var delayTimer2;
var gameReset = false;

//Document Ready
$(document).ready(function () {

	//this object handles the score check
	var CheckWinners = {
		//restart the game to turn 1
		resetGame: function () {
			gameReset = false;
			turns = 1;
			//update the turn in the firebase to 1
			database.ref().update({
				turn: turns
			});
		},
		//clear the 3 seconds timeout and call the reset
		clearDelay: function () {
			clearTimeout(delayTimer);
			CheckWinners.resetGame();
		},
		//update winner message to winner 1 
		updateWinner1: function () {
			$("#winner").html(user_1_Name + " wins!!");
		},
		//update winner message to winner 1 
		updateWinner2: function () {
			$("#winner").html(user_2_Name + " wins!!");
		},
		//update the database to match the player score after the increases
		updateScore: function () {
			database.ref("players/1").update({
				win: player_1_win,
				lose: player_1_lose,
			});//database update
			database.ref("players/2").update({
				win: player_2_win,
				lose: player_2_lose,
			});//database update
		},
		//update the local vairable of player scores then call the winner message update and call the score update in the database
		playerScore: function () {
			// If user picked rock and computer picked scissors then user wins.
			if (user_1_Choice == "rock" && user_2_Choice == "scissors") {
				player_1_win++;
				player_2_lose++;
				CheckWinners.updateWinner1();
				CheckWinners.updateScore();
			}
			// if user picked rock and computer picked paper then user loses
			if (user_1_Choice == "rock" && user_2_Choice == "paper") {
				player_1_lose++;
				player_2_win++;
				CheckWinners.updateWinner2();
				CheckWinners.updateScore();
			}
			// if user picked scissor and computer picked rock then user loses
			if (user_1_Choice == "scissors" && user_2_Choice == "rock") {
				player_1_lose++;
				player_2_win++;
				CheckWinners.updateWinner2();
				CheckWinners.updateScore();
			}
			// if user picked scissor and computer picked paper then user wins
			if (user_1_Choice == "scissors" && user_2_Choice == "paper") {
				player_1_win++;
				player_2_lose++;
				CheckWinners.updateWinner1();
				CheckWinners.updateScore();
			}
			// if user picked paper and computer picked rock then user wins
			if (user_1_Choice == "paper" && user_2_Choice == "rock") {
				player_1_win++;
				player_2_lose++;
				CheckWinners.updateWinner1();
				CheckWinners.updateScore();
			}
			// if user picked paper and computer picked scissor then user loses				
			if (user_1_Choice == "paper" && user_2_Choice == "scissors") {
				player_1_lose++;
				player_2_win++;
				CheckWinners.updateWinner2();
				CheckWinners.updateScore();
			}
			// if user and computer picks the same
			if (user_1_Choice == user_2_Choice) {
				$("#winner").html("It's a tie!");
			}

		}//playerScore
	}//checkWinners


	//DOM on initial Load
	$("#greetings").html("<h2>Enter Your Name to Play</h2>"
		+ "<input type='text' id='nameInput'>" +
		"<input type='submit' id='submitName'>");
	$("#waiting1").html("Waiting for player 1...");
	$("#waiting2").html("Waiting for player 2...");

	//Hide these when both players dont exist
	function hidden() {
		$("#player1choices").attr("style", "visibility:hidden");
		$("#player2choices").attr("style", "visibility:hidden");
		$("#group2message").attr("style", "visibility:hidden");
		$("#group1message").attr("style", "visibility:hidden");
	}
	hidden();

	//this will run after every database change
	database.ref().on("value", function (snapshot) {

		function playerDisconnect() {
			if (PlayerName != "") {
				//if this is Player 1's browser
				if ((snapshot.child("players").child(1).exists()) && (PlayerName == snapshot.child("players").child(1).val().name)) {
					//update the message to the database
					database.ref("/chat").onDisconnect().update({
						message: ((snapshot.child("players").child(1).val().name) + " has been disconnected."),
						dateAdded: firebase.database.ServerValue.TIMESTAMP
					});
					//delete the player 1 database
					database.ref("players/1").onDisconnect().remove();
					//if this is Player 2's browser
				} else if ((snapshot.child("players").child(2).exists()) && (PlayerName == snapshot.child("players").child(2).val().name)) {
					//update the message to the database	
					database.ref("/chat").onDisconnect().update({
						message: ((snapshot.child("players").child(2).val().name) + " has been disconnected."),
						dateAdded: firebase.database.ServerValue.TIMESTAMP
					});//database	
					//delete the player 1 database
					database.ref("players/2").onDisconnect().remove();
					//delete the turn database				
					database.ref("/turn").onDisconnect().remove();
				}
			}
		}

		//before player 1 joins the game
		if (((snapshot.child("players").child(1).exists()) == false)) {
			$("#waiting1").html("Waiting for player 1...");
			$("#winner").empty();
			$("#win1").empty();
			$("#lose1").empty();
			$("#player1name").empty();
			$("#playerTurn").empty();
			$("#player1").attr("style", "border: 5px solid #eeeeea");
			$("#player2").attr("style", "border: 5px solid #eeeeea");

		};
		//before player 2 joins the game
		if (((snapshot.child("players").child(2).exists()) == false)) {
			$("#waiting2").html("Waiting for player 2...");
			$("#winner").empty();
			$("#win2").empty();
			$("#lose2").empty();
			$("#player2name").empty();
			$("#playerTurn").empty();
			$("#player1").attr("style", "border: 5px solid #eeeeea");
			$("#player2").attr("style", "border: 5px solid #eeeeea");
		};
		//When player 2 exists but not 1
		if ((snapshot.child("players").child(2).exists()) && ((snapshot.child("players").child(1).exists()) === false)) {
			$("#player2name").html(snapshot.child("players").child(2).val().name);
			$("#waiting2").empty();
			$("#player1").attr("style", "border: 5px solid #eeeeea");
			$("#player2").attr("style", "border: 5px solid #eeeeea");
			hidden();

		//when a player leaves the game
			playerDisconnect();
		};
		//When player 1 exists but not 2
		if ((snapshot.child("players").child(1).exists()) && ((snapshot.child("players").child(2).exists()) === false)) {
			$("#waiting1").empty();
			$("#player1name").html(snapshot.child("players").child(1).val().name);
			hidden();

		//when a player leaves the game
			playerDisconnect();

		//Player 1's browser
			if (PlayerName == snapshot.child("players").child(1).val().name) {
				$("#greetings").html("<h2>Hello " + snapshot.child("players").child(1).val().name + "!  You are player 1.</h2>");
				$("#win1").html("WIN: " + player_1_win);
				$("#lose1").html("LOSE: " + player_1_lose);
			}

		//READY TO PLAY
		} else if ((snapshot.child("players").child(1).exists()) && ((snapshot.child("players").child(2).exists()))) {

			//Keeping track of turns on the database
			var databaseTurn = snapshot.child("turn").val();
			user_1_Name = snapshot.child("players").child(1).val().name;
			user_2_Name = snapshot.child("players").child(2).val().name;

			//Both browers will show...
			$("#waiting2").empty();
			$("#waiting1").empty();
			$("#player2name").html(snapshot.child("players").child(2).val().name);
			$("#player1name").html(snapshot.child("players").child(1).val().name);
			$("#win2").html("WINS: " + snapshot.child("players").child(2).val().win);
			$("#lose2").html("LOSSES: " + snapshot.child("players").child(2).val().lose);
			$("#win1").html("WINS: " + snapshot.child("players").child(1).val().win);
			$("#lose1").html("LOSSES: " + snapshot.child("players").child(1).val().lose);

			//when a player leaves the game
			playerDisconnect();

			//player 1's browser during player 1's turn
			if ((PlayerName == snapshot.child("players").child(1).val().name) && (databaseTurn == 1)) {
				$("#greetings").html("<h2>Hello " + snapshot.child("players").child(1).val().name + "!  You are player 1.</h2>");
				$("#player1").attr("style", "border: 5px solid #858581");
				$("#player2").attr("style", "border: 5px solid #eeeeea");
				hidden();
				$("#player1choices").attr("style", "visibility:visible");
				$("#rock1").html("<img class='responsive' src = 'assets/images/rock.png'>");
				$("#paper1").html("<img class='responsive' src = 'assets/images/paper.png'>");
				$("#scissors1").html("<img class='responsive' src = 'assets/images/scissors.png'>");
				$("#winner").empty();
				$("#playerTurn").html("It's your turn. Click a hand below to choose.");
			}
			//player 1's browser during player 2's turn
			if ((PlayerName == snapshot.child("players").child(1).val().name) && (databaseTurn == 2)) {//after player 1 picks
				$("#player1").attr("style", "border: 5px solid #eeeeea");
				$("#player2").attr("style", "border: 5px solid #858581");
				hidden();
				$("#group1message").attr("style", "visibility:visible");
				$("#group1message").html("Chose: " + "<div class='rpsChoice'>" + user_1_Choice + "</div>");
				$("#playerTurn").html("Waiting for " + user_2_Name + " to choose...");
			}

			//player2's browser during player 1's turn
			if ((PlayerName == snapshot.child("players").child(2).val().name) && (databaseTurn == 1)) {
				$("#greetings").html("<h2>Hello " + snapshot.child("players").child(2).val().name + "!  You are player 2.</h2>");
				$("#player1").attr("style", "border: 5px solid #858581");
				$("#player2").attr("style", "border: 5px solid #eeeeea");
				$("#playerTurn").html("Waiting for " + user_1_Name + " to choose...");
				hidden();
				$("#winner").empty();
			}
			//player2's browser during player 2's turn
			if ((PlayerName == snapshot.child("players").child(2).val().name) && (databaseTurn == 2)) {
				$("#player1").attr("style", "border: 5px solid #eeeeea");
				$("#player2").attr("style", "border: 2px solid #858581");
				$("#playerTurn").html("It's your turn. Click a hand below to choose.");
				hidden();
				$("#player2choices").attr("style", "visibility:visible");
				$("#rock2").html("<img class='responsive' src = 'assets/images/rock.png'>");
				$("#paper2").html("<img class='responsive' src = 'assets/images/paper.png'>");
				$("#scissors2").html("<img class='responsive' src = 'assets/images/scissors.png'>");
			}

			//both player's browsers at turn 3 (after player 2 made a choice) and the increase score function hasn't been called
			if (databaseTurn == 3 && gameReset == false) {
				gameReset = true;

				//Restating variables to match the database
				user_1_Choice = snapshot.child("players").child(1).val().choice;
				user_2_Choice = snapshot.child("players").child(2).val().choice;
				player_1_win = snapshot.child("players").child(1).val().win;
				player_1_lose = snapshot.child("players").child(1).val().lose;
				player_2_win = snapshot.child("players").child(2).val().win;
				player_2_lose = snapshot.child("players").child(2).val().lose;

				$("#player1").attr("style", "border: 5px solid #eeeeea");
				$("#player2").attr("style", "border: 5px solid #eeeeea");
				$("#player2choices").attr("style", "display:none");
				$("#player1choices").attr("style", "display:none");
				$("#group2message").attr("style", "visibility:visible");
				$("#group1message").attr("style", "visibility:visible");
				$("#group1message").html("Chose: " + "<div class='rpsChoice'>" + user_1_Choice + "</div>");
				$("#group2message").html("Chose: " + "<div class='rpsChoice'>" + user_2_Choice + "</div>");
				$("#playerTurn").empty();

				//call the function to check for winnner
				CheckWinners.playerScore();

				// Display this page for 3 seconds and call clearDelay function to reset the game
				delayTimer = setTimeout(CheckWinners.clearDelay, 3 * 1000);
			}
		}
	}); 

	//Allow name input submission with enter key
	var input = document.getElementById("nameInput");
	input.addEventListener("keyup", function (event) {
		event.preventDefault();
		if (event.keyCode === 13) {
			document.getElementById("submitName").click();
		}
	});

	//Function for getting player names
	$("#submitName").on("click", function () {

		//Get the user name value
		var username = $("#nameInput").val().trim();

		//set the player name to user's name
		PlayerName = username;
		console.log(username);

		// Read snapshot when user adds name as player,, this is where we set
		database.ref().once('value').then(function (snapshot) {

			//When player 1 does not exist
			if ((snapshot.child("players").child(1).exists()) === false) {
				database.ref("players/1").set({
					name: username,
					win: player_1_win,
					lose: player_1_lose
				}); //database set

			//When player 1 exists but not 2
			} else if ((snapshot.child("players").child(1).exists()) && ((snapshot.child("players").child(2).exists()) === false)) {
				database.ref("players/2").set({
					name: username,
					win: player_2_win,
					lose: player_2_lose
				}); //database set

				database.ref().update({
					turn: turns,
				});
				//When both players exist
			} else if ((snapshot.child("players").child(1).exists()) && (snapshot.child("players").child(2).exists())) {
				alert("There are already two players playing. Please try again later!");
			}
		}); 
	});

	//When player 1 makes a choice 
	$(".choice1").on("click", function () {

		//get the value of player 1 choice
		user_1_Choice = $(this).val();
		console.log(user_1_Choice);

		database.ref().once('value').then(function (snapshot) {
			//push player 1 choice to the database and //increment the turn == it will now be user 2's turn	
			turns = (snapshot.child("turn").exists() ? snapshot.child("turn").val() : turns);
			turns++; //2

			//at player 1's browser, update to show choice
			if ((PlayerName == snapshot.child("players").child(1).val().name)) {
				database.ref("players/1").update({
					choice: user_1_Choice,
				});
				//then update turn to 2
				database.ref().update({
					turn: turns
				});
			}
		});
	});

	//When user 2 makes a choice
	$(".choice2").on("click", function () {
		//get the value of player 2 choice
		user_2_Choice = $(this).val();
		console.log(user_2_Choice);

		database.ref().once('value').then(function (snapshot) {
			//push player 2 choice to the database and //increment the turn == it will now be turn 3		
			turns = (snapshot.child("turn").exists() ? snapshot.child("turn").val() : turns);
			turns++;

			//at player 1's browser, update to show choice
			if ((PlayerName == snapshot.child("players").child(2).val().name)) {
				database.ref("players/2").update({
					choice: user_2_Choice,
				});
				//then update turn to 3
				database.ref().update({
					turn: turns,
				});
			}
		});
	}); 

	//if the any user sends a chat message
	$("#submit-chat").on("click", function (event) {
		//prevent refresh
		event.preventDefault();
		console.log(this);
		//get the value of what the user types and then empty the input field;
		var messages = $("#chat-input").val().trim();
		$("#chat-input").val("");

		//Define the newMessage
		newMessage = PlayerName + " : " + messages;

		//push each chat message to the database and log the time
		database.ref("/chat").update({
			message: newMessage,
			dateAdded: firebase.database.ServerValue.TIMESTAMP
		});
	});

	//updating the messages in the browser's chat window by using the last one added into the database (time added)
	database.ref("/chat").orderByChild("dateAdded").limitToLast(1).on("value", function (snapshot) {
		$("#chat-window").append("</br>" + snapshot.val().message + "</br>");
	});

});// document.ready