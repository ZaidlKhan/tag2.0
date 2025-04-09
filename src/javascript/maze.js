class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = [true, true, true, true];
        this.visited = false;
    }
}

class Maze {
    constructor() {
        this.rows = 50;
        this.cols = 50;
        this.cellSize = 40;
        this.grid = [];
        this.walls = [];
    }

    makeMaze() {
        this.generateMaze();
        this.mazeToWalls();
    }

    generateMaze() {
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = new Cell(r, c);
            }
        }

        const stack = [];
        let current = this.grid[0][0];
        current.visited = true;

        do {
            const next = this.getUnvisitedNeighbor(current);
            if (next) {
                next.visited = true;
                stack.push(current);
                this.removeWalls(current, next);
                current = next;
            } else if (stack.length > 0) {
                current = stack.pop();
            }
        } while (stack.length > 0);
    }

    getUnvisitedNeighbor(cell) {
        const neighbors = [];
        const r = cell.row;
        const c = cell.col;

        if (r > 0 && !this.grid[r - 1][c].visited)
            neighbors.push(this.grid[r - 1][c]);
        if (c < this.cols - 1 && !this.grid[r][c + 1].visited)
            neighbors.push(this.grid[r][c + 1]);
        if (r < this.rows - 1 && !this.grid[r + 1][c].visited)
            neighbors.push(this.grid[r + 1][c]);
        if (c > 0 && !this.grid[r][c - 1].visited)
            neighbors.push(this.grid[r][c - 1]);

        if (neighbors.length === 0) return null;

        for (let i = neighbors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
        }
        return neighbors[0];
    }

    removeWalls(a, b) {
        const dx = b.col - a.col;
        const dy = b.row - a.row;

        if (dx === 1) {
            a.walls[1] = false;
            b.walls[3] = false;
        } else if (dx === -1) {
            a.walls[3] = false;
            b.walls[1] = false;
        }

        if (dy === 1) {
            a.walls[2] = false;
            b.walls[0] = false;
        } else if (dy === -1) {
            a.walls[0] = false;
            b.walls[2] = false;
        }
    }

    mazeToWalls() {
        this.walls = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.grid[r][c];
                const x = c * this.cellSize;
                const y = r * this.cellSize;

                if (cell.walls[0])
                    this.walls.push({ x, y, width: this.cellSize, height: 2 });
                if (cell.walls[1])
                    this.walls.push({ x: x + this.cellSize - 2, y, width: 2, height: this.cellSize });
                if (cell.walls[2])
                    this.walls.push({ x, y: y + this.cellSize - 2, width: this.cellSize, height: 2 });
                if (cell.walls[3])
                    this.walls.push({ x, y, width: 2, height: this.cellSize });
            }
        }
    }

    getWalls() {
        return this.walls;
    }
}