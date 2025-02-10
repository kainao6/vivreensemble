document.addEventListener('DOMContentLoaded', function() {
    loadArticles();

    document.getElementById('articleForm').addEventListener('submit', function(event) {
        event.preventDefault();
        saveArticle();
    });
});

function loadArticles() {
    fetch('/get_articles')
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
                    <button onclick="editArticle(${article.id})">Modifier</button>
                    <button onclick="deleteArticle(${article.id})">Supprimer</button>
                `;
                articlesContainer.appendChild(articleElement);
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des articles:', error);
        });
}

function showAddArticleForm() {
    document.getElementById('articleId').value = '';
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('image').value = '';
    document.getElementById('formTitle').innerText = 'Ajouter un article';
    document.getElementById('articleForm').style.display = 'block';
}

function hideArticleForm() {
    document.getElementById('articleForm').style.display = 'none';
}

function saveArticle() {
const id = document.getElementById('articleId').value;
const title = document.getElementById('title').value;
const content = document.getElementById('content').value;
const image = document.getElementById('image').value;

const url = id ? '/edit_article' : '/add_article';
const method = 'POST';

fetch(url, {
method: method,
headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
},
body: new URLSearchParams({ id, title, content, image })
})
.then(response => response.json())
.then(data => {
if (data.success) {
    loadArticles();
    hideArticleForm();
} else {
    alert('Erreur: ' + data.message);
}
})
.catch(error => {
console.error('Erreur lors de la sauvegarde de l\'article:', error);
});
}


// fonction modifier article

function editArticle(id) {
fetch(`/get_article?id=${id}`)
.then(response => response.json())
.then(article => {
    document.getElementById('articleId').value = article.id;
    document.getElementById('title').value = article.title;
    document.getElementById('content').value = article.content;
    document.getElementById('image').value = article.image;
    document.getElementById('formTitle').innerText = 'Modifier l\'article';
    document.getElementById('articleForm').style.display = 'block';
})
.catch(error => {
    console.error('Erreur lors de la récupération de l\'article:', error);
});
}



function deleteArticle(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article?')) {
        fetch(`/delete_article?id=${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadArticles();
                } else {
                    alert('Erreur: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la suppression de l\'article:', error);
            });
    }
}