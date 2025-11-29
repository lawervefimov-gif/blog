// Конфигурация для страницы поста
const BLOG_CONFIG = {
    postsPath: 'posts/'
};

// Настройка Marked
marked.setOptions({
    breaks: true,
    gfm: true,
    tables: true,
    sanitize: false
});

// Загрузка поста
async function loadPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    try {
        // Загружаем список постов чтобы взять метаданные
        const postsResponse = await fetch('posts/index.json');
        const posts = await postsResponse.json();
        const postMeta = posts.find(p => p.id === postId);

        // Загружаем контент поста
        const contentResponse = await fetch(`${BLOG_CONFIG.postsPath}${postId}.txt`);
        const content = await contentResponse.text();

        // Устанавливаем метаданные
        document.title = `${postMeta.title} | Юридический блог`;
        document.getElementById('post-title').textContent = postMeta.title;
        
        if (postMeta.date) {
            document.getElementById('post-date').textContent = formatDate(postMeta.date);
        }
        
        if (postMeta.author) {
            document.getElementById('post-author').textContent = ` • ${postMeta.author}`;
        }

        // Рендерим контент
        document.getElementById('post-content').innerHTML = marked.parse(content);
        
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('post-title').textContent = 'Ошибка';
    }
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', loadPost);
