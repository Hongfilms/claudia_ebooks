import * as framerMotion from 'https://esm.run/framer-motion';

const BOOK_CONFIG = {
    claudia: {
        title: 'Claudia',
        content: 'content/claudia.md',
        toc: 'data/claudia_toc.json',
    },
    superclaude: {
        title: 'SuperClaude',
        content: 'content/superclaude.md',
        toc: 'data/superclaude_toc.json',
    },
};

let activeTocLink = null;
let headings = [];

function createSlug(text) {
    if (!text) return '';
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrssssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(new RegExp('\\s+', 'g'), '-')
        .replace(p, c => b.charAt(a.indexOf(c)))
        .replace(new RegExp('&', 'g'), '-and-')
        .replace(new RegExp('[^\\w\\-]+', 'g'), '')
        .replace(new RegExp('\\-\\-+', 'g'), '-')
        .replace(new RegExp('^-+'), '')
        .replace(new RegExp('-+$'), '')
}


function buildToc(tocData, container) {
    const fragment = document.createDocumentFragment();
    
    function createLink(item) {
        const link = document.createElement('a');
        link.href = `#${item.slug}`;
        link.textContent = item.title;
        link.className = `toc-link toc-level-${item.level}`;
        link.dataset.slug = item.slug;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetElement = document.getElementById(item.slug);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.history.pushState(null, null, `#${item.slug}`);
            }
            if (window.innerWidth < 768) {
                document.getElementById('sidebar').classList.remove('is-open');
            }
        });
        return link;
    }

    function buildLevel(items) {
        const ul = document.createElement('ul');
        ul.className = 'space-y-1';
        items.forEach(item => {
            const li = document.createElement('li');
            li.appendChild(createLink(item));
            if (item.children && item.children.length > 0) {
                li.appendChild(buildLevel(item.children));
            }
            ul.appendChild(li);
        });
        return ul;
    }

    fragment.appendChild(buildLevel(tocData));
    container.innerHTML = '';
    container.appendChild(fragment);
}


function updateActiveTocLink() {
    let current = '';
    const scrollPosition = document.getElementById('content-container').scrollTop;

    for (const heading of headings) {
        if (heading.offsetTop <= scrollPosition + 100) {
            current = heading.id;
        } else {
            break;
        }
    }

    if (current && current !== activeTocLink) {
        activeTocLink = current;
        document.querySelectorAll('#toc-container .toc-link').forEach(link => {
            link.classList.remove('active');
        });
        const newActiveLink = document.querySelector(`#toc-container .toc-link[data-slug="${current}"]`);
        if (newActiveLink) {
            newActiveLink.classList.add('active');
        }
    }
}

async function loadBook(bookKey) {
    const config = BOOK_CONFIG[bookKey];
    if (!config) {
        document.getElementById('content').innerHTML = '<h1>Book not found</h1>';
        return;
    }

    const { animate } = framerMotion;
    const contentContainer = document.getElementById('content');
    const tocContainer = document.getElementById('toc-container');

    document.title = `${config.title} - E-Book Reader`;
    document.getElementById('book-title').textContent = config.title;

    try {
        const [contentRes, tocRes] = await Promise.all([
            fetch(config.content),
            fetch(config.toc)
        ]);

        if (!contentRes.ok || !tocRes.ok) {
            throw new Error('Failed to load book content or TOC.');
        }

        const markdown = await contentRes.text();
        const tocData = await tocRes.json();

        buildToc(tocData, tocContainer);

        const renderer = new marked.Renderer();
        const originalHeading = renderer.heading.bind(renderer);
        renderer.heading = (text, level, raw) => {
            const slug = createSlug(raw);
            return `<h${level} id="${slug}">${text}</h${level}>`;
        };
        marked.use({ renderer });

        contentContainer.innerHTML = marked.parse(markdown);
        
        headings = Array.from(contentContainer.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        
        animate(
            contentContainer,
            { opacity: [0, 1], y: [10, 0] },
            { duration: 0.5, ease: 'easeOut' }
        );
        animate(
            '#toc-container ul',
            { opacity: [0, 1] },
            { duration: 0.5, delay: 0.2, ease: 'easeOut' }
        );

        document.getElementById('content-container').addEventListener('scroll', updateActiveTocLink);
        
        const initialHash = window.location.hash.substring(1);
        if (initialHash) {
            const targetElement = document.getElementById(initialHash);
            if(targetElement) targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
        
        updateActiveTocLink();

    } catch (error) {
        console.error('Error loading book:', error);
        contentContainer.innerHTML = '<h1>Error loading book. Please try again later.</h1>';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const urlParams = new URLSearchParams(window.location.search);
    const bookKey = urlParams.get('book');

    if (bookKey && BOOK_CONFIG[bookKey]) {
        loadBook(bookKey);
    } else {
        window.location.href = 'index.html';
    }

    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('open-sidebar-btn');
    const closeBtn = document.getElementById('close-sidebar-btn');
    
    openBtn.addEventListener('click', () => sidebar.classList.add('is-open'));
    closeBtn.addEventListener('click', () => sidebar.classList.remove('is-open'));
});
