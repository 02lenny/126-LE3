/**
 * Node class represents a single cell in the pathfinding grid
 * Contains all properties needed for pathfinding algorithms
 */
export class Node {
    constructor(row, col) {
        // Position properties
        this.row = row;
        this.col = col;
        
        // Node type properties
        this.isStart = false;
        this.isEnd = false;
        this.isWall = false;
        this.weight = 1;
        
        // Algorithm properties
        this.isExplored = false;
        this.isPath = false;
        this.distance = Infinity;
        this.previousNode = null;
        
        // A* specific properties
        this.gScore = Infinity; // Distance from start
        this.fScore = Infinity; // gScore + heuristic
        this.hScore = 0; // Heuristic score
        
        // DOM element reference
        this.element = null;
    }
    
    /**
     * Reset node to default state (except position and walls)
     */
    reset() {
        this.isExplored = false;
        this.isPath = false;
        this.distance = Infinity;
        this.previousNode = null;
        this.gScore = Infinity;
        this.fScore = Infinity;
        this.hScore = 0;
        
        // Update visual state
        this.updateVisualState();
    }
    
    /**
     * Reset node completely (including walls and weights)
     */
    resetCompletely() {
        this.isStart = false;
        this.isEnd = false;
        this.isWall = false;
        this.weight = 1;
        this.reset();
    }
    
    /**
     * Set node as start node
     */
    setAsStart() {
        this.isStart = true;
        this.isEnd = false;
        this.isWall = false;
        this.updateVisualState();
    }
    
    /**
     * Set node as end node
     */
    setAsEnd() {
        this.isEnd = true;
        this.isStart = false;
        this.isWall = false;
        this.updateVisualState();
    }
    
    /**
     * Set node as wall
     */
    setAsWall() {
        if (!this.isStart && !this.isEnd) {
            this.isWall = true;
            this.weight = 1;
            this.updateVisualState();
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
    
    /**
     * Clear node (remove all special states)
     */
    clear() {
        if (!this.isStart && !this.isEnd) {
            this.isWall = false;
            this.weight = 1;
            this.isExplored = false;
            this.isPath = false;
            this.updateVisualState();
        }
    }
    
    /**
     * Mark node as explored for visualization
     */
    markAsExplored() {
        this.isExplored = true;
        this.updateVisualState();
    }
    
    /**
     * Mark node as part of the final path
     */
    markAsPath() {
        this.isPath = true;
        this.updateVisualState();
    }
    
    /**
     * Update the visual appearance of the node
     */
    updateVisualState() {
        if (!this.element) return;
        
        // Clear all classes and data attributes
        this.element.className = 'node';
        this.element.textContent = '';
        this.element.removeAttribute('data-weight');
        
        // Apply appropriate class based on node state
        if (this.isStart) {
            this.element.classList.add('start');
            this.element.textContent = 'S';
        } else if (this.isEnd) {
            this.element.classList.add('end');
            this.element.textContent = 'E';
        } else if (this.isWall) {
            this.element.classList.add('wall');
        } else if (this.isPath) {
            this.element.classList.add('path');
        } else if (this.isExplored) {
            this.element.classList.add('explored');
        } else if (this.weight > 1) {
            this.element.classList.add('weighted');
            this.element.setAttribute('data-weight', this.weight.toString());
            // No icon, overlay handled by CSS
        } else if (this.weight === 1) {
            this.element.classList.add('weighted');
            this.element.setAttribute('data-weight', '1');
            // No icon, overlay handled by CSS
        }
    }
    
    /**
     * Create and return DOM element for this node
     * @param {Function} clickHandler - Click event handler
     * @returns {HTMLElement} The DOM element for this node
     */
    createElement(clickHandler) {
        this.element = document.createElement('div');
        this.element.className = 'node';
        this.element.dataset.row = this.row;
        this.element.dataset.col = this.col;
        
        // Add event listeners
        this.element.addEventListener('click', () => clickHandler(this));
        this.element.addEventListener('mouseenter', (e) => {
            if (e.buttons === 1) { // Mouse is being dragged
                clickHandler(this);
            }
        });
        
        this.updateVisualState();
        return this.element;
    }
    
    /**
     * Get node serialization for saving/loading
     * @returns {Object} Serialized node data
     */
    serialize() {
        return {
            row: this.row,
            col: this.col,
            isStart: this.isStart,
            isEnd: this.isEnd,
            isWall: this.isWall,
            weight: this.weight
        };
    }
    
    /**
     * Load node state from serialized data
     * @param {Object} data - Serialized node data
     */
    deserialize(data) {
        this.isStart = data.isStart || false;
        this.isEnd = data.isEnd || false;
        this.isWall = data.isWall || false;
        this.weight = data.weight || 1;
        this.updateVisualState();
    }
    
    /**
     * Check if this node is traversable
     * @returns {boolean} True if node can be traversed
     */
    isTraversable() {
        return !this.isWall;
    }
    
    /**
     * Get the cost to move to this node
     * @returns {number} Movement cost
     */
    getMovementCost() {
        return this.weight;
    }
    
    /**
     * Calculate Manhattan distance to another node (used for A* heuristic)
     * @param {Node} other - Target node
     * @returns {number} Manhattan distance
     */
    manhattanDistanceTo(other) {
        return Math.abs(this.row - other.row) + Math.abs(this.col - other.col);
    }
    
    /**
     * Calculate Euclidean distance to another node
     * @param {Node} other - Target node
     * @returns {number} Euclidean distance
     */
    euclideanDistanceTo(other) {
        const dx = this.row - other.row;
        const dy = this.col - other.col;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Get string representation of the node
     * @returns {string} String representation
     */
    toString() {
        return `Node(${this.row}, ${this.col})`;
    }
} 