// js/main.js (Phiên bản chuẩn)

document.addEventListener("DOMContentLoaded", () => {
          
            const bellBtn = document.getElementById("bellBtn");
            const notificationBox = document.getElementById("notificationBox");
            const notificationList = document.getElementById("notificationList");
            const userBtn = document.getElementById("userBtn");
            const userMenu = document.getElementById("userMenu");

            // Bấm chuông -> hiện thông báo
            if (bellBtn && notificationBox) {
              bellBtn.addEventListener("click", async (e) => {
                e.stopPropagation();
                notificationBox.classList.toggle("d-none");

                // Nếu bật hộp thì load thông báo
                if (!notificationBox.classList.contains("d-none")) {
                  const res = await fetch("/trang_chu/notification");
                  const data = await res.json();

                  notificationList.innerHTML = "";

                  if (data.notifyList && data.notifyList.length > 0) {
                    data.notifyList.forEach(n => {
                      const li = document.createElement("li");
                      li.classList.add("border-bottom", "py-1");
                      li.textContent = n.message;
                      notificationList.appendChild(li);
                    });
                  } else {
                    notificationList.innerHTML = "<li class='text-muted'>Không có thông báo mới</li>";
                  }
                }
              });
            }

            // Menu người dùng
            if (userBtn && userMenu) {
              userBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                userMenu.classList.toggle("d-none");
              });
            }

            // Click ra ngoài -> ẩn mọi popup
            document.addEventListener("click", (e) => {
              if (!notificationBox.classList.contains("d-none") &&
                !notificationBox.contains(e.target) &&
                !bellBtn.contains(e.target)) {
                notificationBox.classList.add("d-none");
              }
              if (!userMenu.classList.contains("d-none") &&
                !userMenu.contains(e.target) &&
                !userBtn.contains(e.target)) {
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

