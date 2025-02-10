document.addEventListener('DOMContentLoaded', function() {
    function animateCards() {
        const cards = document.querySelectorAll('.card');
        console.log(cards); // Vérifie si les cartes sont trouvées

        cards.forEach(card => {
            const cardPosition = card.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (cardPosition < screenPosition) {
                console.log('Ajout de la classe start à une carte'); // Vérifie si la condition est remplie
                card.classList.add('start');
            }
        });
    }

    window.addEventListener('scroll', animateCards);
    animateCards(); // Appel initial pour vérifier si les cartes sont déjà en vue au chargement de la page
});
