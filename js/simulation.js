function Simulation(mapSize) {
	this.map = new Map(mapSize);
	this.map.simulation = this;
	
	this.months = 0;
	
	this.trees = [];
	this.lumberjacks = [];
	this.bears = [];
	this.lumber = 0;
	this.mauls = 0;
	
	this.initialise();
}
Simulation.prototype.tickMonth = function() {
	if (this.months > 11 && this.months % 12 == 0) {
		console.log('lumber: ' + this.lumber);
		console.log('lumberjacks: ' + this.lumberjacks.length);
		if (this.lumber > this.lumberjacks.length) {
			// Hire some lumberjacks
			var newHireCount = Math.floor(this.lumber / this.lumberjacks.length);
			console.log('hiring ' + newHireCount + ' new luberjacks!');
			this.spawnMobileAgents(Lumberjack, newHireCount);
		} else {
			// Fire some lumberjacks
			if (this.lumberjacks.length > 1) {
				var removals = Math.floor(this.lumberjacks.length / this.lumber);
				if (removals > this.lumberjacks.length - 1) {
					removals = this.lumberjacks.length - 1;
				}
				console.log('firing ' + removals + ' lumberjacks!');
				while (removals > 0) {
					var index = Math.floor(Math.random() * this.lumberjacks.length);
					var exLumberjack = this.lumberjacks[index];
					this.map.remove(exLumberjack.x, exLumberjack.y, exLumberjack);
					this.lumberjacks.splice(index, 1);
					removals--;
				}
			}
		}
		
		this.lumber = 0;
		this.mauls = 0;
	}

	var trees = this.trees;
	var lumberjacks = this.lumberjacks;
	
	$.each(trees, function(k, v) {
		v.tickMonth();
	});
	
	$.each(lumberjacks, function(k, v) {
		v.tickMonth();
	});
	
	this.months++;	
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
Simulation.prototype.spawnMobileAgents = function(object, count) {
	for (var i = 0; i < count; i++) {
		var obj = new object();
		obj.simulation = this;
		
		var x = Math.floor(Math.random() * this.map.mapSize);
		var y = Math.floor(Math.random() * this.map.mapSize);
		
		this.map.put(x, y, obj);
		
		switch(obj.type) {
			case 'lumberjack':
				this.lumberjacks.push(obj);
				break;
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
Simulation.prototype.reportLumber = function(amount) {
	this.lumber += amount;
}