document.addEventListener("DOMContentLoaded", () => {
    // Загружаем JSON с аниме
    fetch("data/anime.json")
        .then(response => response.json())
        .then(data => {
            // Получаем id аниме из URL
            const params = new URLSearchParams(window.location.search);
            const animeId = params.get("id");

            // Ищем аниме по id
            const anime = data.find(item => item.id === animeId);

            if (!anime) {
                document.querySelector(".anime-title").textContent = "Anime not found";
                return;
            }

            // ---- Динамическая подстановка данных ----
            document.title = `${anime.title} - AnimeWorld`;
            
            // Основные данные
            document.getElementById("anime-title").textContent = anime.title;
            document.getElementById("anime-year").textContent = anime.year;
            // Подставляем header
            const header = document.getElementById("anime-header");
            header.style.background = `url('${anime.images.header}') center/cover no-repeat`;
            document.getElementById("anime-genres").textContent = anime.genres.join(", ");
            document.getElementById("anime-duration").textContent = anime.duration;
            document.getElementById("anime-type").textContent = anime.type;
            document.getElementById("anime-language").textContent = anime.language;

            // Постер
            document.getElementById("anime-poster").src = anime.images.poster;

            // Получаем данные с Jikan
            fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime.title)}`)
            .then(response => response.json())
            .then(data => {
                if (data.data && data.data.length > 0) {
                // Найти точное совпадение по названию или взять первый результат
                const jikanAnime = data.data.find(a => a.title === anime.title) || data.data[0];

                // Рейтинг
                const score = jikanAnime.score || 0;
                document.getElementById("rating-value").textContent = `${score}/10`;
                const starsCount = Math.round(score / 2);
                document.getElementById("rating-stars").textContent =
                    "★★★★★☆☆☆☆☆".slice(0, starsCount + 5).slice(0, 5);

                // Постер
                const posterUrl = jikanAnime.images.jpg.large_image_url || anime.images.poster;
                document.getElementById("anime-poster").src = posterUrl;

                } else {
                // fallback на JSON
                document.getElementById("rating-value").textContent = `${anime.rating}/5`;
                document.getElementById("rating-stars").textContent =
                    "★★★★★".slice(0, Math.round(anime.rating)) + "☆☆☆☆☆".slice(Math.round(anime.rating));
                document.getElementById("anime-poster").src = anime.images.poster;
                console.error("Anime not found in Jikan:", anime.title);
                }
            })
            .catch(err => {
                // fallback на JSON
                document.getElementById("rating-value").textContent = `${anime.rating}/5`;
                document.getElementById("rating-stars").textContent =
                "★★★★★".slice(0, Math.round(anime.rating)) + "☆☆☆☆☆".slice(Math.round(anime.rating));
                document.getElementById("anime-poster").src = anime.images.poster;
                console.error(err);
            });

            // Режиссер и актеры
            document.getElementById("anime-director").textContent = anime.director;
            document.getElementById("anime-cast").textContent = anime.cast.join(", ");

            // Описание
            document.getElementById("anime-description").textContent = anime.description;

            // Цитата
            document.getElementById("anime-quote").textContent = `"${anime.quote}"`;

            // Галерея сцен
            const scenesGrid = document.getElementById("scenes-grid");
            anime.images.scenes.forEach(scene => {
                const img = document.createElement("img");
                img.src = scene;
                img.alt = anime.title + " scene";
                img.classList.add("scene-image");
                img.addEventListener("click", () => openLightbox(scene));
                scenesGrid.appendChild(img);
            });

            // Манга
            const mangaCovers = document.getElementById("manga-covers");
            anime.images.manga.forEach(manga => {
                const img = document.createElement("img");
                img.src = manga;
                img.alt = anime.title + " manga volume";
                mangaCovers.appendChild(img);
            });

            // Open Graph и Twitter
            document.querySelector('meta[property="og:title"]').setAttribute("content", anime.title);
            document.querySelector('meta[property="og:description"]').setAttribute("content", anime.description);
            document.querySelector('meta[property="og:image"]').setAttribute("content", anime.images.poster);

            document.querySelector('meta[name="twitter:title"]').setAttribute("content", anime.title);
            document.querySelector('meta[name="twitter:description"]').setAttribute("content", anime.description);
            document.querySelector('meta[name="twitter:image"]').setAttribute("content", anime.images.poster);

            // Lightbox
            initLightbox(anime.images.scenes);
        });
});

// ----- Lightbox -----
let currentIndex = 0;
let images = [];

function initLightbox(imgArray) {
    images = imgArray;
}

function openLightbox(src) {
    currentIndex = images.indexOf(src);
    document.getElementById("lightbox").style.display = "block";
    document.getElementById("lightbox-img").src = src;
}

document.querySelector(".lightbox .close").addEventListener("click", () => {
    document.getElementById("lightbox").style.display = "none";
});

document.querySelector(".lightbox .prev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    document.getElementById("lightbox-img").src = images[currentIndex];
});

document.querySelector(".lightbox .next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    document.getElementById("lightbox-img").src = images[currentIndex];
});
