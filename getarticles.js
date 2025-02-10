document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
});

function loadArticles() {
    fetch('/get_public_articles')
        .then(response => response.json())
        .then(articles => {
            const articlesContainer = document.getElementById('articles-container');
            articlesContainer.innerHTML = ''; // Clear current content
            articles.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.className = 'article';
                articleElement.innerHTML = `
                    <h3>${article.title}</h3>
                    <p>${article.content}</p>
                    <img src="${article.image}" alt="${article.title}">
                `;
                articlesContainer.appendChild(articleElement);
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des articles:', error);
        });
}