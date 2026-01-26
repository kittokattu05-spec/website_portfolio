/**
 * Keith's Retro OS Portfolio - Main JavaScript File
 *
 * This script powers a retro operating system-inspired portfolio website.
 * It features a boot sequence, draggable windows, theme switching, sound effects,
 * and various portfolio sections showcasing development work and creative content.
 *
 * Architecture:
 * - Boot sequence animation on page load
 * - Desktop with clickable icons that open windows
 * - Draggable, resizable windows with retro styling
 * - Theme switching (light/dark mode)
 * - Sound effects for user interactions
 * - Slideshow functionality for project showcases
 *
 * Key Components:
 * - Window management system with z-index stacking
 * - Dynamic content loading based on window type
 * - Responsive design with retro aesthetics
 * - Accessibility features (keyboard navigation, screen reader support)
 *
 * @author Keith Louie Panagsagan
 * @version 1.0.0
 * @date January 2026
 */

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    // Core DOM element references for the OS interface
    const bootEl = document.getElementById('boot-sequence');        // Boot animation container
    const desktop = document.getElementById('desktop');             // Main desktop area
    const themeToggle = document.getElementById('theme-toggle');    // Theme switcher button
    const themeIcon = document.getElementById('theme-icon');        // Sun/moon icon in theme button
    const windowsContainer = document.getElementById('windows-container'); // Container for all windows
    const clockTimeEl = document.getElementById('clock-time');     // Taskbar time element
    const clockDateEl = document.getElementById('clock-date');     // Taskbar date element

    // Global state variables
    let isDark = false;        // Current theme state (false = light, true = dark)
    let zIndexCounter = 100;   // Z-index counter for window stacking order
    let dosboxLoaded = false;  // Flag to track if JS-DOS API is loaded

    // Load JS-DOS API globally for DOOM
    const dosboxScript = document.createElement('script');
    dosboxScript.src = 'assets/doom_on_js-dos-main/js-dos-api.js';
    dosboxScript.onload = () => { dosboxLoaded = true; };
    document.head.appendChild(dosboxScript);

    // Sound system - Audio files for user interactions
    // All sounds are preloaded and have reduced volume for better UX
    const sounds = {
        click: new Audio('assets/click.wav'),     // General click sounds
        window: new Audio('assets/window.wav'),   // Window open/close sounds
        toggle: new Audio('assets/toggle.mp3'),   // Theme toggle sound
        bootup: new Audio('assets/bootup.wav')    // Boot sequence completion
    };

    // Preload all audio files to prevent delays during playback
    // Set volume to 30% to avoid being too loud/annoying
    Object.values(sounds).forEach(sound => {
        sound.preload = 'auto';  // Force browser to load audio immediately
        sound.volume = 0.3;      // Set volume to 30% (0.0 to 1.0 scale)
    });

    /**
     * Plays a sound effect by name
     * @param {string} soundName - The key name of the sound to play (click, window, toggle, bootup)
     * Handles audio playback errors gracefully (missing files, browser restrictions)
     */
    function playSound(soundName) {
        const sound = sounds[soundName];
        if (sound) {
            sound.currentTime = 0; // Reset to start (allows rapid replay)
            sound.play().catch(e => {
                // Silently fail if audio can't play (no files or browser restrictions)
                console.log('Sound not available:', soundName);
            });
        }
    }

    /**
     * Clock / Date for Taskbar
     * Updates every second in HH:MM:SS and short weekday + date format
     */
    function updateClock() {
        if (!clockTimeEl || !clockDateEl) return;
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        clockTimeEl.textContent = `${hh}:${mm}:${ss}`;

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayName = days[now.getDay()];
        const date = now.getDate();
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();
        clockDateEl.textContent = `${dayName} ${date} ${monthName} ${year}`;
    }

    let _clockInterval = null;
    function startClock() {
        updateClock();
        if (_clockInterval) clearInterval(_clockInterval);
        _clockInterval = setInterval(updateClock, 1000);
    }

    // Initialize the boot sequence when page loads
    startBootSequence();
    // Start the taskbar clock updater (will run while booting and be visible once desktop shows)
    startClock();

    /**
     * Boot Sequence Animation
     * Creates a retro terminal-style boot animation that mimics OS startup
     * Types text character by character, shows loading bars, and transitions to desktop
     */
    function startBootSequence() {
        const terminal = document.getElementById('boot-terminal');
        let output = '';
        const typingSpeed = 25; // milliseconds per character (faster = more dramatic)

        /**
         * Types text character by character with a blinking cursor effect
         * @param {string} text - The text to type out
         * @param {function} callback - Function to call when typing is complete
         */
        function typeText(text, callback) {
            let i = 0;
            const interval = setInterval(() => {
                output += text[i];
                terminal.textContent = output + '_'; // Add blinking cursor
                i++;
                if (i >= text.length) {
                    clearInterval(interval);
                    terminal.textContent = output; // Remove cursor when done
                    if (callback) callback();
                }
            }, typingSpeed);
        }

        /**
         * Animates a loading progress bar with percentage counter
         * @param {function} callback - Function to call when loading is complete
         */
        function animateLoadingBar(callback) {
            let progress = '';
            const barLength = 12; // Length of the progress bar in characters
            const interval = setInterval(() => {
                progress += '█'; // Unicode block character for progress bar
                const barText = 'Checking memory... [' + progress + '] ' + Math.round((progress.length / barLength) * 100) + '%\n';
                output = output.replace(/Checking memory\.\.\. \[.*\]\s*\d+%\n/, barText);
                terminal.textContent = output;
                if (progress.length >= barLength) {
                    clearInterval(interval);
                    if (callback) callback();
                }
            }, 150); // Speed of bar filling (milliseconds)
        }

        // Boot sequence timeline - chained callbacks create the animation flow
        typeText('INIT: System boot sequence started...\n', () => {
            setTimeout(() => {
                typeText('Loading kernel modules... [OK]\n', () => {
                    setTimeout(() => {
                        // Initialize loading bar animation
                        output += 'Checking memory... [] 0%\n';
                        terminal.textContent = output;
                        animateLoadingBar(() => {
                            setTimeout(() => {
                                typeText('Mounting filesystems... [OK]\n', () => {
                                    setTimeout(() => {
                                        typeText('Starting keith.portfolio...\n', () => {
                                            setTimeout(() => {
                                                bootEl.classList.add('hidden');
                                                desktop.classList.remove('hidden');
                                                desktop.classList.add('fade-in');
                                                openWindow('home');
                                                // Play bootup intro sound
                                                playSound('bootup');
                                            }, 500);
                                        });
                                    }, 200);
                                });
                            }, 200);
                        });
                    }, 300);
                });
            }, 300);
        });
    }

    /**
     * Theme Toggle System
     * Switches between light and dark themes with smooth transitions
     * Updates icon, plays sound, and maintains state across windows
     */
    themeToggle.addEventListener('click', () => {
        playSound('toggle');              // Play theme toggle sound
        isDark = !isDark;                 // Toggle theme state
        desktop.classList.toggle('dark', isDark);  // Apply/remove dark class
        themeIcon.src = isDark ? 'assets/moon.png' : 'assets/sun.png'; // Update icon
        updateProfileImage();             // Update profile image in home window
    });

    /**
     * Desktop Icon Click Handlers
     * Attaches click listeners to all desktop icons
     * Each icon opens a corresponding window type
     */
    document.querySelectorAll('.icon').forEach(icon => {
        icon.addEventListener('click', () => {
            playSound('click');                    // Play click sound
            const windowType = icon.dataset.window; // Get window type from data attribute
            openWindow(windowType);                // Open the corresponding window
        });
    });

    /**
     * Updates profile image based on current theme
     * Called when theme changes to maintain visual consistency
     */
    function updateProfileImage() {
        const profileImg = document.querySelector('.window[data-type="home"] img');
        if (profileImg) {
            profileImg.src = isDark ? 'assets/myself.jpg' : 'assets/me.jpg';
        }
    }

    /**
     * Opens a new window or brings existing window to front
     * @param {string} type - The type of window to open (home, about, projects, etc.)
     * Prevents duplicate windows and manages window stacking
     */
    function openWindow(type) {
        // Check if a window of this type already exists
        const existingWindow = document.querySelector(`.window[data-type="${type}"]`);
        if (existingWindow) {
            bringToFront(existingWindow); // Bring existing window to front
            return; // Don't create duplicate
        }

        // Create new window
        const windowEl = createWindow(type);
        windowsContainer.appendChild(windowEl); // Add to DOM
        bringToFront(windowEl);                  // Bring to front
        makeDraggable(windowEl);                 // Enable dragging

        // Special initialization for specific window types
        if (type === 'projects') {
            // Initialize slideshow after window is rendered
            setTimeout(() => initializeSlideshow(), 100);
        } else if (type === 'doom') {
            // Initialize DOOM emulator after window is rendered
            setTimeout(() => initializeDoom(), 200);
        }
    }

    /**
     * Creates a new window element with title bar and content
     * @param {string} type - The type of window content to create
     * @returns {HTMLElement} The created window element
     */
    function createWindow(type) {
        const windowEl = document.createElement('div');
        windowEl.className = 'window fade-in';    // Base window classes
        windowEl.dataset.type = type;             // Store window type for identification

        // Apply size-specific classes for different window types
        if (type === 'home') windowEl.classList.add('home-window');
        else if (type === 'about') windowEl.classList.add('about-window');
        else if (type === 'projects') windowEl.classList.add('projects-window');
        else if (type === 'faq') windowEl.classList.add('faq-window');
        else if (type === 'links') windowEl.classList.add('links-window');
        else if (type === 'contact') windowEl.classList.add('contact-window');
        else if (type === 'doom') windowEl.classList.add('doom-window');
        windowEl.style.zIndex = zIndexCounter++;

        const titleBar = document.createElement('div');
        titleBar.className = 'window-title-bar';

        const title = document.createElement('div');
        title.className = 'window-title';
        title.textContent = getWindowTitle(type);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'window-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => {
            playSound('window');
            windowEl.remove();
        });

        titleBar.appendChild(title);
        titleBar.appendChild(closeBtn);

        const content = document.createElement('div');
        content.className = 'window-content';
        content.innerHTML = getWindowContent(type);

        windowEl.appendChild(titleBar);
        windowEl.appendChild(content);

        // Position window
        const positions = {
            home: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
            about: { top: '100px', left: '100px' },
            projects: { top: '80px', left: '80px' },
            faq: { top: '150px', left: '150px' },
            links: { top: '200px', left: '200px' },
            contact: { top: '250px', left: '120px' },
            doom: { top: '60px', left: '150px' }
        };
        const pos = positions[type] || { top: '100px', left: '100px' };
        Object.assign(windowEl.style, pos);

        return windowEl;
    }

    function getWindowTitle(type) {
        const titles = {
            home: 'index.html',
            about: 'readme.txt',
            projects: 'projects/',
            faq: 'faq.txt',
            links: 'links.url',
            contact: 'contact.info',
            doom: 'DOOM.exe'
        };
        return titles[type] || type;
    }

    /**
     * Window Content Factory
     * Returns HTML content for different window types
     * Each case corresponds to a desktop icon and window type
     * @param {string} type - The window type (home, about, projects, etc.)
     * @returns {string} HTML content for the window
     */
    function getWindowContent(type) {
        switch (type) {
            case 'home':
                const profileImgSrc = isDark ? 'assets/myself.jpg' : 'assets/me.jpg';
                return `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1>keith</h1>
                        <h2>full-stack developer & creative</h2>
                        <div class="code-comment">// building digital experiences</div>
                        <div>// welcome to keith.portfolio  a retro-inspired space for // creative development explore my journey from year 1 to 3</div>
                    </div>
                    <div style="display: flex; gap: 20px;">
                        <div style="flex: 1;">
                            <img src="${profileImgSrc}" style="width: 132px; height: 132px; border: 1px solid #ccc; display: block; margin: 0 auto 10px;" alt="Keith">
                            <div class="code-comment">/**
status: currently brewing code ☕
focus: year 1→3 portfolio projects
stack: mobile & web development
*/</div>
                        </div>
                    </div>
                    <div style="margin-top: 20px;">
                        <button class="nav-button" data-window="about">→ about me readme.txt</button>
                        <button class="nav-button" data-window="projects">→ my work projects/</button>
                        <button class="nav-button" data-window="faq">→ faq faq.txt</button>
                        <button class="nav-button" data-window="links">→ links links.url</button>
                        <button class="nav-button" data-window="contact">→ get in touch contact.sh</button>
                    </div>
                    <div class="code-comment" style="margin-top: 20px;">// end of file<br>thanks for stopping by ✨</div>
                `;
            case 'about':
                return `
                    <div class="code-comment">// README.txt - keith's portfolio</div>
                    <h2>hey, i'm keith louie panagsagan! </h2>
                    <p>a front end focus developer passionate about building digital experiences that blend creativity with functionality. currently exploring the intersection of design and code.</p>
                    <h3>My Journey </h3>
                    <p>Started coding in year 1 with simple basic java...</p>
                    <h3>What I Do?</h3>
                    <ul>
                        <li>→ Mobile development with Java & Android Studio</li>
                        <li>→ Web applications using React, JavaScript, HTML/CSS</li>
                        <li>→ UI/UX design with a focus on minimalism</li>
			            <li>→ Illustration making</li>

                    </ul>
                    <h3>Currently</h3>
                    <p>Year 3 status: Current learning: system architecture, creative coding.  Illustration making.</p>
                    <h3>When I'm Not Coding </h3>
                    <p>Personal interests:  Illustration making, Photogrpahy, love life(not really). Hobbies and inspiration sources.</p>
                    <h3>Tech Stack</h3>
                    <div>
                        <span class="skill-tag">Java</span>
                        <span class="skill-tag">JavaScript</span>
                        <span class="skill-tag">Android Studio</span>
                        <span class="skill-tag">Node.js</span>
                        <span class="skill-tag">HTML/CSS</span>
                        <span class="skill-tag">Git</span>
                        <span class="skill-tag">Figma</span>
                        <span class="skill-tag">Firebase</span>
                    </div>
                    <div class="code-comment" style="margin-top: 20px;">// thanks for reading!<br>feel free to reach out if you want to collaborate ✨</div>
                `;
            case 'projects':
                return `
                    <div style="background: #ff6b35; color: white; padding: 20px; margin: -20px -20px 20px; border-radius: 8px 8px 0 0;">
                        accepting work offers via my work email!<br>
                        i do illustration, animation, web design, and web/app development. :)
                    </div>
                    <h3>TOOLS</h3>
                    <div>
                        <span class="skill-tag">Adobe Photoshop</span>
                        <span class="skill-tag">Adobe Animate</span>
                        <span class="skill-tag">Clip Studio Paint</span>
                        <span class="skill-tag">Unity 2D/3D</span>
                        <span class="skill-tag">Adobe Illustrator</span>
                        <span class="skill-tag">Adobe Premiere</span>
                        <span class="skill-tag">Adobe After Effects</span>
                        <span class="skill-tag">Blender</span>
                        <span class="skill-tag">OpenToonz</span>
                        <span class="skill-tag">InDesign</span>
                        <span class="skill-tag">Figma</span>
                    </div>
                    <h3>DEVELOPMENT</h3>
                    <div>
                        <span class="skill-tag">C#</span>
                        <span class="skill-tag">C++</span>
                        <span class="skill-tag">C</span>
                        <span class="skill-tag">Python</span>
                        <span class="skill-tag">JavaScript</span>
                        <span class="skill-tag">HTML/CSS</span>
                        <span class="skill-tag">React</span>
                        <span class="skill-tag">Gatsby</span>
                        <span class="skill-tag">Next.js</span>
                        <span class="skill-tag">Java</span>
                        <span class="skill-tag">Android Studio</span>
                    </div>
                    <h3>FEATURED PROJECTS</h3>
                    <div class="project-card">
                        <h4>Year 1 (2023) - Java Compilation Project</h4>
                        <div class="pdf-preview">
                            <div class="pdf-header">
                                <h3> Java Programming Fundamentals</h3>
                                <p>Complete documentation of Java programming fundamentals, compilation techniques, and coding exercises from Year 1</p>
                                <a href="assets/java compilation.pdf" target="_blank" class="pdf-link"> Open Full PDF Document</a>
                            </div>
                            <div class="pdf-embed">
                                <iframe src="assets/java compilation.pdf" width="100%" height="500px" style="border: 1px solid #ccc; border-radius: 4px;"></iframe>
                            </div>
                        </div>
                    </div>
                    <div class="project-card">
                        <h4>Year 2 (2024)</h4>
                        <div class="video-preview">
                            <div class="video-header">
                                <h3> Android App Development</h3>
                                <p>Mobile application development showcasing Android Studio skills and Java programming</p>
                            </div>
                            <div class="video-embed">
                                <video controls width="100%" height="300px" style="border: 1px solid #ccc; border-radius: 4px;">
                                    <source src="assets/android_app.mp4" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    </div>
                    <div class="project-card">
                        <h4>Year 3 (2025)</h4>
                        <div class="video-preview">
                            <div class="video-header">
                                <h3> Flutter App Development</h3>
                                <p>Cross-platform mobile application built with Flutter framework</p>
                            </div>
                            <div class="video-embed">
                                <video controls width="100%" height="300px" style="border: 1px solid #ccc; border-radius: 4px;">
                                    <source src="assets/flutterapp.mp4" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                        <div class="slideshow-container">
                            <div class="slideshow-header">
                                <h3> System Architecture & Integration (IT 12)</h3>
                                <p>Comprehensive documentation and diagrams showcasing system design, integration patterns, and IT infrastructure</p>
                            </div>
                            <div class="slideshow-wrapper" id="sia-slideshow">
                                <div class="slideshow-slide active">
                                    <img src="assets/siapics/sia1.png" alt="System Architecture Diagram 1">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia2.png" alt="System Architecture Diagram 2">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia3.png" alt="System Architecture Diagram 3">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia4.png" alt="System Architecture Diagram 4">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia5.png" alt="System Architecture Diagram 5">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia6.png" alt="System Architecture Diagram 6">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia7.png" alt="System Architecture Diagram 7">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia8.png" alt="System Architecture Diagram 8">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia9.png" alt="System Architecture Diagram 9">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia10.png" alt="System Architecture Diagram 10">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia11.png" alt="System Architecture Diagram 11">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/sia12.png" alt="System Architecture Diagram 12">
                                </div>
                                <div class="slideshow-slide">
                                    <img src="assets/siapics/siadocpic.jpg" alt="System Architecture Documentation">
                                </div>
                            </div>
                            <div class="slideshow-controls">
                                <button class="slideshow-btn" id="sia-prev">◀</button>
                                <div class="slideshow-indicators">
                                    <div class="slideshow-indicator active" data-slide="0"></div>
                                    <div class="slideshow-indicator" data-slide="1"></div>
                                    <div class="slideshow-indicator" data-slide="2"></div>
                                    <div class="slideshow-indicator" data-slide="3"></div>
                                    <div class="slideshow-indicator" data-slide="4"></div>
                                    <div class="slideshow-indicator" data-slide="5"></div>
                                    <div class="slideshow-indicator" data-slide="6"></div>
                                    <div class="slideshow-indicator" data-slide="7"></div>
                                    <div class="slideshow-indicator" data-slide="8"></div>
                                    <div class="slideshow-indicator" data-slide="9"></div>
                                    <div class="slideshow-indicator" data-slide="10"></div>
                                    <div class="slideshow-indicator" data-slide="11"></div>
                                    <div class="slideshow-indicator" data-slide="12"></div>
                                </div>
                                <button class="slideshow-btn" id="sia-next">▶</button>
                            </div>
                        </div>
                    </div>
                `;
            case 'faq':
                return `
                    <h2>frequently asked questions</h2>
                    <div class="code-comment">// click to expand</div>
                    <div class="faq-item">
                        <div class="faq-question">what do you do?</div>
                        <div class="faq-answer">"i'm a full-stack developer specializing in web and mobile app development. i also dabble in design, animation, and creative coding!"</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">what languages/frameworks do you use?</div>
                        <div class="faq-answer">"primarily JavaScript/React, Java for Android, Python, and various web technologies. check out the projects section for specifics!"</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">are you available for freelance work?</div>
                        <div class="faq-answer">"yes! feel free to reach out via the contact form. i'm open to collaboration on interesting projects."</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">how did you build this portfolio?</div>
                        <div class="faq-answer">"built with HTML, CSS, and JavaScript. the retro aesthetic was inspired by classic OS interfaces and 90s web design."</div>
                    </div>
                    <div class="faq-item">
                        <div class="faq-question">what are you currently learning?</div>
                        <div class="faq-answer">"always exploring new tech! currently diving deeper into system design, animation libraries, and creative web experiences."</div>
                    </div>
                `;
            case 'links':
                return `
                    <h2>find me online</h2>
                    <div class="code-comment">// social & professional links</div>
                    <div class="social-links">
                        <a href="https://github.com/keithlouie" target="_blank" class="social-link">
                            <span class="social-icon"><img src="assets/github.png" alt="GitHub" class="social-img"></span>
                            <span>GitHub - Code repositories & projects</span>
                        </a>
                        <a href="https://x.com/yummyykittkat" target="_blank" class="social-link">
                            <span class="social-icon"><img src="assets/twitter.png" alt="Twitter" class="social-img"></span>
                            <span>Twitter - Thoughts & updates</span>
                        </a>
                        <a href="https://www.linkedin.com/in/keith-louie-panagsagan-089601366/" target="_blank" class="social-link">
                            <span class="social-icon"><img src="assets/linkedin.png" alt="LinkedIn" class="social-img"></span>
                            <span>LinkedIn - Professional profile</span>
                        </a>
                        <a href="mailto:keithlouie.panagsagan@gmail.com" class="social-link">
                            <span class="social-icon"><img src="assets/gmail.png" alt="Gmail" class="social-img"></span>
                            <span>Email - Work inquiries</span>
                        </a>
                    </div>
                    <div class="code-comment" style="margin-top: 20px;">// feel free to connect!</div>
                `;
            case 'contact':
                return `
                    <h2>get in touch</h2>
                    <div class="code-comment">// contact information</div>
                    <div class="contact-card">
                        <div class="contact-icon"><img src="assets/gmail.png" alt="Gmail" class="contact-img"></div>
                        <div>
                            <div class="contact-title">Email</div>
                            <div>keithlouie.panagsagan@gmail.com</div>
                            <div class="code-comment">"I'm ready to read more in the emails if you have concerns or comments"</div>
                        </div>
                    </div>
                    <div class="email-button-container">
                        <a href="mailto:keithlouie.panagsagan@gmail.com" class="send-email-btn">
                             Send Email
                        </a>
                    </div>
                    <div class="code-comment" style="margin-top: 20px;">// looking forward to hearing from you!<br>feel free to reach out for any inquiries ✨</div>
                `;
            case 'other':
                return `
                    <h2>other stuff</h2>
                    <div class="code-comment">// illustrations & photography</div>
                    <div class="creative-section">
                        <div class="creative-category">
                            <h3> Illustrations</h3>
                            <div class="code-comment">// digital art & creative designs</div>
                            <div class="creative-grid">
                                <div class="creative-item">
                                    <img src="assets/illustration/illus1.png" alt="Digital Illustration 1" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/illustration/illus 2.png" alt="Digital Illustration 2" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/illustration/illus3.png" alt="Digital Illustration 3" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/illustration/illus4.jpg" alt="Digital Illustration 4" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/illustration/illus5.jpg" alt="Digital Illustration 5" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/illustration/illus6.jpg" alt="Digital Illustration 6" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/illustration/illus7.jpg" alt="Digital Illustration 7" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/illustration/illus8.jpg" alt="Digital Illustration 8" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/illustration/illus9.jpg" alt="Digital Illustration 9" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/illustration/illus10.jpg" alt="Digital Illustration 10" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/illustration/illus11.jpg" alt="Digital Illustration 11" class="creative-image">
                                </div>
                            </div>
                        </div>
                        <div class="creative-category">
                            <h3>📸 Photography</h3>
                            <div class="code-comment">// capturing moments & perspectives</div>
                            <div class="creative-grid">
                                <div class="creative-item">
                                    <img src="assets/photograp/photograp1.jpg" alt="Photography 1" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/photograp/photograp2.jpg" alt="Photography 2" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/photograp/photograp3.jpg" alt="Photography 3" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/photograp/photograp4.jpg" alt="Photography 4" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/photograp/photograp5.jpg" alt="Photography 5" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/photograp/photograp6.jpg" alt="Photography 6" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/photograp/photograp7.jpg" alt="Photography 7" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/photograp/photograp8.jpg" alt="Photography 8" class="creative-image">
                                </div>
                                <div class="creative-item">
                                    <img src="assets/photograp/photograp9.jpg" alt="Photography 9" class="creative-image">
                                </div>
                            </div>
                        </div>
                        <div class="creative-note">
                            <div class="code-comment">// enjoy exploring my creative work!<br>// illustrations & photography portfolio ✨</div>
                        </div>
                    </div>
                `;
            case 'doom':
                return `
                    <div style="text-align: center;">
                        <h2> DOOM</h2>
                        <div class="code-comment">// classic retro gaming in your browser</div>
                        <div id="DOOM" class="dosbox-default" style="margin: 20px 0; display: flex; justify-content: center;"></div>
                        <div style="margin-top: 15px;">
                            <button id="fullscreen_DOOM" class="nav-button" style="margin-right: 10px;">⛶ Fullscreen</button>
                            <a href="assets/doom_on_js-dos-main/MANUAL.MD" target="_blank" class="nav-button">📖 Manual</a>
                        </div>
                        <div class="code-comment" style="margin-top: 20px;">// Use arrow keys to move, Ctrl to shoot<br>// ESC to pause and menu</div>
                    </div>
                `;
            default:
                return '<p>Content not available.</p>';
        }
    }

    /**
     * Brings a window to the front by increasing its z-index
     * @param {HTMLElement} windowEl - The window element to bring to front
     * Uses a global counter to ensure proper stacking order
     */
    function bringToFront(windowEl) {
        windowEl.style.zIndex = zIndexCounter++;
    }

    /**
     * Makes a window draggable by its title bar
     * @param {HTMLElement} windowEl - The window element to make draggable
     * Implements mouse-based dragging with boundary constraints
     */
    function makeDraggable(windowEl) {
        const titleBar = windowEl.querySelector('.window-title-bar');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        // Start dragging when mouse is pressed on title bar
        titleBar.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;    // Mouse X position when drag starts
            startY = e.clientY;    // Mouse Y position when drag starts
            const rect = windowEl.getBoundingClientRect();
            startLeft = rect.left; // Window left position when drag starts
            startTop = rect.top;   // Window top position when drag starts
            bringToFront(windowEl); // Bring window to front when dragging
        });

        // Handle mouse movement during drag
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            // Calculate how far mouse has moved
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // Calculate new window position
            let newLeft = startLeft + dx;
            let newTop = startTop + dy;

            // Constrain window to stay within viewport bounds
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - windowEl.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - windowEl.offsetHeight));

            // Apply new position
            windowEl.style.left = `${newLeft}px`;
            windowEl.style.top = `${newTop}px`;
            windowEl.style.transform = 'none'; // Remove any CSS transforms
        });

        // Stop dragging when mouse is released
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    /**
     * Navigation Button Handler
     * Handles clicks on navigation buttons within window content
     * Allows windows to open other windows (like "View Projects" buttons)
     */
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-button')) {
            playSound('click');
            const windowType = e.target.dataset.window;
            if (windowType) {
                openWindow(windowType);
            }
        }
    });

    // FAQ accordion
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('faq-question')) {
            playSound('click');
            const answer = e.target.nextElementSibling;
            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
        }
    });

    /**
     * Slideshow System for Projects Window
     * Manages image slideshow with auto-play, manual navigation, and indicators
     * Used in the projects window to showcase work samples
     */
    function initializeSlideshow() {
        const slides = document.querySelectorAll('.slideshow-slide');
        const indicators = document.querySelectorAll('.slideshow-indicator');
        const prevBtn = document.getElementById('sia-prev');
        const nextBtn = document.getElementById('sia-next');

        if (!slides.length || !indicators.length || !prevBtn || !nextBtn) {
            return; // Elements not found yet
        }

        let currentSlide = 0;
        let autoPlayInterval;

        function showSlide(index) {
            // Hide all slides
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));

            // Show current slide
            slides[index].classList.add('active');
            indicators[index].classList.add('active');
            currentSlide = index;
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        // Event listeners for slideshow controls
        prevBtn.addEventListener('click', () => {
            playSound('click');
            stopAutoPlay();
            prevSlide();
            setTimeout(startAutoPlay, 10000); // Restart auto-play after 10 seconds
        });

        nextBtn.addEventListener('click', () => {
            playSound('click');
            stopAutoPlay();
            nextSlide();
            setTimeout(startAutoPlay, 10000); // Restart auto-play after 10 seconds
        });

        // Indicator click handlers
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                playSound('click');
                stopAutoPlay();
                showSlide(index);
                setTimeout(startAutoPlay, 10000); // Restart auto-play after 10 seconds
            });
        });

        // Start auto-play initially
        startAutoPlay();
    }

    /**
     * Initialize DOOM emulator
     * Sets up the JS-DOS emulator to run DOOM in a window
     */
    function initializeDoom() {
        // Wait for JS-DOS API to load
        if (typeof Dosbox === 'undefined') {
            // Try again if not loaded yet
            setTimeout(initializeDoom, 100);
            return;
        }

        // Check if DOOM container exists
        const doomContainer = document.getElementById('DOOM');
        if (!doomContainer) return;

        // Initialize the DOS emulator
        try {
            var dosbox_DOOM = new Dosbox({
                id: "DOOM",
                onload: function (dosbox) {
                    console.log("DOS emulator loaded");
                    dosbox_DOOM.run("assets/doom_on_js-dos-main/DOOM-@evilution.zip", "./DOOM/DOOM.EXE");
                },
                onrun: function (dosbox, app) {
                    console.log("DOOM is running");
                }
            });

            // Add fullscreen button functionality
            var fullscreenBtn = document.getElementById("fullscreen_DOOM");
            if (fullscreenBtn) {
                fullscreenBtn.addEventListener("click", function() {
                    dosbox_DOOM.requestFullScreen();
                });
            }
        } catch (e) {
            console.error("Error initializing DOOM:", e);
        }
    }

    /**
     * DEVELOPMENT NOTES:
     *
     * Adding New Windows:
     * 1. Add desktop icon in index.html with data-window="newtype"
     * 2. Add case 'newtype' to getWindowContent() function
     * 3. Add CSS styling in style.css for .newtype-window
     * 4. Add any special initialization in openWindow() if needed
     *
     * Adding New Sounds:
     * 1. Add audio file to assets/ folder
     * 2. Add to sounds object at top of file
     * 3. Call playSound('soundname') where needed
     *
     * Theme Support:
     * - Use .dark-theme class for theme-specific styles
     * - Update updateProfileImage() if adding theme-dependent images
     * - Test both light and dark modes thoroughly
     *
    * Performance Considerations:
    * - Audio files are preloaded to prevent delays
    * - Windows are created only when opened (not all at once)
    * - Event listeners are attached efficiently
    */
    /**
    * Full-Screen Image Viewer
     * Creates a modal overlay for viewing images in full screen
     * Handles both illustrations and photography images
     */
    function initializeFullscreenViewer() {
        // Create fullscreen overlay elements
        const overlay = document.createElement('div');
        overlay.id = 'fullscreen-overlay';
        overlay.innerHTML = `
            <div id="fullscreen-container">
                <img id="fullscreen-image" src="" alt="">
                <button id="fullscreen-close" title="Close (ESC)">×</button>
                <div id="fullscreen-caption"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Add click listeners to all creative images
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('creative-image')) {
                const imgSrc = e.target.src;
                const imgAlt = e.target.alt;
                openFullscreen(imgSrc, imgAlt);
            }
        });

        // Close fullscreen on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeFullscreen();
            }
        });

        // Close fullscreen on close button click
        document.getElementById('fullscreen-close').addEventListener('click', closeFullscreen);

        // Close fullscreen on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.style.display === 'flex') {
                closeFullscreen();
            }
        });
    }

    /**
     * Opens the fullscreen image viewer
     * @param {string} src - Image source URL
     * @param {string} alt - Image alt text for caption
     */
    function openFullscreen(src, alt) {
        const overlay = document.getElementById('fullscreen-overlay');
        const image = document.getElementById('fullscreen-image');
        const caption = document.getElementById('fullscreen-caption');

        image.src = src;
        caption.textContent = alt;
        overlay.style.display = 'flex';

        // Prevent body scrolling when fullscreen is open
        document.body.style.overflow = 'hidden';
    }

    /**
     * Closes the fullscreen image viewer
     */
    function closeFullscreen() {
        const overlay = document.getElementById('fullscreen-overlay');
        overlay.style.display = 'none';

        // Restore body scrolling
        document.body.style.overflow = 'auto';
    }

        // Initialize fullscreen viewer when page loads
        initializeFullscreenViewer();
    });