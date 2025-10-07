document.addEventListener("DOMContentLoaded", () => {
  const mainContent = document.getElementById("main-content");

  async function loadPage(pageName) {
    mainContent.innerHTML = `
      <div class="text-center mt-5">
        <div class="spinner-border text-secondary" role="status"></div>
        <p class="mt-3">Đang tải nội dung...</p>
      </div>
    `;

    try {
      const res = await fetch(`/content/${pageName}`);
      if (!res.ok) throw new Error('Không tìm thấy trang!');
      const html = await res.text();
      mainContent.innerHTML = html;
      console.log("✅ Loaded:", pageName);
    } catch (err) {
      mainContent.innerHTML = `<p class="text-danger text-center mt-5">❌ ${err.message}</p>`;
    }
  }

  // Gắn sự kiện click cho menu
  // Event delegation: bắt tất cả click trên document
  document.addEventListener("click", (e) => {
    const item = e.target.closest(".chat-item[data-file]");
    if (!item) return; // nếu không phải menu thì bỏ qua

    e.preventDefault();

    // Xóa class active của tất cả menu
    document.querySelectorAll(".chat-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");

    // Lấy pageName từ data-file và load
    const pageName = item.getAttribute("data-file");
    loadPage(pageName);
  });


  // Load mặc định
  loadPage("trang_chu");
});
