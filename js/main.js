document.addEventListener("DOMContentLoaded", () => {
  // ====== MENU AVATAR ======
  const userBtn = document.getElementById('userBtn');
  const userMenu = document.getElementById('userMenu');

// ====== THÔNG BÁO ======
const bellBtn = document.getElementById("bellBtn");
const notificationBox = document.getElementById("notificationBox");
const notificationList = document.getElementById("notificationList");
const notifyCount = document.getElementById("notifyCount");

if (bellBtn) {
  // Bấm vào chuông => hiện/ẩn box
  bellBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // tránh lan ra ngoài
    notificationBox.classList.toggle("d-none");
  });

  // Bấm ra ngoài => ẩn box
  document.addEventListener("click", (e) => {
    if (
      !notificationBox.classList.contains("d-none") &&
      !notificationBox.contains(e.target) &&
      !bellBtn.contains(e.target)
    ) {
      notificationBox.classList.add("d-none");
    }
  });

  // Load thông báo
  async function loadNotifications() {
    try {
      const res = await fetch("http://localhost:3000/api/notifications");
      const data = await res.json();

      notifyCount.textContent = data.length;
      notificationList.innerHTML = data.map(item => `
        <li class="border-bottom py-2">
          <strong>${item.title}</strong><br>
          <small class="text-muted">${item.time}</small>
        </li>
      `).join("");
    } catch (err) {
      console.error("Lỗi load thông báo:", err);
    }
  }

  loadNotifications();
}


  // ====== MENU AVATAR ======
  function toggleMenu() {
    const shown = !userMenu.classList.contains('d-none');
    if (shown) {
      userMenu.classList.add('d-none');
      userBtn.setAttribute('aria-expanded', 'false');
    } else {
      userMenu.classList.remove('d-none');
      userBtn.setAttribute('aria-expanded', 'true');
    }
  }

  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  document.addEventListener('click', (e) => {
    if (!userMenu.classList.contains('d-none') &&
        !userMenu.contains(e.target) &&
        !userBtn.contains(e.target)) {
      userMenu.classList.add('d-none');
      userBtn.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !userMenu.classList.contains('d-none')) {
      userMenu.classList.add('d-none');
      userBtn.setAttribute('aria-expanded', 'false');
      userBtn.focus();
    }
  });

  document.getElementById('viewProfile').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Loading hồ sơ...');
  });

  document.getElementById('settings').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Mở cài đặt...');
  });

  document.getElementById('logout').addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Bạn có chắc muốn đăng xuất không?')) {
      alert('Đã đăng xuất (demo)');
    }
  });

  // ====== SIDEBAR TOGGLE ======
  const toggleBtn = document.querySelector('.toggle-btn');
  const sidebar = document.querySelector('.sidebar');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  // ====== LOAD NỘI DUNG ======
  const mainContent = document.querySelector('.content');

  document.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      document.querySelectorAll('.chat-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const fileName = item.getAttribute('data-file');
      if (!fileName) return;

      mainContent.innerHTML = `
        <div class="text-center mt-5">
          <div class="spinner-border text-secondary" role="status"></div>
          <p class="mt-3">Đang tải nội dung...</p>
        </div>
      `;

      try {
        const res = await fetch(fileName);
        if (!res.ok) throw new Error('Không tìm thấy file!');
        const html = await res.text();
        mainContent.innerHTML = html;
      } catch (err) {
        mainContent.innerHTML = `<p class="text-danger text-center mt-5">❌ Lỗi tải nội dung: ${err.message}</p>`;
      }
    });
  });

  // ====== LOAD TRANG CHỦ MẶC ĐỊNH ======
  loadPage("trang_chu.html");

  // ====== LOGO CLICK ======
  const logo = document.querySelector(".navbar-brand");
  logo.addEventListener("click", (e) => {
    e.preventDefault();
    loadPage("trang_chu.html");
  });
});

async function loadPage(fileName) {
  const mainContent = document.querySelector('.content');
  if (!mainContent) return;

  mainContent.innerHTML = `
    <div class="text-center mt-5">
      <div class="spinner-border text-secondary" role="status"></div>
      <p class="mt-3">Đang tải nội dung...</p>
    </div>
  `;

  try {
    const res = await fetch(fileName);
    if (!res.ok) throw new Error('Không tìm thấy file!');
    const html = await res.text();
    mainContent.innerHTML = html;
  } catch (err) {
    mainContent.innerHTML = `<p class="text-danger text-center mt-5">❌ Lỗi tải nội dung: ${err.message}</p>`;
  }
}

