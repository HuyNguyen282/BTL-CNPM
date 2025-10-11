// js/viewbud.js

document.addEventListener("DOMContentLoaded", function () {
  const budgetList = document.getElementById("budgetList");
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  const editForm = document.getElementById("editForm");
  let budgets = []; // Mảng để lưu dữ liệu từ server

  // Hàm lấy và hiển thị ngân sách từ API
  async function renderBudgets() {
    try {
      // Giả sử API của bạn là /api/budgets
      const response = await fetch('/api/budgets');
      budgets = await response.json();

      budgetList.innerHTML = "";
      if (budgets.length === 0) {
        budgetList.innerHTML = `<p class="text-center text-muted">Chưa có ngân sách nào.</p>`;
        return;
      }

      budgets.forEach((budget, index) => {
        const card = document.createElement("div");
        card.className = "col-md-4";
        card.innerHTML = `
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">${budget.name}</h5>
                            <p class="card-text">Số tiền: ${budget.amount.toLocaleString()} VND</p>
                            <button class="btn btn-primary btn-sm edit-btn" data-index="${index}">Sửa</button>
                            <button class="btn btn-danger btn-sm delete-btn" data-id="${budget.id}">Xóa</button>
                        </div>
                    </div>`;
        budgetList.appendChild(card);
      });
      attachEvents();
    } catch (error) {
      budgetList.innerHTML = `<p class="text-center text-danger">Lỗi tải dữ liệu.</p>`;
    }
  }

  function attachEvents() {
    // Sự kiện Xóa
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async function () {
        const budgetId = this.dataset.id;
        if (confirm("Bạn chắc chắn muốn xóa?")) {
          await fetch(`/api/budgets/${budgetId}`, { method: 'DELETE' });
          renderBudgets(); // Tải lại danh sách
        }
      });
    });

    // Sự kiện Sửa
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const index = this.dataset.index;
        const budget = budgets[index];
        document.getElementById("editIndex").value = budget.id;
        document.getElementById("editName").value = budget.name;
        document.getElementById("editAmount").value = budget.amount;
        //... điền các trường khác vào form
        editModal.show();
      });
    });
  }

  // Sự kiện submit form chỉnh sửa
  editForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const budgetId = document.getElementById("editIndex").value;
    const updatedData = {
      name: document.getElementById("editName").value,
      amount: parseFloat(document.getElementById("editAmount").value),
      //... lấy dữ liệu các trường khác
    };

    await fetch(`/api/budgets/${budgetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });

    editModal.hide();
    renderBudgets(); // Tải lại
  });

  renderBudgets();
});