function Agent() {
	this.type = 'agent';
	this.x = -1;
	this.y = -1;
	this.simulation = null;
}
Agent.prototype.tickMonth = function() { }

function Tree() {
	Agent.call(this);
	
	// Age in months
	this.age = 0;
	this.type = 'sapling'
}
Tree.prototype = new Agent();
Tree.prototype.constructor = Tree;
Tree.prototype.setAge = function(newAge) {
	this.age = newAge;
	
	// Update tree type if old enough
	if (this.age < 12) {
		this.type = 'sapling';
	} else if (12 <= this.age && this.age < 120) {
		this.type = 'mature';
	} else if (120 < this.age) {
		this.type = 'elder';
	}
}
Tree.prototype.tickMonth = function() {
	var map = this.simulation.map;
	
	// Increment age
	var newAge = this.age + 1;
	this.setAge(newAge);
			
	// Check if we can and should spawn a new tree
	if (12 <= this.age) {
		var chance = Math.random();
	
		if ((this.age < 120 && chance < 0.1) || 
			(120 < this.age && chance < 0.2)) {
			// Check there's space to spawn a tree
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
			
			if (emptyLocations.length > 0) {
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
}

function Lumberjack() {
	Agent.call(this);
	
	this.type = 'lumberjack';
}
Lumberjack.prototype = new Agent();
Lumberjack.prototype.constructor = Lumberjack;
Lumberjack.prototype.tickMonth = function() {
	var movesRemaining = 3;
	var treeFound = false;
	
	while (movesRemaining > 0 && !treeFound) {
		// Move to a random location
		var dx = Math.floor(Math.random() * 3) - 1;
		var dy = Math.floor(Math.random() * 3) - 1;
		this.simulation.move(this.x + dx, this.y + dy, this);
		
		// Check for trees
		var trees = this.simulation.checkFor(this.x, this.y, Tree);
		
		if (trees.length > 0) {
			for (var i = 0; i < trees.length; i++) {
				if (trees[i].type === 'sapling') {
					continue;
				} else if (trees[i].type === 'mature') {
					this.simulation.remove(trees[i]);
					this.simulation.reportLumber(1);
					break;
				} else if (trees[i].type === 'elder') {
					this.simulation.remove(trees[i]);
					this.simulation.reportLumber(2);
					break;
				}
			}
		}
		
		movesRemaining--;
	}
}

function Bear() {
	Agent.call(this);

	this.type = 'bear';
}
Bear.prototype = new Agent();
Bear.prototype.constructor = Bear;
Bear.prototype.tickMonth = function() {
	var movesRemaining = 5;
	var lumberjackEaten = false;
	
	while (movesRemaining > 0 && !lumberjackEaten) {
		// Move to a random location
		var dx = Math.floor(Math.random() * 3) - 1;
		var dy = Math.floor(Math.random() * 3) - 1;
		this.simulation.move(this.x + dx, this.y + dy, this);
		
		// Check for lumberjacks
		var lumberjacks = this.simulation.checkFor(this.x, this.y, Lumberjack);
		
		// Found a lumberjack! Dinner time!
		if (lumberjacks.length > 0) {
			this.simulation.remove(lumberjacks[0]);
			lumberjackEaten = true;
		}
		
		movesRemaining--;
	}
}