// fake login


function login() {
  const username = document.getElementById("username").value;
  const key = document.getElementById("key").value;

  if (username === "admin" && key === "1234") {
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").innerText = "Hatalı giriş!";
  }
}
