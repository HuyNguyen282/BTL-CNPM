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