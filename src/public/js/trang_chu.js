// js/trang_chu.js

document.addEventListener('DOMContentLoaded', () => {
  // Hàm để lấy dữ liệu thống kê từ API của bạn và hiển thị
  async function loadDashboardStats() {
    try {
      // Giả sử bạn có API trả về dữ liệu thống kê
      const response = await fetch('/api/statistics');
      const stats = await response.json();

      // Cập nhật các con số trên giao diện
      document.getElementById('total-spending').textContent = `${stats.totalSpending.toLocaleString()}₫`;
      document.getElementById('total-categories').textContent = stats.categoryCount;
      document.getElementById('top-category').textContent = stats.topCategory || 'Chưa có';
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  }
  // loadDashboardStats(); // Bỏ comment khi bạn có API
});