/**
 * Dijkstra's algorithm implementation for pathfinding
 * Finds the shortest path between start and end nodes
 */
export class DijkstraAlgorithm {
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
     * Find path using Dijkstra's algorithm with animation
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
        
        // Initialize distances
        const allNodes = this.grid.getAllNodes();
        startNode.distance = 0;
        
        // Priority queue (using array for simplicity, could optimize with heap)
        const unvisitedNodes = [...allNodes];
        const visitedNodes = [];
        
        while (unvisitedNodes.length > 0) {
            if (!this.isRunning) {
                if (onComplete) onComplete({ success: false, message: 'Stopped', nodesExplored: this.nodesExplored, pathLength: 0 });
                return { success: false, message: 'Stopped', nodesExplored: this.nodesExplored, pathLength: 0 };
            }
            // Sort nodes by distance (inefficient but clear for educational purposes)
            unvisitedNodes.sort((a, b) => a.distance - b.distance);
            
            // Get closest node
            const currentNode = unvisitedNodes.shift();
            
            // If we hit a wall or infinite distance, we're done
            if (currentNode.isWall || currentNode.distance === Infinity) {
                break;
            }
            
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
            
            visitedNodes.push(currentNode);
            
            // If we reached the end, reconstruct path
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
            
            // Update neighbors
            await this.updateNeighbors(currentNode);
            if (!this.isRunning) {
                if (onComplete) onComplete({ success: false, message: 'Stopped', nodesExplored: this.nodesExplored, pathLength: 0 });
                return { success: false, message: 'Stopped', nodesExplored: this.nodesExplored, pathLength: 0 };
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
     * Update distances of neighboring nodes
     * @param {Node} currentNode - Current node being processed
     */
    async updateNeighbors(currentNode) {
        const neighbors = this.grid.getNeighbors(currentNode);
        
        for (const neighbor of neighbors) {
            if (!this.isRunning) return;
            if (!neighbor.isWall) {
                const tentativeDistance = currentNode.distance + neighbor.getMovementCost();
                
                if (tentativeDistance < neighbor.distance) {
                    neighbor.distance = tentativeDistance;
                    neighbor.previousNode = currentNode;
                }
            }
        }
    }
    
    /**
     * Reconstruct the shortest path from end to start
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
            name: "Dijkstra's Algorithm",
            description: "Finds the shortest path by exploring nodes in order of their distance from the start",
            timeComplexity: "O((V + E) log V)",
            spaceComplexity: "O(V)",
            guaranteesOptimal: true,
            characteristics: [
                "Explores nodes uniformly in all directions",
                "Guarantees shortest path",
                "Works with weighted graphs",
                "No heuristic used"
            ]
        };
    }
} 