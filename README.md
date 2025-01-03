# AntennaFeed-Backend

AntennaFeed-Backend is a Node.js backend server for fetching and processing articles and RSS feeds. It uses various libraries such as Express, Axios, Puppeteer, and Readability to fetch, parse, and process web content. This is made to serve the backend for my frontend project which you can find [here](https://github.com/Razen04/AntennaFeed). The server provides endpoints for:

- Fetching and parsing articles from URLs using Readability and Puppeteer as a fallback.
- Fetching RSS feeds and filtering articles based on publication date.
- Converting OPML to JSON format.
- Fetching favicons for given URLs.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Rate Limiting](#rate-limiting)
- [Project Structure](#project-structure)
- [License](#license)

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/razen04/antennafeed-backend.git
    cd antennafeed-backend
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

## Usage

1. Start the server:
    ```sh
    npm run start
    ```

2. The server will run on `http://localhost:3000`.

## API Endpoints

### Articles

- **Fetch Article**
    - **URL:** `/articles/fetch-article`
    - **Method:** `POST`
    - **Body:**
        ```json
        {
            "url": "https://example.com/article"
        }
        ```
    - **Response:**
        ```json
        {
            "feed": {
                "title": "Article Title",
                "content": "Article content...",
                ...
            },
            "image": "https://example.com/image.jpg"
        }
        ```

### Feeds

- **Fetch Feed**
    - **URL:** `/feeds/fetch`
    - **Method:** `POST`
    - **Body:**
        ```json
        {
            "feedLink": "https://example.com/feed"
        }
        ```
    - **Response:**
        ```json
        {
            "relevantFeedData": {
                "title": "Feed Title",
                "link": "https://example.com",
                "items": [
                    {
                        "id": "https://example.com/article1",
                        "title": "Article 1",
                        ...
                    },
                    ...
                ]
            }
        }
        ```

### OPML

- **Convert OPML to JSON**
    - **URL:** `/opml/opmltojson`
    - **Method:** `POST`
    - **Body:**
        ```json
        {
            "body": "<opml>...</opml>"
        }
        ```
    - **Response:**
        ```json
        [
            {
                "id": "uuid-1",
                "selected": false,
                "folder": null,
                "level": 1,
                "type": "main-parent",
                "text": "Feed 1",
                "children": []
            },
            ...
        ]
        ```

## Rate Limiting

The server uses rate limiting to prevent abuse. Each user can make up to 10 requests per minute for both feeds and articles to prevent exploitation. If the limit is exceeded, the server will respond with a `429 Too Many Requests` status and the following message:

```json
{
    "message": "Too many requests from this IP, please try again after a minute"
}
```

## Project Structure

```
.
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── server.js
├── .env
├── src
│   ├── controllers
│   │   ├── articleController.js
│   │   ├── feedController.js
│   │   └── opmlController.js
│   ├── middlewares
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── routes
│   │   ├── articleRoutes.js
│   │   ├── feedRoutes.js
│   │   └── opmlRoutes.js
│   ├── services
│   │   ├── articleService.js
│   │   ├── feedService.js
│   │   └── opmlService.js
│   ├── utils
│   │   └── helpers.js
```
### License

Read the [LICENSE](LICENSE) file for more info.