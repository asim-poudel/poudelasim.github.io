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

setTheme(root.dataset.theme);
toggle.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});
