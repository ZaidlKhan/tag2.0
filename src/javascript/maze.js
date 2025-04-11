// maze.js
import { CELL_SIZE, COLS, ROWS } from '../../config.js';
import { generateMaze } from './utils/generateMaze.js';

export class Maze {
    constructor() {
        this.cellSize = CELL_SIZE;
        this.cols = COLS;
        this.rows = ROWS;
        this.grid = [];
        this.walls = [];
        this.rewards = [];
    }

    makeMaze() {
        const mazeData = generateMaze(this.cols, this.rows, this.cellSize);
        this.grid = mazeData.grid;
        this.walls = mazeData.walls;
        this.rewards = mazeData.rewards;
    }

    getWalls() {
        return this.walls;
    }

    getRewards() {
        return this.rewards;
    }
}