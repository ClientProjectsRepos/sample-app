document.addEventListener("DOMContentLoaded", () => {
  fetch("navbar.html")
    .then((res) => res.text())
    .then((html) => {
      const container = document.getElementById("navbar-container");
      if (container) {
        container.innerHTML = html;

        const currentPage = location.pathname.split("/").pop() || "index.html";

        if (currentPage === "index.html") {
          const homeLink = document.getElementById("nav-home");
          if (homeLink?.closest("li")) {
            homeLink.closest("li").remove();
          }
        }

        container.querySelectorAll(".nav-link").forEach((link) => {
          const href = link.getAttribute("href");
          if (href === currentPage) {
            link.classList.add("active");
          }
        });

        setTimeout(function () {
          const token = localStorage.getItem("authToken");
          const user = JSON.parse(localStorage.getItem("user"));
          const navbar = document.querySelector(".navbar-nav");

          const loginLink = navbar.querySelector("a[href='login.html']");
          if (token && user) {
            if (loginLink) loginLink.closest("li").remove();

            const newsLink = `<li class="nav-item"><a class="nav-link" href="news.html">News</a></li>`;
            const galleryLink = `<li class="nav-item"><a class="nav-link" href="gallery.html">Gallery</a></li>`;

            navbar.insertAdjacentHTML("beforeend", newsLink);
            navbar.insertAdjacentHTML("beforeend", galleryLink);

            const name = `${user.name.first} ${user.name.last}`;
            const userDropdown = `
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            ${name}
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><a class="dropdown-item" href="#">Dashboard</a></li>
            <li><a class="dropdown-item" href="#">Settings</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" id="logoutBtn">Sign Out</a></li>
          </ul>
        </li>
      `;
            navbar.insertAdjacentHTML("beforeend", userDropdown);
          }

          // Logout Handler
          document.addEventListener("click", function (e) {
            if (e.target.id === "logoutBtn") {
              localStorage.removeItem("authToken");
              localStorage.removeItem("user");
              location.href = "index.html";
            }
          });
        }, 500);
      }
    });
});
