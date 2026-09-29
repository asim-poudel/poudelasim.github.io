const root = document.documentElement;
const toggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');

function setTheme(theme) {
    const dark = theme === "dark";
    const label = `Switch to ${dark ? "light" : "dark"} theme`;

    root.dataset.theme = dark ? "dark" : "light";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    themeColor.content = dark ? "#000000" : "#ffffff";

    try {
        localStorage.setItem("theme", root.dataset.theme);
    } catch {}
}

function requiredText(value, name) {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${name} must be a non-empty string`);
    }

    return value.trim();
}

function requiredHttpsUrl(value, name) {
    const url = new URL(requiredText(value, name));

    if (url.protocol !== "https:") {
        throw new Error(`${name} must use HTTPS`);
    }

    return url.href;
}

async function loadJson(path) {
    const response = await fetch(path, { cache: "no-store" });

    if (!response.ok) {
        throw new Error(`${path} returned ${response.status}`);
    }

    return response.json();
}

function status(message) {
    const paragraph = document.createElement("p");
    paragraph.className = "section-status";
    paragraph.textContent = message;
    return paragraph;
}

function renderAbout(data) {
    document.querySelector("[data-about-heading]").textContent = requiredText(data.heading, "about.heading");

    const paragraph = document.createElement("p");
    paragraph.textContent = requiredText(data.paragraph, "about.paragraph");
    document.querySelector("[data-about-content]").replaceChildren(paragraph);
}

function createEntry(heading, description, url) {
    const article = document.createElement("article");
    article.className = "entry";

    const headingRow = document.createElement("div");
    headingRow.className = "entry__heading-row";

    const title = document.createElement("h3");
    title.className = "entry__title";

    const link = document.createElement("a");
    link.className = "entry__link";
    link.href = url;
    link.textContent = heading;
    title.append(link);
    headingRow.append(title);

    const copy = document.createElement("p");
    copy.className = "entry__description";
    copy.textContent = description;

    article.append(headingRow, copy);
    return { article, headingRow };
}

function createGitHubLink(projectHeading, githubUrl) {
    const link = document.createElement("a");
    link.className = "github-link";
    link.href = githubUrl;
    link.setAttribute("aria-label", `View the ${projectHeading} repository on GitHub`);

    for (const theme of ["light", "dark"]) {
        const image = document.createElement("img");
        image.className = `github-mark github-mark--${theme}`;
        image.src = `assets/images/${theme}.png`;
        image.width = 512;
        image.height = 512;
        image.alt = "";
        image.decoding = "async";
        link.append(image);
    }

    return link;
}

function renderProjects(data) {
    document.querySelector("[data-projects-heading]").textContent = requiredText(data.heading, "projects.heading");

    if (!Array.isArray(data.items)) {
        throw new Error("projects.items must be an array");
    }

    const container = document.querySelector("[data-projects-content]");

    if (data.items.length === 0) {
        container.replaceChildren(status("No projects published yet."));
        return;
    }

    const entries = data.items.map((project, index) => {
        const heading = requiredText(project.heading, `projects.items[${index}].heading`);
        const description = requiredText(project.description, `projects.items[${index}].description`);
        const websiteUrl = requiredHttpsUrl(project.websiteUrl, `projects.items[${index}].websiteUrl`);
        const githubUrl = requiredHttpsUrl(project.githubUrl, `projects.items[${index}].githubUrl`);
        const { article, headingRow } = createEntry(heading, description, websiteUrl);

        headingRow.append(createGitHubLink(heading, githubUrl));
        return article;
    });

    container.replaceChildren(...entries);
}

function renderThoughts(data) {
    document.querySelector("[data-thoughts-heading]").textContent = requiredText(data.heading, "thoughts.heading");

    if (!Array.isArray(data.items)) {
        throw new Error("thoughts.items must be an array");
    }

    const container = document.querySelector("[data-thoughts-content]");

    if (data.items.length === 0) {
        container.replaceChildren(status("No thoughts published yet."));
        return;
    }

    const entries = data.items.map((thought, index) => {
        const heading = requiredText(thought.heading, `thoughts.items[${index}].heading`);
        const description = requiredText(thought.description, `thoughts.items[${index}].description`);
        const blogUrl = requiredHttpsUrl(thought.blogUrl, `thoughts.items[${index}].blogUrl`);
        return createEntry(heading, description, blogUrl).article;
    });

    container.replaceChildren(...entries);
}

function loadSection(path, render, containerSelector, errorMessage) {
    loadJson(path)
        .then(render)
        .catch((error) => {
            console.error(error);
            document.querySelector(containerSelector).replaceChildren(status(errorMessage));
        });
}

setTheme(root.dataset.theme);
toggle.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

loadSection("about.json", renderAbout, "[data-about-content]", "About content is unavailable.");
loadSection("project.json", renderProjects, "[data-projects-content]", "Projects are unavailable.");
loadSection("thoughts.json", renderThoughts, "[data-thoughts-content]", "Thoughts are unavailable.");
