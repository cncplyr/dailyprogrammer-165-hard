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
	var newTree;
	
	// Increment age
	var newAge = this.age + 1;
	this.setAge(newAge);
	
	// Get the tree's surroundings
	var surroundings = map.getLocale(this.x, this.y);
	
	// Check if we spawn a new tree
	if (12 <= this.age && surroundings.empty.length > 0) {
		var chance = Math.random();
	
		if ((this.age < 120 && chance < 0.1) || 
			(120 < this.age && chance < 0.2)) {
			
			var index = Math.floor(Math.random() * surroundings.empty.length);
			// Spawn a new tree!
			console.log("Spawning new tree!");
			newTree = new Tree();
			newTree.simulation = this.simulation;
			this.simulation.trees.push(newTree);
			map.put(surroundings.empty[index].x, 
					surroundings.empty[index].y,
					newTree
			);
		} 
	}
	
	return newTree;
}