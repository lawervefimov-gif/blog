// Конфигурация
const CONFIG = {
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

    console.log('Loading post:', postId);

    if (!postId) {
        showError('Не указан идентификатор поста');
        return;
    }

    try {
        const response = await fetch(`${CONFIG.postsPath}${postId}.txt`);
        if (!response.ok) throw new Error('Пост не найден');
        
        const markdown = await response.text();
        console.log('Raw content (first 500 chars):', markdown.substring(0, 500));
        await renderPost(markdown, postId);
        
    } catch (error) {
        console.error('Ошибка загрузки поста:', error);
        showError('Не удалось загрузить статью');
    }
}

// Рендер поста
async function renderPost(markdown, postId) {
    try {
        const { content, metadata } = parseFrontmatter(markdown);
        
        console.log('Parsed metadata:', metadata);
        console.log('Content start:', content.substring(0, 200));
        
        // Сначала устанавливаем метаданные
        document.title = `${metadata.title} | Юридический блог`;
        document.getElementById('post-title').textContent = metadata.title;
        
        if (metadata.date) {
            document.getElementById('post-date').textContent = formatDate(metadata.date);
        }
        
        if (metadata.author) {
            document.getElementById('post-author').textContent = ` • ${metadata.author}`;
        }
        
        // Потом рендерим контент
        const htmlContent = marked.parse(content);
        document.getElementById('post-content').innerHTML = htmlContent;
        
    } catch (error) {
        console.error('Ошибка рендера поста:', error);
        showError('Ошибка отображения статьи: ' + error.message);
    }
}

// Парсинг фронтматера
function parseFrontmatter(markdown) {
    try {
        console.log('Parsing frontmatter...');
        
        // Несколько вариантов regex для фронтматера
        const frontmatterRegexes = [
            /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/,  // стандартный
            /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/, // с поддержкой Windows
            /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/ // универсальный
        ];
        
        let match = null;
        for (const regex of frontmatterRegexes) {
            match = markdown.match(regex);
            if (match) break;
        }
        
        if (!match) {
            console.warn('Frontmatter not found. Full content:', markdown.substring(0, 300));
            return {
                content: markdown,
                metadata: { title: 'Статья без названия' }
            };
        }
        
        const frontmatter = match[1];
        const content = match[2];
        
        console.log('Frontmatter found:', frontmatter);
        console.log('Content after frontmatter:', content.substring(0, 200));
        
        const metadata = {};
        frontmatter.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && trimmedLine.includes(':')) {
                const [key, ...valueParts] = trimmedLine.split(':');
                if (key && valueParts.length) {
                    metadata[key.trim()] = valueParts.join(':').trim().replace(/^"|"$/g, '');
                }
            }
        });
        
        console.log('Final metadata:', metadata);
        return { content, metadata };
        
    } catch (error) {
        console.error('Ошибка парсинга фронтматера:', error);
        return {
            content: markdown,
            metadata: { title: 'Ошибка формата' }
        };
    }
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
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', loadPost);
