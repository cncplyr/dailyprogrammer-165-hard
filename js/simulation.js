function Simulation(mapSize) {
	this.map = new Map(mapSize);
	this.map.simulation = this;
	this.trees = []
	
	this.initialise();
}
Simulation.prototype.tickMonth = function() {
	var trees = this.trees;
	
	$.each(trees, function(k, v) {
		v.tickMonth();
	});
}
Simulation.prototype.initialise = function() {
	var map = this.map;
	var mapSize = map.mapSize;

	console.log(mapSize);
	
	// Spawn trees (50% chance per location)
	for (var x = 0; x < mapSize; x++) {
		for (var y = 0; y < mapSize; y++) {
			if (Math.floor(Math.random() * 2)) {
				var t = new Tree();
				t.setAge(12);
				t.simulation = this;				
				this.trees.push(t);
				map.put(x, y, t);
			}
		}
	}
}