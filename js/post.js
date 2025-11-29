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
    console.log('=== DEBUG: loadPost started ===');
    
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    console.log('Post ID:', postId);

    if (!postId) {
        console.log('ERROR: No post ID');
        showError('Не указан идентификатор поста');
        return;
    }

    try {
        const filePath = `${CONFIG.postsPath}${postId}.md`;
        console.log('Fetching from:', filePath);
        
        const response = await fetch(filePath);
        console.log('Response status:', response.status);
        console.log('Response URL:', response.url);
        
        if (!response.ok) {
            console.log('ERROR: Response not OK');
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const markdown = await response.text();
        console.log('SUCCESS: File loaded, length:', markdown.length);
        
        if (markdown.length === 0) {
            console.log('ERROR: File is empty');
            throw new Error('Файл пустой');
        }
        
        console.log('First 50 chars:', markdown.substring(0, 50));
        await renderPost(markdown, postId);
        
    } catch (error) {
        console.error('CATCH: Error in loadPost:', error);
        showError('Не удалось загрузить статью: ' + error.message);
    }
}

// Рендер поста
async function renderPost(markdown, postId) {
    console.log('=== DEBUG: renderPost started ===');
    
    try {
        const { content, metadata } = parseFrontmatter(markdown);
        
        console.log('Metadata:', metadata);
        
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
        
        console.log('=== DEBUG: renderPost completed ===');
        
    } catch (error) {
        console.error('Ошибка рендера поста:', error);
        showError('Ошибка отображения статьи: ' + error.message);
    }
}

// Парсинг фронтматера
function parseFrontmatter(markdown) {
    console.log('=== DEBUG: parseFrontmatter started ===');
    
    try {
        // Упрощенный regex
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);
        
        console.log('Regex match:', match ? 'FOUND' : 'NOT FOUND');
        
        if (!match) {
            console.log('Trying alternative regex...');
            // Альтернативный regex
            const altRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
            const altMatch = markdown.match(altRegex);
            console.log('Alternative regex match:', altMatch ? 'FOUND' : 'NOT FOUND');
            
            if (!altMatch) {
                console.log('First 5 lines:');
                markdown.split('\n').slice(0, 5).forEach((line, i) => {
                    console.log(`${i}: ${JSON.stringify(line)}`);
                });
                return {
                    content: markdown,
                    metadata: { title: 'Статья без названия' }
                };
            }
            
            const frontmatter = altMatch[1];
            const content = altMatch[2];
            
            const metadata = {};
            frontmatter.split('\n').forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine && trimmedLine.includes(':')) {
                    const [key, ...valueParts] = trimmedLine.split(':');
                    if (key && valueParts.length) {
                        metadata[key.trim()] = valueParts.join(':').trim();
                    }
                }
            });
            
            return { content, metadata };
        }
        
        const frontmatter = match[1];
        const content = match[2];
        
        const metadata = {};
        frontmatter.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && trimmedLine.includes(':')) {
                const [key, ...valueParts] = trimmedLine.split(':');
                if (key && valueParts.length) {
                    metadata[key.trim()] = valueParts.join(':').trim();
                }
            }
        });
        
        console.log('Parsed metadata:', metadata);
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
