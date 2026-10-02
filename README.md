# Biblioteca Bookstore Events

A simple bookstore events website built with HTML, CSS, and vanilla JavaScript.

The page lets users browse upcoming events, search by keyword, filter events by category, and add new events through the form.

## Features

- Browse upcoming bookstore events
- Search events by name, author, or location
- Filter events by category
- Loading and empty states
- Add new events using the form
- Form validation with error messages
- Toast notifications for user actions
- Events loaded from a JSON file
- Local storage support
- Responsive design
- Automated tests
- Docker support
- GitHub Actions CI/CD

## Project Structure

```text
Biblioteca-Bookstore-Events/
│
├── index.html
├── config.js
├── package.json
├── .dockerignore
├── package.json
├── data/events.json
├── css/
│   └── style.css
│
├── script/
│   ├── utils.js
│   └── script.js
│
├── assests/
│   ├── data/
│   │   └── events.json
│   └── images/
│       ├── books.jpg
│       └── bookstore1.jpg
│
├── tests/
│   └── data.test.js
    |
    └── utils.test.js
    |
    └── validate.test.js
│
├── docker/
│   └── 40-config.sh
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
└── Dockerfile
