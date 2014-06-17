function Simulation(mapSize) {
	this.map = new Map(mapSize);
	this.map.simulation = this;
	
	this.month = 0;
	
	this.trees = [];
	this.lumberjacks = [];
	this.bears = [];
	this.lumber = 0;
	this.mauls = 0;
	
	this.annualClock = new Date().getTime();
	this.annualRecords = []
	
	this.initialise();
}
/**
 * Called to run a single tick on every agent in the simulation
 */
Simulation.prototype.tickMonth = function() {
	// Check end of year
	if (this.month > 11 && this.month % 12 == 0) {
		// Log some statistics
		console.log('year: ' + this.month/12 + '\t\tlumber: ' + this.lumber + '\tjacks: ' + this.lumberjacks.length + '\tmauls: ' + this.mauls +  '\tbears: ' + this.bears.length);

		// Monitor the lumberjack population
		if (this.lumber > this.lumberjacks.length) {
			// Lots of lumber, hire more lumberjacks!
			var newHireCount = Math.floor(this.lumber / this.lumberjacks.length);
			console.log('\t\t\t\t\t\t\t\t+' + newHireCount + ' lumberjacks!');
			this.spawnAgents(Lumberjack, newHireCount);
		} else {
			// Not much lumber, fire some lumberjacks!
			if (this.lumberjacks.length > 1) {
				var removals = Math.floor(this.lumberjacks.length / this.lumber);
				if (removals > this.lumberjacks.length - 1) {
					removals = this.lumberjacks.length - 1;
				}
				console.log('\t\t\t\t\t\t\t\t-' + removals + ' lumberjacks!');
				while (removals > 0) {
					var index = Math.floor(Math.random() * this.lumberjacks.length);
					var exLumberjack = this.lumberjacks[index];
					this.map.remove(exLumberjack.x, exLumberjack.y, exLumberjack);
					this.lumberjacks.splice(index, 1);
					removals--;
				}
			}
		}
		if (this.lumberjacks.length === 0) {
			this.spawnAgents(Lumberjack, 1);
		}

		// Monitor the bear population
		if (this.mauls > 1) {
			// Maulings occured, cull a bears!
			var index = Math.floor(Math.random() * this.bears.length);
			var exBear = this.bears[index];
			this.map.remove(exBear.x, exBear.y, exBear);
			this.bears.splice(index, 1);
		} else if (this.mauls === 0) {
			// No maulings this year, new bear moves in
			this.spawnAgents(Bear, 1);
		}
		
		this.annualRecords.push({
			year: this.month / 12,
			trees: this.trees.length,
			lumberjacks: this.lumberjacks.length,
			bears: this.bears.length,
			lumber: this.lumber,
			mauls: this.mauls,
			calculationTime: new Date().getTime() - this.annualClock
		});
		
		// Reset counts
		this.lumber = 0;
		this.mauls = 0;
		this.annualClock = new Date().getTime();
	}

	// Monthly updates
	var trees = this.trees;
	var lumberjacks = this.lumberjacks;
	var bears = this.bears;
	
	$.each(trees, function(k, v) {
		v.tickMonth();
	});
	
	$.each(lumberjacks, function(k, v) {
		v.tickMonth();
	});
	
	$.each(bears, function(k, v) {
		v.tickMonth();
	});
	
	this.month++;	
}
Simulation.prototype.initialise = function() {
	// Seed trees (50% chance per location)
	this.seed(Tree, 0.5);
	
	// Seed lumberjacks (10% chance per location)
	this.seed(Lumberjack, 0.1);
	
	// Seed bears (2% chance per location)
	this.seed(Bear, 0.02)
}
/**
 * Goes through the entire map and seeds agents randomly
 * according to the defined percent chance.
 */
Simulation.prototype.seed = function(agentType, chance) {
	var map = this.map;
	var mapSize = map.mapSize;

	for (var x = 0; x < mapSize; x++) {
		for (var y = 0; y < mapSize; y++) {
			if (Math.random() < chance) {
				var agent = new agentType();
				agent.simulation = this;
				
				if (agent instanceof Tree) {
					// Set age between 12 and 120 months
					agent.setAge(Math.floor(Math.random() * 109) + 12);
				}
				
				this.spawnAgent(x, y, agent);
			}
		}
	}
}
/**
 * Spawns a set number of agents randomly across the map
 */
Simulation.prototype.spawnAgents = function(agentType, count) {
	for (var i = 0; i < count; i++) {
		var agent = new agentType();
		agent.simulation = this;
		
		var x = Math.floor(Math.random() * this.map.mapSize);
		var y = Math.floor(Math.random() * this.map.mapSize);
		
		this.spawnAgent(x, y, agent);		
	}
}
/** 
 * Spawns an agent at a specified location on the map
 */
Simulation.prototype.spawnAgent = function(x, y, agent) {
	this.map.put(x, y, agent);
	
	switch(agent.type) {
		case 'sapling':
		case 'mature':
		case 'elder':
			this.trees.push(agent);
			break;
		case 'lumberjack':
			this.lumberjacks.push(agent);
			break;
		case 'bear':
			this.bears.push(agent);
			break;
	}
}
/**
 * Removes an agent from it's current position on the map, 
 * and places it at a new location
 */
Simulation.prototype.move = function(x, y, agent) {
	this.map.remove(agent.x, agent.y, agent);
	this.map.put(x, y, agent);
}
/**
 * Removes an agent from the simulation and map
 * e.g. if the agent was killed
 */
Simulation.prototype.remove = function(agent) {
	// Remove from the appropriate list in the simulation
	switch (agent.type) {
		case 'sapling':
		case 'mature':
		case 'elder':
			var trees = this.trees;
			var index = $.inArray(agent, trees);
			if (index > -1) {
				trees.splice(index, 1);
			}
			break;
		case 'lumberjack':
			var lumberjacks = this.lumberjacks;
			var index = $.inArray(agent, lumberjacks);
			if (index > -1) {
				lumberjacks.splice(index, 1);
			}
			this.mauls++;
			break;
		case 'bear':
			var index = $.inArray(agent, bears);
			if (index > -1) {
				bears.splice(index, 1);
			}
			break;
	}
	
	// Remove from the actual map
	this.map.remove(agent.x, agent.y, agent);
}
/**
 * Checks a grid location for a type of agent.
 * Returns an array of all agents found, or an empty array if none found.
 */
Simulation.prototype.checkFor = function(x, y, agentType) {
	var currentLocation = this.map.get(x, y);
		
	var agents = [];
		for (var i = 0; i < currentLocation.length; i++) {
			if (currentLocation[i] instanceof agentType) {
				agents.push(currentLocation[i]);
			}
		}
	
	return agents;
}
Simulation.prototype.reportLumber = function(amount) {
	this.lumber += amount;
}
Simulation.prototype.getAnnualRecordsAsCSV = function() {
	var r = this.annualRecords;
	console.log('year,trees,lumberjacks,bears,lumber,mauls,calculationTime');
	$.each(r, function(k, v) {
		console.log(v.year + ',' + v.trees + ',' + v.lumberjacks + ',' + v.bears + ',' + v.lumber + ',' + v.mauls + ',' + v.calculationTime);
	});
}
