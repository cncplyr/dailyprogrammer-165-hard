function Map(mapSize) {
	this.mapSize = mapSize;
	this.grid = this.makeGrid(mapSize);
	
	this.simulation = null;
}

Map.prototype.makeGrid = function(size) {
	array = [];
	for (var x = 0; x < size; x++) {
		array[x] = [];
		array[x][size-1] = null;
	}
	return array;
}

Map.prototype.put = function(x, y, obj) {
	var grid = this.grid;
	
	var posX = this.getSafeCoord(x);
	var posY = this.getSafeCoord(y);
	
	// No array at location, create one
	if (grid[posX][posY] == null) {
		grid[posX][posY] = [obj];
		
		obj.x = posX;
		obj.y = posY;
	} else {
		// Check if object already exists at that location
		if ($.inArray(obj, grid[posX][posY]) === -1) {
			grid[posX][posY].push(obj);

			obj.x = posX;
			obj.y = posY;
		} else {
			console.log(obj.name + " is already at that location!");
		}
	}
}

Map.prototype.remove = function(x, y, obj) {
	var grid = this.grid;
	var index = $.inArray(obj, grid);
	if (index > -1) {
		grid.splice(index, 1);
	}
}

Map.prototype.get = function(x, y) {
	return this.grid[x][y];
}

Map.prototype.getLocale = function(xCoord, yCoord) {
	var surroundings = {
		grid: [],
		empty: [],
	};
	for (var x = -1; x < 2; x++) {
		for (var y = -1; y < 2; y++) {
			var posX = this.getSafeCoord(xCoord + x);
			var posY = this.getSafeCoord(yCoord + y);
			
			surroundings.grid.push({
				x: posX,
				y: posY,
				objects: this.grid[posX][posY]
			});
			if (this.grid[posX][posY] == null) {
				surroundings.empty.push({
					x: posX,
					y: posY
				});
			}
		}
	}
	return surroundings;
}

// Toroid
Map.prototype.getSafeCoord = function(coord) {
	if (coord < 0) return this.mapSize - 1;
	if (coord >= this.mapSize) return 0;
	return coord;
}