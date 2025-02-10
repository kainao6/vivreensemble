document.addEventListener('DOMContentLoaded', function() {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginMessageDiv = document.getElementById('loginMessage');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(adminLoginForm);

            fetch('/admin_login', {
                method: 'POST',
                body: new URLSearchParams(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loginMessageDiv.textContent = data.message;
                    loginMessageDiv.style.color = 'green';
                    // Rediriger vers le tableau de bord admin
                    setTimeout(() => {
                        window.location.href = '/admin_dashboard';
                    }, 1000);
                } else {
                    loginMessageDiv.textContent = data.message;
                    loginMessageDiv.style.color = 'red';
                }
            })
            .catch(error => {
                loginMessageDiv.textContent = "Erreur lors de la connexion";
                loginMessageDiv.style.color = 'red';
            });
        });
    }
});
