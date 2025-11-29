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
    console.log('=== LOAD POST STARTED ===');
    
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    console.log('Post ID:', postId);

    if (!postId) {
        showError('Не указан идентификатор поста');
        return;
    }

    try {
        const response = await fetch(`${BLOG_CONFIG.postsPath}${postId}.txt`);
        console.log('Response status:', response.status);
        
        if (!response.ok) throw new Error('Пост не найден');
        
        const markdown = await response.text();
        console.log('File loaded, length:', markdown.length);
        console.log('First 150 chars:', markdown.substring(0, 150));
        
        await renderPost(markdown, postId);
        
    } catch (error) {
        console.error('Ошибка загрузки поста:', error);
        showError('Не удалось загрузить статью');
    }
}

// Рендер поста
async function renderPost(markdown, postId) {
    console.log('=== RENDER POST STARTED ===');
    
    try {
        const { content, metadata } = parseFrontmatter(markdown);
        
        console.log('After parseFrontmatter - metadata:', metadata);
        console.log('After parseFrontmatter - content start:', content.substring(0, 100));
        
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
        
        console.log('=== RENDER COMPLETED ===');
        
    } catch (error) {
        console.error('Ошибка рендера поста:', error);
        showError('Ошибка отображения статьи: ' + error.message);
    }
}

// Парсинг фронтматера
function parseFrontmatter(markdown) {
    console.log('=== PARSING FRONTMATTER ===');
    console.log('Raw content start:', markdown.substring(0, 200));
    
    try {
        // Простой regex для фронтматера
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);
        
        console.log('Regex match result:', match);
        
        if (!match) {
            console.log('Frontmatter not found!');
            return {
                content: markdown,
                metadata: { title: 'Статья без названия' }
            };
        }
        
        const frontmatter = match[1].trim();
        const content = match[2].trim();
        
        console.log('Frontmatter text:', frontmatter);
        console.log('Content text start:', content.substring(0, 100));
        
        const metadata = {};
        const lines = frontmatter.split('\n');
        
        console.log('Frontmatter lines:', lines);
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            console.log(`Line ${index}: "${trimmedLine}"`);
            
            if (trimmedLine && trimmedLine.includes(':')) {
                const colonIndex = trimmedLine.indexOf(':');
                const key = trimmedLine.substring(0, colonIndex).trim();
                const value = trimmedLine.substring(colonIndex + 1).trim();
                
                if (key && value) {
                    // Убираем кавычки если есть
                    const cleanValue = value.replace(/^["']|["']$/g, '');
                    metadata[key] = cleanValue;
                    console.log(`Parsed metadata: ${key} = ${cleanValue}`);
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
