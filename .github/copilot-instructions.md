# Copilot Instructions for Judovisa

This project is a Finnish-language educational web app for learning Judo techniques. It consists of three main files:
- `index.html`: Main HTML structure, navigation, and content sections for different Judo technique categories.
- `script.js`: Handles all interactive logic, including question management, answer validation, and user feedback. Finnish variable/function names are used throughout.
- `style.css`: Provides layout and visual styling, including sticky header, responsive navigation, and content wrappers.

## Architecture & Data Flow
- The app is single-page, with navigation links scrolling to technique sections.
- Each section contains a question, input field, and feedback area. Questions and answers are managed in JavaScript.
- All logic for question order, answer checking, and UI updates is in `script.js`. Data for questions is stored in the `kysymysData` object.
- User input is normalized for comparison (see `muotoileVertailuun`).

## Developer Workflows
- No build tools or frameworks; edit HTML/CSS/JS directly.
- No automated tests or CI/CD; changes are previewed in the browser.
- Debugging is done via browser DevTools (console, inspector).

## Project-Specific Patterns
- All code and UI labels are in Finnish; maintain this for consistency.
- Use semantic HTML for accessibility (e.g., `<section>`, `<nav>`, `<header>`).
- JavaScript functions and variables use descriptive Finnish names (e.g., `lisaaTapahtumat`, `kysymysJarjestys`).
- CSS uses class names matching Finnish terminology (e.g., `.kysymykset`).

## Integration Points
- No external libraries or APIs are used.
- All dependencies are local; no package manager or external build steps.

## Examples
- To add a new question, create a new `<section>` in `index.html` and update `script.js` to handle its logic.
- To change the UI, edit `style.css` and preview in the browser.

## Key Files
- `index.html`: Structure and navigation
- `script.js`: Interactive logic, question/answer management
- `style.css`: Layout and visual design

---
For questions, follow the existing Finnish naming and UI conventions. If adding new features, keep all code and comments in Finnish for consistency.
