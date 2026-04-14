/* script.js
   Day 2 To‑Do List App
   - Uses localStorage for persistence
   - Add, edit, delete, complete tasks
   - Clean, modular, and commented for clarity
*/

/* ---------- Constants and DOM references ---------- */
const STORAGE_KEY = 'day2_todo_tasks_v1';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');

const pendingList = document.getElementById('pendingList');
const completedList = document.getElementById('completedList');

const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');

const clearAllBtn = document.getElementById('clearAllBtn');

const editModalEl = document.getElementById('editModal');
const editModal = new bootstrap.Modal(editModalEl);
const editForm = document.getElementById('editForm');
const editInput = document.getElementById('editInput');
const editIdInput = document.getElementById('editId');

/* ---------- App state ---------- */
let tasks = []; // array of { id, text, completed, createdAt }

/* ---------- Utilities ---------- */

// Generate a simple unique id
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    tasks = [];
    console.error('Failed to parse tasks from localStorage', e);
  }
}

// Format relative time (simple)
function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

/* ---------- Rendering ---------- */

// Create a list item element for a task
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'list-group-item task-item';
  li.dataset.id = task.id;

  if (task.completed) li.classList.add('task-completed');

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'form-check-input mt-0';
  checkbox.checked = !!task.completed;
  checkbox.setAttribute('aria-label', 'Mark task completed');

  checkbox.addEventListener('change', () => toggleComplete(task.id));

  // Text
  const text = document.createElement('div');
  text.className = 'task-text';
  text.textContent = task.text;

  // Meta (time)
  const meta = document.createElement('small');
  meta.className = 'text-muted ms-2';
  meta.textContent = timeAgo(task.createdAt);

  // Actions
  const actions = document.createElement('div');
  actions.className = 'task-actions d-flex gap-1 ms-3';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-sm btn-outline-secondary';
  editBtn.type = 'button';
  editBtn.innerHTML = 'Edit';
  editBtn.addEventListener('click', () => openEditModal(task.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-sm btn-outline-danger';
  deleteBtn.type = 'button';
  deleteBtn.innerHTML = 'Delete';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  actions.append(editBtn, deleteBtn);

  // Assemble
  li.append(checkbox, text, meta, actions);

  return li;
}

// Render lists and counts
function render() {
  // Clear lists
  pendingList.innerHTML = '';
  completedList.innerHTML = '';

  // Sort: pending first by createdAt desc, completed by completedAt desc
  const pending = tasks.filter(t => !t.completed).sort((a, b) => b.createdAt - a.createdAt);
  const completed = tasks.filter(t => t.completed).sort((a, b) => b.completedAt - a.completedAt);

  pending.forEach(task => pendingList.appendChild(createTaskElement(task)));
  completed.forEach(task => completedList.appendChild(createTaskElement(task)));

  pendingCount.textContent = pending.length;
  completedCount.textContent = completed.length;
}

/* ---------- CRUD operations ---------- */

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const newTask = {
    id: uid(),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
    completedAt: null
  };

  tasks.unshift(newTask);
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function toggleComplete(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  t.completedAt = t.completed ? Date.now() : null;
  saveTasks();
  render();
}

function openEditModal(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  editInput.value = t.text;
  editIdInput.value = t.id;
  editModal.show();
}

function updateTask(id, newText) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.text = newText.trim();
  saveTasks();
  render();
}

/* ---------- Event listeners ---------- */

// Add task form submit
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = taskInput.value;
  if (!value.trim()) return;
  addTask(value);
  taskInput.value = '';
  taskInput.focus();
});

// Edit form submit
editForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = editIdInput.value;
  const newText = editInput.value;
  if (!newText.trim()) return;
  updateTask(id, newText);
  editModal.hide();
});

// Clear all tasks (with confirmation)
clearAllBtn.addEventListener('click', () => {
  if (!tasks.length) return;
  if (!confirm('Clear all tasks? This cannot be undone.')) return;
  tasks = [];
  saveTasks();
  render();
});

/* ---------- Initialization ---------- */

function init() {
  loadTasks();
  render();

  // Accessibility: focus input on load
  taskInput.focus();

  // Optional: seed example tasks if none exist (comment out if undesired)
  // if (!tasks.length) {
  //   addTask('Welcome — try adding a task');
  //   addTask('Click Edit to change a task');
  // }
}

init();
