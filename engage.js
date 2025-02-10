document.addEventListener('DOMContentLoaded', function() {
    const volunteerForm = document.getElementById('volunteerForm');
    const volunteerMessageDiv = document.getElementById('message');

    if (volunteerForm) {
        volunteerForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(volunteerForm);
            const params = new URLSearchParams(formData);

            fetch('/volunteer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    volunteerMessageDiv.textContent = data.message;
                    volunteerMessageDiv.style.color = 'green';
                } else {
                    volunteerMessageDiv.textContent = data.message;
                    volunteerMessageDiv.style.color = 'red';
                }
                setTimeout(() => {
                    volunteerMessageDiv.textContent = '';
                    volunteerForm.reset();
                }, 5000);
            })
            .catch(error => {
                volunteerMessageDiv.textContent = "Erreur lors de l'envoi du formulaire";
                volunteerMessageDiv.style.color = 'red';
            });
        });
    }
});