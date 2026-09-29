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

function requiredEmail(value, name) {
    const email = requiredText(value, name);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(`${name} must be a valid email address`);
    }

    return email;
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
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${heading} (opens in a new tab)`);
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
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `View the ${projectHeading} repository on GitHub in a new tab`);

    const mark = document.createElement("span");
    mark.className = "github-mark icon-mask icon-mask--github";
    mark.setAttribute("aria-hidden", "true");
    link.append(mark);

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

async function copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {}
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();

    try {
        return typeof document.execCommand === "function" && document.execCommand("copy");
    } catch {
        return false;
    } finally {
        textarea.remove();
    }
}

function renderContact(data) {
    document.querySelector("[data-contact-heading]").textContent = requiredText(data.heading, "contact.heading");

    const email = requiredEmail(data.email, "contact.email");
    const socials = [
        ["Facebook", "facebook", requiredHttpsUrl(data.facebookUrl, "contact.facebookUrl")],
        ["Instagram", "instagram", requiredHttpsUrl(data.instagramUrl, "contact.instagramUrl")],
        ["LinkedIn", "linkedin", requiredHttpsUrl(data.linkedinUrl, "contact.linkedinUrl")]
    ];
    const actions = document.createElement("div");
    actions.className = "contact-actions";

    const emailButton = document.createElement("button");
    emailButton.className = "contact-action contact-action--email";
    emailButton.type = "button";
    emailButton.setAttribute("aria-label", `Copy ${email} to clipboard`);
    emailButton.setAttribute("aria-expanded", "false");
    emailButton.setAttribute("aria-controls", "contact-email-address");

    const emailIcon = document.createElement("span");
    emailIcon.className = "contact-action__icon icon-mask icon-mask--gmail";
    emailIcon.setAttribute("aria-hidden", "true");

    const address = document.createElement("span");
    address.className = "contact-action__address";
    address.id = "contact-email-address";
    address.textContent = email;
    address.setAttribute("aria-hidden", "true");
    emailButton.append(emailIcon, address);
    actions.append(emailButton);

    for (const [label, icon, url] of socials) {
        const link = document.createElement("a");
        link.className = "contact-action";
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `Open ${label} profile in a new tab`);

        const mark = document.createElement("span");
        mark.className = `contact-action__icon icon-mask icon-mask--${icon}`;
        mark.setAttribute("aria-hidden", "true");
        link.append(mark);
        actions.append(link);
    }

    const copyStatus = document.createElement("p");
    copyStatus.className = "contact-copy-status";
    copyStatus.setAttribute("role", "status");
    copyStatus.setAttribute("aria-live", "polite");
    copyStatus.setAttribute("aria-atomic", "true");

    let copyStatusTimer;
    let emailActionId = 0;
    emailButton.addEventListener("click", async () => {
        const expanded = !emailButton.classList.contains("is-revealed");
        const actionId = ++emailActionId;

        clearTimeout(copyStatusTimer);
        copyStatus.textContent = "";
        emailButton.classList.toggle("is-revealed", expanded);
        emailButton.setAttribute("aria-expanded", String(expanded));
        emailButton.setAttribute("aria-label", expanded ? `Hide ${email}` : `Copy ${email} to clipboard`);
        address.setAttribute("aria-hidden", String(!expanded));
        emailButton.focus();

        if (!expanded) {
            return;
        }

        const copied = await copyToClipboard(email);

        if (actionId !== emailActionId || !emailButton.classList.contains("is-revealed")) {
            return;
        }

        copyStatus.textContent = copied
            ? "Email copied to clipboard."
            : "Copy failed. Email is shown above.";
        copyStatusTimer = setTimeout(() => {
            if (actionId === emailActionId) {
                copyStatus.textContent = "";
            }
        }, 3000);
    });

    document.querySelector("[data-contact-content]").replaceChildren(actions, copyStatus);
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
loadSection("contact.json", renderContact, "[data-contact-content]", "Contact links are unavailable.");
