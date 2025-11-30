// Конфигурация
const CONFIG = {
    postsIndex: 'posts/index.json',
    postsPath: 'posts/'
};

// Загрузка списка постов
async function loadPostsList() {
    const postsListContainer = document.getElementById('posts-list');
    
    try {
        console.log('🔄 Начинаем загрузку статей...');
        console.log('📁 Путь к index.json:', CONFIG.postsIndex);
        
        const response = await fetch(CONFIG.postsIndex);
        console.log('📊 Статус ответа:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const jsonText = await response.text();
        console.log('📄 Получен JSON:', jsonText.substring(0, 200) + '...');
        
        const posts = JSON.parse(jsonText);
        console.log('✅ Успешно распаршено постов:', posts.length);
        console.log('📋 Посты:', posts.map(p => p.id));
        
        if (posts.length === 0) {
            postsListContainer.innerHTML = '<p>Пока нет статей.</p>';
            return;
        }
        
        // Сортируем по дате (новые сначала)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        renderPostsList(posts, postsListContainer);
        setupSearch(posts, postsListContainer);
        
        console.log('🎉 Статьи успешно загружены и отображены!');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        postsListContainer.innerHTML = `
            <div class="error">
                <p>Не удалось загрузить статьи.</p>
                <p><strong>Ошибка:</strong> ${error.message}</p>
                <p><a href="javascript:location.reload()">Обновить страницу</a></p>
            </div>
        `;
    }
}

// Рендер списка постов
function renderPostsList(posts, container) {
    console.log('🎨 Рендерим список постов...');
    container.innerHTML = posts.map(post => `
        <article class="post-preview" data-post-id="${post.id}">
            <div class="post-meta">
                <time datetime="${post.date}">${formatDate(post.date)}</time>
                ${post.author ? ` • <span>${post.author}</span>` : ''}
                ${post.category ? ` • <span class="category">${post.category}</span>` : ''}
            </div>
            <h2>
                <a href="post.html?id=${post.id}">${post.title}</a>
            </h2>
            <div class="post-excerpt">${post.excerpt || ''}</div>
            <a href="post.html?id=${post.id}" class="read-more">Читать далее →</a>
        </article>
    `).join('');
}

// Настройка поиска
function setupSearch(posts, container) {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            if (searchTerm.length < 2) {
                renderPostsList(posts, container);
                return;
            }
            
            const filteredPosts = posts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.excerpt.toLowerCase().includes(searchTerm) ||
                (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
            );
            
            renderPostsList(filteredPosts, container);
        });
    }
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
console.log('🚀 app.js загружен, запускаем загрузку статей...');
document.addEventListener('DOMContentLoaded', loadPostsList);
