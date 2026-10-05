// =========================
// 1. Variables
// =========================
document.addEventListener("DOMContentLoaded", function () {
  let loaderInterval = null;
  let autoLogoutTimer = null;

  const AUTO_LOGOUT_TIME = 5 * 60 * 1000; // 5 minutes

  // =========================
  // 2. LOGIN ELEMENTS
  // =========================
  const loginForm = document.getElementById("loginForm");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const message = document.getElementById("message");
  const togglePassword = document.getElementById("togglePassword");
  const loginBtn = document.getElementById("loginBtn");

  // =========================
  // 3. LOADER ELEMENTS
  // =========================
  const pageLoader = document.getElementById("pageLoader");
  const loaderText = document.getElementById("loaderText");

  // =========================
  // 4. BUTTON LOADING
  // =========================
  function setButtonLoading(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.classList.add("loading");
      button.disabled = true;
    } else {
      button.classList.remove("loading");
      button.disabled = false;
    }
  }

  // =========================
  // 5. FULL PAGE LOADER
  // =========================
  function showLoader(text = "Processing...") {
    if (!pageLoader || !loaderText) return;
    loaderText.textContent = text;
    pageLoader.style.display = "flex";
  }

  function hideLoader() {
    if (pageLoader) {
      pageLoader.style.display = "none";
    }

    if (loaderInterval) {
      clearInterval(loaderInterval);
      loaderInterval = null;
    }
  }

  // =========================
  // 6. AUTO LOGOUT
  // =========================
  function resetAutoLogoutTimer() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) return;

    clearTimeout(autoLogoutTimer);

    autoLogoutTimer = setTimeout(() => {
      autoLogout();
    }, AUTO_LOGOUT_TIME);
  }

  function autoLogout() {
    sessionStorage.removeItem("isLoggedIn");
    hideLoader();
    stopAutoLogoutTracking();

    window.location.href = "index.html";
  }

  function startAutoLogoutTracking() {
    resetAutoLogoutTimer();

    document.addEventListener("mousemove", resetAutoLogoutTimer);
    document.addEventListener("keydown", resetAutoLogoutTimer);
    document.addEventListener("click", resetAutoLogoutTimer);
    document.addEventListener("scroll", resetAutoLogoutTimer);
    document.addEventListener("touchstart", resetAutoLogoutTimer);
  }

  function stopAutoLogoutTracking() {
    clearTimeout(autoLogoutTimer);

    document.removeEventListener("mousemove", resetAutoLogoutTimer);
    document.removeEventListener("keydown", resetAutoLogoutTimer);
    document.removeEventListener("click", resetAutoLogoutTimer);
    document.removeEventListener("scroll", resetAutoLogoutTimer);
    document.removeEventListener("touchstart", resetAutoLogoutTimer);
  }

  // =========================
  // 7. SHOW / HIDE PASSWORD
  // =========================
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      if (password.type === "password") {
        password.type = "text";
        togglePassword.textContent = "Hide";
      } else {
        password.type = "password";
        togglePassword.textContent = "Show";
      }
    });
  }

  // =========================
  // 8. LOGIN
  // =========================
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const userValue = username.value.trim();
      const passValue = password.value.trim();

      if (!userValue || !passValue) {
        message.textContent = "Please fill in all fields.";
        message.style.color = "red";
        return;
      }

      setButtonLoading(loginBtn, true);
      showLoader("Logging in...");

      const certificateUser = {
        username: "User_mitra",
        password: "Mitra@7777"
      };

      setTimeout(() => {
        if (
          userValue === certificateUser.username &&
          passValue === certificateUser.password
        ) {

          sessionStorage.setItem("isLoggedIn", "true");
          sessionStorage.setItem("appType", "certificate");

          message.textContent = "Login successful!";
          message.style.color = "green";

          setTimeout(() => {
            loginForm.reset();
            password.type = "password";
            if (togglePassword) togglePassword.textContent = "Show";
            message.textContent = "";
            hideLoader();
            setButtonLoading(loginBtn, false);

            window.location.href = "Vasundhara/mitra.html";
          }, 500);

        }
       
        else {
          hideLoader();
          message.textContent = "Invalid username or password.";
          message.style.color = "red";
          setButtonLoading(loginBtn, false);
        }
      }, 1000);
    });
  }

  function checkLoginState() {
    if (sessionStorage.getItem("isLoggedIn") !== "true") return;

    const appType = sessionStorage.getItem("appType");

    if (appType === "certificate") {
      window.location.href = "Vasundhara/mitra.html";
    } else if (appType === "birthday") {
      window.location.href = "birthday/birthday.html";
    }
  }
  // =========================
  // INITIAL PAGE CHECK
  // =========================
  checkLoginState();
});