# Student Hub

**Your academic life, organized.**

Student Hub is a responsive student productivity dashboard built with HTML, CSS and vanilla JavaScript. It is designed as a frontend demonstration project for an IILP submission.

## Features

- Dashboard with task, notes and completion statistics
- Add, complete, filter and delete tasks
- Plan study sessions by date, time and duration
- Create and delete personal notes
- Dark and light theme switcher
- LocalStorage persistence (data stays in the same browser)
- Responsive layout for desktop, tablet and mobile

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript
- Browser LocalStorage

## Run locally

1. Download or clone this repository.
2. Open the `STUDENT-HUB` folder in Visual Studio Code.
3. Open `index.html` in a browser.

You can also use the VS Code Live Server extension for automatic refresh while developing.

## Publish with GitHub Pages

1. Create a new GitHub repository named `student-hub`.
2. Upload the contents of this folder to the repository's root (make sure `index.html` is at the root).
3. Open **Settings → Pages** in the repository.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish your site. The URL will appear in the Pages settings.

## Project structure

```text
STUDENT-HUB/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/
│   ├── images/
│   └── icons/
├── README.md
└── LICENSE
```

## Notes

- This is a frontend-only demonstration. It does not include accounts, cloud sync or a backend.
- Tasks, notes and study sessions are saved in the browser's LocalStorage on the device/browser where they were created.
- Google Fonts are loaded online; the site uses fallback fonts if they are unavailable.

## License

MIT — see [LICENSE](LICENSE).
