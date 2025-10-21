document.addEventListener("DOMContentLoaded", () => {
  const filterBtn = document.getElementById("filterBtn");
  const typeSelect = document.getElementById("type");
  const rows = document.querySelectorAll("#transactionTable tbody tr");

  // Lọc giao dịch
  filterBtn.addEventListener("click", () => {
    const type = typeSelect.value;
    rows.forEach(row => {
      if (!type || row.dataset.type === type) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
  // Giả lập xuất PDF
  document.getElementById("exportPDF").addEventListener("click", () => {
    alert("📄 Xuất dữ liệu sang PDF (demo)");
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const toggleThemeBtn = document.querySelector(".toggle-theme");
  const body = document.body;

  // Kiểm tra chế độ được lưu
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark-mode");
    toggleThemeBtn.textContent = "☀️ Chế độ sáng";
  }

  toggleThemeBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const isDark = body.classList.contains("dark-mode");
    toggleThemeBtn.textContent = isDark ? "☀️ Chế độ sáng" : "🌙 Chế độ tối";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});