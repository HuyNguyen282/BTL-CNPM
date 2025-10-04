// Toggle hiển thị mật khẩu trong login-form
window.addEventListener("load", function () {
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    const showPasswordIcon = loginForm.querySelector(".show-password");
    const inputPassword = loginForm.querySelector('input[type="password"]');

    if (showPasswordIcon && inputPassword) {
      showPasswordIcon.addEventListener("click", function () {
        inputPassword.type = inputPassword.type === "password" ? "text" : "password";
      });
    }
  }
});


/**
 * Kiểm tra email hợp lệ
/** */
function isValidEmail(email) {
 
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return re.test(String(email).trim().toLowerCase());
}

document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.querySelector('.form__input');
  const errorText = document.querySelector('.form__error');
  const errorIcon = document.querySelector('.form__input-icon-error');
  const submitBtn = document.querySelector('.auth__btn');
  const form = emailInput ? emailInput.closest('form') : null;

  // Hiển thị lỗi
  function showError(msg) {
    if (errorText) {
      errorText.textContent = msg;
      errorText.classList.add('active'); // bạn có thể dùng class .active để hiện lỗi
    }
    if (errorIcon) errorIcon.style.visibility = 'visible';
    if (emailInput) emailInput.classList.add('is-invalid');
  }

  // Xóa lỗi
  function clearError() {
    if (errorText) {
      errorText.textContent = '';
      errorText.classList.remove('active');
    }
    if (errorIcon) errorIcon.style.visibility = 'hidden';
    if (emailInput) emailInput.classList.remove('is-invalid');
  }

  // Kiểm tra realtime khi user gõ
  if (emailInput) {
    // ẩn icon lỗi ban đầu
    if (errorIcon) errorIcon.style.visibility = 'hidden';

    emailInput.addEventListener('input', () => {
      const val = emailInput.value;
      if (!val) {
        clearError();
        return;
      }
      if (isValidEmail(val)) {
        clearError();
      } else {
        showError('Email không hợp lệ');
      }
    });

    // optional: blur để bắt lỗi khi rời input
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value;
      if (val && !isValidEmail(val)) {
        showError('Email không hợp lệ');
      }
    });
  }

  // Bắt sự kiện submit form
  if (form) {
    form.addEventListener('submit', (e) => {
      const val = emailInput ? emailInput.value : '';
      if (!val || !isValidEmail(val)) {
        e.preventDefault();
        showError('Vui lòng nhập email hợp lệ trước khi tiếp tục');
        // focus lại input
        if (emailInput) emailInput.focus();
      } else {
        // email hợp lệ -> cho submit tiếp (hoặc gọi API)
        clearError();
      }
    });
  } else if (submitBtn) {
    // Nếu bạn không có form mà chỉ dùng button
    submitBtn.addEventListener('click', (e) => {
      const val = emailInput ? emailInput.value : '';
      if (!val || !isValidEmail(val)) {
        e.preventDefault();
        showError('Vui lòng nhập email hợp lệ');
        if (emailInput) emailInput.focus();
      } else {
        clearError();
        // thực hiện submit manual nếu cần
      }
    });
  }
});
