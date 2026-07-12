// fake login


async function girisYap() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('devKey').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ user: u, pass: p })
    });

    const data = await response.json();

    if (data.status === 'success') {
        // API'den gelen 'role' bilgisine göre yönlendir
        if (data.role === 'admin') {
            window.location.href = '/admin-panel.html'; // Admin sayfasına at
        } else {
            window.location.href = '/dashboard.html';   // Normal kullanıcıya at
        }
    } else {
        alert("Giriş başarısız: " + data.message);
    }
}
