window.addEventListener("scroll", function () {
  const navbar = document.getElementById("navbar-container");
  const mainPage = document.getElementById("main-page");
  if (navbar && mainPage) {
    if (this.window.scrollY === 0) {
      navbar.style.paddingTop = "50px";
    } else {
      navbar.style.paddingTop = "0px";
    }
  }
});

window.toggleForms = function () {
  const loginForm = document.getElementById("login-form");
  const verifyForm = document.getElementById("verify-form");
  const changepasswordform = document.getElementById("change-password-form");
  const messageBoxLogin = document.getElementById("messageLogin");
  const messageBoxVerify = document.getElementById("messageVerify");
  const formTitle = document.getElementById("form-title");
  const toggleLink = document.querySelector(".toggle-link");

  if (loginForm.style.display === "none") {
    loginForm.style.display = "block";
    verifyForm.style.display = "none";
    changepasswordform.style.display = "none";
    formTitle.textContent = "User Login";
    toggleLink.textContent = "Forget Password?";
    messageBoxLogin.innerText = "";
    messageBoxLogin.classList.remove("text-success");
  } else {
    loginForm.style.display = "none";
    verifyForm.style.display = "block";
    formTitle.textContent = "Forget Password";
    toggleLink.textContent = "Back to Login";
    messageBoxVerify.innerText = "";
  }
};

window.onLoginFormSubmit = async function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const messageBoxLogin = document.getElementById("messageLogin");

  try {
    const res = await fetch("http://localhost:3000/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      messageBoxLogin.classList.remove("text-danger");
      messageBoxLogin.classList.add("text-success");
      messageBoxLogin.innerText = "Login successful!";
      if (data?.user?.isPasswordFresh) {
        alert("Please change temporary password.");
        setTimeout(
          () => window.NavigationChanged(null, "changepassword"),
          1000
        );
      } else setTimeout(() => (window.location.href = "index.html"), 1000);
    } else {
      messageBoxLogin.classList.remove("text-success");
      messageBoxLogin.classList.add("text-danger");
      messageBoxLogin.innerText = data.error || "Login failed.";
    }
  } catch (error) {
    messageBoxLogin.innerText = "An error occurred.";
  }
};

window.onVerifyFormSubmit = async function (e) {
  e.preventDefault();
  const username = document.getElementById("verifyusername").value;
  const email = document.getElementById("verifyemail").value;
  const tokenResult = document.getElementById("tokenResult");
  const changepasswordform = document.getElementById("change-password-form");
  const verifyForm = document.getElementById("verify-form");
  const messageBoxVerify = document.getElementById("messageVerify");
  const formTitle = document.getElementById("form-title");
  const toggleLink = document.querySelector(".toggle-link");

  try {
    const res = await fetch("http://localhost:3000/api/auth/forgotpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });
    const data = await res.json();
    if (res.ok) {
      tokenResult.innerText = `${data.resetToken}`;
      changepasswordform.style.display = "block";
      verifyForm.style.display = "none";
      formTitle.textContent = "Change Password";
      toggleLink.textContent = "Back to Login";
    } else {
      messageBoxVerify.innerText = "Verification failed!";
    }
  } catch (error) {
    messageBoxVerify.innerText = "An error occurred.";
  }
};

window.onResetPasswordFormSubmit = async function (e) {
  e.preventDefault();
  const newPassword = document.getElementById("newpassword").value;
  const verifypassword = document.getElementById("verifypassword").value;
  const token = document.getElementById("tokenResult").innerText;
  const messageChangePassword = document.getElementById(
    "messageChangePassword"
  );
  const loginForm = document.getElementById("login-form");
  const changepasswordform = document.getElementById("change-password-form");
  const formTitle = document.getElementById("form-title");
  const toggleLink = document.querySelector(".toggle-link");

  try {
    if (newPassword !== verifypassword) {
      messageChangePassword.innerText = "Passwords do not match!";
      return;
    }

    const res = await fetch("http://localhost:3000/api/auth/resetpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      setTimeout(() => {
        document.getElementById("tokenResult").innerText = "";
        changepasswordform.style.display = "none";
        loginForm.style.display = "block";
        formTitle.textContent = "User Login";
        toggleLink.textContent = "Forget Password";
        messageChangePassword.innerText = "";
      }, 1000);
      messageChangePassword.classList.remove("text-danger");
      messageChangePassword.classList.add("text-success");
      messageChangePassword.innerText = data.message;
    } else {
      messageChangePassword.classList.add("text-danger");
      messageChangePassword.innerText =
        "Error resetting password! " + data.message;
    }
  } catch (error) {
    messageChangePassword.classList.add("text-danger");
    messageChangePassword.innerText = "An error occurred.";
  }
};

/*===onMembershipFormSubmit - Start===*/
window.onMembershipFormSubmit = async function (event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Handle radio & checkbox manually
  data.membershipType =
    form.querySelector("input[name='membershipType']:checked")?.value || "";
  data.agreedToCode = document.getElementById("acceptConstitution").checked;

  clearErrors(form);

  if (validateMembershipForm(data)) return;

  try {
    const response = await fetch(
      "http://localhost:3000/api/membership/submit",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (response.ok) {
      // If response is a PDF blob, download it
      const contentType = response.headers.get("Content-Type");
      if (contentType?.includes("application/pdf")) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Membership_Form.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        form.reset();
        alert("Form submitted and downloaded successfully!");
      } else {
        const result = await response.json();
        alert(result.message || "Form submitted successfully!");
      }
    } else {
      const errorData = await response.json();
      alert("Error: " + (errorData.message || "Submission failed."));
    }
  } catch (err) {
    alert("Something went wrong: " + err.message);
  }
};

function clearErrors(form) {
  form
    .querySelectorAll(".is-invalid")
    .forEach((el) => el.classList.remove("is-invalid"));
  form
    .querySelectorAll(".invalid-feedback")
    .forEach((el) => (el.textContent = ""));
  document.getElementById("constitutionError").textContent = "";
}

function validateMembershipForm(data) {
  let hasError = false;

  function showError(id, message) {
    const field = document.getElementById(id);
    field.classList.add("is-invalid");
    field.nextElementSibling.textContent = message;
    hasError = true;
  }

  if (!data.fullName.trim()) showError("fullName", "Full Name is required.");
  if (!data.address.trim()) showError("address", "Address is required.");
  if (!data.postalCode.trim())
    showError("postalCode", "Postal Code is required.");
  if (!data.phone.trim()) showError("phone", "Phone number is required.");
  if (!data.email.trim()) showError("email", "Email is required.");
  if (!data.agreedToCode) {
    document.getElementById("constitutionError").textContent =
      "You must agree to the Constitution.";
    hasError = true;
  }
  if (!data.signature.trim()) showError("signature", "Signature is required.");
  if (!data.printedName.trim())
    showError("printedName", "Printed name is required.");
  if (!data.date.trim()) showError("date", "Date is required.");

  return hasError;
}
/*===onMembershipFormSubmit - End===*/

window.onUserRegisterFormSubmit = async function (e) {
  e.preventDefault();

  // Validation
  let valid = true;

  const fields = [
    { id: "username", errorId: "usernameError" },
    {
      id: "email",
      errorId: "emailError",
      validate: (value) => value.includes("@"),
    },
    { id: "firstName", errorId: "firstNameError" },
    { id: "lastName", errorId: "lastNameError" },
    { id: "dob", errorId: "dobError" },
    { id: "gender", errorId: "genderError", validate: (value) => value !== "" },
    { id: "city", errorId: "cityError" },
    { id: "state", errorId: "stateError" },
    { id: "zip", errorId: "zipError" },
    { id: "country", errorId: "countryError" },
    { id: "phoneNumbers", errorId: "phoneError" },
  ];

  fields.forEach(({ id, errorId, validate }) => {
    const field = document.getElementById(id);
    const value = field.value.trim();
    const isValid = validate ? validate(value) : value !== "";
    document.getElementById(errorId).style.display = isValid ? "none" : "block";
    if (!isValid) valid = false;
  });

  if (!valid) return;

  // Data payload
  const data = {
    username: username.value.trim(),
    email: email.value.toLowerCase().trim(),
    password: null,
    roles: [
      ...(document.getElementById("roleUser").checked ? ["user"] : []),
      ...(document.getElementById("roleAdmin").checked ? ["admin"] : []),
    ],
    personalInfo: {
      fullName: {
        first: document.getElementById("firstName").value,
        middle: document.getElementById("middleName").value,
        last: document.getElementById("lastName").value,
      },
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      phoneNumbers: document
        .getElementById("phoneNumbers")
        .value.split(",")
        .map((n) => n.trim())
        .filter(Boolean),
      address: {
        street: document.getElementById("street").value,
        city: document.getElementById("city").value,
        state: document.getElementById("state").value,
        zip: document.getElementById("zip").value,
        country: document.getElementById("country").value,
      },
      emergencyContact: {
        name: document.getElementById("emergencyName").value,
        relationship: document.getElementById("relationship").value,
        phone: document.getElementById("emergencyPhone").value,
      },
    },
  };

  // Submit
  const token = localStorage.getItem("authToken") || null;
  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(data),
    });

    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = username.value.trim() + "_credentials.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("User registered successfully! Credentials downloaded.");
      document.getElementById("registrationForm").reset();
    } else {
      alert(result.message || "Something went wrong.");
    }
  } catch (error) {
    alert("Error submitting form");
    console.error(error);
  }
};

window.onChangePasswordFormSubmit = async function (e) {
  e.preventDefault();
  const oldPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmNewPassword").value;
  const messageBoxChangePassword = document.getElementById(
    "messageChangePassword"
  );

  if (newPassword !== confirmPassword) {
    messageBoxChangePassword.classList.add("text-danger");
    messageBoxChangePassword.innerText = "New passwords do not match!";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/changepassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (res.ok) {
      const user = JSON.parse(localStorage.getItem("user"));
      messageBoxChangePassword.classList.remove("text-danger");
      messageBoxChangePassword.classList.add("text-success");
      messageBoxChangePassword.innerText = "Password changed successfully!";
      if (user?.isPasswordFresh) {
        user.isPasswordFresh = false;
        localStorage.setItem("user", JSON.stringify(user));
        setTimeout(() => (window.location.href = "index.html"), 1000);
      }
    } else {
      const data = await res.json();
      messageBoxChangePassword.classList.add("text-danger");
      messageBoxChangePassword.innerText =
        data.error || "Failed to change password.";
    }
  } catch (error) {
    messageBoxChangePassword.classList.add("text-danger");
    messageBoxChangePassword.innerText = "An error occurred.";
  }
};

window.getUnregisteredMembers = async function () {
  try {
    const token = localStorage.getItem("authToken") || null;
    const response = await fetch(
      "http://localhost:3000/api/membership/getUnregisteredMembers",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Network response was not ok");
    const members = await response.json();
    const tableBody = document.getElementById("memberTableBody");

    tableBody.innerHTML = ""; // Clear existing rows
    members.forEach((member) => {
      const row = `
          <tr>
            <td>${member.fullName}</td>
            <td>${member.address || ""}</td>
            <td>${member.postalCode || ""}</td>
            <td>${member.phone || ""}</td>
            <td>${member.email}</td>
            <td>${member.membershipType}</td>
            <td>${member.agreedToCode ? "✅" : "❌"}</td>
            <td>${new Date(member.createdAt).toLocaleDateString()}</td>
          </tr>
        `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    document.getElementById("memberTableBody").innerHTML =
      '<tr><td colspan="9" class="text-danger">Failed to load members</td></tr>';
  }
};

window.getUsersList = async function () {
  try {
    const token = localStorage.getItem("authToken") || null;
    const response = await fetch("http://localhost:3000/api/auth/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Network response was not ok");
    const transformedUsers = await response.json();
    const tableBody = document.getElementById("userTableBody");

    tableBody.innerHTML = "";
    transformedUsers.forEach((user, index) => {
      const row = `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.phone}</td>
          <td>${user.gender}</td>
          <td>${user.city}</td>
          <td>${user.status}</td>
          <td>${user.roles}</td>
          <td>${user.registeredOn}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="window.viewUser('${user.id}')">
              View
            </button>
          </td>
        </tr>
      `;
      tableBody.insertAdjacentHTML("beforeend", row);
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    document.getElementById("memberTableBody").innerHTML =
      '<tr><td colspan="9" class="text-danger">Failed to load members</td></tr>';
  }
};

window.viewUser = async function (userId) {
  try {
    const res = await fetch(
      `http://localhost:3000/api/auth/profileById?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (res.ok) {
      const userData = await res.json();
      fetch(`./pages/userregister.html`)
        .then((res) => res.text())
        .then((html) => {
          const mainSection = document.getElementById("main-section");
          if (mainSection) {
            mainSection.innerHTML = html;
            setTimeout(() => {
              addDataToForm(userData);
            });
          }
        });
    } else {
      alert("An error occurred.");
    }
  } catch (error) {
    alert("An error occurred.");
  }
};

function addDataToForm(userData) {
  if (userData) {
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.role?.includes("admin") || false;
    document.getElementById("username").value = userData.username || "";
    document.getElementById("email").value = userData.email || "";

    document.getElementById("firstName").value =
      userData.personalInfo?.fullName?.first || "";
    document.getElementById("middleName").value =
      userData.personalInfo?.fullName?.middle || "";
    document.getElementById("lastName").value =
      userData.personalInfo?.fullName?.last || "";

    document.getElementById("dob").value =
      userData.personalInfo?.dob?.split("T")[0] || "";
    document.getElementById("gender").value =
      userData.personalInfo?.gender || "";

    document.getElementById("street").value =
      userData.personalInfo?.address?.street || "";
    document.getElementById("city").value =
      userData.personalInfo?.address?.city || "";
    document.getElementById("state").value =
      userData.personalInfo?.address?.state || "";
    document.getElementById("zip").value =
      userData.personalInfo?.address?.zip || "";
    document.getElementById("country").value =
      userData.personalInfo?.address?.country || "";

    document.getElementById("phoneNumbers").value =
      (userData.personalInfo?.phoneNumbers || [])[0] || "";

    document.getElementById("emergencyName").value =
      userData.personalInfo?.emergencyContact?.name || "";
    document.getElementById("relationship").value =
      userData.personalInfo?.emergencyContact?.relationship || "";
    document.getElementById("emergencyPhone").value =
      userData.personalInfo?.emergencyContact?.phone || "";

    document.getElementById("roleUser").checked =
      userData.roles.includes("user");
    document.getElementById("roleAdmin").checked =
      userData.roles.includes("admin");

    if (!isAdmin) {
      makeFormReadOnly();
    }
  }
}
/*===loadUserToForm - Start===*/
window.loadUserToForm = async function () {
  try {
    const res = await fetch("http://localhost:3000/api/auth/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });

    if (res.ok) {
      const userData = await res.json();
      addDataToForm(userData);
    } else {
      alert("An error occurred.");
    }
  } catch (error) {
    alert("An error occurred.");
  }
};

function makeFormReadOnly() {
  const form = document.getElementById("registrationForm");
  form.querySelectorAll("input, select, textarea").forEach((el) => {
    el.disabled = true;
  });

  form.querySelector("button[type='submit']").style.display = "none";
}
/*===loadUserToForm - End===*/

window.resetUserFrom = function () {
  const form = document.getElementById("registrationForm");
  form.reset();
  form.querySelector("button[type='submit']").style.display = "block";
};
