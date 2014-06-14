function Simulation(mapSize) {
	this.map = new Map(mapSize);
	this.map.simulation = this;
	this.trees = [];
	this.lumberjacks = [];
	
	this.initialise();
}
Simulation.prototype.tickMonth = function() {
	var trees = this.trees;
	var lumberjacks = this.lumberjacks;
	
	$.each(trees, function(k, v) {
		v.tickMonth();
	});
	
	$.each(lumberjacks, function(k, v) {
		v.tickMonth();
	});
}
Simulation.prototype.initialise = function() {
	// Spawn trees (50% chance per location)
	this.spawn(Tree, 0.5);
	
	// Spawn lumberjacks (10% chance per location)
	this.spawn(Lumberjack, 0.1);
	
}
Simulation.prototype.spawn = function(object, chance) {
	var map = this.map;
	var mapSize = map.mapSize;

	for (var x = 0; x < mapSize; x++) {
		for (var y = 0; y < mapSize; y++) {
			if (Math.random() < chance) {
				var obj = new object();
				obj.simulation = this;
				map.put(x, y, obj);
				
				switch(obj.type) {
					case 'sapling':
					case 'mature':
					case 'elder':
						obj.setAge(12);				
						this.trees.push(obj);
						break;
					case 'lumberjack':
						this.lumberjacks.push(obj);
						break;
				}
			}
		}
	}
}