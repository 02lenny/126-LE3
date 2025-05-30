/**
 * Event handlers and utility functions for the pathfinding visualizer
 * Manages UI interactions, local storage, and application state
 */

/**
 * Local Storage utility for saving and loading grid states (multiple named grids)
 */
export class StorageManager {
    static STORAGE_KEY = 'pathfinder-lab-grids';
    
    /**
     * Save grid state to local storage under a given name
     * @param {Grid} grid - Grid instance to save
     * @param {string} name - Name for the saved grid
     */
    static saveGrid(grid, name) {
        try {
            let allGrids = this.getAllGridsRaw();
            if (!allGrids) allGrids = {};
            allGrids[name] = {
                name,
                timestamp: new Date().toISOString(),
                data: grid.serialize()
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allGrids));
            this.showNotification(`Grid "${name}" saved successfully!`, 'success');
        } catch (error) {
            console.error('Error saving grid:', error);
            this.showNotification('Failed to save grid', 'error');
        }
    }
    
    /**
     * Load grid state from local storage by name
     * @param {Grid} grid - Grid instance to load into
     * @param {string} name - Name of the saved grid
     * @returns {boolean} Success status
     */
    static loadGrid(grid, name) {
        try {
            const allGrids = this.getAllGridsRaw();
            if (!allGrids || !allGrids[name]) {
                this.showNotification('No saved grid found', 'warning');
                return false;
            }
            const saveData = allGrids[name];
            grid.deserialize(saveData.data);
            const saveDate = new Date(saveData.timestamp).toLocaleString();
            this.showNotification(`Grid "${name}" loaded successfully! (Saved: ${saveDate})`, 'success');
            return true;
        } catch (error) {
            console.error('Error loading grid:', error);
            this.showNotification('Failed to load grid', 'error');
            return false;
        }
    }
    
    /**
     * Delete a saved grid by name
     * @param {string} name - Name of the saved grid
     */
    static deleteGrid(name) {
        let allGrids = this.getAllGridsRaw();
        if (allGrids && allGrids[name]) {
            delete allGrids[name];
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allGrids));
            this.showNotification(`Grid "${name}" deleted.`, 'info');
        }
    }
    
    /**
     * Get all saved grids as an array [{name, timestamp, data}]
     * @returns {Array}
     */
    static getAllSavedGrids() {
        const allGrids = this.getAllGridsRaw();
        if (!allGrids) return [];
        // Return sorted by most recent
        return Object.values(allGrids).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    /**
     * Helper: get all grids as an object {name: {name, timestamp, data}}
     */
    static getAllGridsRaw() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw);
            // Backward compatibility: if old format (single grid), wrap in object
            if (parsed && !parsed.name && !parsed.data && !parsed.timestamp && parsed.nodes) {
                // Old single grid format
                return { 'Default': { name: 'Default', timestamp: new Date().toISOString(), data: parsed } };
            }
            return parsed;
        } catch {
            return null;
        }
    }
    
    // --- Old single-grid methods for backward compatibility ---
    static saveGridSingle(grid) {
        try {
            const gridData = grid.serialize();
            const saveData = {
                timestamp: new Date().toISOString(),
                data: gridData
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
            this.showNotification('Grid saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving grid:', error);
            this.showNotification('Failed to save grid', 'error');
        }
    }
    static loadGridSingle(grid) {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (!savedData) {
                this.showNotification('No saved grid found', 'warning');
                return false;
            }
            const saveData = JSON.parse(savedData);
            grid.deserialize(saveData.data);
            const saveDate = new Date(saveData.timestamp).toLocaleString();
            this.showNotification(`Grid loaded successfully! (Saved: ${saveDate})`, 'success');
            return true;
        } catch (error) {
            console.error('Error loading grid:', error);
            this.showNotification('Failed to load grid', 'error');
            return false;
        }
    }
    static hasSavedGrid() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }
    static clearSavedGrid() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.showNotification('Saved grid cleared', 'info');
    }
    
    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
     */
    static showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '500',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });
        
        // Set background color based on type
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        notification.style.background = colors[type] || colors.info;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

/**
 * Tool selection manager
 */
export class ToolManager {
    static currentTool = 'wall';
    
    /**
     * Initialize tool button event listeners
     */
    static initializeToolButtons() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        
        toolButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                toolButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Update current tool
                this.currentTool = button.dataset.tool;
            });
        });
    }
    
    /**
     * Get current active tool
     * @returns {string} Current tool name
     */
    static getCurrentTool() {
        return this.currentTool;
    }
    
    /**
     * Set active tool
     * @param {string} tool - Tool name to activate
     */
    static setActiveTool(tool) {
        const toolButton = document.querySelector(`[data-tool="${tool}"]`);
        if (toolButton) {
            // Remove active class from all buttons
            document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
            
            // Add active class to selected button
            toolButton.classList.add('active');
            this.currentTool = tool;
        }
    }
}

/**
 * Performance monitor for tracking algorithm performance
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
    }
    
    /**
     * Start timing an operation
     * @param {string} operation - Operation name
     */
    startTiming(operation) {
        this.metrics.set(operation, {
            startTime: performance.now(),
            endTime: null,
            duration: null
        });
    }
    
    /**
     * End timing an operation
     * @param {string} operation - Operation name
     * @returns {number} Duration in milliseconds
     */
    endTiming(operation) {
        const metric = this.metrics.get(operation);
        if (metric) {
            metric.endTime = performance.now();
            metric.duration = metric.endTime - metric.startTime;
            return metric.duration;
        }
        return 0;
    }
    
    /**
     * Get timing results
     * @param {string} operation - Operation name
     * @returns {Object|null} Timing results
     */
    getTimingResults(operation) {
        return this.metrics.get(operation) || null;
    }
    
    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics.clear();
    }
    
    /**
     * Get performance summary
     * @returns {Object} Performance summary
     */
    getPerformanceSummary() {
        const summary = {};
        for (const [operation, metric] of this.metrics) {
            summary[operation] = {
                duration: metric.duration,
                durationFormatted: this.formatDuration(metric.duration)
            };
        }
        return summary;
    }
    
    /**
     * Format duration for display
     * @param {number} duration - Duration in milliseconds
     * @returns {string} Formatted duration
     */
    formatDuration(duration) {
        if (duration < 1000) {
            return `${duration.toFixed(2)}ms`;
        } else {
            return `${(duration / 1000).toFixed(2)}s`;
        }
    }
}

/**
 * Animation controller for managing algorithm animations
 */
export class AnimationController {
    constructor() {
        this.isAnimating = false;
        this.animationQueue = [];
        this.currentAnimation = null;
    }
    
    /**
     * Check if animation is currently running
     * @returns {boolean} Animation status
     */
    isRunning() {
        return this.isAnimating;
    }
    
    /**
     * Start animation
     */
    start() {
        this.isAnimating = true;
    }
    
    /**
     * Stop animation
     */
    stop() {
        this.isAnimating = false;
        this.animationQueue = [];
        if (this.currentAnimation) {
            clearTimeout(this.currentAnimation);
            this.currentAnimation = null;
        }
    }
    
    /**
     * Pause animation
     */
    pause() {
        this.isAnimating = false;
    }
    
    /**
     * Resume animation
     */
    resume() {
        this.isAnimating = true;
    }
    
    /**
     * Add animation step to queue
     * @param {Function} animationStep - Animation function to execute
     * @param {number} delay - Delay before execution
     */
    addToQueue(animationStep, delay = 0) {
        this.animationQueue.push({ step: animationStep, delay });
    }
    
    /**
     * Execute animation queue
     */
    async executeQueue() {
        for (const { step, delay } of this.animationQueue) {
            if (!this.isAnimating) break;
            
            await new Promise(resolve => {
                this.currentAnimation = setTimeout(() => {
                    step();
                    resolve();
                }, delay);
            });
        }
        
        this.animationQueue = [];
        this.currentAnimation = null;
    }
}

/**
 * Utility functions for DOM manipulation and event handling
 */
export class DOMUtils {
    /**
     * Add event listener with automatic cleanup
     * @param {Element} element - DOM element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event listener options
     */
    static addEventListenerWithCleanup(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        
        // Return cleanup function
        return () => {
            element.removeEventListener(event, handler, options);
        };
    }
    
    /**
     * Debounce function to limit rapid fire events
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * Throttle function to limit execution frequency
     * @param {Function} func - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, delay) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, delay);
            }
        };
    }
    
    /**
     * Get element position relative to viewport
     * @param {Element} element - DOM element
     * @returns {Object} Position coordinates
     */
    static getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
        };
    }
    
    /**
     * Check if element is visible in viewport
     * @param {Element} element - DOM element
     * @returns {boolean} Visibility status
     */
    static isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

/**
 * Keyboard shortcut manager
 */
export class KeyboardManager {
    constructor() {
        this.shortcuts = new Map();
        this.isEnabled = true;
        
        // Bind keyboard event listener
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }
    
    /**
     * Register keyboard shortcut
     * @param {string} key - Key combination (e.g., 'ctrl+s', 'space')
     * @param {Function} handler - Handler function
     * @param {string} description - Description of the shortcut
     */
    registerShortcut(key, handler, description = '') {
        this.shortcuts.set(key.toLowerCase(), { handler, description });
    }
    
    /**
     * Unregister keyboard shortcut
     * @param {string} key - Key combination
     */
    unregisterShortcut(key) {
        this.shortcuts.delete(key.toLowerCase());
    }
    
    /**
     * Handle keydown events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        if (!this.isEnabled) return;
        
        const key = this.getKeyString(event);
        const shortcut = this.shortcuts.get(key);
        
        if (shortcut) {
            event.preventDefault();
            shortcut.handler(event);
        }
    }
    
    /**
     * Get key string from keyboard event
     * @param {KeyboardEvent} event - Keyboard event
     * @returns {string} Key string
     */
    getKeyString(event) {
        const parts = [];
        
        if (event.ctrlKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        
        const key = event.key.toLowerCase();
        if (key !== 'control' && key !== 'alt' && key !== 'shift') {
            parts.push(key);
        }
        
        return parts.join('+');
    }
    
    /**
     * Enable keyboard shortcuts
     */
    enable() {
        this.isEnabled = true;
    }
    
    /**
     * Disable keyboard shortcuts
     */
    disable() {
        this.isEnabled = false;
    }
    
    /**
     * Get all registered shortcuts
     * @returns {Array} List of shortcuts with descriptions
     */
    getShortcuts() {
        const shortcuts = [];
        for (const [key, { description }] of this.shortcuts) {
            shortcuts.push({ key, description });
        }
        return shortcuts;
    }
} 