// === Biểu đồ Cột ===
const barCtx = document.getElementById("barChart");
if (barCtx) {
  new Chart(barCtx, {
    type: "bar",
    data: {
      labels: ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6"],
      datasets: [
        {
          label: "Thu nhập (triệu VNĐ)",
          data: [15, 17, 14, 19, 22, 20],
          backgroundColor: "#4BC0C0",
        },
        {
          label: "Chi tiêu (triệu VNĐ)",
          data: [10, 12, 9, 15, 16, 18],
          backgroundColor: "#FF6384",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Số tiền (triệu VNĐ)",
          },
        },
      },
    },
  });
}

// === Biểu đồ Tròn ===
const ctxPie = document.getElementById("pieChart");
if (ctxPie) {
  new Chart(ctxPie, {
    type: "pie",
    data: {
      labels: ["Ăn uống", "Mua sắm", "Giải trí", "Đi lại", "Khác"],
      datasets: [
        {
          data: [35, 25, 15, 10, 15],
          backgroundColor: [
            "#198754",
            "#FFC107",
            "#0D6EFD",
            "#DC3545",
            "#6C757D",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
    },
  });
}

// === Hiển thị menu thông báo & người dùng ===
document.addEventListener("DOMContentLoaded", () => {
  // Thông báo
  const bellBtn = document.getElementById("bellBtn");
  const notificationBox = document.getElementById("notificationBox");

  if (bellBtn && notificationBox) {
    bellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notificationBox.classList.toggle("d-none");
    });
  }

  // Menu người dùng
  const userBtn = document.getElementById("userBtn");
  const userMenu = document.getElementById("userMenu");

  if (userBtn && userMenu) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("d-none");
    });
  }

  // Ẩn khi click ra ngoài
  document.addEventListener("click", (e) => {
    if (notificationBox && !notificationBox.contains(e.target) && !bellBtn.contains(e.target)) {
      notificationBox.classList.add("d-none");
    }
    if (userMenu && !userMenu.contains(e.target) && !userBtn.contains(e.target)) {
      userMenu.classList.add("d-none");
    }
  });
});
  // ====== SIDEBAR TOGGLE (THU GỌN) ======
  const toggleBtn = document.querySelector('.toggle-btn');
  const sidebar = document.querySelector('.sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // ====== SIDEBAR SUBMENU (MENU CON) ======
  document.querySelectorAll(".has-submenu").forEach(parent => {
    parent.addEventListener("click", function (e) {
      if (this.getAttribute('href') === '#') {
        e.preventDefault();
      }
      const submenu = this.nextElementSibling;
      if (submenu && submenu.classList.contains('submenu')) {
        submenu.style.display = (submenu.style.display === "block") ? "none" : "block";
      }
    });
  });
