const barCtx = document.getElementById("barChart");
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

// === Biểu đồ Tròn ===
const ctxPie = document.getElementById('pieChart');
if (ctxPie) {
  new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: ['Ăn uống', 'Mua sắm', 'Giải trí', 'Đi lại', 'Khác'],
      datasets: [{
        data: [35, 25, 15, 10, 15],
        backgroundColor: [
          '#198754', // xanh đậm Bootstrap
          '#FFC107', // vàng EggHead
          '#0D6EFD', // xanh nước biển
          '#DC3545', // đỏ
          '#6C757D'  // xám
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}
