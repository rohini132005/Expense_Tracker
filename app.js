const STORAGE_KEY = "expenseTrackerItems";
let expenses = [];
let editingModal;

const expenseForm = document.getElementById("expenseForm");
const expenseName = document.getElementById("expenseName");
const expenseAmount = document.getElementById("expenseAmount");
const expenseCategory = document.getElementById("expenseCategory");
const expenseDate = document.getElementById("expenseDate");
const expenseList = document.getElementById("expenseList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const formMessage = document.getElementById("formMessage");

function todayLocalDate() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2
  }).format(amount);
}

function saveExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error("Could not save expenses:", error);
    showMessage("Could not save to local storage in this browser.", "danger");
  }
}

function showMessage(message, type = "success") {
  formMessage.className = `small mt-3 mb-0 text-${type}`;
  formMessage.textContent = message;
}

function getFilteredExpenses() {
  const query = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  return expenses.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query);
    const matchesCategory = !category || expense.category === category;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

function makeCell(text, className = "") {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function renderExpenses() {
  expenseList.replaceChildren();
  const filtered = getFilteredExpenses();

  filtered.forEach(expense => {
    const row = document.createElement("tr");
    row.appendChild(makeCell(expense.name));

    const categoryCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge rounded-pill category-badge";
    badge.textContent = expense.category;
    categoryCell.appendChild(badge);
    row.appendChild(categoryCell);

    row.appendChild(makeCell(expense.date));
    row.appendChild(makeCell(formatMoney(expense.amount), "text-end amount-cell"));

    const actions = document.createElement("td");
    actions.className = "text-end text-nowrap";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-btn edit";
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", `Edit ${expense.name}`);
    editButton.addEventListener("click", () => openEditModal(expense.id));

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-btn delete";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete ${expense.name}`);
    deleteButton.addEventListener("click", () => deleteExpense(expense.id));

    actions.append(editButton, deleteButton);
    row.appendChild(actions);
    expenseList.appendChild(row);
  });

  emptyState.classList.toggle("d-none", filtered.length > 0);
  document.getElementById("visibleCount").textContent =
    `${filtered.length} expense${filtered.length === 1 ? "" : "s"} shown`;
  document.getElementById("filteredTotal").textContent =
    formatMoney(filtered.reduce((sum, expense) => sum + expense.amount, 0));

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const largest = expenses.reduce((max, expense) => Math.max(max, expense.amount), 0);
  document.getElementById("totalAmount").textContent = formatMoney(total);
  document.getElementById("expenseCount").textContent = String(expenses.length);
  document.getElementById("largestExpense").textContent = formatMoney(largest);
}

function validateExpense(name, amount, category, date) {
  return name.trim().length > 0 &&
    Number.isFinite(amount) && amount > 0 &&
    category.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(date);
}

expenseDate.value = todayLocalDate();

expenseForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = expenseName.value.trim();
  const amount = Number(expenseAmount.value);
  const category = expenseCategory.value;
  const date = expenseDate.value;

  if (!validateExpense(name, amount, category, date)) {
    expenseForm.classList.add("was-validated");
    showMessage("Please fill in all fields with valid values.", "danger");
    return;
  }

  expenses.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    amount: Math.round(amount * 100) / 100,
    category,
    date,
    createdAt: Date.now()
  });

  saveExpenses();
  renderExpenses();
  expenseForm.reset();
  expenseDate.value = todayLocalDate();
  expenseForm.classList.remove("was-validated");
  showMessage("Expense added successfully.");
  expenseName.focus();
});

function deleteExpense(id) {
  const expense = expenses.find(item => item.id === id);
  if (!expense) return;
  if (!window.confirm(`Delete "${expense.name}"?`)) return;

  expenses = expenses.filter(item => item.id !== id);
  saveExpenses();
  renderExpenses();
  showMessage("Expense deleted.");
}

function openEditModal(id) {
  const expense = expenses.find(item => item.id === id);
  if (!expense) return;

  document.getElementById("editExpenseId").value = expense.id;
  document.getElementById("editExpenseName").value = expense.name;
  document.getElementById("editExpenseAmount").value = expense.amount;
  document.getElementById("editExpenseCategory").value = expense.category;
  document.getElementById("editExpenseDate").value = expense.date;

  editingModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("editModal"));
  editingModal.show();
}

document.getElementById("editForm").addEventListener("submit", event => {
  event.preventDefault();

  const id = document.getElementById("editExpenseId").value;
  const name = document.getElementById("editExpenseName").value.trim();
  const amount = Number(document.getElementById("editExpenseAmount").value);
  const category = document.getElementById("editExpenseCategory").value;
  const date = document.getElementById("editExpenseDate").value;

  if (!validateExpense(name, amount, category, date)) {
    event.target.reportValidity();
    return;
  }

  expenses = expenses.map(expense => expense.id === id ? {
    ...expense, name, amount: Math.round(amount * 100) / 100, category, date
  } : expense);

  saveExpenses();
  renderExpenses();
  editingModal.hide();
  showMessage("Expense updated successfully.");
});

searchInput.addEventListener("input", renderExpenses);
categoryFilter.addEventListener("change", renderExpenses);

document.getElementById("clearAllBtn").addEventListener("click", () => {
  if (expenses.length === 0) {
    showMessage("There are no expenses to clear.", "secondary");
    return;
  }

  if (!window.confirm("Delete all expenses? This cannot be undone.")) return;
  expenses = [];
  saveExpenses();
  renderExpenses();
  showMessage("All expenses cleared.");
});

// The assignment says restoring expenses after a page reload is not required yet.
// So this app intentionally starts with an empty in-memory list.
renderExpenses();
