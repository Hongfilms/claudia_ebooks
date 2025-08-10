import * as framerMotion from 'https://esm.run/framer-motion';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    const { animate } = framerMotion;

    const cards = document.querySelectorAll('.book-card');
    cards.forEach((card, index) => {
        animate(
            card,
            { opacity: [0, 1], y: [20, 0] },
            { duration: 0.5, delay: index * 0.15, ease: 'easeOut' }
        );
    });
});
