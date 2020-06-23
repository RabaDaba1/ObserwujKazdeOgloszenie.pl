// Show hidden card content on click
const cards = Array.from(document.querySelectorAll('.offer'));

cards.forEach(el => {
    el.addEventListener('click', () => {
        el.classList.toggle('active');
    });
})