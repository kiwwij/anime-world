document.addEventListener("DOMContentLoaded", () => {
    // Загружаем JSON с аниме
    fetch("data/anime.json")
        .then(response => response.json())
        .then(data => {
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

            const header = document.getElementById("anime-header");
            header.style.background = `url('${anime.images.header}') center/cover no-repeat`;

            document.getElementById("anime-genres").textContent = anime.genres.join(", ");
            document.getElementById("anime-duration").textContent = anime.duration;
            document.getElementById("anime-type").textContent = anime.type;
            document.getElementById("anime-language").textContent = anime.language;

            // Постер
            document.getElementById("anime-poster").src = anime.images.poster;

            // --- Получаем данные с Jikan ---
            fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(anime.title)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.data && data.data.length > 0) {
                        const jikanAnime = data.data.find(a => a.title === anime.title) || data.data[0];
                        const score = jikanAnime.score || 0;

                        document.getElementById("rating-value").textContent = `${score}/10`;
                        const starsCount = Math.round(score / 2);
                        document.getElementById("rating-stars").textContent =
                            "★★★★★☆☆☆☆☆".slice(0, starsCount + 5).slice(0, 5);

                        document.getElementById("anime-poster").src =
                            jikanAnime.images.jpg.large_image_url || anime.images.poster;
                    } else {
                        fallbackRating(anime);
                        console.error("Anime not found in Jikan:", anime.title);
                    }
                })
                .catch(err => {
                    fallbackRating(anime);
                    console.error(err);
                });

            function fallbackRating(anime) {
                document.getElementById("rating-value").textContent = `${anime.rating}/5`;
                document.getElementById("rating-stars").textContent =
                    "★★★★★".slice(0, Math.round(anime.rating)) +
                    "☆☆☆☆☆".slice(Math.round(anime.rating));
            }

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

            // Манга / Лайт-новелла
            const mangaSection = document.querySelector(".manga-section");
            const mangaTitle = mangaSection.querySelector("h3");
            const mangaCovers = document.getElementById("manga-covers");

            if (anime.images.manga && anime.images.manga.length > 0) {
                mangaTitle.textContent = "Manga Volumes";
                anime.images.manga.forEach(manga => {
                    const img = document.createElement("img");
                    img.src = manga;
                    img.alt = anime.title + " manga volume";
                    mangaCovers.appendChild(img);
                });
            } else if (anime.images.light_novel && anime.images.light_novel.length > 0) {
                mangaTitle.textContent = "Ranobe / Light Novels";
                anime.images.light_novel.forEach(novel => {
                    const img = document.createElement("img");
                    img.src = novel;
                    img.alt = anime.title + " light novel volume";
                    mangaCovers.appendChild(img);
                });
            } else {
                // скрыть секцию, если ничего нет
                mangaSection.style.display = "none";
            }

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
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");

    lightbox.style.display = "flex";
    lightboxImg.src = src;
}

// Закрытие
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("close")) {
        document.getElementById("lightbox").style.display = "none";
    }
});

// Переключение стрелками
document.querySelector(".lightbox .prev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    document.getElementById("lightbox-img").src = images[currentIndex];
});

document.querySelector(".lightbox .next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    document.getElementById("lightbox-img").src = images[currentIndex];
});

// Закрытие по клику на фон
document.getElementById("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") {
        e.currentTarget.style.display = "none";
    }
});

// Закрытие по клавише ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.getElementById("lightbox").style.display = "none";
    }
});
