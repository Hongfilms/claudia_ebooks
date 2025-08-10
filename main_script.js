import * as framerMotion from 'https://esm.run/framer-motion';

document.addEventListener('DOMContentLoaded', () => {
    framerMotion.animate(
        '#main-title',
        { opacity: [0, 1], y: [-20, 0] },
        { duration: 0.6, ease: "easeOut" }
    );

    framerMotion.animate(
        '#main-title + p',
        { opacity: [0, 1], y: [-20, 0] },
        { duration: 0.6, delay: 0.2, ease: "easeOut" }
    );
    
    framerMotion.animate(
        '#ebook-cards > a',
        { opacity: [0, 1], y: [20, 0] },
        { delay: framerMotion.stagger(0.2, { startDelay: 0.4 }), duration: 0.5, ease: "easeOut" }
    );
});
