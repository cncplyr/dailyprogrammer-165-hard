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
	
	// Spawn lumberjacks (1% chance per location)
	this.spawn(Lumberjack, 0.01);
	
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
						// Set age between 12 and 120 months
						obj.setAge(Math.floor(Math.random() * 109) + 12);				
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
Simulation.prototype.remove = function(x, y, obj) {
	switch (obj.type) {
		case 'sapling':
		case 'mature':
		case 'elder':
			var trees = this.trees;
			var index = $.inArray(obj, trees);
			if (index > -1) {
				trees.splice(index, 1);
			}
			break;
		case 'lumberjack':
			var lumberjacks = this.lumberjacks;
			var index = $.inArray(obj, lumberjacks);
			if (index > -1) {
				lumberjacks.splice(index, 1);
			}
			break;
	}
	
	this.map.remove(x, y, obj);
}