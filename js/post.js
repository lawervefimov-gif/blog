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

    console.log('=== DEBUG: Starting loadPost ===');
    console.log('Post ID:', postId);

    if (!postId) {
        showError('Не указан идентификатор поста');
        return;
    }

    try {
        const filePath = `${CONFIG.postsPath}${postId}.txt`;
        console.log('Fetching from:', filePath);
        
        const response = await fetch(filePath);
        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);
        
        if (!response.ok) throw new Error('Пост не найден');
        
        const markdown = await response.text();
        console.log('=== DEBUG: File content loaded ===');
        console.log('Content length:', markdown.length);
        console.log('First 300 chars:', markdown.substring(0, 300));
        console.log('================');
        
        await renderPost(markdown, postId);
        
    } catch (error) {
        console.error('Ошибка загрузки поста:', error);
        showError('Не удалось загрузить статью: ' + error.message);
    }
}

// Рендер поста
async function renderPost(markdown, postId) {
    console.log('=== DEBUG: Starting renderPost ===');
    
    try {
        const { content, metadata } = parseFrontmatter(markdown);
        
        console.log('=== DEBUG: After parseFrontmatter ===');
        console.log('Metadata:', metadata);
        console.log('Content length:', content.length);
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
        
        console.log('=== DEBUG: Render complete ===');
        
    } catch (error) {
        console.error('Ошибка рендера поста:', error);
        showError('Ошибка отображения статьи: ' + error.message);
    }
}

// Парсинг фронтматера
function parseFrontmatter(markdown) {
    console.log('=== DEBUG: Starting parseFrontmatter ===');
    
    try {
        // Упрощенный regex
        const frontmatterRegex = /^---\s*\n?([\s\S]*?)---\s*\n?([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);
        
        console.log('Regex match result:', match);
        
        if (!match) {
            console.warn('Frontmatter not found!');
            console.log('First 10 lines of content:');
            markdown.split('\n').slice(0, 10).forEach((line, i) => {
                console.log(`${i}: "${line}"`);
            });
            
            return {
                content: markdown,
                metadata: { title: 'Статья без названия' }
            };
        }
        
        const frontmatter = match[1].trim();
        const content = match[2].trim();
        
        console.log('Frontmatter raw:', frontmatter);
        console.log('Content raw:', content.substring(0, 200));
        
        const metadata = {};
        frontmatter.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && trimmedLine.includes(':')) {
                const [key, ...valueParts] = trimmedLine.split(':');
                if (key && valueParts.length) {
                    const value = valueParts.join(':').trim();
                    metadata[key.trim()] = value.replace(/^["']|["']$/g, '');
                    console.log(`Parsed: ${key.trim()} = ${metadata[key.trim()]}`);
                }
            }
        });
        
        console.log('Final metadata object:', metadata);
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
