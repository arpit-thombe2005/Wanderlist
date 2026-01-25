// Data structure for locations
let locations = [];
let currentEditId = null;
let draggedElement = null;
let draggedIndex = null;
let currentFilter = 'all'; // 'all', 'visited', 'togo'

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadLocations();
    // initializeTheme();
    setupEventListeners();
    updateStatistics();
    renderLocations();
});

// Load locations from localStorage
function loadLocations() {
    const saved = localStorage.getItem('wanderlist_locations');
    if (saved) {
        try {
            locations = JSON.parse(saved);
            // Migrate old locations to include visited property
            locations = locations.map(loc => {
                if (loc.visited === undefined) {
                    loc.visited = false;
                }
                return loc;
            });
            saveLocations(); // Save migrated data
        } catch (e) {
            locations = [];
        }
    }
}

//Save locations to localStorage
function saveLocations() {
    localStorage.setItem('wanderlist_locations', JSON.stringify(locations));
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('wanderlist_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// function toggleTheme() {
//     const currentTheme = document.documentElement.getAttribute('data-theme');
//     const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
//     document.documentElement.setAttribute('data-theme', newTheme);
//     localStorage.setItem('wanderlist_theme', newTheme);
//     updateThemeIcon(newTheme);
// }

// function updateThemeIcon(theme) {
//     const icon = document.querySelector('.theme-icon');
//     if (icon) {
//         icon.textContent = theme === 'dark' ? '☀️' : '🌙';
//     }
// }

// Event Listeners
function setupEventListeners() {
    // Add location
    const addBtn = document.getElementById('addBtn');
    const locationInput = document.getElementById('locationInput');
    
    if (addBtn) {
        addBtn.addEventListener('click', addLocation);
    }
    
    if (locationInput) {
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addLocation();
            }
        });
    }

    // Toggle advanced options
    const toggleBtn = document.getElementById('toggleAdvancedBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleAdvancedOptions);
    }

    // Filter
    const filterSelect = document.getElementById('filterSelect');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            renderLocations();
        });
    }

    // Sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortLocations(e.target.value);
        });
    }

    // Theme toggle
    // const themeToggle = document.getElementById('themeToggle');
    // if (themeToggle) {
    //     themeToggle.addEventListener('click', toggleTheme);
    // }

    // Modal
    const closeModalBtn = document.getElementById('closeModal');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const saveEditBtn = document.getElementById('saveEdit');
    const editModal = document.getElementById('editModal');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeModal);
    }
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', saveEdit);
    }
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target.id === 'editModal') {
                closeModal();
            }
        });
    }
}

// Toggle advanced options
function toggleAdvancedOptions() {
    const options = document.getElementById('advancedOptions');
    const icon = document.getElementById('toggleIcon');
    
    if (!options || !icon) return;
    
    const isVisible = options.style.display !== 'none';
    
    if (isVisible) {
        options.style.display = 'none';
        icon.textContent = '▼';
    } else {
        options.style.display = 'block';
        icon.textContent = '▲';
    }
}

// Add location
function addLocation() {
    const input = document.getElementById('locationInput');
    if (!input) return;
    
    const name = input.value.trim();

    if (!name) {
        input.focus();
        return;
    }

    const descriptionEl = document.getElementById('addDescription');
    const priorityEl = document.getElementById('addPriority');
    
    const description = descriptionEl ? descriptionEl.value.trim() : '';
    const priority = priorityEl ? priorityEl.value : 'medium';

    const newLocation = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: name,
        description: description,
        priority: priority,
        visited: false,
        dateAdded: new Date().toISOString(),
        order: locations.length
    };

    locations.push(newLocation);
    saveLocations();
    
    // Clear form
    input.value = '';
    if (descriptionEl) descriptionEl.value = '';
    if (priorityEl) priorityEl.value = 'medium';
    
    // Hide advanced options
    const options = document.getElementById('advancedOptions');
    if (options && options.style.display !== 'none') {
        toggleAdvancedOptions();
    }
    
    // Render immediately for real-time update
    requestAnimationFrame(() => {
        updateStatistics();
        renderLocations();
        if (input) input.focus();
    });
}

// Remove location
function removeLocation(id) {
    if (confirm('Are you sure you want to remove this location?')) {
        locations = locations.filter(loc => loc.id !== id);
        saveLocations();
        // Real-time update
        requestAnimationFrame(() => {
            updateStatistics();
            renderLocations();
        });
    }
}

// Toggle visited status
function toggleVisited(id) {
    const location = locations.find(loc => loc.id === id);
    if (location) {
        location.visited = !location.visited;
        saveLocations();
        updateStatistics();
        renderLocations();
    }
}

// Edit location
function editLocation(id) {
    const location = locations.find(loc => loc.id === id);
    if (!location) return;

    currentEditId = id;
    const editName = document.getElementById('editName');
    const editDescription = document.getElementById('editDescription');
    const editPriority = document.getElementById('editPriority');
    const editVisited = document.getElementById('editVisited');
    const editModal = document.getElementById('editModal');
    
    if (editName) editName.value = location.name;
    if (editDescription) editDescription.value = location.description || '';
    if (editPriority) editPriority.value = location.priority;
    if (editVisited) editVisited.checked = location.visited || false;
    if (editModal) editModal.classList.add('active');
}

// Save edit
function saveEdit() {
    if (!currentEditId) return;

    const location = locations.find(loc => loc.id === currentEditId);
    if (location) {
        const editName = document.getElementById('editName');
        const editDescription = document.getElementById('editDescription');
        const editPriority = document.getElementById('editPriority');
        const editVisited = document.getElementById('editVisited');
        
        if (editName) location.name = editName.value.trim();
        if (editDescription) location.description = editDescription.value.trim();
        if (editPriority) location.priority = editPriority.value;
        if (editVisited) location.visited = editVisited.checked;
    }

    saveLocations();
    // Real-time update
    requestAnimationFrame(() => {
        updateStatistics();
        renderLocations();
    });
    closeModal();
}

// Close modal
function closeModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.classList.remove('active');
    }
    currentEditId = null;
}

// Sort locations
function sortLocations(sortBy) {
    // Create a copy to preserve original order if needed
    const sortedLocations = [...locations];
    
    switch (sortBy) {
        case 'name':
            sortedLocations.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            sortedLocations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            break;
        case 'date':
        default:
            sortedLocations.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
    }
    
    // Update locations array
    locations = sortedLocations;
    saveLocations();
    // Real-time update
    requestAnimationFrame(() => {
        updateStatistics();
        renderLocations();
    });
}

// Update statistics
function updateStatistics() {
    const total = locations.length;
    const visited = locations.filter(loc => loc.visited).length;
    const togo = total - visited;

    const totalEl = document.getElementById('totalLocations');
    const visitedEl = document.getElementById('visitedLocations');
    const togoEl = document.getElementById('togoLocations');

    if (totalEl) totalEl.textContent = total;
    if (visitedEl) visitedEl.textContent = visited;
    if (togoEl) togoEl.textContent = togo;
}

// Render locations
function renderLocations() {
    const container = document.getElementById('locationsContainer');
    const emptyState = document.getElementById('emptyState');

    if (!container) return;

    // Filter locations based on current filter
    let filteredLocations = locations;
    if (currentFilter === 'visited') {
        filteredLocations = locations.filter(loc => loc.visited);
    } else if (currentFilter === 'togo') {
        filteredLocations = locations.filter(loc => !loc.visited);
    }

    if (filteredLocations.length === 0) {
        if (emptyState) {
            emptyState.classList.remove('hidden');
            if (currentFilter === 'visited') {
                emptyState.querySelector('h2').textContent = 'No visited locations yet';
                emptyState.querySelector('p').textContent = 'Mark locations as visited to see them here!';
            } else if (currentFilter === 'togo') {
                emptyState.querySelector('h2').textContent = 'All locations visited!';
                emptyState.querySelector('p').textContent = 'Great job! Add more locations to your list.';
            } else {
                emptyState.querySelector('h2').textContent = 'No locations yet';
                emptyState.querySelector('p').textContent = 'Start adding your travel destinations!';
            }
        }
        container.innerHTML = '';
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    
    // Clear container
    container.innerHTML = '';

    // Create cards with animation
    filteredLocations.forEach((location, index) => {
        const card = createLocationCard(location, index);
        container.appendChild(card);
        
        // Add entrance animation
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        }, index * 50);
    });

    // Initialize drag and drop after a brief delay to ensure DOM is ready
    setTimeout(() => {
        initializeDragAndDrop();
    }, 100);
}

// Create location card
function createLocationCard(location, index) {
    const card = document.createElement('div');
    card.className = 'location-card';
    card.draggable = true;
    card.dataset.id = location.id;
    card.dataset.index = index;

    const dateAdded = new Date(location.dateAdded).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const visitedClass = location.visited ? 'visited' : '';
    const visitedCheck = location.visited ? 'checked' : '';
    
    card.innerHTML = `
        <div class="drag-handle">⋮⋮</div>
        <div class="location-content">
            <div class="location-header">
                <label class="visited-checkbox-label">
                    <input type="checkbox" class="visited-checkbox" data-id="${location.id}" ${visitedCheck}>
                    <span class="visited-checkmark"></span>
                </label>
                <div class="location-name ${visitedClass}">${escapeHtml(location.name)}</div>
                <div class="location-actions">
                    <button class="btn-icon" data-action="edit" data-id="${location.id}" title="Edit">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn-icon btn-icon-danger" data-action="delete" data-id="${location.id}" title="Delete">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            ${location.description ? `<div class="location-description">${escapeHtml(location.description)}</div>` : ''}
            <div class="location-footer">
                <div class="location-meta">
                    <span class="meta-item">📅 ${dateAdded}</span>
                    <span class="priority-badge priority-${location.priority}">${location.priority}</span>
                    ${location.visited ? '<span class="visited-badge">✅ Visited</span>' : ''}
                </div>
            </div>
        </div>
    `;

    // Attach button handlers
    const editBtn = card.querySelector('[data-action="edit"]');
    const deleteBtn = card.querySelector('[data-action="delete"]');
    const visitedCheckbox = card.querySelector('.visited-checkbox');
    
    if (editBtn) {
        editBtn.draggable = false;
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            editLocation(location.id);
        });
    }
    if (deleteBtn) {
        deleteBtn.draggable = false;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            removeLocation(location.id);
        });
    }
    if (visitedCheckbox) {
        visitedCheckbox.draggable = false;
        visitedCheckbox.addEventListener('change', (e) => {
            e.stopPropagation();
            toggleVisited(location.id);
        });
        visitedCheckbox.addEventListener('mousedown', (e) => e.stopPropagation());
    }

    return card;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Drag and Drop functionality - Complete rewrite
function initializeDragAndDrop() {
    const cards = document.querySelectorAll('.location-card');
    
    cards.forEach((card, index) => {
        // Remove old listeners by cloning
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        // Re-attach button handlers
        const editBtn = newCard.querySelector('[data-action="edit"]');
        const deleteBtn = newCard.querySelector('[data-action="delete"]');
        const visitedCheckbox = newCard.querySelector('.visited-checkbox');
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                editLocation(newCard.dataset.id);
            });
        }
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                removeLocation(newCard.dataset.id);
            });
        }
        if (visitedCheckbox) {
            visitedCheckbox.addEventListener('change', (e) => {
                e.stopPropagation();
                toggleVisited(newCard.dataset.id);
            });
        }
        
        // Drag handlers
        newCard.addEventListener('dragstart', (e) => {
            // Don't drag if clicking buttons or checkbox
            if (e.target.closest('.btn-icon') || e.target.closest('.location-actions') || e.target.closest('.visited-checkbox-label')) {
                e.preventDefault();
                return false;
            }
            
            draggedElement = newCard;
            draggedIndex = parseInt(newCard.dataset.index);
            newCard.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', newCard.dataset.id);
            
            // Create a ghost image
            setTimeout(() => {
                newCard.style.opacity = '0.5';
            }, 0);
        });
        
        newCard.addEventListener('dragend', (e) => {
            newCard.classList.remove('dragging');
            newCard.style.opacity = '1';
            document.querySelectorAll('.location-card').forEach(c => {
                c.classList.remove('drag-over', 'drag-above', 'drag-below');
            });
            draggedElement = null;
            draggedIndex = null;
        });
        
        newCard.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (draggedElement && draggedElement !== newCard) {
                e.dataTransfer.dropEffect = 'move';
                
                const rect = newCard.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                
                newCard.classList.remove('drag-above', 'drag-below');
                if (e.clientY < midY) {
                    newCard.classList.add('drag-above');
                } else {
                    newCard.classList.add('drag-below');
                }
            }
            return false;
        });
        
        newCard.addEventListener('dragenter', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (draggedElement && draggedElement !== newCard) {
                newCard.classList.add('drag-over');
            }
            return false;
        });
        
        newCard.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const rect = newCard.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                newCard.classList.remove('drag-over', 'drag-above', 'drag-below');
            }
            return false;
        });
        
        newCard.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (draggedElement && draggedElement !== newCard) {
                const draggedId = draggedElement.dataset.id;
                const targetId = newCard.dataset.id;
                
                if (draggedId && targetId) {
                    const fromIndex = locations.findIndex(loc => loc.id === draggedId);
                    const toIndex = locations.findIndex(loc => loc.id === targetId);
                    
                    if (fromIndex !== -1 && toIndex !== -1) {
                        // Remove from old position
                        const [movedItem] = locations.splice(fromIndex, 1);
                        // Insert at new position
                        locations.splice(toIndex, 0, movedItem);
                        
                        // Update order
                        locations.forEach((loc, idx) => {
                            loc.order = idx;
                        });
                        
                        saveLocations();
                        renderLocations();
                    }
                }
            }
            
            newCard.classList.remove('drag-over', 'drag-above', 'drag-below');
            return false;
        });
    });
}

// Make functions globally available
window.editLocation = editLocation;
window.removeLocation = removeLocation;
