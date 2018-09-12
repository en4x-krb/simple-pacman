const game = function() {
	"use strict";

	const boardRow = 17, boardCol = 28;

	let start = false;
	let score = 0;
	let clock = 0;
	
	/*Key Constants*/
	const leftKey = 37, upKey = 38, downKey = 40, rightKey = 39;
	const COOKIE = 0, WALL = 1, POTION = 7, GATE = 9;
	
	//objects
	let pacMAN;
	let monsters = [];
	
	/*Special State Time*/
	let ghostTime = 8000, superTime = 4000;
	
	let totalFood = 0;
	
	let dimension = 30;
	let movePX = 5;
	
	let currLeft, currTop, currTopPx, currLeftPx;
	
	let newTop = 0, newLeft = 0;
	let extraTop = 0, extraLeft  = 0;
	
	let boardObj;
	
	let gameClock;
	
	let superPacAttacks, pacManSuper, pacManDies, pacManEats, pacManWins;
	
	let pacBoard = [
	  //[0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7]
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1], //0
		[1,7,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,7,1], //1
		[1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,0,1,1,0,0,0,1,1,0,1], //2
		[1,0,1,1,1,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,0,1], //3
		[1,0,0,0,0,0,0,1,0,1,1,0,1,1,1,0,1,1,1,0,0,0,0,0,0,0,0,1], //4
		[1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,1,1,1], //5
		[1,1,1,0,1,1,1,0,1,1,0,1,1,1,1,0,0,0,1,0,0,0,0,0,0,1,1,1], //6
		[1,1,1,0,1,1,1,0,1,1,0,1,5,1,1,0,1,0,0,1,1,1,1,1,0,1,1,1], //7
		[8,8,2,0,0,0,0,0,1,1,0,1,4,3,9,0,1,1,0,1,1,1,1,0,0,8,8,8], //8
		[1,1,1,0,1,0,1,0,0,0,0,1,6,1,1,0,0,0,0,1,1,1,1,1,0,1,1,1], //9
		[1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,0,1,1,0,0,1,1,1,0,0,1,1,1], //10
		[1,1,1,0,1,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,1,0,0,1,1,1,1], //11
		[1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,1,1,0,0,1,0,1,0,1,0,0,0,1], //12
		[1,1,0,1,0,1,1,0,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,0,0,1,0,1], //13
		[1,1,0,1,0,1,1,0,1,1,1,1,0,1,1,0,1,1,1,0,1,0,1,1,0,1,0,1], //14
		[1,7,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,7,1], //15
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1], //16
	];
	
	const drawBoard = () => {
	
		//Maze construction
		document.getElementById("MainBoard").innerHTML="";
		boardObj = document.getElementById("MainBoard");
		for (let i = 0; i < boardRow; i++) {
			for (let j = 0; j < boardCol; j++) {
				let tiles = document.createElement("div");
				tiles.id="r"+i+"c"+j;		
				if ( pacBoard[i][j] == COOKIE ) {
					tiles.style.backgroundImage = "url('./Images/cookie.png')";
					totalFood++;
				}
	
				else if( pacBoard[i][j] == WALL )
					tiles.style.backgroundImage = "url('./Images/bricks.jpg')";
	
				else if( pacBoard[i][j] == POTION ){
					tiles.style.backgroundImage = "url('./Images/potion.png')";
					totalFood+=5;
				}
				else if( pacBoard[i][j] == GATE )
					tiles.style.backgroundImage = "url('./Images/oneway.jpg')";
	
				boardObj.appendChild(tiles);
			}
		}
		//Monsters creation
		for (let k = 1; k <= 4; k++) {
			let monster = document.createElement("img");
			monster.src = `./Images/g${k}.gif`;
			monster.id = `monster${k}`;
			boardObj.appendChild(monster);
		}
		
		//Pacman creation
		let pacman = document.createElement("img");
		pacman.src = "./Images/pacman.gif";
		pacman.id = "pacImg";
		boardObj.appendChild(pacman);
		
		initialize();
	}
	
	function initialize() {
		pacMAN = new Actor('pacImg',  240, 60, 0, 0);
		monsters[0] = new Actor('monster1', 240, 390, rightKey, 1000);
		monsters[1] = new Actor('monster2', 240, 360, rightKey, 2000);
		monsters[2] = new Actor('monster3', 210, 360, downKey, 3000);
		monsters[3] = new Actor('monster4', 270, 360, upKey, 4500);
		document.addEventListener("keydown", keyPress, true);
	}
	
	class Actor {
		constructor (actorType, topPx, leftPx, dir, startTime) {
			this.actorType = actorType;
			this.TopPx = topPx;
			this.LeftPx = leftPx;
			this.dir = dir;
			this.startTime = startTime;
			this.moves = [0,0,0,0];
			this.superman = false;
			this.ghost = false;
			this.specialStateTime = 0;
			this.outOfSafehouse = false;
		}
	}
	
	function keyPress(event) {
		pacMAN.moves[1] = pacMAN.moves[0];	//Store Previous Move at 2nd location
		pacMAN.moves[0] = event.keyCode;	//Store New Move at the 1st location
	
		if (start == false) {
			pacManDies = document.getElementById("pacManDies"); 
			pacManEats = document.getElementById("pacManEats"); 
			pacManWins = document.getElementById("pacManWins"); 
			pacManSuper = document.getElementById("pacManSuper"); 
			superPacAttacks = document.getElementById("superPacAttacks"); 
			start = true;
			gameClock = setInterval(gameLoop,100);
		}
	}
	
	function gameLoop() {
		clock += 100;
	
		//Make PacMan move
		//If 1st direction is valid, move in that direction, otherwise
		//Keep moving in 2nd direction until 1st direction is valid
		//Stop movement if 2 consecutive invalid directions are given
		for (let k = 0; k < 2; k++) {
			pacMAN.dir = pacMAN.moves[k];
			if (moveCheck(pacMAN)) {
				movePacMan(pacMAN);
				checkScore();
				if (k == 0) 
					//If first move is valid then make second move invalid
					pacMAN.moves[1] = 0;
				break;
			}		
		}
	
		//Make monsters move
		for (let k = 0; k < 4; k++) {
			if (clock > monsters[k].startTime) {
				if (!monsters[k].outOfSafehouse)
					getOutOfSafeHouse(monsters[k]);
				else
					goRandomDirection(monsters[k]);
			}
		}
	
		if (clock > 7000) {
			pacBoard[8][14] = WALL; //Closing the gate
			clock=7000;
		}
		
		//SuperPacMan State
		if (pacMAN.superman)
			pacMAN.specialStateTime -= 100;
	
		if (pacMAN.specialStateTime <= 0 ) {
			pacMAN.superman=false;
			document.getElementById("pacImg").style.filter = "invert(0%)";
		}
	
		//Ghosts State
		for (let k = 0; k < 4; k++) {
			if (monsters[k].ghost)
				monsters[k].specialStateTime -= 100;
	
			if (monsters[k].specialStateTime <= 0 ) {
				monsters[k].ghost = false;
				document.getElementById(monsters[k].actorType).style.filter = "grayscale(0%) opacity(100%)";
			}			
		}
	
		//Checking for collision between PacMan and Monsters
		for (let k = 0; k < 4; k++) {
			if (checkCollision(pacMAN,monsters[k])) {
				if (pacMAN.superman && !monsters[k].ghost) {	//If PacMan is super pacman then it turns monsters into ghost
					superPacAttacks.play();
					document.getElementById(monsters[k].actorType).style.filter = "grayscale(100%) opacity(40%)";
					monsters[k].ghost = true;
					monsters[k].specialStateTime = ghostTime;
				}
	
				else if (!monsters[k].ghost) {	//If the monster is not in ghost form then pacman dies and stop the game
					pacManDies.play();
					document.getElementById("pacImg").style.opacity = "0";
					document.getElementById("pacImg").style.transition = "opacity 3s ease-in-out";
					document.getElementById("gameOverText").src = "./Images/gameoverlose.png";
					document.getElementById("gameOver").style.visibility = "visible";
					resetGame();
				}
			}
		}
		
		//Checking for collision between Monsters
		for (let k = 0; k < 4; k++) {
			for (let l = k + 1; l < 4; l++) {
				if (checkCollision(monsters[k],monsters[l]) && (!monsters[k].ghost && !monsters[l].ghost)) {
					goOppositeDirection(monsters[k]);
					goOppositeDirection(monsters[l]);
				}
			}
		}
	}
	
	function movePacMan(actorObj) {
		let actorDOM = document.getElementById(actorObj.actorType); 
		switch(actorObj.dir) {
			case leftKey:
				actorObj.LeftPx = currLeftPx - movePX;
				actorDOM.style.transform = "rotate(180deg)";
				actorDOM.style.left = actorObj.LeftPx + "px";
				break;
	
			case upKey:
				actorObj.TopPx = currTopPx - movePX;
				actorDOM.style.transform = "rotate(270deg)";
				actorDOM.style.top = actorObj.TopPx + "px";
				break;
	
			case rightKey:
				actorObj.LeftPx = currLeftPx + movePX;	
				actorDOM.style.transform = "rotate(0deg)";
				actorDOM.style.left = actorObj.LeftPx + "px";
				break;
	
			case downKey:
				actorObj.TopPx = currTopPx + movePX;
				actorDOM.style.transform = "rotate(90deg)";
				actorDOM.style.top = actorObj.TopPx + "px";
				break;
		}
	}  
	
	function moveMonsters(actorObj) {
		let actorDOM = document.getElementById(actorObj.actorType); 
		switch(actorObj.dir) {
			case leftKey:
				actorObj.LeftPx = currLeftPx - movePX;
				actorDOM.style.left = actorObj.LeftPx + "px";
				break;
	
			case upKey:
				actorObj.TopPx = currTopPx - movePX;
				actorDOM.style.top = actorObj.TopPx + "px";
				break;
	
			case rightKey:		  
				actorObj.LeftPx = currLeftPx + movePX;	
				actorDOM.style.left = actorObj.LeftPx + "px";
				break;
	
			case downKey:
				actorObj.TopPx = currTopPx + movePX;
				actorDOM.style.top = actorObj.TopPx + "px";
				break;
		}
	}
	
	//Function to calculate score and make pacman super-pacman if potion is consumed
	function checkScore() {
		let hasDot = document.getElementById("r"+newTop+"c"+newLeft).style.backgroundImage;
		if (pacBoard[newTop][newLeft] == COOKIE && hasDot) {	//Tile has cookie
			score++;
			pacManEats.play();
		}
	
		else if (pacBoard[newTop][newLeft] == POTION && hasDot) {	//Tile has potion
			score += 5;
			document.getElementById("pacImg").style.filter = "invert(60%)";
			pacMAN.superman = true;
			pacMAN.specialStateTime = superTime;
			pacManSuper.play();
		}
	
		document.getElementById("score").innerHTML = score;
	
		document.getElementById("r" + newTop + "c" + newLeft).style.backgroundImage = "";
		
		if (score >= totalFood) {
			pacManWins.play();
			document.getElementById("gameOverText").src = "./Images/gameoverwin.png";
			document.getElementById("gameOver").style.visibility = "visible";
			resetGame();
		}
	}
	
	//Checking the movement of Actors
	function moveCheck(actorObj) {
		let fitsTop = false;
		let fitsLeft = false;
	
		currTopPx = actorObj.TopPx;
		currLeftPx = actorObj.LeftPx;
	
		currTop  = Math.floor(currTopPx  / dimension);
		currLeft = Math.floor(currLeftPx / dimension);
	
		if(currTopPx % dimension == 0)
			fitsTop = true;
		if(currLeftPx % dimension == 0)
			fitsLeft = true;
		
		newLeft = currLeft;
		newTop = currTop;
		
		switch(actorObj.dir) {
			case leftKey: 
				if(fitsLeft)
					newLeft = currLeft - 1;
				break;
				
			case upKey:
				if(fitsTop)
					newTop = currTop - 1;
				break;
				
			case rightKey:
				newLeft = currLeft + 1;
				break;
				
			case downKey:
				newTop = currTop + 1;
				break;					  
		}
		tunnelConditions();
		checkOverlapse(actorObj.dir);
		
		if (!Obstacles())
			return true;
		
		return false;	
	}
	
	//Checking tunnel condition
	function tunnelConditions() {
		if (newLeft < 0) {
			newLeft = (boardCol - 1);
			currLeftPx = newLeft * dimension;
		}	
				
		if (newTop < 0) {
			newTop = (boardRow - 1);
			currTopPx = newTop * dimension;
		}
				
		if (newLeft > (boardCol - 1)) {
			newLeft = 0;
			currLeftPx = 0; 
		}
				
		if (newTop > (boardRow - 1)) {
			newTop = 0;
			currTopPx = 0;
		}				  
	}
	
	//Checking overlap of rows and column	
	function checkOverlapse(direction) {
		extraTop = newTop;
		extraLeft = newLeft;
		
		let overlapRows = false;
		  let overlapCols = false;
		
		if (currTopPx % dimension != 0)
			overlapRows = true;
		if (currLeftPx % dimension != 0)
			overlapCols = true;
		
		switch(direction) {
			case leftKey:
			case rightKey:	         
				if (overlapRows)
					extraTop = newTop + 1;
				break;
	
			case upKey:
			case downKey:  
				if (overlapCols)
					extraLeft = newLeft + 1;
				break;						
		}
	}	
	
	//Obstacle checking
	function Obstacles() {	
		if ((pacBoard[newTop][newLeft] == WALL) || (pacBoard[extraTop][extraLeft] == WALL))
			return true;
		
		return false;
	}	
	
	//Getting monsters out of the safehouse
	function getOutOfSafeHouse(actorObj) {
	
		switch(actorObj.actorType) {
			case "monster1":
			case "monster2":
				//Monster1 and Monster2 Goes to right until out of safehouse
				actorObj.dir = rightKey;
				break;
				
			case "monster3":
				//Monster3 first comes down and then goes right until out of safehouse
				if (actorObj.TopPx < 240)
					actorObj.dir = downKey;
				else
					actorObj.dir = rightKey;
				break;
				
			case "monster4":
				//Monster 4 first goes up and then goes right until out of safehouse
				if (actorObj.TopPx > 240)
					actorObj.dir = upKey;
				else
					actorObj.dir = rightKey;	
				break;
		}
		
		if (moveCheck(actorObj)) {
			moveMonsters(actorObj);
			//450 is the leftPX of the tile outside gate.
			if (actorObj.LeftPx == 450)
				actorObj.outOfSafehouse = true;
		}
	}
	
	function goOppositeDirection(actorObj) {
		switch(actorObj.dir) {
			case leftKey:
				actorObj.moves = [rightKey, upKey, downKey, leftKey];
				break;
						
			case rightKey:
				actorObj.moves = [leftKey, upKey, downKey, rightKey];
				break;
					
			case upKey:
				actorObj.moves = [downKey, leftKey, rightKey, upKey];
				break;
									
			case downKey:
				actorObj.moves = [upKey, leftKey, rightKey, downKey];
				break;
		}
		shuffle(actorObj);
		for (let i = 0; i < 4; i++) {
			actorObj.dir=actorObj.moves[i]
			if (moveCheck(actorObj)) {
				moveMonsters(actorObj);
				break;
			}
		}
	}
	
	function goRandomDirection(actorObj) {
		switch(actorObj.dir) {
			case leftKey:
				actorObj.moves = [leftKey, upKey, downKey, rightKey];
				break;
						
			case rightKey:
				actorObj.moves = [rightKey, upKey, downKey, leftKey];
				break;
					
			case upKey:
				actorObj.moves = [upKey, leftKey, rightKey, downKey];
				break;
									
			case downKey:
				actorObj.moves = [downKey, leftKey, rightKey, upKey];
				break;
		}
		shuffle(actorObj);
	
		for (let l = 0; l < 4; l++) {
			actorObj.dir = actorObj.moves[l]
			if (moveCheck(actorObj)) {
				moveMonsters(actorObj);
				break;
			}
		}
	}
	
	function shuffle(actorObj) {
		let m = actorObj.moves.length - 1;
		while (m) {
			let i = Math.floor(Math.random() * m--);
			let t = actorObj.moves[m];
			actorObj.moves[m] = actorObj.moves[i];
			actorObj.moves[i] = t;
		}
	}
	
	function checkCollision(actor1,actor2) {
		if (actor1.LeftPx >= (actor2.LeftPx + dimension)  || 
			actor2.LeftPx >= (actor1.LeftPx + dimension)  || 
			actor1.TopPx  >= (actor2.TopPx + dimension)   || 
			actor2.TopPx  >= (actor1.TopPx + dimension)
		) return false;
	
		return true;
	}
	
	function resetGame() {
		setTimeout(() => {
			location.reload();
		}, 4000);
		clearInterval(gameClock);
	}

	drawBoard();
};

window.onload = game;

alert('Use arrow keys to make PacMan move');
