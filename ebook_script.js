document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const contentElement = document.getElementById('content');
    const tocListElement = document.getElementById('toc-list');
    const markdownPath = document.body.dataset.markdown;

    if (contentElement && tocListElement && markdownPath) {
        loadEbook(markdownPath, contentElement, tocListElement);
    }
});

async function loadEbook(path, contentEl, tocEl) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const markdown = await response.text();
        contentEl.innerHTML = marked.parse(markdown);

        generateTOC(contentEl, tocEl);
        setupSmoothScroll(tocEl);
        setupScrollSpy(contentEl, tocEl);
    } catch (error) {
        console.error('Error loading ebook content:', error);
        contentEl.innerHTML = '<p class="text-red-400">콘텐츠를 불러오는 데 실패했습니다. 페이지를 새로고침하거나 나중에 다시 시도해 주세요.</p>';
    }
}

function generateTOC(contentEl, tocEl) {
    const headings = contentEl.querySelectorAll('h3, h4');
    const fragment = document.createDocumentFragment();
    let currentChapterList = null;

    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;

        const text = heading.textContent.replace(/^[0-9.]+\s*/, '').replace(/^[✅- χώρο]+/, '').trim();
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = text;
        link.className = 'block hover:text-white transition-all duration-200';

        if (heading.tagName === 'H3') {
            const listItem = document.createElement('li');
            listItem.className = 'mt-4';
            
            link.className += ' font-semibold text-gray-300';
            listItem.appendChild(link);
            
            currentChapterList = document.createElement('ul');
            currentChapterList.className = 'pl-4 mt-2 border-l border-gray-700 space-y-2';
            listItem.appendChild(currentChapterList);

            fragment.appendChild(listItem);
        } else if (heading.tagName === 'H4' && currentChapterList) {
            const subListItem = document.createElement('li');
            link.className += ' text-gray-400';
            subListItem.appendChild(link);
            currentChapterList.appendChild(subListItem);
        }
    });

    tocEl.appendChild(fragment);
}

function setupSmoothScroll(tocEl) {
    tocEl.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const targetId = e.target.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
}

function setupScrollSpy(contentEl, tocEl) {
    const headings = Array.from(contentEl.querySelectorAll('h3, h4'));
    const tocLinks = Array.from(tocEl.querySelectorAll('a'));

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(entries => {
        let latestIntersecting = null;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                latestIntersecting = entry.target;
            }
        });

        const visibleHeadings = headings.filter(h => {
             const rect = h.getBoundingClientRect();
             return rect.top >= 0 && rect.top <= window.innerHeight / 2;
        });

        let activeId = null;
        if(visibleHeadings.length > 0) {
            activeId = visibleHeadings[0].id;
        }

        tocLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (`#${activeId}` === href) {
                link.classList.add('active');
            }
        });

    }, {
        rootMargin: '0px 0px -50% 0px',
        threshold: 0
    });

    headings.forEach(section => observer.observe(section));
}
