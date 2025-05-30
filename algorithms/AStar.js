/**
 * A* Search algorithm implementation for pathfinding
 * Uses heuristic to guide search towards the goal more efficiently
 */
export class AStarAlgorithm {
    constructor(grid) {
        this.grid = grid;
        this.isRunning = false;
        this.animationSpeed = 50; // milliseconds
        this.nodesExplored = 0;
        this.pathLength = 0;
    }
    
    /**
     * Set animation speed
     * @param {string} speed - Speed setting ('slow', 'medium', 'fast')
     */
    setAnimationSpeed(speed) {
        const speedMap = {
            'slow': 100,
            'medium': 50,
            'fast': 10
        };
        this.animationSpeed = speedMap[speed] || 50;
    }
    
    /**
     * Find path using A* algorithm with animation
     * @param {Function} onProgress - Callback for progress updates
     * @param {Function} onComplete - Callback when algorithm completes
     * @returns {Promise<Object>} Result object with path and statistics
     */
    async findPath(onProgress, onComplete) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.nodesExplored = 0;
        this.pathLength = 0;
        
        // Reset all nodes
        this.grid.resetAlgorithmStates();
        
        // Get start and end nodes
        const startNode = this.grid.startNode;
        const endNode = this.grid.endNode;
        
        if (!startNode || !endNode) {
            this.isRunning = false;
            return { success: false, message: 'Start or end node not found' };
        }
        
        // Initialize start node
        startNode.gScore = 0;
        startNode.fScore = this.calculateHeuristic(startNode, endNode);
        
        // Open set contains nodes to be evaluated
        const openSet = [startNode];
        // Closed set contains nodes already evaluated
        const closedSet = new Set();
        
        while (openSet.length > 0) {
            if (!this.isRunning) {
                if (onComplete) onComplete({ success: false, message: 'Stopped', nodesExplored: this.nodesExplored, pathLength: 0 });
                return { success: false, message: 'Stopped', nodesExplored: this.nodesExplored, pathLength: 0 };
            }
            // Get node with lowest fScore
            openSet.sort((a, b) => a.fScore - b.fScore);
            const currentNode = openSet.shift();
            
            // Add to closed set
            closedSet.add(currentNode);
            
            // Mark as explored and update visuals
            if (!currentNode.isStart && !currentNode.isEnd) {
                currentNode.markAsExplored();
                this.nodesExplored++;
                
                // Update progress
                if (onProgress) {
                    onProgress(this.nodesExplored, 0);
                }
                
                // Animate exploration
                await this.delay(this.animationSpeed);
                if (!this.isRunning) {
                    if (onComplete) onComplete({ success: false, message: 'Stopped', nodesExplored: this.nodesExplored, pathLength: 0 });
                    return { success: false, message: 'Stopped', nodesExplored: this.nodesExplored, pathLength: 0 };
                }
            }
            
            // Check if we reached the goal
            if (currentNode === endNode) {
                const path = this.reconstructPath(endNode);
                this.pathLength = path.length;
                
                // Animate path
                await this.animatePath(path);
                
                this.isRunning = false;
                
                const result = {
                    success: true,
                    path: path,
                    nodesExplored: this.nodesExplored,
                    pathLength: this.pathLength
                };
                
                if (onComplete) {
                    onComplete(result);
                }
                
                return result;
            }
            
            // Examine neighbors
            const neighbors = this.grid.getNeighbors(currentNode);
            
            for (const neighbor of neighbors) {
                if (!this.isRunning) {
                    if (onComplete) onComplete({ success: false, message: 'Stopped', nodesExplored: this.nodesExplored, pathLength: 0 });
                    return { success: false, message: 'Stopped', nodesExplored: this.nodesExplored, pathLength: 0 };
                }
                // Skip walls and already evaluated nodes
                if (neighbor.isWall || closedSet.has(neighbor)) {
                    continue;
                }
                
                // Calculate tentative gScore
                const tentativeGScore = currentNode.gScore + neighbor.getMovementCost();
                
                // Check if this neighbor is not in openSet
                const neighborInOpenSet = openSet.includes(neighbor);
                
                if (!neighborInOpenSet) {
                    // Add neighbor to openSet
                    openSet.push(neighbor);
                } else if (tentativeGScore >= neighbor.gScore) {
                    // This is not a better path
                    continue;
                }
                
                // This path is the best until now. Record it!
                neighbor.previousNode = currentNode;
                neighbor.gScore = tentativeGScore;
                neighbor.fScore = neighbor.gScore + this.calculateHeuristic(neighbor, endNode);
            }
        }
        
        // No path found
        this.isRunning = false;
        
        const result = {
            success: false,
            message: 'No path found',
            nodesExplored: this.nodesExplored,
            pathLength: 0
        };
        
        if (onComplete) {
            onComplete(result);
        }
        
        return result;
    }
    
    /**
     * Calculate heuristic (Manhattan distance) from node to goal
     * @param {Node} node - Current node
     * @param {Node} goal - Goal node
     * @returns {number} Heuristic value
     */
    calculateHeuristic(node, goal) {
        // Using Manhattan distance as heuristic
        // This is admissible (never overestimates) for grid-based movement
        return node.manhattanDistanceTo(goal);
    }
    
    /**
     * Reconstruct the path from start to end
     * @param {Node} endNode - The destination node
     * @returns {Node[]} Array of nodes representing the path
     */
    reconstructPath(endNode) {
        const path = [];
        let currentNode = endNode;
        
        while (currentNode !== null) {
            path.unshift(currentNode);
            currentNode = currentNode.previousNode;
        }
        
        return path;
    }
    
    /**
     * Animate the final path
     * @param {Node[]} path - Array of path nodes
     */
    async animatePath(path) {
        for (let i = 1; i < path.length - 1; i++) {
            if (!this.isRunning) return;
            const node = path[i];
            node.markAsPath();
            await this.delay(this.animationSpeed * 2);
            if (!this.isRunning) return;
        }
    }
    
    /**
     * Stop the algorithm execution
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * Check if algorithm is currently running
     * @returns {boolean} True if algorithm is running
     */
    isAlgorithmRunning() {
        return this.isRunning;
    }
    
    /**
     * Get current statistics
     * @returns {Object} Current algorithm statistics
     */
    getStatistics() {
        return {
            nodesExplored: this.nodesExplored,
            pathLength: this.pathLength,
            isRunning: this.isRunning
        };
    }
    
    /**
     * Utility function to create delays for animation
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get algorithm information
     * @returns {Object} Algorithm information
     */
    getAlgorithmInfo() {
        return {
            name: "A* Search Algorithm",
            description: "Uses heuristic to guide search towards the goal, typically finding paths faster than Dijkstra",
            timeComplexity: "O(b^d) where b is branching factor and d is depth",
            spaceComplexity: "O(b^d)",
            guaranteesOptimal: true, // When using admissible heuristic
            characteristics: [
                "Uses heuristic to guide search",
                "More efficient than Dijkstra for single target",
                "Guarantees optimal path with admissible heuristic",
                "Explores fewer nodes than Dijkstra in most cases"
            ]
        };
    }
    
    /**
     * Set heuristic function (for advanced users)
     * @param {Function} heuristicFunction - Custom heuristic function
     */
    setHeuristic(heuristicFunction) {
        this.calculateHeuristic = heuristicFunction;
    }
    
    /**
     * Get available heuristic functions
     * @returns {Object} Available heuristic functions
     */
    getAvailableHeuristics() {
        return {
            manhattan: (node, goal) => node.manhattanDistanceTo(goal),
            euclidean: (node, goal) => node.euclideanDistanceTo(goal),
            chebyshev: (node, goal) => Math.max(
                Math.abs(node.row - goal.row),
                Math.abs(node.col - goal.col)
            ),
            // Zero heuristic turns A* into Dijkstra
            zero: (node, goal) => 0
        };
    }
} 