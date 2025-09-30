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
    faviconLink.href = randomIcon;

    // Тёмная тема
    const toggle = document.getElementById('toggle');
    toggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        toggle.checked = true;
    }

    // Поиск
    const searchInput = document.getElementById("anime-search");
    const searchBtn = document.querySelector(".search-btn");
    const searchResults = document.getElementById("search-results");

    let animeData = [];

    fetch("data/anime.json")
        .then(response => response.json())
        .then(data => animeData = data)
        .catch(error => console.error("Data loading error:", error));

    async function searchAnime(query) {
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

        // Формируем HTML с постерами через Jikan
        searchResults.innerHTML = (await Promise.all(results.map(async anime => {
        let posterUrl = anime.images.poster; // fallback

        try {
            const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime.title)}`);
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                const match = data.data.find(a => a.title.toLowerCase() === anime.title.toLowerCase()) || data.data[0];
                posterUrl = match.images.jpg.large_image_url;
            }
        } catch (err) {
            console.error("Jikan API error:", err);
        }

        return `
            <div class="search-item">
                <img src="${posterUrl}" alt="${anime.title}" class="search-poster">
                <div class="search-info">
                    <h3>${anime.title} (${anime.year})</h3>
                    <p>${anime.genres.join(", ")}</p>
                    <button onclick="location.href='anime.html?id=${anime.id}'" class="view-btn">View Details</button>
                </div>
            </div>
        `;
    }))).join("");


    }

    searchBtn.addEventListener("click", () => searchAnime(searchInput.value));
    searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") searchAnime(searchInput.value);
    });
});

document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById('anime-grid');

    try {
        // Загружаем локальный JSON
        const response = await fetch('data/anime.json');
        const animeData = await response.json();

        // Для каждого аниме создаем карточку
        for (const anime of animeData) {
            let posterUrl = anime.images.poster; // fallback

            try {
                const apiResponse = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime.title)}`);
                const apiData = await apiResponse.json();

                if (apiData.data && apiData.data.length > 0) {
                    const match = apiData.data.find(a => a.title.toLowerCase() === anime.title.toLowerCase()) || apiData.data[0];
                    posterUrl = match.images.jpg.large_image_url;
                }
            } catch (err) {
                console.warn(`Jikan API error for "${anime.title}":`, err);
            }

            // Создаем карточку с кликабельным постером
            const card = document.createElement('div');
            card.classList.add('anime-card');
            card.innerHTML = `
                <a href="anime.html?id=${anime.id}">
                    <img src="${posterUrl}" alt="${anime.title}">
                </a>
                <a href="anime.html?id=${anime.id}" class="anime-title-link">
                    <h3>${anime.title}</h3>
                </a>
                <p>${anime.genres.join(', ')} | ${anime.duration}</p>
            `;
            grid.appendChild(card);
        }
    } catch (error) {
        console.error('Ошибка загрузки JSON:', error);
        grid.innerHTML = '<p>Failed to load anime data.</p>';
    }
});
