# Финансы Просто

Статический сайт про личные финансы для новичков в США.

## Локальный запуск

```bash
python3 -m http.server 8080
```

Открой: `http://localhost:8080`

## Перед публикацией

1. Замени `https://example.com` на реальный домен в файлах:
- `index.html`
- `about.html`
- `contact.html`
- `privacy.html`
- `articles/*.html`
- `robots.txt`
- `sitemap.xml`

2. Замени email `hello@example.com` на рабочий.

## Бесплатный деплой (GitHub Pages)

В проект уже добавлен workflow: `.github/workflows/pages.yml`.

1. Создай репозиторий на GitHub и загрузи эти файлы в ветку `main`.
2. В GitHub открой `Settings` -> `Pages`.
3. В `Build and deployment` выбери `Source: GitHub Actions`.
4. После первого пуша сайт опубликуется автоматически.

## Альтернатива: Cloudflare Pages

1. Подключи этот репозиторий в Cloudflare Pages.
2. Framework preset: `None`.
3. Build command: пусто.
4. Build output directory: `/`.

## Монетизация

Добавь Google AdSense после накопления контента (20+ статей).
