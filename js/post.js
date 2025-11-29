// Конфигурация
const CONFIG = {
    postsPath: './posts/'
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

    console.log('Loading post:', postId);

    if (!postId) {
        showError('Не указан идентификатор поста');
        return;
    }

    try {
        const response = await fetch(`${CONFIG.postsPath}${postId}.md`);
        if (!response.ok) throw new Error('Пост не найден');
        
        const markdown = await response.text();
        console.log('Markdown loaded');
        await renderPost(markdown, postId);
        
    } catch (error) {
        console.error('Ошибка загрузки поста:', error);
        showError('Не удалось загрузить статью');
    }
}

// Рендер поста
async function renderPost(markdown, postId) {
    const { content, metadata } = parseFrontmatter(markdown);
    
    document.title = `${metadata.title} | Юридический блог`;
    document.getElementById('post-title').textContent = metadata.title;
    
    if (metadata.date) {
        document.getElementById('post-date').textContent = formatDate(metadata.date);
    }
    
    if (metadata.author) {
        document.getElementById('post-author').textContent = ` • ${metadata.author}`;
    }
    
    const htmlContent = marked.parse(content);
    document.getElementById('post-content').innerHTML = htmlContent;
}

// Парсинг фронтматера
function parseFrontmatter(markdown) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontmatterRegex);
    
    if (!match) {
        return {
            content: markdown,
            metadata: { title: 'Статья без названия' }
        };
    }
    
    const frontmatter = match[1];
    const content = match[2];
    
    const metadata = {};
    frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            metadata[key.trim()] = valueParts.join(':').trim();
        }
    });
    
    return { content, metadata };
}

// Показ ошибки
function showError(message) {
    document.getElementById('post-title').textContent = 'Ошибка';
    document.getElementById('post-content').innerHTML = `
        <div class="error">
            <p>${message}</p>
            <p><a href="index.html">Вернуться к списку статей</a></p>
        </div>
    `;
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
