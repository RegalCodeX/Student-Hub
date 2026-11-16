const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const STORAGE_KEY = "studentHubData";
let data = loadData();
let currentFilter = "all";

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { tasks: [], notes: [], sessions: [], theme: "light" };
  } catch {
    return { tasks: [], notes: [], sessions: [], theme: "light" };
  }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}
function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function setView(name) {
  $$(".view").forEach(view => view.classList.toggle("active", view.id === `${name}View`));
  $$(".nav-item[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === name));
  $("#pageName").textContent = ({ dashboard:"Dashboard", tasks:"My Tasks", planner:"Study Planner", notes:"My Notes" })[name];
  $("#sidebar").classList.remove("open");
  if (name === "dashboard") renderDashboard();
  if (name === "tasks") renderTasks();
  if (name === "planner") renderSessions();
  if (name === "notes") renderNotes();
}
function renderStats() {
  const completed = data.tasks.filter(task => task.done).length;
  const pending = data.tasks.length - completed;
  $("#completedStat").textContent = completed;
  $("#pendingStat").textContent = pending;
  $("#notesStat").textContent = data.notes.length;
  $("#rateStat").textContent = data.tasks.length ? Math.round(completed / data.tasks.length * 100) + "%" : "0%";
  $("#navTaskCount").textContent = pending;
  $("#taskTotal").textContent = `${data.tasks.length} task${data.tasks.length === 1 ? "" : "s"}`;
  $("#noteTotal").textContent = `${data.notes.length} note${data.notes.length === 1 ? "" : "s"}`;
}
function taskMarkup(task) {
  return `<div class="task-row ${task.done ? "done" : ""}">
    <input class="task-check" type="checkbox" data-complete="${task.id}" ${task.done ? "checked" : ""} aria-label="Mark ${escapeHTML(task.title)} complete">
    <div class="task-info"><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(task.category)} · ${formatDate(task.date)}</small></div>
    <span class="priority ${task.priority.toLowerCase()}">${escapeHTML(task.priority)}</span>
    <button class="delete-btn" data-delete-task="${task.id}" aria-label="Delete task">×</button>
  </div>`;
}
function renderDashboard() {
  renderStats();
  const tasks = data.tasks.filter(task => !task.done).slice().sort((a,b) => (a.date || "9999").localeCompare(b.date || "9999")).slice(0,4);
  $("#dashboardTasks").innerHTML = tasks.length ? tasks.map(taskMarkup).join("") : '<div class="empty-state">You’re all caught up. Add a task when you’re ready ✨</div>';
}
function renderTasks() {
  renderStats();
  const filtered = data.tasks.filter(task => currentFilter === "all" || (currentFilter === "completed" ? task.done : !task.done));
  $("#allTasks").innerHTML = filtered.length ? filtered.map(taskMarkup).join("") : '<div class="empty-state">Nothing here yet. Add a task to get started.</div>';
}
function renderSessions() {
  const sessions = data.sessions.slice().sort((a,b) => (a.date + a.time).localeCompare(b.date + b.time));
  $("#sessionsList").innerHTML = sessions.length ? sessions.map(session => {
    const date = new Date(session.date + "T00:00:00");
    return `<div class="session-item"><div class="session-date"><strong>${date.getDate()}</strong>${date.toLocaleDateString(undefined,{month:"short"}).toUpperCase()}</div><div style="flex:1"><strong>${escapeHTML(session.subject)}</strong><small>${escapeHTML(session.time)} · ${escapeHTML(session.duration)}</small></div><button class="delete-btn" data-delete-session="${session.id}" aria-label="Delete session">×</button></div>`;
  }).join("") : '<div class="empty-state">No study sessions planned yet.</div>';
}
function renderNotes() {
  renderStats();
  $("#notesGrid").innerHTML = data.notes.length ? data.notes.slice().reverse().map(note => `<article class="note-card"><div class="note-card-head"><h4>${escapeHTML(note.title)}</h4><button class="delete-btn" data-delete-note="${note.id}" aria-label="Delete note">×</button></div><p>${escapeHTML(note.body)}</p><small>${formatDate(note.created)}</small></article>`).join("") : '<div class="empty-state">Your saved notes will appear here.</div>';
}
function openTaskModal() {
  $("#taskModal").classList.add("open");
  $("#taskModal").setAttribute("aria-hidden", "false");
  $("#taskTitle").focus();
}
function closeTaskModal() {
  $("#taskModal").classList.remove("open");
  $("#taskModal").setAttribute("aria-hidden", "true");
}

$$(".nav-item[data-view]").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
$$("[data-view-link]").forEach(button => button.addEventListener("click", () => setView(button.dataset.viewLink)));
$$("[data-open-task]").forEach(button => button.addEventListener("click", openTaskModal));
$("#closeModal").addEventListener("click", closeTaskModal);
$("#taskModal").addEventListener("click", event => { if (event.target === $("#taskModal")) closeTaskModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeTaskModal(); });
$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

$("#taskForm").addEventListener("submit", event => {
  event.preventDefault();
  data.tasks.push({ id:uid(), title:$("#taskTitle").value.trim(), date:$("#taskDate").value, priority:$("#taskPriority").value, category:$("#taskCategory").value, done:false });
  saveData(); event.target.reset(); closeTaskModal(); renderDashboard(); showToast("Task added to your list.");
});
$("#sessionForm").addEventListener("submit", event => {
  event.preventDefault();
  data.sessions.push({ id:uid(), subject:$("#sessionSubject").value.trim(), date:$("#sessionDate").value, time:$("#sessionTime").value, duration:$("#sessionDuration").value });
  saveData(); event.target.reset(); renderSessions(); showToast("Study session planned.");
});
$("#noteForm").addEventListener("submit", event => {
  event.preventDefault();
  data.notes.push({ id:uid(), title:$("#noteTitle").value.trim(), body:$("#noteBody").value.trim(), created:new Date().toISOString().slice(0,10) });
  saveData(); event.target.reset(); renderNotes(); showToast("Note saved successfully.");
});
$$(".filter-btn").forEach(button => button.addEventListener("click", () => {
  currentFilter = button.dataset.filter;
  $$(".filter-btn").forEach(item => item.classList.toggle("active", item === button));
  renderTasks();
}));
document.addEventListener("change", event => {
  if (event.target.matches("[data-complete]")) {
    const task = data.tasks.find(item => item.id === event.target.dataset.complete);
    if (task) task.done = event.target.checked;
    saveData(); renderDashboard(); renderTasks();
  }
});
document.addEventListener("click", event => {
  const taskId = event.target.closest("[data-delete-task]")?.dataset.deleteTask;
  const noteId = event.target.closest("[data-delete-note]")?.dataset.deleteNote;
  const sessionId = event.target.closest("[data-delete-session]")?.dataset.deleteSession;
  if (taskId) { data.tasks = data.tasks.filter(item => item.id !== taskId); saveData(); renderDashboard(); renderTasks(); showToast("Task deleted."); }
  if (noteId) { data.notes = data.notes.filter(item => item.id !== noteId); saveData(); renderNotes(); showToast("Note deleted."); }
  if (sessionId) { data.sessions = data.sessions.filter(item => item.id !== sessionId); saveData(); renderSessions(); showToast("Study session deleted."); }
});
function applyTheme() {
  document.body.classList.toggle("dark", data.theme === "dark");
  $("#themeIcon").textContent = data.theme === "dark" ? "☀" : "☾";
}
$("#themeToggle").addEventListener("click", () => {
  data.theme = data.theme === "dark" ? "light" : "dark";
  saveData(); applyTheme(); showToast(`${data.theme === "dark" ? "Dark" : "Light"} theme enabled.`);
});

$("#todayLabel").textContent = new Date().toLocaleDateString(undefined, { weekday:"short", month:"short", day:"numeric" });
$("#sessionDate").value = new Date().toISOString().slice(0,10);
applyTheme();
renderDashboard();
