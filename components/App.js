import { Grid } from './Grid.js';
import { DijkstraAlgorithm } from '../algorithms/Dijkstra.js';
import { AStarAlgorithm } from '../algorithms/AStar.js';
import { 
    StorageManager, 
    ToolManager, 
    PerformanceMonitor, 
} from '../utils/EventHandlers.js';

/**
 * Main application class that orchestrates the pathfinding visualizer
 * Manages grids, algorithms, UI interactions, and application state
 */
class PathfinderApp {
    constructor() {
        // Initialize grids
        this.dijkstraGrid = null;
        this.astarGrid = null;
        
        // Initialize algorithms
        this.dijkstraAlgorithm = null;
        this.astarAlgorithm = null;
        
        // Initialize utilities
        this.performanceMonitor = new PerformanceMonitor();
        
        // Application state
        this.isRunning = false;
        this.currentGridSize = 10;
        this.currentSpeed = 'medium';
        
        this.initialize();
    }
    
    /**
     * Initialize the application
     */
    initialize() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * Setup the application after DOM is ready
     */
    setup() {
        // Initialize grids
        this.initializeGrids();
        
        // Initialize algorithms
        this.initializeAlgorithms();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize tools
        ToolManager.initializeToolButtons();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Show welcome message
        StorageManager.showNotification('Welcome to Pathfinder Lab! Use the tools to create obstacles and find paths.', 'info');
    }
    
    /**
     * Initialize both grids
     */
    initializeGrids() {
        this.dijkstraGrid = new Grid(this.currentGridSize, this.currentGridSize, 'dijkstra-grid');
        this.astarGrid = new Grid(this.currentGridSize, this.currentGridSize, 'astar-grid');
        this.dijkstraGrid.enableDragAndDrop();
        this.astarGrid.enableDragAndDrop();
        
        // Sync grids so they have the same layout
        this.syncGrids();
    }
    
    /**
     * Initialize algorithm instances
     */
    initializeAlgorithms() {
        this.dijkstraAlgorithm = new DijkstraAlgorithm(this.dijkstraGrid);
        this.astarAlgorithm = new AStarAlgorithm(this.astarGrid);
        
        // Set initial speed
        this.setAnimationSpeed(this.currentSpeed);
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Header buttons
        document.getElementById('find-path').addEventListener('click', () => this.findPaths());
        document.getElementById('clear-grid').addEventListener('click', () => {
            if (this.isRunning) this.stopAlgorithms();
            this.clearGrids();
        });
        document.getElementById('save-grid').addEventListener('click', () => this.openSaveGridModal());
        document.getElementById('load-grid').addEventListener('click', () => this.openLoadGridModal());
        document.getElementById('close-save-modal').addEventListener('click', () => this.closeSaveGridModal());
        document.getElementById('close-load-modal').addEventListener('click', () => this.closeLoadGridModal());
        document.getElementById('confirm-save-grid').addEventListener('click', () => this.confirmSaveGrid());
        
        // Control inputs
        const gridSizeSelect = document.getElementById('grid-size');
        const customGridInput = document.getElementById('custom-grid-size');
        const customGridContainer = document.getElementById('custom-grid-container');
        gridSizeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customGridContainer.style.display = '';
                customGridInput.value = this.currentGridSize;
            } else {
                customGridContainer.style.display = 'none';
                this.resizeGrids(parseInt(e.target.value));
            }
        });
        customGridInput.addEventListener('change', (e) => {
            let val = parseInt(e.target.value);
            if (isNaN(val) || val < 2) val = 2;
            if (val > 50) val = 50;
            e.target.value = val;
            this.resizeGrids(val);
            const warning = document.getElementById('custom-grid-warning');
            if (val > 30) {
                warning.style.display = '';
            } else {
                warning.style.display = 'none';
            }
        });
        
        document.getElementById('speed-selector').addEventListener('change', (e) => {
            this.setAnimationSpeed(e.target.value);
        });
        
        // Randomizer buttons
        document.getElementById('random-maze').addEventListener('click', () => {
            if (this.isRunning) this.stopAlgorithms();
            this.generateRandomMaze();
        });
        document.getElementById('random-points').addEventListener('click', () => {
            if (this.isRunning) this.stopAlgorithms();
            this.setRandomStartEnd();
        });
        document.getElementById('random-weights').addEventListener('click', () => {
            if (this.isRunning) this.stopAlgorithms();
            this.generateRandomWeights();
        });
        document.getElementById('random-environment').addEventListener('click', () => {
            if (this.isRunning) this.stopAlgorithms();
            this.generateRandomEnvironment();
        });
        
        // Analysis section toggle
        document.getElementById('analysis-toggle').addEventListener('click', () => this.toggleAnalysisSection());
        
        // Grid synchronization (when one grid is modified, update the other)
        this.setupGridSynchronization();
        
        // Grid click listeners for stopping algorithms
        const dijkstraGridEl = document.getElementById('dijkstra-grid');
        const astarGridEl = document.getElementById('astar-grid');
        dijkstraGridEl.addEventListener('mousedown', () => { if (this.isRunning) this.stopAlgorithms(); });
        astarGridEl.addEventListener('mousedown', () => { if (this.isRunning) this.stopAlgorithms(); });
    }
    
    
    /**
     * Setup grid synchronization
     */
    setupGridSynchronization() {
        const originalDijkstraClick = this.dijkstraGrid.handleNodeClick.bind(this.dijkstraGrid);
        const originalAstarClick = this.astarGrid.handleNodeClick.bind(this.astarGrid);

        // Sync on click (tool use)
        this.dijkstraGrid.handleNodeClick = (node) => {
            if (this.isRunning) this.stopAlgorithms();
            this.dijkstraGrid.resetAlgorithmStates();
            this.astarGrid.resetAlgorithmStates();
            originalDijkstraClick(node);
            this.syncNodeToOtherGrid(node, this.astarGrid);
        };
        this.astarGrid.handleNodeClick = (node) => {
            if (this.isRunning) this.stopAlgorithms();
            this.dijkstraGrid.resetAlgorithmStates();
            this.astarGrid.resetAlgorithmStates();
            originalAstarClick(node);
            this.syncNodeToOtherGrid(node, this.dijkstraGrid);
        };

        // --- Drag-and-drop sync fix ---
        // Listen for drag end (mouseup) and sync only the final start/end position
        const syncDragEnd = (sourceGrid, targetGrid) => {
            document.addEventListener('mouseup', () => {
                // Sync start
                if (sourceGrid.startNode) {
                    const targetNode = targetGrid.getNode(sourceGrid.startNode.row, sourceGrid.startNode.col);
                    if (targetNode) {
                        targetGrid.setStartNode(targetNode.row, targetNode.col);
                    }
                }
                // Sync end
                if (sourceGrid.endNode) {
                    const targetNode = targetGrid.getNode(sourceGrid.endNode.row, sourceGrid.endNode.col);
                    if (targetNode) {
                        targetGrid.setEndNode(targetNode.row, targetNode.col);
                    }
                }
            });
        };
        syncDragEnd(this.dijkstraGrid, this.astarGrid);
        syncDragEnd(this.astarGrid, this.dijkstraGrid);
    }
    
    /**
     * Sync a node change to the other grid
     * @param {Node} sourceNode - Node that was changed
     * @param {Grid} targetGrid - Grid to sync to
     */
    syncNodeToOtherGrid(sourceNode, targetGrid) {
        // If syncing a start node, clear all previous start nodes in the target grid
        if (sourceNode.isStart) {
            for (let r = 0; r < targetGrid.rows; r++) {
                for (let c = 0; c < targetGrid.cols; c++) {
                    if (targetGrid.nodes[r][c].isStart) {
                        targetGrid.nodes[r][c].isStart = false;
                        targetGrid.nodes[r][c].updateVisualState();
                    }
                }
            }
        }
        // If syncing an end node, clear all previous end nodes in the target grid
        if (sourceNode.isEnd) {
            for (let r = 0; r < targetGrid.rows; r++) {
                for (let c = 0; c < targetGrid.cols; c++) {
                    if (targetGrid.nodes[r][c].isEnd) {
                        targetGrid.nodes[r][c].isEnd = false;
                        targetGrid.nodes[r][c].updateVisualState();
                    }
                }
            }
        }
        const targetNode = targetGrid.getNode(sourceNode.row, sourceNode.col);
        if (targetNode) {
            targetNode.isStart = sourceNode.isStart;
            targetNode.isEnd = sourceNode.isEnd;
            targetNode.isWall = sourceNode.isWall;
            targetNode.weight = sourceNode.weight;
            targetNode.updateVisualState();
            if (sourceNode.isStart) {
                targetGrid.startNode = targetNode;
            }
            if (sourceNode.isEnd) {
                targetGrid.endNode = targetNode;
            }
        }
    }
    
    /**
     * Sync both grids to have the same layout
     */
    syncGrids() {
        // Clear all start/end states in astar grid before copying
        for (let row = 0; row < this.currentGridSize; row++) {
            for (let col = 0; col < this.currentGridSize; col++) {
                this.astarGrid.nodes[row][col].isStart = false;
                this.astarGrid.nodes[row][col].isEnd = false;
                this.astarGrid.nodes[row][col].updateVisualState();
            }
        }
        // Copy dijkstra grid state to astar grid
        for (let row = 0; row < this.currentGridSize; row++) {
            for (let col = 0; col < this.currentGridSize; col++) {
                const dijkstraNode = this.dijkstraGrid.getNode(row, col);
                const astarNode = this.astarGrid.getNode(row, col);
                if (dijkstraNode && astarNode) {
                    astarNode.isStart = dijkstraNode.isStart;
                    astarNode.isEnd = dijkstraNode.isEnd;
                    astarNode.isWall = dijkstraNode.isWall;
                    astarNode.weight = dijkstraNode.weight;
                    astarNode.updateVisualState();
                }
            }
        }
        this.astarGrid.startNode = this.astarGrid.getNode(
            this.dijkstraGrid.startNode.row, 
            this.dijkstraGrid.startNode.col
        );
        this.astarGrid.endNode = this.astarGrid.getNode(
            this.dijkstraGrid.endNode.row, 
            this.dijkstraGrid.endNode.col
        );
    }
    
    /**
     * Run both pathfinding algorithms simultaneously
     */
    async findPaths() {
        if (this.isRunning) {
            StorageManager.showNotification('Algorithms are already running!', 'warning');
            return;
        }
        this.isRunning = true;
        this.setSidebarEnabled(false);
        this.performanceMonitor.clearMetrics();
        const findButton = document.getElementById('find-path');
        findButton.textContent = 'Running...';
        findButton.disabled = true;
        this.performanceMonitor.startTiming('dijkstra');
        this.performanceMonitor.startTiming('astar');
        try {
            const [dijkstraResult, astarResult] = await Promise.all([
                this.dijkstraAlgorithm.findPath(
                    (explored, pathLength) => this.updateStats('dijkstra', explored, pathLength),
                    (result) => {
                        this.performanceMonitor.endTiming('dijkstra');
                        this.updateStats('dijkstra', result.nodesExplored, result.pathLength);
                    }
                ),
                this.astarAlgorithm.findPath(
                    (explored, pathLength) => this.updateStats('astar', explored, pathLength),
                    (result) => {
                        this.performanceMonitor.endTiming('astar');
                        this.updateStats('astar', result.nodesExplored, result.pathLength);
                    }
                )
            ]);
            this.showAlgorithmResults(dijkstraResult, astarResult);
        } catch (error) {
            console.error('Error running algorithms:', error);
            StorageManager.showNotification('Error running algorithms', 'error');
        } finally {
            this.isRunning = false;
            findButton.textContent = 'Find Path';
            findButton.disabled = false;
            this.setSidebarEnabled(true);
        }
    }
    
    /**
     * Stop running algorithms
     */
    stopAlgorithms() {
        if (this.isRunning) {
            this.dijkstraAlgorithm.stop();
            this.astarAlgorithm.stop();
            this.isRunning = false;
            const findButton = document.getElementById('find-path');
            findButton.textContent = 'Find Path';
            findButton.disabled = false;
            this.setSidebarEnabled(true);
            StorageManager.showNotification('Algorithms stopped', 'info');
        }
    }
    
    /**
     * Update algorithm statistics display
     * @param {string} algorithm - Algorithm name ('dijkstra' or 'astar')
     * @param {number} explored - Number of nodes explored
     * @param {number} pathLength - Path length
     */
    updateStats(algorithm, explored, pathLength) {
        document.getElementById(`${algorithm}-explored`).textContent = explored;
        document.getElementById(`${algorithm}-path-length`).textContent = pathLength;
    }
    
    /**
     * Show algorithm comparison results in the analysis section
     * @param {Object} dijkstraResult - Dijkstra algorithm result
     * @param {Object} astarResult - A* algorithm result
     */
    showAlgorithmResults(dijkstraResult, astarResult) {
        const performance = this.performanceMonitor.getPerformanceSummary();
        const analysisResults = document.getElementById('analysis-results');
        
        // Create detailed analysis HTML
        let analysisHTML = '';
        
        if (dijkstraResult.success || astarResult.success) {
            analysisHTML = `
                <div class="analysis-grid">
                    <div class="algorithm-result ${dijkstraResult.success ? 'success' : 'failure'}">
                        <h4>Dijkstra's Algorithm</h4>
                        ${dijkstraResult.success ? `
                            <div class="result-item">
                                <span class="result-label">Status:</span>
                                <span class="result-value">Path Found ✓</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Nodes Explored:</span>
                                <span class="result-value">${dijkstraResult.nodesExplored}</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Path Length:</span>
                                <span class="result-value">${dijkstraResult.pathLength}</span>
                            </div>
                            ${performance.dijkstra ? `
                                <div class="result-item">
                                    <span class="result-label">Execution Time:</span>
                                    <span class="result-value">${performance.dijkstra.durationFormatted}</span>
                                </div>
                            ` : ''}
                        ` : `
                            <div class="result-item">
                                <span class="result-label">Status:</span>
                                <span class="result-value">No Path Found ✗</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Nodes Explored:</span>
                                <span class="result-value">${dijkstraResult.nodesExplored}</span>
                            </div>
                        `}
                    </div>
                    
                    <div class="algorithm-result ${astarResult.success ? 'success' : 'failure'}">
                        <h4>A* Search Algorithm</h4>
                        ${astarResult.success ? `
                            <div class="result-item">
                                <span class="result-label">Status:</span>
                                <span class="result-value">Path Found ✓</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Nodes Explored:</span>
                                <span class="result-value">${astarResult.nodesExplored}</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Path Length:</span>
                                <span class="result-value">${astarResult.pathLength}</span>
                            </div>
                            ${performance.astar ? `
                                <div class="result-item">
                                    <span class="result-label">Execution Time:</span>
                                    <span class="result-value">${performance.astar.durationFormatted}</span>
                                </div>
                            ` : ''}
                        ` : `
                            <div class="result-item">
                                <span class="result-label">Status:</span>
                                <span class="result-value">No Path Found ✗</span>
                            </div>
                            <div class="result-item">
                                <span class="result-label">Nodes Explored:</span>
                                <span class="result-value">${astarResult.nodesExplored}</span>
                            </div>
                        `}
                    </div>
                </div>
                
                <div class="comparison-summary">
                    <h4>Algorithm Comparison Summary</h4>
                    ${this.generateComparisonSummary(dijkstraResult, astarResult, performance)}
                </div>
            `;
        } else {
            analysisHTML = `
                <div class="comparison-summary">
                    <h4>Analysis Results</h4>
                    <p>Both algorithms were unable to find a path. This typically happens when:</p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>The start and end points are completely blocked by walls</li>
                        <li>There's no possible route between the start and end positions</li>
                    </ul>
                    <p>Try removing some walls or generating a new maze with more open paths.</p>
                </div>
            `;
        }
        
        analysisResults.innerHTML = analysisHTML;
        
        // Show the analysis section if it's collapsed
        const analysisContent = document.getElementById('analysis-content');
        const analysisHeader = document.getElementById('analysis-toggle');
        if (analysisContent.classList.contains('collapsed')) {
            this.toggleAnalysisSection();
        }
        
        StorageManager.showNotification('Pathfinding complete! Check analysis section for detailed comparison.', 'success');
    }
    
    /**
     * Generate comparison summary text
     * @param {Object} dijkstraResult - Dijkstra algorithm result
     * @param {Object} astarResult - A* algorithm result
     * @param {Object} performance - Performance metrics
     * @returns {string} HTML summary
     */
    generateComparisonSummary(dijkstraResult, astarResult, performance) {
        if (!dijkstraResult.success && !astarResult.success) {
            return '<p>Neither algorithm could find a path in this configuration.</p>';
        }
        
        if (!dijkstraResult.success || !astarResult.success) {
            const successful = dijkstraResult.success ? 'Dijkstra' : 'A*';
            return `<p>Only ${successful} found a path in this configuration. This is unusual and may indicate an implementation issue.</p>`;
        }
        
        let summary = '<div>';
        
        // Efficiency comparison
        if (astarResult.nodesExplored < dijkstraResult.nodesExplored) {
            const efficiency = ((dijkstraResult.nodesExplored - astarResult.nodesExplored) / dijkstraResult.nodesExplored * 100).toFixed(1);
            summary += `<p><strong>🏆 A* was more efficient!</strong> It explored ${efficiency}% fewer nodes than Dijkstra (${astarResult.nodesExplored} vs ${dijkstraResult.nodesExplored}).</p>`;
        } else if (dijkstraResult.nodesExplored < astarResult.nodesExplored) {
            const efficiency = ((astarResult.nodesExplored - dijkstraResult.nodesExplored) / astarResult.nodesExplored * 100).toFixed(1);
            summary += `<p><strong>🏆 Dijkstra was more efficient!</strong> It explored ${efficiency}% fewer nodes than A* (${dijkstraResult.nodesExplored} vs ${astarResult.nodesExplored}).</p>`;
        } else {
            summary += `<p>Both algorithms explored the same number of nodes (${dijkstraResult.nodesExplored}).</p>`;
        }
        
        // Path length comparison
        if (dijkstraResult.pathLength === astarResult.pathLength) {
            summary += `<p>Both algorithms found the optimal path with length ${dijkstraResult.pathLength}.</p>`;
        } else {
            summary += `<p>⚠️ Path lengths differ: Dijkstra found ${dijkstraResult.pathLength}, A* found ${astarResult.pathLength}. This may indicate different handling of weights.</p>`;
        }
        
        // Performance comparison
        if (performance.dijkstra && performance.astar) {
            const dijkstraTime = performance.dijkstra.duration;
            const astarTime = performance.astar.duration;
            
            if (Math.abs(dijkstraTime - astarTime) < 10) {
                summary += `<p>Execution times were similar: Dijkstra ${performance.dijkstra.durationFormatted}, A* ${performance.astar.durationFormatted}.</p>`;
            } else if (astarTime < dijkstraTime) {
                const speedup = ((dijkstraTime - astarTime) / dijkstraTime * 100).toFixed(1);
                summary += `<p>⚡ A* was ${speedup}% faster in execution time.</p>`;
            } else {
                const speedup = ((astarTime - dijkstraTime) / astarTime * 100).toFixed(1);
                summary += `<p>⚡ Dijkstra was ${speedup}% faster in execution time.</p>`;
            }
        }
        
        summary += '</div>';
        return summary;
    }
    
    /**
     * Toggle the analysis section collapsed state
     */
    toggleAnalysisSection() {
        const analysisContent = document.getElementById('analysis-content');
        const analysisHeader = document.getElementById('analysis-toggle');
        
        analysisContent.classList.toggle('collapsed');
        analysisHeader.classList.toggle('collapsed');
    }
    
    /**
     * Clear both grids
     */
    clearGrids() {
        this.dijkstraGrid.clearGrid();
        this.astarGrid.clearGrid();
        this.syncGrids();
        this.resetStats();
        StorageManager.showNotification('Grids cleared', 'info');
    }
    
    /**
     * Reset statistics display
     */
    resetStats() {
        this.updateStats('dijkstra', 0, 0);
        this.updateStats('astar', 0, 0);
    }
    
    /**
     * Save current grid state
     */
    openSaveGridModal() {
        document.getElementById('save-grid-modal').style.display = 'flex';
        document.getElementById('save-grid-name').value = '';
    }
    closeSaveGridModal() {
        document.getElementById('save-grid-modal').style.display = 'none';
    }
    confirmSaveGrid() {
        const name = document.getElementById('save-grid-name').value.trim();
        if (!name) {
            StorageManager.showNotification('Please enter a name for the grid.', 'warning');
            return;
        }
        StorageManager.saveGrid(this.dijkstraGrid, name);
        this.closeSaveGridModal();
    }
    openLoadGridModal() {
        document.getElementById('load-grid-modal').style.display = 'flex';
        this.renderSavedGridsList();
    }
    closeLoadGridModal() {
        document.getElementById('load-grid-modal').style.display = 'none';
    }
    renderSavedGridsList() {
        const list = document.getElementById('saved-grids-list');
        let grids = StorageManager.getAllSavedGrids();
        // Filter out any undefined/null entries
        grids = grids.filter(g => g && g.name);
        if (!grids.length) {
            list.innerHTML = '<div style="color:#888;">No saved grids found.</div>';
            return;
        }
        list.innerHTML = grids.map(g => `
            <div class="saved-grid-item">
                <span class="saved-grid-name">${g.name}</span>
                <span>
                    <button class="saved-grid-load" data-name="${g.name}">Load</button>
                    <button class="saved-grid-delete" data-name="${g.name}">Delete</button>
                </span>
            </div>
        `).join('');
        list.querySelectorAll('.saved-grid-load').forEach(btn => {
            btn.onclick = () => {
                StorageManager.loadGrid(this.dijkstraGrid, btn.dataset.name);
                this.syncGrids();
                this.resetStats();
                this.closeLoadGridModal();
            };
        });
        list.querySelectorAll('.saved-grid-delete').forEach(btn => {
            btn.onclick = () => {
                StorageManager.deleteGrid(btn.dataset.name);
                this.renderSavedGridsList();
            };
        });
    }
    
    /**
     * Generate random maze
     */
    generateRandomMaze() {
        this.dijkstraGrid.resetAlgorithmStates();
        this.astarGrid.resetAlgorithmStates();
        this.dijkstraGrid.generateRandomMaze();
        this.syncGrids();
        this.resetStats();
        StorageManager.showNotification('Random maze generated', 'info');
    }
    
    /**
     * Set random start and end positions
     */
    setRandomStartEnd() {
        this.dijkstraGrid.resetAlgorithmStates();
        this.astarGrid.resetAlgorithmStates();
        this.dijkstraGrid.randomizeStartAndEnd();
        this.syncGrids();
        this.resetStats();
        StorageManager.showNotification('Random start and end positions set', 'info');
    }
    
    /**
     * Set animation speed for both algorithms
     * @param {string} speed - Speed setting ('slow', 'medium', 'fast')
     */
    setAnimationSpeed(speed) {
        this.currentSpeed = speed;
        if (this.dijkstraAlgorithm) {
            this.dijkstraAlgorithm.setAnimationSpeed(speed);
        }
        if (this.astarAlgorithm) {
            this.astarAlgorithm.setAnimationSpeed(speed);
        }
    }
    
    /**
     * Resize both grids
     * @param {number} newSize - New grid size
     */
    resizeGrids(newSize) {
        this.currentGridSize = newSize;
        this.dijkstraGrid.resize(newSize, newSize);
        this.astarGrid.resize(newSize, newSize);
        this.syncGrids();
        this.resetStats();
        StorageManager.showNotification(`Grid resized to ${newSize}x${newSize}`, 'info');
    }
    
    /**
     * Generate random weights for both grids, with user prompt for range and fill
     */
    generateRandomWeights() {
        this.dijkstraGrid.resetAlgorithmStates();
        this.astarGrid.resetAlgorithmStates();
        this.dijkstraGrid.generateRandomWeights(undefined, undefined, 1);
        this.astarGrid.generateRandomWeights(undefined, undefined, 1);
        this.syncGrids();
        this.resetStats();
        StorageManager.showNotification('Random weights assigned', 'info');
    }
    
    /**
     * Randomize everything: maze, start, end, weights
     */
    generateRandomEnvironment() {
        this.dijkstraGrid.resetAlgorithmStates();
        this.astarGrid.resetAlgorithmStates();
        this.dijkstraGrid.generateRandomMaze();
        this.dijkstraGrid.randomizeStartAndEnd();
        this.dijkstraGrid.generateRandomWeights(undefined, undefined, 1); // Only 2,5,10 weights
        this.syncGrids();
        this.resetStats();
        StorageManager.showNotification('Random environment generated', 'info');
    }
    
    /**
     * Get application statistics
     * @returns {Object} Application statistics
     */
    getAppStatistics() {
        return {
            gridSize: this.currentGridSize,
            animationSpeed: this.currentSpeed,
            isRunning: this.isRunning,
            dijkstraStats: this.dijkstraAlgorithm?.getStatistics(),
            astarStats: this.astarAlgorithm?.getStatistics(),
            performanceMetrics: this.performanceMonitor.getPerformanceSummary()
        };
    }

    // Utility to enable/disable sidebar controls
    setSidebarEnabled(enabled) {
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => btn.disabled = !enabled);
        // Randomizer buttons (all with .tool-btn and btn-secondary and full-width)
        document.querySelectorAll('#random-maze, #random-points, #random-weights, #random-environment').forEach(btn => btn.disabled = !enabled);
        // Controls
        document.getElementById('speed-selector').disabled = !enabled;
        document.getElementById('grid-size').disabled = !enabled;
        const customInput = document.getElementById('custom-grid-size');
        if (customInput) customInput.disabled = !enabled;
    }
}

// Initialize the application when the script loads
const app = new PathfinderApp();

// Export for potential external use
export default PathfinderApp; 