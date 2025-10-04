console.log("Resetpass.js loaded!");


const form = document.getElementById("registerForm");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", function (e) {
  if (password.value !== confirmPassword.value) {
    e.preventDefault();
    errorMsg.textContent = "Mật khẩu xác nhận không khớp!";
    confirmPassword.classList.add("is-invalid");
  } else {
    e.preventDefault(); // Ngăn form load lại trang
    errorMsg.textContent = "";
    confirmPassword.classList.remove("is-invalid");

    alert("Đổi mật khẩu thành công!"); // ✅ thông báo

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  }
});
