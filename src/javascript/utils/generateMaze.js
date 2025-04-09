// generateMaze.js
import { CELL_SIZE, COLS, ROWS } from '../../config.js';

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = [true, true, true, true];
        this.visited = false;
        this.hasReward = false;
    }
}

export function generateMaze(cols = COLS, rows = ROWS, cellSize = CELL_SIZE) {
    const grid = initializeGrid(rows, cols);
    generateMazeStructure(grid);
    addLoops(grid);
    const rewards = placeRewards(grid, cellSize);
    const walls = mazeToWalls(grid, cellSize);

    return { grid, walls, rewards };
}

function initializeGrid(rows, cols) {
    const grid = [];
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = new Cell(r, c);
        }
    }
    return grid;
}

function generateMazeStructure(grid) {
    const stack = [];
    let current = grid[0][0];
    current.visited = true;

    do {
        const next = getUnvisitedNeighbor(current, grid);
        if (next) {
            next.visited = true;
            stack.push(current);
            removeWalls(current, next);
            current = next;
        } else if (stack.length > 0) {
            current = stack.pop();
        }
    } while (stack.length > 0);
}

function getUnvisitedNeighbor(cell, grid) {
    const neighbors = [];
    const r = cell.row;
    const c = cell.col;
    const cols = grid[0].length;
    const rows = grid.length;

    if (r > 0 && !grid[r - 1][c].visited)
        neighbors.push(grid[r - 1][c]);
    if (c < cols - 1 && !grid[r][c + 1].visited)
        neighbors.push(grid[r][c + 1]);
    if (r < rows - 1 && !grid[r + 1][c].visited)
        neighbors.push(grid[r + 1][c]);
    if (c > 0 && !grid[r][c - 1].visited)
        neighbors.push(grid[r][c - 1]);

    if (neighbors.length === 0) return null;

    for (let i = neighbors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
    }
    return neighbors[0];
}

function removeWalls(a, b) {
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

function addLoops(grid, loopChance = 0.05) {
    const rows = grid.length;
    const cols = grid[0].length;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = grid[r][c];
            const neighbors = [];

            if (r > 0) neighbors.push(grid[r - 1][c]);     // top
            if (c < cols - 1) neighbors.push(grid[r][c + 1]); // right
            if (r < rows - 1) neighbors.push(grid[r + 1][c]); // bottom
            if (c > 0) neighbors.push(grid[r][c - 1]);     // left

            for (const neighbor of neighbors) {
                if (!areConnected(cell, neighbor) && Math.random() < loopChance) {
                    removeWalls(cell, neighbor);
                }
            }
        }
    }
}

function areConnected(a, b) {
    const dx = b.col - a.col;
    const dy = b.row - a.row;

    if (dx === 1) return !a.walls[1] && !b.walls[3];
    if (dx === -1) return !a.walls[3] && !b.walls[1];
    if (dy === 1) return !a.walls[2] && !b.walls[0];
    if (dy === -1) return !a.walls[0] && !b.walls[2];
    return false;
}

function placeRewards(grid, cellSize) {
    const rewardCount = 5;
    let placed = 0;
    const rewards = [];
    const rows = grid.length;
    const cols = grid[0].length;

    while (placed < rewardCount) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        const cell = grid[r][c];

        if (!cell.hasReward) {
            cell.hasReward = true;
            rewards.push({
                x: c * cellSize + cellSize / 4,
                y: r * cellSize + cellSize / 4,
                width: cellSize / 2,
                height: cellSize / 2
            });
            placed++;
        }
    }
    return rewards;
}

function mazeToWalls(grid, cellSize) {
    const walls = [];
    const rows = grid.length;
    const cols = grid[0].length;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = grid[r][c];
            const x = c * cellSize;
            const y = r * cellSize;

            if (cell.walls[0]) walls.push({ x, y, width: cellSize, height: 2 });
            if (cell.walls[1]) walls.push({ x: x + cellSize - 2, y, width: 2, height: cellSize });
            if (cell.walls[2]) walls.push({ x, y: y + cellSize - 2, width: cellSize, height: 2 });
            if (cell.walls[3]) walls.push({ x, y, width: 2, height: cellSize });
        }
    }
    return walls;
}