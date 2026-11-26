/**
 * Task Tracker - Frontend Application
 * Reactive Task Management inspired by Google Sheets & Modern SaaS
 */

// --- Default Demo Dataset matching the reference image ---
function getInitialTasks() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Helper to get offset date ISO string
  function getOffsetDate(daysOffset) {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // 30 Sample tasks mirroring the reference image distribution:
  // High: 12 (40%), Medium: 12 (40%), Low: 6 (20%)
  // Completed: 21, In Progress: 6, Overdue: 3 (Total: 30)
  return [
    { id: '1', title: 'Plan content calendar', priority: 'High', dueDate: getOffsetDate(-3), completed: true },
    { id: '2', title: 'Finish project proposal', priority: 'High', dueDate: getOffsetDate(-3), completed: true },
    { id: '3', title: 'Client meeting', priority: 'Medium', dueDate: getOffsetDate(-2), completed: true },
    { id: '4', title: 'Email marketing campaign', priority: 'Medium', dueDate: getOffsetDate(-1), completed: false }, // Overdue
    { id: '5', title: 'Update website copy', priority: 'Low', dueDate: getOffsetDate(-2), completed: false }, // Overdue
    { id: '6', title: 'Team status update', priority: 'Medium', dueDate: getOffsetDate(-1), completed: true },
    { id: '7', title: 'Review monthly budget', priority: 'High', dueDate: getOffsetDate(0), completed: true }, // Completed today
    { id: '8', title: 'Design social media posts', priority: 'Low', dueDate: getOffsetDate(-1), completed: false }, // Overdue
    { id: '9', title: 'Call with supplier', priority: 'Medium', dueDate: getOffsetDate(0), completed: false }, // Due today
    { id: '10', title: 'Prepare presentation', priority: 'High', dueDate: getOffsetDate(0), completed: true }, // Today
    { id: '11', title: 'Organize files', priority: 'Low', dueDate: getOffsetDate(0), completed: false }, // Due today
    { id: '12', title: 'Write blog post', priority: 'Medium', dueDate: getOffsetDate(0), completed: false }, // Due today
    { id: '13', title: 'Backup important data', priority: 'Low', dueDate: getOffsetDate(0), completed: false }, // Due today
    { id: '14', title: 'Finalize quarterly OKRs', priority: 'High', dueDate: getOffsetDate(0), completed: false }, // Due today (6th due today)
    { id: '15', title: 'Customer survey review', priority: 'Medium', dueDate: getOffsetDate(1), completed: false },
    { id: '16', title: 'Conduct code audit', priority: 'High', dueDate: getOffsetDate(-4), completed: true },
    { id: '17', title: 'Setup CI/CD pipeline', priority: 'High', dueDate: getOffsetDate(-4), completed: true },
    { id: '18', title: 'Renew SSL certificates', priority: 'Medium', dueDate: getOffsetDate(-3), completed: true },
    { id: '19', title: 'User interview session A', priority: 'High', dueDate: getOffsetDate(-3), completed: true },
    { id: '20', title: 'User interview session B', priority: 'High', dueDate: getOffsetDate(-2), completed: true },
    { id: '21', title: 'Refactor authentication flow', priority: 'High', dueDate: getOffsetDate(-2), completed: true },
    { id: '22', title: 'Design system icon update', priority: 'Low', dueDate: getOffsetDate(-2), completed: true },
    { id: '23', title: 'Optimize database queries', priority: 'High', dueDate: getOffsetDate(-1), completed: true },
    { id: '24', title: 'Draft investor newsletter', priority: 'Medium', dueDate: getOffsetDate(-1), completed: true },
    { id: '25', title: 'Competitor pricing analysis', priority: 'Medium', dueDate: getOffsetDate(-1), completed: true },
    { id: '26', title: 'Onboarding guide overhaul', priority: 'Medium', dueDate: getOffsetDate(2), completed: true },
    { id: '27', title: 'Security compliance check', priority: 'High', dueDate: getOffsetDate(3), completed: true },
    { id: '28', title: 'Analytics tagging review', priority: 'Medium', dueDate: getOffsetDate(4), completed: true },
    { id: '29', title: 'Clean legacy cloud storage', priority: 'Low', dueDate: getOffsetDate(5), completed: true },
    { id: '30', title: 'Sync with product design lead', priority: 'High', dueDate: getOffsetDate(6), completed: true }
  ];
}

// --- State Management ---
const STORAGE_KEY = 'task_tracker_app_tasks_v2';

let state = {
  tasks: [],
  activeTab: 'all', // 'all', 'today', 'this-week', 'in-progress', 'completed', 'overdue'
  searchQuery: '',
  priorityFilter: 'ALL',
  sortColumn: 'dueDate',
  sortAscending: true,
  selectedTaskIds: new Set()
};

// Initialize App
function initApp() {
  loadTasks();
  setupEventListeners();
  updateLiveDate();
  renderAll();
}

// Load tasks from LocalStorage or initialize default
function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state.tasks = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse local storage, loading demo tasks', e);
      state.tasks = getInitialTasks();
    }
  } else {
    state.tasks = getInitialTasks();
    saveTasks();
  }
}

// Save tasks to LocalStorage
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

// Format Date string (e.g., "2024-05-16" -> "May 16, 2024")
function formatDateDisplay(dateStr) {
  if (!dateStr) return 'No Date';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Check if a task is overdue (past date and not completed)
function isTaskOverdue(task) {
  if (task.completed || !task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parts = task.dueDate.split('-');
  const due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return due < today;
}

// Check if a task is due today
function isTaskDueToday(task) {
  if (!task.dueDate) return false;
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return task.dueDate === todayIso;
}

// Check if task is in current week
function isTaskInCurrentWeek(task) {
  if (!task.dueDate) return false;
  const parts = task.dueDate.split('-');
  const due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23, 59, 59, 999);

  return due >= startOfWeek && due <= endOfWeek;
}

// Update Live Date in footer
function updateLiveDate() {
  const el = document.getElementById('liveDateDisplay');
  if (el) {
    const now = new Date();
    el.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

// --- Metrics & Dashboard Stats Computation ---
function calculateMetrics() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.completed).length;
  const inProgress = state.tasks.filter(t => !t.completed).length;
  const overdue = state.tasks.filter(isTaskOverdue).length;

  const dueToday = state.tasks.filter(isTaskDueToday).length;
  const completedThisWeek = state.tasks.filter(t => t.completed && isTaskInCurrentWeek(t)).length;

  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Counts by priority
  const high = state.tasks.filter(t => t.priority === 'High').length;
  const medium = state.tasks.filter(t => t.priority === 'Medium').length;
  const low = state.tasks.filter(t => t.priority === 'Low').length;

  const highPct = total > 0 ? Math.round((high / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((medium / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((low / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    overdue,
    dueToday,
    completedThisWeek,
    rate,
    high,
    medium,
    low,
    highPct,
    medPct,
    lowPct
  };
}

// --- Render KPI Cards & Summary Section ---
function renderKPIsAndSummary() {
  const m = calculateMetrics();

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // Top Cards
  setTxt('kpiTasksDueToday', m.dueToday);
  setTxt('kpiCompletedThisWeek', m.completedThisWeek);
  setTxt('kpiOverdue', m.overdue);
  setTxt('kpiCompletionRate', `${m.rate}%`);

  // Summary counts
  setTxt('summaryTotalTasks', m.total);
  setTxt('summaryCompleted', m.completed);
  setTxt('summaryInProgress', m.inProgress);
  setTxt('summaryOverdue', m.overdue);

  // Priority Legend
  setTxt('legendHighPct', `${m.highPct}%`);
  setTxt('legendMedPct', `${m.medPct}%`);
  setTxt('legendLowPct', `${m.lowPct}%`);
  setTxt('legendTotalTasks', `Total Tasks: ${m.total}`);

  // Redraw Canvas Donut Chart
  renderPriorityDonutChart(m);
}

// --- Render Canvas Donut Chart ---
function renderPriorityDonutChart(metrics) {
  const canvas = document.getElementById('priorityChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Set real resolution for high-DPI screens
  const size = 96;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, size, size);

  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = 42;
  const innerRadius = 30;

  const total = metrics.high + metrics.medium + metrics.low;

  if (total === 0) {
    // Empty state gray ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
    ctx.closePath();
    ctx.fillStyle = '#E4E4E7';
    ctx.fill();
    return;
  }

  // Segments: High (Red), Medium (Amber), Low (Slate)
  const segments = [
    { label: 'High', count: metrics.high, color: '#DC2626' },
    { label: 'Medium', count: metrics.medium, color: '#D97706' },
    { label: 'Low', count: metrics.low, color: '#71717A' }
  ];

  let currentAngle = -Math.PI / 2; // start from top (12 o'clock)

  segments.forEach(seg => {
    if (seg.count <= 0) return;
    const sliceAngle = (seg.count / total) * (Math.PI * 2);
    const endAngle = currentAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, currentAngle, endAngle, false);
    ctx.arc(centerX, centerY, innerRadius, endAngle, currentAngle, true);
    ctx.closePath();
    ctx.fillStyle = seg.color;
    ctx.fill();

    // Subtle divider line
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    currentAngle = endAngle;
  });

  // Inner hole background (Clean White)
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  // Center subtle label (Total)
  ctx.font = '600 13px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#18181B';
  ctx.fillText(`${total}`, centerX, centerY);
}

// --- Filter & Sort Tasks ---
function getFilteredAndSortedTasks() {
  let list = [...state.tasks];

  // 1. Tab filtering
  if (state.activeTab === 'today') {
    list = list.filter(isTaskDueToday);
  } else if (state.activeTab === 'this-week') {
    list = list.filter(isTaskInCurrentWeek);
  } else if (state.activeTab === 'in-progress') {
    list = list.filter(t => !t.completed);
  } else if (state.activeTab === 'completed') {
    list = list.filter(t => t.completed);
  } else if (state.activeTab === 'overdue') {
    list = list.filter(isTaskOverdue);
  }

  // 2. Search query filter
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    list = list.filter(t => t.title.toLowerCase().includes(q));
  }

  // 3. Priority filter
  if (state.priorityFilter !== 'ALL') {
    list = list.filter(t => t.priority === state.priorityFilter);
  }

  // 4. Sorting
  const priorityOrder = { High: 3, Medium: 2, Low: 1 };

  list.sort((a, b) => {
    let result = 0;
    if (state.sortColumn === 'title') {
      result = a.title.localeCompare(b.title);
    } else if (state.sortColumn === 'priority') {
      result = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
    } else if (state.sortColumn === 'dueDate') {
      result = (a.dueDate || '').localeCompare(b.dueDate || '');
    } else if (state.sortColumn === 'completed') {
      result = (a.completed === b.completed) ? 0 : a.completed ? 1 : -1;
    }

    return state.sortAscending ? result : -result;
  });

  return list;
}

// --- Render Table ---
function renderTable() {
  const tableBody = document.getElementById('taskTableBody');
  const emptyState = document.getElementById('emptyState');
  const filteredBadge = document.getElementById('filteredCountBadge');
  const selectAll = document.getElementById('selectAllCheckbox');

  const tasks = getFilteredAndSortedTasks();
  filteredBadge.textContent = `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`;

  if (tasks.length === 0) {
    tableBody.innerHTML = '';
    emptyState.style.display = 'block';
    selectAll.checked = false;
    updateBulkActionsBar();
    return;
  }

  emptyState.style.display = 'none';

  // Check if all filtered are selected
  const allSelected = tasks.length > 0 && tasks.every(t => state.selectedTaskIds.has(t.id));
  selectAll.checked = allSelected;

  tableBody.innerHTML = tasks.map(task => {
    const isSelected = state.selectedTaskIds.has(task.id);
    const overdue = isTaskOverdue(task);
    const today = isTaskDueToday(task);

    let dateClass = 'due-date-text';
    if (overdue) dateClass += ' due-overdue';
    else if (today) dateClass += ' due-today';

    const priorityClass = `badge-priority badge-${task.priority.toLowerCase()}`;
    const rowClass = task.completed ? 'row-completed' : '';

    return `
      <tr class="${rowClass}" data-id="${task.id}">
        <td class="td-checkbox">
          <input type="checkbox" class="row-select" data-id="${task.id}" ${isSelected ? 'checked' : ''} aria-label="Select row">
        </td>
        <td class="task-title-cell">
          <span>${escapeHtml(task.title)}</span>
        </td>
        <td>
          <span class="${priorityClass}">${task.priority}</span>
        </td>
        <td>
          <span class="${dateClass}">
            ${formatDateDisplay(task.dueDate)}
            ${overdue ? ' (Overdue)' : today ? ' (Today)' : ''}
          </span>
        </td>
        <td>
          <button type="button" class="status-btn" data-action="toggle-status" data-id="${task.id}" title="${task.completed ? 'Mark pending' : 'Mark complete'}">
            <div class="status-box ${task.completed ? 'checked' : ''}">
              ${task.completed ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
            </div>
          </button>
        </td>
        <td class="actions-cell">
          <button class="action-icon-btn btn-edit" data-action="edit" data-id="${task.id}" title="Edit Task">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="action-icon-btn btn-delete" data-action="delete" data-id="${task.id}" title="Delete Task">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  updateBulkActionsBar();
}

// Update bulk actions visibility
function updateBulkActionsBar() {
  const bar = document.getElementById('bulkActionsBar');
  const countText = document.getElementById('selectedCountText');
  const count = state.selectedTaskIds.size;

  if (count > 0) {
    bar.classList.add('active');
    countText.textContent = `${count} ${count === 1 ? 'task' : 'tasks'} selected`;
  } else {
    bar.classList.remove('active');
  }
}

// --- Full Re-render ---
function renderAll() {
  renderKPIsAndSummary();
  renderTable();
}

// --- CRUD Actions ---

function toggleTaskStatus(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks();
  renderAll();

  showToast(task.completed ? `✓ "${task.title}" completed!` : `Task marked pending`, 'info');
}

function deleteTask(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  state.tasks = state.tasks.filter(t => t.id !== taskId);
  state.selectedTaskIds.delete(taskId);
  saveTasks();
  renderAll();

  showToast(`Task removed`, 'info');
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add New Task';
  document.getElementById('editTaskId').value = '';
  document.getElementById('taskTitleInput').value = '';
  document.getElementById('taskPriorityInput').value = 'Medium';

  // Default due date to today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('taskDueDateInput').value = `${yyyy}-${mm}-${dd}`;
  document.getElementById('taskStatusInput').checked = false;

  document.getElementById('taskModal').classList.add('open');
  document.getElementById('taskTitleInput').focus();
}

function openEditModal(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  document.getElementById('modalTitle').textContent = 'Edit Task';
  document.getElementById('editTaskId').value = task.id;
  document.getElementById('taskTitleInput').value = task.title;
  document.getElementById('taskPriorityInput').value = task.priority;
  document.getElementById('taskDueDateInput').value = task.dueDate;
  document.getElementById('taskStatusInput').checked = task.completed;

  document.getElementById('taskModal').classList.add('open');
  document.getElementById('taskTitleInput').focus();
}

function closeModal() {
  document.getElementById('taskModal').classList.remove('open');
}

function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('editTaskId').value;
  const title = document.getElementById('taskTitleInput').value.trim();
  const priority = document.getElementById('taskPriorityInput').value;
  const dueDate = document.getElementById('taskDueDateInput').value;
  const completed = document.getElementById('taskStatusInput').checked;

  if (!title) return;

  if (id) {
    // Update existing task
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.title = title;
      task.priority = priority;
      task.dueDate = dueDate;
      task.completed = completed;
      showToast('Task updated successfully', 'success');
    }
  } else {
    // Add new task
    const newTask = {
      id: Date.now().toString(),
      title,
      priority,
      dueDate,
      completed
    };
    state.tasks.unshift(newTask);
    showToast('New task added', 'success');
  }

  saveTasks();
  closeModal();
  renderAll();
}

// Bulk Actions
function bulkMarkComplete() {
  state.tasks.forEach(t => {
    if (state.selectedTaskIds.has(t.id)) {
      t.completed = true;
    }
  });
  state.selectedTaskIds.clear();
  saveTasks();
  renderAll();
  showToast('Selected tasks marked as completed', 'success');
}

function bulkDelete() {
  const count = state.selectedTaskIds.size;
  if (!confirm(`Delete ${count} selected tasks?`)) return;

  state.tasks = state.tasks.filter(t => !state.selectedTaskIds.has(t.id));
  state.selectedTaskIds.clear();
  saveTasks();
  renderAll();
  showToast(`${count} tasks deleted`, 'info');
}

// Reset Demo Data
function resetDemoData() {
  if (confirm('Reset all tasks to the original demo data matching the reference image?')) {
    state.tasks = getInitialTasks();
    state.selectedTaskIds.clear();
    saveTasks();
    renderAll();
    showToast('Reset to demo dataset successfully', 'success');
  }
}

// Export Tasks to JSON file
function exportTasksJson() {
  const jsonStr = JSON.stringify(state.tasks, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `task-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Exported tasks to JSON', 'info');
}

// --- Toast Notifications ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

// --- Setup Event Listeners ---
function setupEventListeners() {
  const on = (id, event, handler) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  };

  // Modal buttons
  on('btnOpenAddModal', 'click', openAddModal);
  on('btnEmptyAdd', 'click', openAddModal);
  on('btnModalClose', 'click', closeModal);
  on('btnModalCancel', 'click', closeModal);
  on('taskForm', 'submit', handleFormSubmit);

  // Close modal on backdrop click
  const taskModal = document.getElementById('taskModal');
  if (taskModal) {
    taskModal.addEventListener('click', (e) => {
      if (e.target.id === 'taskModal') closeModal();
    });
  }

  // Close modal on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && taskModal && taskModal.classList.contains('open')) {
      closeModal();
    }
  });

  // Toolbar actions
  on('btnResetDemo', 'click', resetDemoData);
  on('btnExportJson', 'click', exportTasksJson);

  // Search input
  const searchInput = document.getElementById('taskSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderTable();
    });
  }

  // Priority filter dropdown
  const priorityFilter = document.getElementById('priorityFilterSelect');
  if (priorityFilter) {
    priorityFilter.addEventListener('change', (e) => {
      state.priorityFilter = e.target.value;
      renderTable();
    });
  }

  // Segmented Tabs navigation
  const tabsContainer = document.getElementById('viewTabsContainer');
  if (tabsContainer) {
    tabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;

      tabsContainer.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      state.activeTab = btn.dataset.tab;
      renderTable();
    });
  }

  // Table clicks (Status toggle, Edit, Delete, Checkbox select)
  const tableBody = document.getElementById('taskTableBody');
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('button[data-action]');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        const id = actionBtn.dataset.id;
        if (action === 'toggle-status') toggleTaskStatus(id);
        else if (action === 'edit') openEditModal(id);
        else if (action === 'delete') deleteTask(id);
        return;
      }

      const rowCheckbox = e.target.closest('.row-select');
      if (rowCheckbox) {
        const id = rowCheckbox.dataset.id;
        if (rowCheckbox.checked) {
          state.selectedTaskIds.add(id);
        } else {
          state.selectedTaskIds.delete(id);
        }
        const tasks = getFilteredAndSortedTasks();
        const allSelected = tasks.length > 0 && tasks.every(t => state.selectedTaskIds.has(t.id));
        const selectAll = document.getElementById('selectAllCheckbox');
        if (selectAll) selectAll.checked = allSelected;
        updateBulkActionsBar();
      }
    });
  }

  // Select All checkbox
  const selectAll = document.getElementById('selectAllCheckbox');
  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      const tasks = getFilteredAndSortedTasks();
      if (e.target.checked) {
        tasks.forEach(t => state.selectedTaskIds.add(t.id));
      } else {
        tasks.forEach(t => state.selectedTaskIds.delete(t.id));
      }
      renderTable();
    });
  }

  // Table Column Header Sorting
  const sortHeaders = document.querySelectorAll('.task-table th.sortable');
  sortHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (state.sortColumn === col) {
        state.sortAscending = !state.sortAscending;
      } else {
        state.sortColumn = col;
        state.sortAscending = true;
      }
      renderTable();
    });
  });

  // Bulk buttons
  on('btnBulkComplete', 'click', bulkMarkComplete);
  on('btnBulkDelete', 'click', bulkDelete);
  on('btnBulkCancel', 'click', () => {
    state.selectedTaskIds.clear();
    renderTable();
  });
}

// Start app on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initApp);
