/**
 * RUMAH ALAM JAYA - Interactive Web Application Script
 * Features: SPA Navigation, Theme Switcher, Count-up Stats, Accordion Guides, Gallery Filter, Form Validator
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SPA Tab Navigation ---
    const navLinks = document.querySelectorAll('.nav-links a, .footer-links-list a');
    const sections = document.querySelectorAll('.page-section');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    function switchPage(targetId) {
        // Remove active class from all links and sections
        navLinks.forEach(link => {
            if (link.getAttribute('data-target') === targetId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        sections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
                // Scroll to top of the page when changing tabs
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                section.classList.remove('active');
            }
        });

        // Trigger stats animation if switching to home page
        if (targetId === 'home') {
            startStatsObserver();
        }

        // Close mobile menu if open
        if (menuToggle.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navLinksContainer.classList.remove('active');
        }
    }

    // Nav Links Click Listeners
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            if (targetId) {
                switchPage(targetId);
                // Update URL hash without jumping
                history.pushState(null, null, `#${targetId}`);
            }
        });
    });

    // Check URL Hash on load
    const currentHash = window.location.hash.substring(1);
    if (currentHash && document.getElementById(currentHash)) {
        switchPage(currentHash);
    } else {
        switchPage('home');
    }

    // Handle back/forward browser buttons
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            switchPage(hash, false);
        } else {
            switchPage('home', false);
        }
    });

    // --- 2. Mobile Nav Toggle ---
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinksContainer.contains(e.target)) {
            menuToggle.classList.remove('active');
            navLinksContainer.classList.remove('active');
        }
    });

    // Sticky Header Scroll Effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 3. Light / Dark Theme Switcher ---
    const themeToggleBtn = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply saved theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeToggleBtn.innerHTML = '☀️'; // Sun icon for light mode option
            themeToggleBtn.setAttribute('title', 'Ganti ke Mode Terang');
        } else {
            themeToggleBtn.innerHTML = '🌙'; // Moon icon for dark mode option
            themeToggleBtn.setAttribute('title', 'Ganti ke Mode Gelap');
        }
    }

    // --- 4. Interactive Counter (Statistik) ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;
        statsAnimated = true;

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            function updateCount(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const easeProgress = 1 - Math.pow(1 - progress, 3);
                
                const value = Math.floor(easeProgress * target);
                
                // Format numbers with dot as thousand separator
                stat.innerText = value.toLocaleString('id-ID');

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    stat.innerText = target.toLocaleString('id-ID') + '+';
                }
            }

            requestAnimationFrame(updateCount);
        });
    }

    // Intersection Observer for Stats
    let statsObserver;
    function startStatsObserver() {
        const statsSection = document.querySelector('.stats-section');
        if (!statsSection) return;

        if (statsObserver) statsObserver.disconnect();
        statsAnimated = false; // Reset to allow re-animation when switching back

        statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                }
            });
        }, { threshold: 0.2 });

        statsObserver.observe(statsSection);
    }
    
    startStatsObserver();

    // --- 5. Gallery Documentation Filter ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const docCards = document.querySelectorAll('.doc-card');

    function filterGallery(category) {
        docCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            if (category === 'all' || cardCat === category) {
                card.classList.add('show');
            } else {
                card.classList.remove('show');
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from other buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-filter');
            filterGallery(category);
        });
    });

    // Initialize gallery filter (show all)
    filterGallery('all');

    // --- 6. Guides Accordion Interaction ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');

            // Close all items
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });

            // Toggle selected item
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- 7. Interactive Composting Calculator / Steps Helper ---
    // Make first accordion active by default
    if (document.querySelector('.accordion-item')) {
        document.querySelector('.accordion-item').classList.add('active');
    }

    // --- 8. Contact Form Validation and Submission ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simple validation
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                showStatus('Mohon isi semua bidang formulir!', 'error');
                return;
            }

            if (!validateEmail(email)) {
                showStatus('Format email tidak valid!', 'error');
                return;
            }

            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Mengirim... <svg class="spinner" viewBox="0 0 50 50" style="width:16px; height:16px; fill:none; stroke:#fff; stroke-width:5; stroke-linecap:round; animation:spin 1s linear infinite; display:inline-block; margin-left:8px;"><circle cx="25" cy="25" r="20" stroke-dasharray="1, 150" stroke-dashoffset="0"></circle></svg>';

            // Styled spinning keyframes added via JS to avoid cluttering main css
            if (!document.getElementById('spinnerStyle')) {
                const style = document.createElement('style');
                style.id = 'spinnerStyle';
                style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
                document.head.appendChild(style);
            }

            setTimeout(() => {
                showStatus('Terima kasih! Pesan Anda telah berhasil dikirim ke Rumah Alam Jaya.', 'success');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }, 1500);
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showStatus(msg, type) {
        formStatus.innerText = msg;
        formStatus.className = `form-status ${type}`;
        
        // Auto hide error/success after 5 seconds
        setTimeout(() => {
            formStatus.style.display = 'none';
        }, 5000);
    }
});
