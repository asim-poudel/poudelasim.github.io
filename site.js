document.addEventListener("DOMContentLoaded", () => {
    // Smoothly animate the loading bar from 0% to 75% on page load
    setTimeout(() => {
        const progressBar = document.getElementById('progress');
        if (progressBar) {
            progressBar.style.width = '75%';
        }
    }, 300);
});
