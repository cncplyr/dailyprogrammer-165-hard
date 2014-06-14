function Tree() {
	// Age in months
	this.age = 0;
	this.type = "sapling";
	this.x = -1;
	this.y = -1;
	this.simulation = null;
}
Tree.prototype.setAge = function(newAge) {
	this.age = newAge;
	
	// Update tree type if old enough
	if (this.age < 12) {
		this.type = "sapling";
	} else if (12 <= this.age && this.age < 120) {
		this.type = "mature";
	} else if (120 < this.age) {
		this.type = "elder";
	}
}
Tree.prototype.tickMonth = function() {
	var map = this.simulation.map;
	
	// Increment age
	var newAge = this.age + 1;
	this.setAge(newAge);
	
	// Get the tree's surroundings
	var localArea = map.getLocalArea(this.x, this.y);
	var emptyLocations = [];
	
	// Check each surrounding location
	for (var i = 0; i < localArea.length; i++) {
		// Nothing in this location
		if (!(localArea[i].objects instanceof Array)) {
			emptyLocations.push({x: localArea[i].x, y: localArea[i].y});
		// Nothing in this location either
		} else if (localArea[i].objects.length === 0) {
			emptyLocations.push({x: localArea[i].x, y: localArea[i].y});
		// Something here, check if it's a tree
		} else {
			var treeFound = false;
			for (var j = 0; j < localArea[i].objects.length; j++) {
				if (localArea[i].objects[j].type === 'sapling' ||
					localArea[i].objects[j].type === 'mature' || 
					localArea[i].objects[j].type === 'elder') {
					// There's a tree here!
					treeFound = true;
					break;
				}
			}
			if (!treeFound) {
				emptyLocations.push({x: localArea[i].x, y: localArea[i].y});
			}
		}
	}
	
	// Check if we can and should spawn a new tree
	if (12 <= this.age && emptyLocations.length > 0) {
		var chance = Math.random();
	
		if ((this.age < 120 && chance < 0.1) || 
			(120 < this.age && chance < 0.2)) {
			
			var index = Math.floor(Math.random() * emptyLocations.length);
			// Spawn a new tree!
			var newTree = new Tree();
			newTree.simulation = this.simulation;
			this.simulation.trees.push(newTree);
			map.put(emptyLocations[index].x, 
					emptyLocations[index].y,
					newTree
			);
		} 
	}
}

function Lumberjack() {
	this.type = "lumberjack";
	this.x = -1;
	this.y = -1;
	this.simulation = null;
}
Lumberjack.prototype.tickMonth = function() {
	var map = this.simulation.map;
	var movesRemaining = 3;
	var treeFound = false;
	
	while (movesRemaining > 0 && !treeFound) {
		// Move to a random location
		var dx = Math.floor(Math.random() * 3) - 1;
		var dy = Math.floor(Math.random() * 3) - 1;
		map.remove(this.x, this.y, this);
		map.put(this.x + dx, this.y + dy, this);
		
		// Check for trees
		var currentLocation = map.get(this.x, this.y);
		
		var tree = null;
		for (var i = 0; i < currentLocation.length; i++) {
			if (currentLocation[i] instanceof Tree && 
				currentLocation[i].type != 'sapling') {
				
				tree = currentLocation[i];
				break;
			}
		}
		// Found a tree, cut it down!
		if (tree !== null) {
			this.simulation.remove(this.x, this.y, tree);
			treeFound = true;
		}
		
		movesRemaining--;
	}
}