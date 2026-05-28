const API_BASE_URL = 'http://localhost:8080/api/tasks';
let currentUser = null;
let currentAuth = null;
let currentPage = 0;
let currentSort = 'id';
let totalPages = 1;

// DOM Elements
const authContainer = document.getElementById('authContainer');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const welcomeMessage = document.getElementById('welcomeMessage');
const logoutBtn = document.getElementById('logoutBtn');
const createTaskForm = document.getElementById('createTaskForm');
const tasksList = document.getElementById('tasksList');
const sortSelect = document.getElementById('sortSelect');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    createTaskForm.addEventListener('submit', handleCreateTask);
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 0;
        fetchTasks();
    });
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            fetchTasks();
        }
    });
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            currentPage++;
            fetchTasks();
        }
    });
}

// Authentication
function checkAuth() {
    const storedAuth = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedAuth && storedUser) {
        currentAuth = storedAuth;
        currentUser = storedUser;
        showDashboard();
    } else {
        showLogin();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    
    const token = btoa(`${usernameInput}:${passwordInput}`);
    const authHeader = `Basic ${token}`;
    
    try {
        // Test auth by hitting an endpoint
        const response = await fetch(`${API_BASE_URL}?page=0&size=1`, {
            headers: { 'Authorization': authHeader }
        });
        
        if (response.ok) {
            localStorage.setItem('auth_token', authHeader);
            localStorage.setItem('auth_user', usernameInput);
            currentAuth = authHeader;
            currentUser = usernameInput;
            loginError.textContent = '';
            showDashboard();
        } else {
            loginError.textContent = 'Invalid username or password';
        }
    } catch (error) {
        loginError.textContent = 'Connection error. Is the server running?';
        console.error('Login error:', error);
    }
}

function handleLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    currentAuth = null;
    currentUser = null;
    showLogin();
}

function showLogin() {
    appContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    loginForm.reset();
}

function showDashboard() {
    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');
    welcomeMessage.textContent = `Hello, ${currentUser}`;
    currentPage = 0;
    fetchTasks();
}

// API Calls
async function fetchWithAuth(url, options = {}) {
    if (!options.headers) options.headers = {};
    options.headers['Authorization'] = currentAuth;
    if (!options.headers['Content-Type'] && options.method !== 'DELETE') {
        options.headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, options);
    if (response.status === 401) {
        handleLogout();
        throw new Error('Unauthorized');
    }
    return response;
}

async function fetchTasks() {
    tasksList.innerHTML = `
        <div class="loading-spinner">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            <p>Loading tasks...</p>
        </div>
    `;
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}?page=${currentPage}&size=5&sortBy=${currentSort}`);
        if (response.ok) {
            const data = await response.json();
            totalPages = data.totalPages;
            renderTasks(data.content);
            updatePagination(data);
        }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        tasksList.innerHTML = `<p class="error-message">Failed to load tasks.</p>`;
    }
}

async function handleCreateTask(e) {
    e.preventDefault();
    const titleInput = document.getElementById('taskTitle');
    const descInput = document.getElementById('taskDescription');
    
    const newTask = {
        title: titleInput.value,
        description: descInput.value,
        completed: false
    };
    
    try {
        const response = await fetchWithAuth(API_BASE_URL, {
            method: 'POST',
            body: JSON.stringify(newTask)
        });
        
        if (response.ok) {
            titleInput.value = '';
            descInput.value = '';
            fetchTasks();
        }
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

async function toggleTaskStatus(taskId, currentTask) {
    const updatedTask = {
        ...currentTask,
        completed: !currentTask.completed
    };
    
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/${taskId}`, {
            method: 'PUT',
            body: JSON.stringify(updatedTask)
        });
        
        if (response.ok) {
            fetchTasks();
        }
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            const response = await fetchWithAuth(`${API_BASE_URL}/${taskId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }
}

// Rendering
function renderTasks(tasks) {
    if (!tasks || tasks.length === 0) {
        tasksList.innerHTML = `
            <div class="glass-panel text-center">
                <i class="fa-solid fa-clipboard-check" style="font-size: 3rem; color: var(--text-secondary); margin-bottom: 1rem;"></i>
                <p style="color: var(--text-secondary)">No tasks found. Create one above!</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = '';
    
    tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        taskEl.innerHTML = `
            <div class="task-content">
                <label class="checkbox-container">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <div class="task-details">
                    <div class="task-title">${escapeHTML(task.title)}</div>
                    ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-icon btn-delete" title="Delete Task">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        
        // Add event listeners for this specific task
        const checkbox = taskEl.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => toggleTaskStatus(task.id, task));
        
        const deleteBtn = taskEl.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        tasksList.appendChild(taskEl);
    });
}

function updatePagination(data) {
    pageInfo.textContent = `Page ${data.number + 1} of ${data.totalPages || 1}`;
    
    prevPageBtn.disabled = data.first;
    nextPageBtn.disabled = data.last || data.totalPages === 0;
}

// Helper to prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
