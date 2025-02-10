// Fonction pour inclure le contenu d'un fichier HTML
function includeHTML(callback) {
    var z, i, elmnt, file, xhttp;
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        file = elmnt.getAttribute("include-html");
        if (file) {
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        elmnt.innerHTML = this.responseText;
                    }
                    if (this.status == 404) {
                        elmnt.innerHTML = "Page not found.";
                    }
                    elmnt.removeAttribute("include-html");
                    includeHTML(callback);
                }
            };
            xhttp.open("GET", file, true);
            xhttp.send();
            return;
        }
    }
    if (callback) callback();
}

// Fonction pour ajouter la classe "current" au menu correspondant
function highlightCurrentMenuItem() {
    var currentPage = window.location.pathname.split("/").pop();
    var menuItems = document.querySelectorAll("nav ul.menu li a");

    menuItems.forEach(function (menuItem) {
        if (menuItem.getAttribute("href") === currentPage) {
            menuItem.classList.add("current");
        }
    });
}

// Fonction pour attacher les événements aux éléments du header/footer après leur inclusion
function attachEvents() {
    // Attacher les événements du header
    var subscribeBtn = document.getElementById("subscribeBtn");
    if (subscribeBtn) {
        subscribeBtn.addEventListener("click", function () {
            document.getElementById("popup").style.display = "block";
        });
    }

    // Attacher les événements du footer
    var footerSubscribeForm = document.getElementById('subscribeForm');
    var footerMessageDiv = document.getElementById('footerMessage');

    if (footerSubscribeForm) {
        footerSubscribeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const formData = new FormData(footerSubscribeForm);
            const params = new URLSearchParams(formData);

            fetch('/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    footerMessageDiv.textContent = data.message;
                    footerMessageDiv.style.color = 'green';
                } else {
                    footerMessageDiv.textContent = data.message;
                    footerMessageDiv.style.color = 'red';
                }
                setTimeout(() => {
                    footerMessageDiv.textContent = '';
                    footerSubscribeForm.reset();
                }, 5000);
            })
            .catch(error => {
                footerMessageDiv.textContent = "Erreur lors de l'inscription";
                footerMessageDiv.style.color = 'red';
            });
        });
    }

    // Attacher les événements de la popup
    const popupSubscribeForm = document.getElementById('popupSubscribeForm');
    const popupMessageDiv = document.getElementById('popupMessage');
    const closePopupButton = document.getElementById('closePopup');

    if (popupSubscribeForm) {
        popupSubscribeForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData(popupSubscribeForm);
            const params = new URLSearchParams(formData);

            fetch('/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        popupMessageDiv.textContent = data.message;
                        popupMessageDiv.style.color = 'green';
                    } else {
                        popupMessageDiv.textContent = data.message;
                        popupMessageDiv.style.color = 'red';
                    }
                    setTimeout(() => {
                        popupMessageDiv.textContent = '';
                        popupSubscribeForm.reset();
                        document.getElementById('popup').style.display = 'none';
                    }, 5000);
                })
                .catch(error => {
                    popupMessageDiv.textContent = "Erreur lors de l'inscription";
                    popupMessageDiv.style.color = 'red';
                });
        });
    }

    if (closePopupButton) {
        closePopupButton.addEventListener('click', function () {
            document.getElementById('popup').style.display = 'none';
        });
    } else {
        console.error('L\'élément de fermeture de la popup n\'a pas été trouvé.');
    }
}

// Appel de la fonction includeHTML() pour inclure header, footer et popup
includeHTML(function () {
    highlightCurrentMenuItem();
    attachEvents();
});
