
document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      // Lấy dữ liệu trực tiếp từ các thuộc tính data-* của nút
      const { id, name, amount, period, startDate, endDate, note } = this.dataset;

      // Điền dữ liệu lấy được vào form trong modal
      document.getElementById("editId").value = id;
      document.getElementById("editName").value = name;
      document.getElementById("editAmount").value = amount;

      // Cần thêm data-period vào nút edit trong EJS để dòng này hoạt động
      if (document.getElementById("editPeriod")) {
        document.getElementById("editPeriod").value = period;
      }

      document.getElementById("editStartDate").value = startDate;
      document.getElementById("editEndDate").value = endDate;
      document.getElementById("editNote").value = note || "";
    });
  });
});