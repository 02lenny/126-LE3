import { Node } from './Node.js';

/**
 * Grid class manages a 2D array of nodes and provides grid operations
 * Handles visualization, user interactions, and grid state management
 */
export class Grid {
    constructor(rows, cols, containerId) {
        this.rows = rows;
        this.cols = cols;
        this.containerId = containerId;
        this.nodes = [];
        this.startNode = null;
        this.endNode = null;
        this.container = null;
        
        this.initializeGrid();
        this.createDOMGrid();
    }
    
    /**
     * Initialize the 2D array of nodes
     */
    initializeGrid() {
        this.nodes = [];
        for (let row = 0; row < this.rows; row++) {
            const currentRow = [];
            for (let col = 0; col < this.cols; col++) {
                currentRow.push(new Node(row, col));
            }
            this.nodes.push(currentRow);
        }
        
        // Set default start and end positions
        this.setStartNode(0, 0);
        this.setEndNode(this.rows - 1, this.cols - 1);
    }
    
    /**
     * Create the DOM representation of the grid
     */
    createDOMGrid() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Container with id ${this.containerId} not found`);
            return;
        }
        
        // Clear existing content
        this.container.innerHTML = '';
        
        // Set grid template columns based on current grid size
        this.container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        
        // Create DOM elements for each node
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.nodes[row][col];
                const nodeElement = node.createElement((clickedNode) => {
                    this.handleNodeClick(clickedNode);
                });
                this.container.appendChild(nodeElement);
            }
        }
    }
    
    /**
     * Handle node click based on current tool selection
     * @param {Node} node - The clicked node
     */
    handleNodeClick(node) {
        const activeTool = document.querySelector('.tool-btn.active');
        if (!activeTool) return;
        
        const tool = activeTool.dataset.tool;
        const weight = parseInt(document.getElementById('weight-selector').value);
        
        switch (tool) {
            case 'start':
                this.setStartNode(node.row, node.col);
                break;
            case 'end':
                this.setEndNode(node.row, node.col);
                break;
            case 'wall':
                node.setAsWall();
                break;
            case 'weight':
                node.setWeight(weight);
                break;
            case 'eraser':
                node.clear();
                break;
            default:
                // If no specific tool, do nothing
                break;
        }
    }
    
    /**
     * Set the start node at specified position
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    setStartNode(row, col) {
        // Prevent setting start on end node
        if (this.endNode && this.endNode.row === row && this.endNode.col === col) return;
        // If cell is wall or weighted, clear wall and set weight to 1
        const node = this.nodes[row][col];
        node.isWall = false;
        node.weight = 1;
        node.updateVisualState();
        if (this.startNode) {
            this.startNode.isStart = false;
            this.startNode.updateVisualState();
        }
        this.startNode = node;
        this.startNode.setAsStart();
    }
    
    /**
     * Set the end node at specified position
     * @param {number} row - Row index
     * @param {number} col - Column index
     */
    setEndNode(row, col) {
        // Prevent setting end on start node
        if (this.startNode && this.startNode.row === row && this.startNode.col === col) return;
        // If cell is wall or weighted, clear wall and set weight to 1
        const node = this.nodes[row][col];
        node.isWall = false;
        node.weight = 1;
        node.updateVisualState();
        if (this.endNode) {
            this.endNode.isEnd = false;
            this.endNode.updateVisualState();
        }
        this.endNode = node;
        this.endNode.setAsEnd();
    }
    
    /**
     * Get all neighbor nodes of a given node
     * @param {Node} node - The node to get neighbors for
     * @returns {Node[]} Array of neighbor nodes
     */
    getNeighbors(node) {
        const neighbors = [];
        const { row, col } = node;
        
        // Check all 4 directions (up, down, left, right)
        const directions = [
            [-1, 0], // Up
            [1, 0],  // Down
            [0, -1], // Left
            [0, 1]   // Right
        ];
        
        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            // Check bounds
            if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                neighbors.push(this.nodes[newRow][newCol]);
            }
        }
        
        return neighbors;
    }
    
    /**
     * Reset all nodes to clear algorithm-specific states
     */
    resetAlgorithmStates() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.nodes[row][col].reset();
            }
        }
    }
    
    /**
     * Clear the entire grid (remove all walls, weights, etc.)
     */
    clearGrid() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.nodes[row][col].resetCompletely();
            }
        }
        
        // Reset start and end positions
        this.setStartNode(0, 0);
        this.setEndNode(this.rows - 1, this.cols - 1);
    }
    
    /**
     * Generate a random maze using recursive division, ensuring a random path exists from start to end
     */
    generateRandomMaze() {
        // Clear grid first
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (!this.nodes[row][col].isStart && !this.nodes[row][col].isEnd) {
                    this.nodes[row][col].clear();
                }
            }
        }
        this._recursiveDivision(0, 0, this.rows, this.cols, true);
        // Ensure a random path exists from start to end
        this._ensureRandomPathExists();
    }
    
    /**
     * Recursive Division Maze Generation
     */
    _recursiveDivision(row, col, height, width, horizontal) {
        if (height < 3 || width < 3) return;
        const isHorizontal = horizontal;
        const wx = col + (isHorizontal ? 0 : Math.floor(Math.random() * (width - 2)));
        const wy = row + (isHorizontal ? Math.floor(Math.random() * (height - 2)) : 0);
        const px = wx + (isHorizontal ? Math.floor(Math.random() * width) : 0);
        const py = wy + (isHorizontal ? 0 : Math.floor(Math.random() * height));
        const dx = isHorizontal ? 1 : 0;
        const dy = isHorizontal ? 0 : 1;
        const length = isHorizontal ? width : height;
        const dir = isHorizontal ? 'horizontal' : 'vertical';

        for (let i = 0; i < length; i++) {
            const nx = wx + i * dx;
            const ny = wy + i * dy;
            if ((nx !== px || ny !== py) &&
                this.isValidPosition(ny, nx) &&
                !this.nodes[ny][nx].isStart &&
                !this.nodes[ny][nx].isEnd) {
                this.nodes[ny][nx].setAsWall();
            }
        }

        const [nx, ny] = [col, row];
        const w = isHorizontal ? width : wx - col + 1;
        const h = isHorizontal ? wy - row + 1 : height;
        this._recursiveDivision(ny, nx, h, w, !isHorizontal);

        const [nx2, ny2] = isHorizontal ? [col, wy + 1] : [wx + 1, row];
        const w2 = isHorizontal ? width : col + width - (wx + 1);
        const h2 = isHorizontal ? row + height - (wy + 1) : height;
        this._recursiveDivision(ny2, nx2, h2, w2, !isHorizontal);
    }
    
    /**
     * Ensure there is a random path from start to end by carving a random walk if needed
     */
    _ensureRandomPathExists() {
        // Use BFS to check for a path
        const queue = [this.startNode];
        const visited = new Set();
        visited.add(`${this.startNode.row},${this.startNode.col}`);
        let found = false;
        while (queue.length > 0) {
            const node = queue.shift();
            if (node === this.endNode) {
                found = true;
                break;
            }
            for (const neighbor of this.getNeighbors(node)) {
                const key = `${neighbor.row},${neighbor.col}`;
                if (!neighbor.isWall && !visited.has(key)) {
                    visited.add(key);
                    queue.push(neighbor);
                }
            }
        }
        if (!found) {
            // If no path, carve a random walk from start to end
            let r = this.startNode.row, c = this.startNode.col;
            const endR = this.endNode.row, endC = this.endNode.col;
            const path = [[r, c]];
            const maxSteps = this.rows * this.cols * 2;
            let steps = 0;
            while ((r !== endR || c !== endC) && steps < maxSteps) {
                const options = [];
                if (r < endR) options.push([r + 1, c]);
                if (r > endR) options.push([r - 1, c]);
                if (c < endC) options.push([r, c + 1]);
                if (c > endC) options.push([r, c - 1]);
                // Add perpendicular moves for more randomness
                if (Math.random() < 0.5 && r > 0) options.push([r - 1, c]);
                if (Math.random() < 0.5 && r < this.rows - 1) options.push([r + 1, c]);
                if (Math.random() < 0.5 && c > 0) options.push([r, c - 1]);
                if (Math.random() < 0.5 && c < this.cols - 1) options.push([r, c + 1]);
                // Pick a random next step
                const [nr, nc] = options[Math.floor(Math.random() * options.length)];
                r = nr; c = nc;
                path.push([r, c]);
                steps++;
            }
            for (const [row, col] of path) {
                if (!this.nodes[row][col].isStart && !this.nodes[row][col].isEnd) {
                    this.nodes[row][col].isWall = false;
                    this.nodes[row][col].updateVisualState();
                }
            }
        }
    }
    
    /**
     * Randomize start and end positions (not the same, not a wall)
     */
    randomizeStartAndEnd() {
        let startRow, startCol, endRow, endCol;
        const maxTries = this.rows * this.cols * 2;
        let tries = 0;
        do {
            startRow = Math.floor(Math.random() * this.rows);
            startCol = Math.floor(Math.random() * this.cols);
            tries++;
        } while (this.nodes[startRow][startCol].isWall && tries < maxTries);
        tries = 0;
        do {
            endRow = Math.floor(Math.random() * this.rows);
            endCol = Math.floor(Math.random() * this.cols);
            tries++;
        } while (((endRow === startRow && endCol === startCol) || this.nodes[endRow][endCol].isWall) && tries < maxTries);
        this.setStartNode(startRow, startCol);
        this.setEndNode(endRow, endCol);
    }
    
    /**
     * Resize the grid to new dimensions
     * @param {number} newRows - New number of rows
     * @param {number} newCols - New number of columns
     */
    resize(newRows, newCols) {
        this.rows = newRows;
        this.cols = newCols;
        this.initializeGrid();
        this.createDOMGrid();
    }
    
    /**
     * Get grid state for saving
     * @returns {Object} Serialized grid state
     */
    serialize() {
        const gridData = {
            rows: this.rows,
            cols: this.cols,
            nodes: []
        };
        
        for (let row = 0; row < this.rows; row++) {
            const rowData = [];
            for (let col = 0; col < this.cols; col++) {
                rowData.push(this.nodes[row][col].serialize());
            }
            gridData.nodes.push(rowData);
        }
        
        return gridData;
    }
    
    /**
     * Load grid state from saved data
     * @param {Object} data - Serialized grid data
     */
    deserialize(data) {
        if (data.rows !== this.rows || data.cols !== this.cols) {
            this.resize(data.rows, data.cols);
        }
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (data.nodes[row] && data.nodes[row][col]) {
                    this.nodes[row][col].deserialize(data.nodes[row][col]);
                    
                    // Update start and end node references
                    if (this.nodes[row][col].isStart) {
                        this.startNode = this.nodes[row][col];
                    }
                    if (this.nodes[row][col].isEnd) {
                        this.endNode = this.nodes[row][col];
                    }
                }
            }
        }
    }
    
    /**
     * Get all nodes in the grid as a flat array
     * @returns {Node[]} All nodes in the grid
     */
    getAllNodes() {
        const allNodes = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                allNodes.push(this.nodes[row][col]);
            }
        }
        return allNodes;
    }
    
    /**
     * Get node at specific position
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {Node|null} Node at position or null if out of bounds
     */
    getNode(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.nodes[row][col];
        }
        return null;
    }
    
    /**
     * Check if position is valid
     * @param {number} row - Row index
     * @param {number} col - Column index
     * @returns {boolean} True if position is valid
     */
    isValidPosition(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    /**
     * Assign random weights to the grid (excluding walls, start, end)
     * @param {number} minWeight - Minimum weight value (inclusive)
     * @param {number} maxWeight - Maximum weight value (inclusive)
     * @param {number} fillProbability - Probability (0-1) that a cell gets a weight > 1 (1 = fill whole grid)
     */
    generateRandomWeights(minWeight = 2, maxWeight = 10, fillProbability = 0.5) {
        const allowedWeights = [2, 5, 10];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const node = this.nodes[row][col];
                if (!node.isWall && !node.isStart && !node.isEnd) {
                    if (Math.random() < fillProbability) {
                        const weight = allowedWeights[Math.floor(Math.random() * allowedWeights.length)];
                        node.setWeight(weight);
                    } else {
                        node.setWeight(1);
                    }
                }
            }
        }
    }
    
    /**
     * Set node weight
     * @param {number} weight - Weight value for the node
     */
    setWeight(weight) {
        if (!this.isStart && !this.isEnd && !this.isWall) {
            this.weight = weight;
            this.updateVisualState();
        }
    }
    
    enableDragAndDrop() {
        let draggingType = null;
        let draggingNode = null;
        this.container.addEventListener('mousedown', (e) => {
            const target = e.target.closest('.node');
            if (!target) return;
            const row = parseInt(target.dataset.row);
            const col = parseInt(target.dataset.col);
            const node = this.getNode(row, col);
            if (node.isStart) {
                draggingType = 'start';
                draggingNode = node;
            } else if (node.isEnd) {
                draggingType = 'end';
                draggingNode = node;
            }
        });
        this.container.addEventListener('mouseenter', (e) => {
            if (!draggingType) return;
            const target = e.target.closest('.node');
            if (!target) return;
            const row = parseInt(target.dataset.row);
            const col = parseInt(target.dataset.col);
            const node = this.getNode(row, col);
            if (!node) return;
            if (draggingType === 'start') {
                // Don't allow placing start on end
                if (this.endNode && this.endNode.row === row && this.endNode.col === col) return;
                // Clear wall and set weight to 1
                node.isWall = false;
                node.weight = 1;
                node.updateVisualState();
                this.setStartNode(row, col);
            } else if (draggingType === 'end') {
                // Don't allow placing end on start
                if (this.startNode && this.startNode.row === row && this.startNode.col === col) return;
                // Clear wall and set weight to 1
                node.isWall = false;
                node.weight = 1;
                node.updateVisualState();
                this.setEndNode(row, col);
            }
        }, true);
        document.addEventListener('mouseup', () => {
            draggingType = null;
            draggingNode = null;
        });
    }
} 