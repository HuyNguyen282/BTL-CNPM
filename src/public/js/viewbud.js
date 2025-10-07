document.addEventListener("DOMContentLoaded", function() {
  const budgetList = document.getElementById("budgetList");
  let budgets = JSON.parse(localStorage.getItem("budgets")) || [];

  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  const editForm = document.getElementById("editForm");

  function renderBudgets() {
    budgetList.innerHTML = "";

    if (budgets.length === 0) {
      budgetList.innerHTML = `<p class="text-center text-muted">Chưa có ngân sách nào được thêm.</p>`;
      return;
    }

    budgets.forEach((budget, index) => {
      const card = document.createElement("div");
      card.className = "col-md-4";

      card.innerHTML = `
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body">
            <h5 class="card-title text-primary">${budget.name}</h5>
            <p class="card-text mb-1"><strong>Số tiền:</strong> ${budget.amount.toLocaleString()} VND</p>
            <p class="card-text mb-1"><strong>Chu kỳ:</strong> ${budget.period}</p>
            <p class="card-text mb-1"><strong>Bắt đầu:</strong> ${budget.startDate}</p>
            ${budget.note ? `<p class="card-text"><em>${budget.note}</em></p>` : ""}
            <div class="d-flex justify-content-between mt-3">
              <button class="btn btn-outline-primary btn-sm edit-btn" data-index="${index}">Chỉnh sửa</button>
              <button class="btn btn-outline-danger btn-sm delete-btn" data-index="${index}">Xóa</button>
            </div>
          </div>
        </div>
      `;

      budgetList.appendChild(card);
    });

    attachEvents();
  }

  function attachEvents() {
    // Nút xóa
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", function() {
        const idx = this.getAttribute("data-index");
        if (confirm("Bạn có chắc muốn xóa ngân sách này không?")) {
          budgets.splice(idx, 1);
          localStorage.setItem("budgets", JSON.stringify(budgets));
          renderBudgets();
        }
      });
    });

    // Nút chỉnh sửa
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", function() {
        const idx = this.getAttribute("data-index");
        const budget = budgets[idx];

        document.getElementById("editIndex").value = idx;
        document.getElementById("editName").value = budget.name;
        document.getElementById("editAmount").value = budget.amount;
        document.getElementById("editPeriod").value = budget.period;
        document.getElementById("editStartDate").value = budget.startDate;
        document.getElementById("editNote").value = budget.note || "";

        editModal.show();
      });
    });
  }

  // Lưu thay đổi khi chỉnh sửa
  editForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const idx = document.getElementById("editIndex").value;
    budgets[idx] = {
      name: document.getElementById("editName").value,
      amount: parseFloat(document.getElementById("editAmount").value),
      period: document.getElementById("editPeriod").value,
      startDate: document.getElementById("editStartDate").value,
      note: document.getElementById("editNote").value
    };

    localStorage.setItem("budgets", JSON.stringify(budgets));
    editModal.hide();
    renderBudgets();
  });

  renderBudgets();
});
