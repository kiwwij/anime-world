document.addEventListener("DOMContentLoaded", () => {
// Массив фавиконок
    const favicons = [
    "img/favicons/icon1.png",
    "img/favicons/icon2.png",
    "img/favicons/icon3.png",
    "img/favicons/icon4.png"
  ];

  // Выбираем случайную
  const randomIcon = favicons[Math.floor(Math.random() * favicons.length)];

  // Находим <link rel="icon">
  const faviconLink = document.querySelector("#dynamic-favicon");

  // Меняем href
  faviconLink.href = randomIcon;
});

const toggle = document.getElementById('toggle');

toggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme');

    // Сохраняем выбор пользователя
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

// При загрузке страницы проверяем сохранённую тему
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        toggle.checked = true; // синхронизируем переключатель
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("anime-search");
    const searchBtn = document.querySelector(".search-btn");
    const searchResults = document.getElementById("search-results");

    let animeData = [];

    // Загружаем JSON с аниме
    fetch("data/anime.json")
        .then(response => response.json())
        .then(data => {
            animeData = data;
        })
        .catch(error => console.error("Data loading error:", error));

    // Функция поиска
    function searchAnime(query) {
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm) {
            searchResults.innerHTML = "<p>Enter a search term.</p>";
            return;
        }

        const results = animeData.filter(anime =>
            anime.title.toLowerCase().includes(searchTerm) ||
            anime.genres.some(genre => genre.toLowerCase().includes(searchTerm))
        );

        if (results.length === 0) {
            searchResults.innerHTML = `<p>No results found for "<strong>${query}</strong>"</p>`;
            return;
        }

        // Формируем HTML для результатов
        searchResults.innerHTML = results.map(anime => `
            <div class="search-item">
                <img src="${anime.images.poster}" alt="${anime.title}" class="search-poster">
                <div class="search-info">
                    <h3>${anime.title} (${anime.year})</h3>
                    <p>${anime.genres.join(", ")}</p>
                    <button onclick="location.href='anime.html?id=${anime.id}'" class="view-btn">View Details</button>
                </div>
            </div>
        `).join("");
    }

    // Кнопка поиска
    searchBtn.addEventListener("click", () => {
        searchAnime(searchInput.value);
    });

    // Поиск по Enter
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            searchAnime(searchInput.value);
        }
    });
});