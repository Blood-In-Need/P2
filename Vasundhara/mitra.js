document.addEventListener("DOMContentLoaded", function () {
  if (sessionStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "../index.html";
    return;
  }
  let cropper = null;
  let croppedImageURL = "";
  let loaderInterval = null;
  let autoLogoutTimer = null;

  const AUTO_LOGOUT_TIME = 5 * 60 * 1000; // 5 minutes


  // =========================
  // APP ELEMENTS
  // =========================
  const logoutBtn = document.getElementById("logoutBtn");
  const photoInput = document.getElementById("photo-input");
  const cropModal = document.getElementById("cropModal");
  const cropImage = document.getElementById("crop-image");
  const donorPhoto = document.getElementById("donor-photo");
  const saveCropBtn = document.getElementById("saveCropBtn");
  const cancelCropBtn = document.getElementById("cancelCropBtn");
  const generateBtn = document.getElementById("generateBtn");

  const donorName = document.getElementById("donor-name");
  const locationInput = document.getElementById("location");
    const location1Input = document.getElementById("location1");

  // =========================
  // CERTIFICATE ELEMENTS
  // =========================
  const certificate = document.getElementById("certificate-container");
  const certName = document.getElementById("cert-name");
  const certLocation = document.getElementById("cert-location");
    const certLocation1 = document.getElementById("cert-location1");

  // =========================
  // LOADER ELEMENTS
  // =========================
  const pageLoader = document.getElementById("pageLoader");
  const loaderText = document.getElementById("loaderText");

  // =========================
  // Toggle Button
  // =========================
  let selectedLanguage = "Sevak";

  const switchBox = document.querySelector(".language-switch");
  const langButtons = document.querySelectorAll(".lang-option");

  langButtons.forEach((button) => {
    button.addEventListener("click", function () {

      selectedLanguage = this.dataset.lang;

      langButtons.forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");

      if (selectedLanguage === "hindi") {
        switchBox.classList.add("hindi");
      } else {
        switchBox.classList.remove("hindi");
      }

    });
  });

  /*const certificateMessages = {

    marathi: `
        <p>
            जगदगुरु श्रीमद रामानंदाचार्य नरेंद्राचार्यजी <br>
            यांच्या <span class="highlight-red">"तुम्ही जगा, दुसऱ्याला जगवा"</span><br>
            या दिव्य शिकवणीला अनुसरून आपण<br>
            गुरुदक्षिणारूपी अर्पण म्हणून <span class="highlight-red">"ऋणानुबंध"</span><br>
            अँप मध्ये <span id="cert-donor-count">${getValidatedDonorCount()}</span>
            नवीन रक्तदात्यांची नोंदणी करून<br>
            जीवनदानाच्या या पवित्र कार्यात मोलाचे<br>
            योगदान दिले आहे.
        </p>
    `,

    hindi: `
        <p>
            जगदगुरु श्रीमद् रामानंदाचार्य नरेंद्राचार्यजी की <br>
            दिव्य शिक्षा <span class="highlight-red">"तुम जिओ, दूसरों को जीवन दो"</span><br>
            का अनुसरण करते हुए, गुरुदक्षिणा स्वरूप <br>
            <span class="highlight-red">"ऋणानुबंध"</span> एपिके के माध्यम से <span id="cert-donor-count">${getValidatedDonorCount()}</span> नए <br>
            रक्तदाताओं का पंजीकरण कर जीवनदान के<br>
            इस पावन कार्य में अपना महत्वपूर्ण योगदान<br>
            दिया है।
        </p>
    `
  }; */

  // =========================
  // BUTTON LOADING
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
  // FULL PAGE LOADER
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

  function startCertificateLoaderMessages() {
    if (!loaderText) return;

    const messages = [
      "Preparing certificate...",
      "Adding details...",
      "Processing image...",
      "Finalizing certificate...",
      "Downloading certificate..."
    ];

    let index = 0;
    loaderText.textContent = messages[index];

    if (loaderInterval) clearInterval(loaderInterval);

    loaderInterval = setInterval(() => {
      index = (index + 1) % messages.length;
      loaderText.textContent = messages[index];
    }, 1200);
  }

  // =========================
  // AUTO LOGOUT
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

    stopAutoLogoutTracking();

    hideLoader();

    sessionStorage.removeItem("isLoggedIn");

    window.location.replace("../index.html");
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
  // LOGOUT ON REFRESH / TAB CLOSE
  // =========================
  window.addEventListener("beforeunload", function () {
    sessionStorage.removeItem("isLoggedIn");
  });
  // =========================
  // LOGOUT
  // =========================
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {

      setButtonLoading(logoutBtn, true);
      showLoader("Logging out...");

      setTimeout(() => {

        sessionStorage.removeItem("isLoggedIn");

        stopAutoLogoutTracking();

        hideLoader();

        window.location.href = "../index.html";

      }, 500);

    });
  }

  // =========================
  // PHOTO UPLOAD + CROP
  // =========================
  if (photoInput) {
    photoInput.addEventListener("change", function (e) {
      resetAutoLogoutTimer();

      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (event) {
        cropModal.style.display = "block";
        cropImage.src = event.target.result;

        if (cropper) cropper.destroy();

        cropper = new Cropper(cropImage, {
          aspectRatio: 300 / 300,
          viewMode: 2,
          autoCropArea: 0.8,
          movable: true,
          rotatable: true,
          scalable: true
        });
      };

      reader.readAsDataURL(file);
    });
  }

  if (saveCropBtn) {
    saveCropBtn.addEventListener("click", function () {
      resetAutoLogoutTimer();

      if (!cropper) return;

      const canvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300,
        fillColor: "#fff",
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high"
      });

      croppedImageURL = canvas.toDataURL("image/jpeg", 0.95);
      donorPhoto.src = croppedImageURL;
      cropModal.style.display = "none";

      cropper.destroy();
      cropper = null;
    });
  }

  if (cancelCropBtn) {
    cancelCropBtn.addEventListener("click", function () {
      resetAutoLogoutTimer();

      cropModal.style.display = "none";
      photoInput.value = "";

      if (cropper) {
        cropper.destroy();
        cropper = null;
      }
    });
  }

  // =========================
  // AUTO FIT CERTIFICATE NAME
  // =========================
  function autoFitCertificateName() {
    if (!certName) return;

    const maxFontSize = 70;
    const minFontSize = 70;
    let fontSize = maxFontSize;

    certName.style.fontSize = maxFontSize + "px";

    const availableWidth = certName.clientWidth;

    const temp = document.createElement("span");
    temp.style.position = "absolute";
    temp.style.visibility = "hidden";
    temp.style.whiteSpace = "nowrap";
    temp.style.fontFamily = window.getComputedStyle(certName).fontFamily;
    temp.style.fontWeight = window.getComputedStyle(certName).fontWeight;
    temp.style.wordSpacing = window.getComputedStyle(certName).wordSpacing;
    temp.textContent = certName.textContent;
    document.body.appendChild(temp);

    while (fontSize > minFontSize) {
      temp.style.fontSize = fontSize + "px";

      if (temp.offsetWidth <= availableWidth) {
        break;
      }

      fontSize--;
    }

    certName.style.fontSize = fontSize + "px";
    temp.remove();
  }
/*
  // =========================
  // DONOR COUNT - ONLY NUMERIC
  // =========================
  if (donorCountInput) {
    donorCountInput.addEventListener("input", function () {
      // Allow only English digits and Marathi digits
      this.value = this.value.replace(/[^\d०-९]/g, "");
    });

    // Optional: block spaces from keyboard
    donorCountInput.addEventListener("keydown", function (e) {
      if (e.key === " ") {
        e.preventDefault();
      }
    });
  }

  // =========================
  // GET DONOR COUNT
  // =========================
  function getValidatedDonorCount() {
    if (!donorCountInput) return "";

    const rawValue = donorCountInput.value.trim();

    if (!rawValue) return "";

    // Keep only English digits + Marathi digits
    const cleanedValue = rawValue.replace(/[^\d०-९]/g, "");

    return cleanedValue;
  }*/

  // =========================
  // FILL CERTIFICATE DATA
  // =========================
  function fillCertificateData() {

    const nameValue = donorName.value.trim();
    const locationValue = locationInput.value.trim();
    const location1Value = location1Input.value.trim();

    certName.textContent = nameValue;
    certLocation.textContent = locationValue;
    certLocation1.textContent = location1Value;

    /*const messageBox = document.getElementById("certificate-message");

    if (selectedLanguage === "marathi") {
      messageBox.innerHTML = certificateMessages.marathi;
    } else {
      messageBox.innerHTML = certificateMessages.hindi;
    }

    const donorCountSpan = document.getElementById("cert-donor-count");

    if (donorCountSpan) {
      donorCountSpan.textContent = donorCountValue;
    } */
  }

  // =========================
  // VALIDATE FORM
  // =========================
  function validateForm() {
    let isValid = true;

    // Donor name
    if (!donorName.value.trim()) {
      donorName.style.borderColor = "red";
      isValid = false;
    } else {
      donorName.style.borderColor = "#ccc";
    }

    // Location
    if (!locationInput.value.trim()) {
      locationInput.style.borderColor = "red";
      isValid = false;
    } else {
      locationInput.style.borderColor = "#ccc";
    }

    // Location1
    if (!location1Input.value.trim()) {
      location1Input.style.borderColor = "red";
      isValid = false;
    } else {
      location1Input.style.borderColor = "#ccc";
    }

    /*// Donor count 
    if (!donorCountInput.value.trim()) {
      donorCountInput.style.borderColor = "red";
      isValid = false;
    } else {
      donorCountInput.style.borderColor = "#ccc";
    } */

    // Photo
    if (!photoInput.files.length || !croppedImageURL) {
      photoInput.style.borderColor = "red";
      isValid = false;
    } else {
      photoInput.style.borderColor = "#ccc";
    }

    return isValid;
  }

  // =========================
  // HIDE CERTIFICATE AFTER DOWNLOAD
  // =========================
  function hideCertificateAfterDownload() {
    certificate.style.display = "none";
    certificate.style.position = "relative";
    certificate.style.left = "";
    certificate.style.top = "";
    certificate.style.visibility = "";
  }

  // =========================
  // GENERATE CERTIFICATE
  // =========================
  if (generateBtn) {
    generateBtn.addEventListener("click", function () {
      resetAutoLogoutTimer();

      const isValid = validateForm();

      /*if (!isValid) {
        alert("Please fill all required fields, donor count and crop the photo.");
        return;
      }*/

      setButtonLoading(generateBtn, true);
      showLoader("Preparing certificate...");
      startCertificateLoaderMessages();

      // Fill certificate data
      fillCertificateData();

      // Change certificate background based on selected language
      if (selectedLanguage === "hindi") {
        certificate.style.backgroundImage = "url('hindi-bg.png')";
      } else {
        certificate.style.backgroundImage = "url('Vasundhara_Mitra.png')";
      }

      certificate.style.backgroundSize = "cover";
      certificate.style.backgroundPosition = "center";
      certificate.style.backgroundRepeat = "no-repeat";

      // Show hidden certificate for rendering
      certificate.style.display = "block";
      certificate.style.position = "absolute";
      certificate.style.left = "-99999px";
      certificate.style.top = "0";
      certificate.style.visibility = "visible";

      requestAnimationFrame(() => {
        autoFitCertificateName();

        html2canvas(certificate, {
          useCORS: true,
          scale: 1,
          backgroundColor: null
        })
          .then((canvas) => {
            setTimeout(() => {
              const safeName =
                donorName.value.trim().replace(/\s+/g, "_") || "blood-donation";

              const link = document.createElement("a");
              link.download = `${safeName}-certificate.jpg`;
              link.href = canvas.toDataURL("image/jpeg", 0.95);
              link.click();

              hideCertificateAfterDownload();
              hideLoader();
              setButtonLoading(generateBtn, false);
            }, 6000);
          })
          .catch((error) => {
            console.error(error);
            alert("Error generating certificate.");

            hideCertificateAfterDownload();
            hideLoader();
            setButtonLoading(logoutBtn, false);

            window.location.href = "../index.html";
          });
      });
    });
  }

  // =========================
  // INITIALIZE
  // =========================
  startAutoLogoutTracking();
});