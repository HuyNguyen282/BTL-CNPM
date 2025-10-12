// js/main.js (Phiên bản chuẩn)

document.addEventListener("DOMContentLoaded", () => {

  // ====== MENU AVATAR ======
  const userBtn = document.getElementById('userBtn');
  const userMenu = document.getElementById('userMenu');
  if (userBtn && userMenu) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.classList.toggle('d-none');
    });
    document.addEventListener('click', (e) => {
      if (!userMenu.classList.contains('d-none') && !userMenu.contains(e.target)) {
        userMenu.classList.add('d-none');
      }
    });
  }

  // ====== THÔNG BÁO ======
  const bellBtn = document.getElementById("bellBtn");
  const notificationBox = document.getElementById("notificationBox");
  if (bellBtn && notificationBox) {
    bellBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notificationBox.classList.toggle("d-none");
    });
    document.addEventListener("click", (e) => {
      if (!notificationBox.classList.contains("d-none") && !notificationBox.contains(e.target)) {
        notificationBox.classList.add("d-none");
      }
    });
    // (Tùy chọn) Bạn có thể thêm logic load thông báo từ API ở đây
  }

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

  // ====== XỬ LÝ ĐĂNG XUẤT ======
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function (e) {
      // 1. Ngăn chặn link chuyển trang ngay lập tức
      e.preventDefault();

      // 2. Hiện hộp thoại xác nhận
      const isConfirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất không?');

      // 3. Nếu người dùng bấm "OK", thì mới chuyển trang
      if (isConfirmed) {
        window.location.href = this.href;
      }
    });
  }

});