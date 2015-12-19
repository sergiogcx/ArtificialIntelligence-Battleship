/*
	Battleship JS - Sergio Garcia
*/

var _probability_map = [
						[1,1,2,1,1],
						[1,2,3,2,1],
						[2,3,3,3,2],
						[1,2,3,2,1],
						[1,1,2,1,1]
					   ];

var _debug = true;
var debug = function(input) {
	if(_debug) console.log(input);
}

var xinspect = function(o,i){
	debug("xinspect() ..." );
    if(typeof i=='undefined')i=''; if(i.length>50)return '[MAX ITERATIONS]'; var r=[];
    for(var p in o){ var t=typeof o[p]; r.push(i+'"'+p+'" ('+t+') => '+(t=='object' ? 'object:'+xinspect(o[p],i+'  ') : o[p]+''));}
    return r.join(i+'\n');
}


var helpers = {
	array_includes:  function (arr, obj) {
		debug("helpers::array_includes() checking if " + xinspect(obj) + " exists in " + xinspect(arr));
		var result = (arr.indexOf(obj) != -1)
		debug("helpers::array_includes() results: " + result);
	    return result;
	},

	array_build_coordinate_list: function(arr) {
		if(arr == null) return null;
		var output = new Array();
		for(var i = 0; i < arr.length; i++) {
			x = arr[i][0], y = arr[i][1];
			debug("helpers::array_build_coordinate_list() We are at arr["+i+"] = " + x + y + " ...");
			output.push(x + "" + y);
		}
		return output;
	},

	array_concat_nonexisting: function(array_dest, array_origin) {
		debug("helpers::array_concat_nonexisting() Merging Unique Coordinates!");
		var output = new Array();
		var dest_coordinate_list = this.array_build_coordinate_list(array_dest);
		var origin_coord_list = this.array_build_coordinate_list(array_origin);

		debug("helpers::array_concat_nonexisting() nothing to append!..");
		if(origin_coord_list == null) return array_dest;

		output = output.concat(array_dest);

		// For each coordinate in origin, check if it already exists in destiny
		for(var c = 0; c < origin_coord_list.length; c++) {
			debug("helpers::array_concat_nonexisting() origin_coord_list["+c+"] =  " + origin_coord_list + " !");

			if(this.array_includes(dest_coordinate_list, origin_coord_list[c])) {
				debug("helpers::array_concat_nonexisting() this element already exists: " + origin_coord_list[c] + ", skipping...");
			} else {
				debug("helpers::array_concat_nonexisting() this element DOES NOT EXIST: " + origin_coord_list[c] + ", pushing...");
				output.push([array_origin[c][0], array_origin[c][1]]);
			}
		}
		return output;
	},

	get_random_number: function(a,b) {
		var rand_number = Math.floor((Math.random() * b) + a);
		debug("helpers::get_random_number() generating a random number between ("+a+" & "+b+") ..., it is: " + rand_number);
		return rand_number;
	}

};

















var Player = function(name) {
	this.name = name || "Computer";
	this.boardSize = 5;
	this.numShips = 3;
	this.shipLength = 3;
	this.shipsSunk = 0;
	
	this.ships = [
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }
	];

	this.getElemId = function(guess) {
		var elem_id = this.name + "_cell_" + guess;
		debug("Player::getElemId() Elem_id for " + guess + " = " + elem_id);
		return elem_id;
	}

	this.fire = function(guess) {
		debug("Player::fire() guess: " + guess);
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			var index = ship.locations.indexOf(guess);

			// here's an improvement! Check to see if the ship
			// has already been hit, message the user, and return true.
			if (ship.hits[index] === "hit") {
				view.displayMessage("Engine: Oops, you already hit that location!");
				return true;
			} else if (index >= 0) {
				ship.hits[index] = "hit";
				debug("Player::fire() it is hit!, transporting hit element's id to the view: " + this.getElemId(guess));
				view.displayHit(this.getElemId(guess));
				view.displayMessage("Engine: Boom, a Hit!");

				if (this.isSunk(ship)) {
					view.displayMessage("Engine: I sank your battleship!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		debug("Player::fire() it missed!, transporting hit element's id to the view: " + this.getElemId(guess));
		view.displayMiss(this.getElemId(guess));
		view.displayMessage("Engine: Yikes, I missed!");
		return false;
	},

	this.isSunk = function(ship) {
		debug("Player::isSunk() checking if sunk...");
		for (var i = 0; i < this.shipLength; i++)  {
			if (ship.hits[i] !== "hit") {
				return false;
			}
		}
	    return true;
	},

	this.generateShipLocations = function() {
		debug("Player::generateShipLocations() generating locations ... ");
		var locations;
		for (var i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip();
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
		console.log("Ships array = ");
		console.log(this.ships);
	},

	this.generateShip = function() {
		debug("Player::generateShip() Generating a Ship ... ");
		var direction = Math.floor(Math.random() * 2);
		var row, col;

		if (direction === 1) { // horizontal
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
		} else { // vertical
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
			col = Math.floor(Math.random() * this.boardSize);
		}

		var newShipLocations = [];
		for (var i = 0; i < this.shipLength; i++) {
			if (direction === 1) {
				newShipLocations.push(row + "" + (col + i));
			} else {
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;
	},

	this.collision = function(locations) {
		debug("Player::collision() checking for collisions ... ");
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			for (var j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) {
					return true;
				}
			}
		}
		return false;
	}
} 


















var view = {
	boardArea: null,

	setBoardArea: function(area) {
		boardArea = document.getElementById(area);	
	},

	displayMessage: function(msg) {
		debug("View::displayMessage() showing message on board: " + msg);
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;
	},

	displayHit: function(location) {
		debug("View::displayHit() showing hit @ " + location);
		var cell = document.getElementById(location);

		cell.setAttribute("style", "");
		cell.setAttribute("class", "hit");

		debug("View::displayHit() title before hit:" + cell.title);
		cell.setAttribute("title", "hit");
		debug("View::displayHit() title after hit:" + cell.title);
	},

	displayMiss: function(location) {
		debug("View::displayMiss() showing miss @ " + location);
		var cell = document.getElementById(location);

		cell.setAttribute("style", "");
		cell.setAttribute("class", "miss");

		debug("View::displayMisst() title before hit:" + cell.title);
		cell.setAttribute("title", "miss");
		debug("View::displayMiss() title after hit:" + cell.title);

	},

	showCellProperties: function(elem) {
		var output = "";
		output += "Id: " + elem.id + "<br/>";
		output += "title: " + elem.id + "<br/>";
		output += "class: " + elem.id + "<br/>"; 

		document.getElementById("div_props").innerHTML = output;
	},

	generateBoard: function(model) {
		debug("View::generateBoard() generating board for User: " + model.name);
		
		var ship_positions = [];

		for(var n = 0; n < model.numShips; n++) {
			for(var l = 0; l < model.ships[n].locations.length ; l++) {
				//debug("View::generateBoard() pushing location: " + model.ships[n].locations[l]);
				ship_positions.push(model.ships[n].locations[l]);
			}
		}

		debug("View::generateBoard(): ship_positions: " + xinspect(ship_positions));

		debug("View::generateBoard(): generating board cells: ");
		var board = document.createElement("div");
			board.id = model.name + "_board";
			board.className = "board";



		for(var x = 0; x < model.boardSize; x++) {
			var row = document.createElement("div");
				row.className = "row";
				row.id = model.name + "_row_" + x;
				row;
			for(var y = 0; y < model.boardSize; y++) {
				var cell = document.createElement("div");
					// debug("View::generateBoard() generating cell xy: " + x + "" + y);

					cell.id = model.name + "_cell_" + x + "" + y;
					cell.setAttribute("title", "playable");
					
					// debug("View::generateBoard() Name: "+model.name+", Namelength: "  + model.name.length);
					if(model.name === "Computer") {
						cell.className = "cell";
						cell.setAttribute("onClick","handleClick(computer, this);");
						cell.setAttribute("onMouseOver","view.showCellProperties(this);");

					} else {
						cell.className = helpers.array_includes(ship_positions, x + "" + y) ? "ship" : "cell";
						cell.innerHTML = _probability_map[x][y];
					}


				row.appendChild(cell);
			}
			board.appendChild(row);
		}

		debug("View::generateBoard(): Appending new Board to boardArea: ");
		boardArea.appendChild(board);
	},

	showWinner: function(player) {
		var win_dialog = document.getElementById("windialog");
		var winner_span = document.getElementById("winner");

		winner_span.innerHTML = player.name + " Wins!";
		win_dialog.style = "display: block;";
	}
}; 



















var controller = {
	guesses: 0,
	
	parseCell: function(elem_id) {
		debug("Controller::parseCell() cell id: " + elem_id);
		var loc = elem_id.replace(/\D/g,'');
		debug("Controller::parseCell() parsed location: " + loc);
		return loc;
	}, 
	processGuess: function(player, elem_id) {
		debug("Controller::processGuess() cell id: " + elem_id);
		var location = this.parseCell(elem_id);
		debug("Controller::processGuess() location: " + location);
		if (location) {
			this.guesses++;
			var hit = player.fire(location);
			if (hit && player.shipsSunk === player.numShips) {
					view.displayMessage("Engine: I sank all your battleships, in " + this.guesses + " guesses");
			}
		}
	},
	processEngineGuess: function() {
		debug("Controller::processEngineGuess() sending trigger to engine ...");
		engine.fireAtBestPosition();
	},

	checkcycle: function(player_a, player_b) {
		if(player_a.shipsSunk == player_a.numShips) {
			view.showWinner(player_b);
		}
		if(player_b.shipsSunk == player_a.numShips)  {
			view.showWinner(player_a);
		}
	}
};



















var engine = {
	model_board: null,
	current_probability_map: null,
	player: null,

	initialize_board: function(player_instance) {
		debug("engine::initialize_board() initializing board ....");
		this.model_board = document.getElementById(player_instance.name + "_board");

		debug("engine::initialize_board() initializing probability map ....");
		this.current_probability_map = _probability_map;

		debug("engine::initialize_board() initializing probability map ....");
		this.player = player_instance;
	},

	get_most_probable_coordinate: function(arr) {
		debug("engine::get_most_probable_coordinate() Using Probability Map ...");
		if(arr == null) {
			debug("engine::get_most_probable_coordinate() input array is empty, never mind! ...");
			return null;	// To Begin with..
		}
		debug("engine::get_most_probable_coordinate() Inspecting Object ...");

		var x = 0, y = 0;

		var probability_table = new Array();

		for(var i = 0; i < arr.length; i++) {
			x = arr[i][0], y = arr[i][1];
			debug("engine::get_most_probable_coordinate() We are at arr["+i+"] = " + x + y + " probability: "+this.current_probability_map[x][y]+" ...");
			probability_table.push({probability: this.current_probability_map[x][y], coordinates: arr[i]});
		}

		// Sort
		probability_table = probability_table.sort(this.array_priority_sort);
		debug("engine::get_most_probable_coordinate() inspecting probability_table: " + xinspect(probability_table));
	
		// Count Equal Probability Elements
		var highest_probability = probability_table[0].probability;
		var highest_probability_counts = 0;
		for(var hpc = 0; hpc < probability_table.length; hpc++) if(probability_table[hpc].probability == highest_probability) highest_probability_counts++;
		var random_hpc = helpers.get_random_number(1, highest_probability_counts) - 1;

		debug("engine::get_most_probable_coordinate() total highest_probability_counts (hpc): " + highest_probability_counts + ", random_hpc: " + random_hpc);
		
		
		// Output & Inspection
		var output = probability_table[random_hpc].coordinates;
		debug("hpcx: " + xinspect(probability_table[random_hpc]));
		debug("engine::get_most_probable_coordinate() output: " + output[0] + output[1]);	

		return output;
	},



	get_logical_action: function() {
		debug("engine::get_logical_action() no changes needed, returning coordinates as is ...");
		return this.get_logical_coordinates();
	},

	get_radius_action: function() {
		debug("engine::get_radius_action() initializing radius_action coordinates list ...");
		var output = new Array();

		for(var y = 0; y < this.player.boardSize; y++) {
			for(var x = 0; x < this.player.boardSize; x++) {
				current_status = this.getCellStatus(x,y);
				if(current_status == "hit") {
					debug("engine::get_radius_action() we have a hit, lets see what we can find another nearby...");
					output = output.concat(this.get_radius_coordinates(x,y));	
				}
			}
		}

		return output;
	},

	get_immidiate_action: function() {
		debug("engine::get_immidiate_action() initializing immidiate_action coordinates list ...");
		var output = new Array();

		for(var y = 0; y < this.player.boardSize; y++) {
			for(var x = 0; x < this.player.boardSize; x++) {
				current_status = this.getCellStatus(x,y);
				if(current_status == "hit") {
					debug("engine::get_immidiate_action() we have a hit, lets see what we can find another nearby...");
					output = output.concat(this.get_immidiate_action_coordinates(x,y));	
				}
			}
		}

		return output;
	},

	fireAtBestPosition: function() {
		debug("engine::fireAtBestPosition() initializing guess ...");
		var bpc = null; // Best Possible Coordinate

		debug("engine::fireAtBestPosition() retrieve logical coordinates ...");
		var logical_list = this.get_logical_action();
		if(logical_list.length == 0) {
			debug("engine::fireAtBestPosition() logical action list is empty, ...");
		} else {
			debug("engine::fireAtBestPosition() logical action list = we are in business! ...");
			bpc = this.get_most_probable_coordinate(logical_list); 
		}

		debug("engine::fireAtBestPosition() retrieve radius coordinates ...");
		var radius_list = this.get_radius_action();
		if(radius_list.length == 0) {
			debug("engine::fireAtBestPosition() radius action list is empty, ...");
		} else {
			debug("engine::fireAtBestPosition() radius action list = we are in business! ...");
			bpc = this.get_most_probable_coordinate(radius_list); 
		}

		debug("engine::fireAtBestPosition() retrieve immidiate action coordinates ...");
		var im_coordinates_list = this.get_immidiate_action();
		
		if(im_coordinates_list.length == 0) {
			debug("engine::fireAtBestPosition() immidiate action list is empty, ...");
		} else {
			debug("engine::fireAtBestPosition() immidiate action list = we are in business! ...");
			bpc = this.get_most_probable_coordinate(im_coordinates_list); 
		}

		// Perform Shot
		this.player.fire(bpc[0] + "" + bpc[1]);
		this.show_low_priority();
		this.show_high_logical_probability();

		return null;
	},

	is_outofbounds: function(x,y) {
		if(x < 0 || y < 0) {
			debug("engine::is_outofbounds("+x+","+y+") X or Y is less than zero!");
			return true;
		}
		if(x >= this.player.boardSize || y >= this.player.boardSize) {
			debug("engine::is_outofbounds("+x+","+y+") X or Y exceeds the length of the board!");
			return true;
		}
		debug("engine::is_outofbounds("+x+","+y+") totally within the board!");
		return false; 
	},

	is_hit: function(x,y) {
		var output = "engine::is_hit("+x+","+y+") ...";
		if(this.is_outofbounds(x,y)) return false;
		var hit = this.getCellStatus(x,y) == "hit";
		output += (hit) ? "true" : "false";
		debug(output);
		return hit;
	},

	is_playable: function(x,y) {
		debug("engine::is_playable("+x+","+y+") ...");
		if(this.is_outofbounds(x,y)) return false; // dismiss
		debug("engine::is_playable() status: " + this.getCellStatus(x,y));
		return this.getCellStatus(x,y) == "playable";
	},

	get_radius_coordinates: function(x,y) {
		debug("engine::get_radius_coordinates("+x+","+y+") ...");
		var hp_coordinates = new Array(); // immidiate action

		// Up (Y +1)
		if(this.is_playable(x,y+1)) {
			debug("engine::show_radius(): hit : down Y-1  is playable... ");
			hp_coordinates.push([x,y+1]);
		}

		// Down (Y -1) 
		if(this.is_playable(x,y-1)) {
			debug("engine::show_radius(): hit : down Y-1  is playable... ");
			hp_coordinates.push([x,y-1]);	
		}

		// Left (X-1)
		if(this.is_playable(x-1,y)) {
			debug("computer::show_radius(): hit : left X-1  is playable... ");
			hp_coordinates.push([x-1,y]);	
		}					

		// Right (X+1)
		if(this.is_playable(x+1,y)) {
			debug("engine::show_radius(): hit : right X+1  is playable... ");
			hp_coordinates.push([x+1,y]);	
		}

		return hp_coordinates;
	},



	get_immidiate_action_coordinates: function(x,y) {
		debug("engine::get_immidiate_action_coordinates("+x+","+y+") ...");
		var ia_coordinates = new Array(); // immidiate action

		// H [ A [B] C ]
		debug("engine::comparison V [ A [B] C ] ...");
		if(this.is_hit(x,y) && this.is_playable(x+1, y) && this.is_hit(x+2, y))  {
			debug("engine::pushing ["+(x+1)+","+y+"]...");
			ia_coordinates.push([x+1, y]);
		}

		// H [ A B [C] ]
		debug("engine::comparison V [ A B [C] ] ...");
		if(this.is_hit(x,y) && this.is_hit(x+1, y) && this.is_playable(x+2, y)) {
			debug("engine::pushing ["+(x+2)+","+y+"]...");
			ia_coordinates.push([x+2, y]);
		}

		// H [ [A] B C ]
		debug("engine::comparison V [ [A] B C ] ...");
		if(this.is_playable(x,y) && this.is_hit(x+1, y) && this.is_hit(x+2, y)) {
			debug("engine::pushing ["+(x+2)+","+y+"]...");
			ia_coordinates.push([x+2, y]);
		}

		// V [ A [B] C ]
		debug("engine::comparison H [ A [B] C ] ...");
		if(this.is_hit(x,y) && this.is_playable(x, y+1) && this.is_hit(x, y+2)) {
			debug("engine::pushing ["+x+","+(y+1)+"]...");
			ia_coordinates.push([x, y+1]);
		}

		// V [ A B [C] ]
		debug("engine::comparison H [ A B [C] ] ...");
		if(this.is_hit(x,y) && this.is_hit(x, y+1) && this.is_playable(x, y+2)) {
			debug("engine::pushing ["+x+","+(y+2)+"]...");
			ia_coordinates.push([x, y+2]);
		}

		// V [ [A] B C ]
		debug("engine::comparison H [ A B [C] ] ...");
		if(this.is_playable(x,y) && this.is_hit(x, y+1) && this.is_hit(x, y+2)) {
			debug("engine::pushing ["+x+","+(y+2)+"]...");
			ia_coordinates.push([x, y+2]);
		}

		return ia_coordinates;
	},

	show_radius: function(x,y) {
		debug("engine::show_radius("+x+","+y+") ...");
		var rad_coord = this.get_radius_coordinates(x,y);
		this.displayLogicalMap(rad_coord, "red");
	},

	show_connect_the_dots: function(x,y) {
		debug("engine::show_connect_the_dots("+x+","+y+") ...");
		var highlight_coordinates = this.get_immidiate_action_coordinates(x,y);
		this.displayLogicalMap(highlight_coordinates, "purple");
	},

	show_high_logical_probability: function() {
		var hp_coordinates = new Array();
		var current_status = "";

		for(var y = 0; y < this.player.boardSize; y++) {
			for(var x = 0; x < this.player.boardSize; x++) {
				current_status = this.getCellStatus(x,y);
				if(current_status == "hit") {
					debug("engine::high_logical_probability(): found a hit item, testing area ... ");
					this.show_radius(x,y);
					this.show_connect_the_dots(x,y);
				}
			}
		}
	},

	get_logical_coordinates: function() {
		debug("engine::get_logical_coordinates() Getting Logical coordinates!");
		if(this.model_board == null) {
			debug("engine::get_logical_coordinates() model board not yet initialized!");
			return;
		}

		var current_count = 0;
		var vertical = new Array();
		var vertical_temporal = new Array();
		var current_status = "";
		var output = new Array();

		// Vertical Search first
		for(var y = 0; y < this.player.boardSize; y++) {
			//debug("computer::get_logical_coordinates(): clearing vertical temporal array, and count!");
			current_count = 0;
			vertical_temporal = new Array();
			for(var x = 0; x < this.player.boardSize; x++) {

				current_status = this.getCellStatus(x,y);
				debug("engine::get_logical_coordinates(): cell status: " + current_status);
				

				if(current_status !== "playable") {
					//debug("computer::get_logical_coordinates(): setting current_count to zero ... ");
					current_count = 0;
					vertical_temporal = new Array();
				} else {
					current_count++;
					//debug("computer::get_logical_coordinates(): current_count is "+current_count+", pushing:  "+x+y);
					vertical_temporal.push([x,y]);	

					if (vertical_temporal.length == 3) {
						//debug("computer::get_logical_coordinates(): current_count is "+current_count+", pushing vertical ... ");
						vertical.push(vertical_temporal);
						debug("computer::get_logical_coordinates(): pushing coordinate " +x +y);
						 

						output = helpers.array_concat_nonexisting(output, vertical_temporal);

						current_count--; 
						vertical_temporal = vertical_temporal.slice(1,3); 
					}	
				}
			}
		} 

		debug("engine::get_logical_coordinates(): Switching to Horizontal Search mode ...");

		// Horizontal Search
		for(var x = 0; x < this.player.boardSize; x++) {
			
			//debug("computer::get_logical_coordinates(): clearing vertical temporal array, and count!");
			current_count = 0;
			vertical_temporal = new Array();

			for(var y = 0; y < this.player.boardSize; y++) {

				current_status = this.getCellStatus(x,y);
				debug("computer::get_logical_coordinates(): cell status: " + current_status);

				if(current_status !== "playable") {
					//debug("computer::get_logical_coordinates(): setting current_count to zero ... ");
					current_count = 0;
					vertical_temporal = new Array();
				} else {
					current_count++;
					//debug("computer::get_logical_coordinates(): current_count is "+current_count+", pushing:  "+x+y);
					vertical_temporal.push([x,y]);	
					

					if (vertical_temporal.length == 3) {
						
						vertical.push(vertical_temporal);
						debug("computer::get_logical_coordinates(): pushing coordinate " +x +y);
						 
						output = helpers.array_concat_nonexisting(output, vertical_temporal);
						current_count--; 
						vertical_temporal = vertical_temporal.slice(1,3); 
					}	
				}
			}
		}

		return output;
	},

	show_low_priority: function() {
		debug("engine::showstuff() showing stuff!");
		var logical_coordinates = this.get_logical_coordinates();
		this.displayLogicalMap(logical_coordinates, "yellow");
	},


	displayLogicalMap: function(coordinates, _color) {
		var color = _color || "green"; 
		var rgba = "";
		switch(color) {
			case 'red': 	rgba = "rgba(255,0,0,.8)"; 		break;
			case 'yellow': 	rgba = "rgba(255,255,0,.8)"; 	break;
			case 'purple':  rgba = "rgba(255,0,255,.8)";	break;
			case 'green':   rgba = "rgba(0,255,0,.3)";		break;
		}

		debug("\n\n===========================================================");
		//debug("computer::displayLogicalMap(): displaying map: " + xinspect(coordinates));
		debug("computer::displayLogicalMap(): length: " + coordinates.length + ", color: " + color);

		for(var n = 0; n < coordinates.length; n++) {
			debug("computer::displayLogicalMap() n = " + n + ", coordinates["+n+"] = " + coordinates[n][0] + coordinates[n][1]);
			debug("computer::displayLogicalMap() n = " + n + ", coordinates["+n+"].style: " + this.getCellAttribute(coordinates[n][0], coordinates[n][1], "style"));

			if(this.getCellAttribute(coordinates[n][0], coordinates[n][1], "style") == "color: rgba(255,0,255,.8);" && color == "red") {
				debug("No Action Taken, purple is higher than red!");
				continue;
			}


			this.setCellStatus(coordinates[n][0],coordinates[n][1],"style", "");
			this.setCellStatus(coordinates[n][0],coordinates[n][1],"style","color: "+ rgba +";");
		}
		debug("===========================================================\n\n");
		return;
	},

	getCellStatus: function(x,y) {
		// if(this.is_outofbounds(x,y)) return "";
		var cell_id = this.player.name + "_cell_" + x + y;
		debug("getCellStatus(): status " + cell_id);
		var cell = document.getElementById(cell_id);
		return cell.title;
	},

	getCellAttribute: function(x,y,attr) {
		// if(this.is_outofbounds(x,y)) return "";
		var cell_id = this.player.name + "_cell_" + x + y;
		debug("getCellStatus(): status " + cell_id);
		var cell = document.getElementById(cell_id);
		return cell.getAttribute(attr);
	},

	setCellStatus: function(x, y, property, status) {
		var cell_id = this.player.name + "_cell_" + x + y;
		var cell = document.getElementById(cell_id);
		cell.setAttribute(property, status);
	},

	iterateThroughCells: function(x, y) {
		debug("computer::getCellStatus() iterating through children: ");
		var rows = this.model_board.children;


		for (var i = 0; i < rows.length; i++) {
		  debug("computer::getCellStatus() iterating through row: " + rows[i].id);
		  var row = rows[i].children;

		  if(i == x) {
		  	for(var n = 0; n < row.length; n++) {
				debug("computer::getCellStatus() iterating through row: " + row[n].id);
				if(n == y) return row.getAttribute("class"); 

		  	}	
		  }
		  
		}
	},

	recalculateProbabilityMap: function() {
		return null;
	},

	array_priority_sort: function(a, b) {
		if (a.probability > b.probability) return -1;
		if (a.probability < b.probability) return 1;
		return 0;
	}
};





























var user = null;
var computer = null;

var handleClick = function(player, elem) {
	debug("handleClick(): fired on "+ player.name +" cell: " + elem.id);
	
	debug("handleClick() sending click event to controller handle ...");
	controller.processGuess(player, elem.id);

	debug("handleClick() not it is the computer's turn to guess ...");
	controller.processEngineGuess();

	debug("handleClick() not it is the computer's turn to guess ...");
	controller.checkcycle(user, computer);
}

var init = function() {
	debug("init() initializing players (user, computer)...");
	user = new Player("User");
	computer = new Player();
	debug("init() done...")

	debug("init() Generating Ship locations for players (user, computer)...");
	user.generateShipLocations();
	computer.generateShipLocations();
	debug("init() done...")

	debug("init() Setting board area...");
	view.setBoardArea("boardArea");

	debug("init() Generating Players' Boards (user, computer)...");
	view.generateBoard(user);
	view.generateBoard(computer);

	debug("init() initializing engine logical board...")
	engine.initialize_board(user);

	debug("init() done...");
}


// init - called when the page has completed loading
window.onload = init;
