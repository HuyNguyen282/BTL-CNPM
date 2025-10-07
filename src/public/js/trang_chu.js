document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");

  // Hàm tải trang HTML con 
  async function loadPage(page) {
    try {
      const res = await fetch(page);
      const html = await res.text();
      content.innerHTML = html;
    } catch (err) {
      content.innerHTML = "<p class='text-danger'>Không thể tải nội dung.</p>";
    }
  }

  // Khi mới vào -> hiển thị home
  loadPage("home.html");

  // Khi bấm vào logo
  const logo = document.querySelector(".navbar-brand");
  logo.addEventListener("click", (e) => {
    e.preventDefault();
    loadPage("home.html");
  });

  // Nếu sidebar có nút khác
  document.querySelectorAll(".sidebar-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = e.target.getAttribute("data-page");
      loadPage(page);
    });
  });
});
