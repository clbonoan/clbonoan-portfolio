// clock that shows in nav bar
function updateClock() {
    const now = new Date();
    const options = {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    const time = now.toLocaleTimeString('en-US', options);
    document.getElementById('nav-clock').textContent = 'CA ' + time;
}
updateClock();
setInterval(updateClock, 1000);

// menu button functionality
function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn = document.querySelector('#menu-btn');

    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');

    if (btn.textContent === 'MENU') {
        btn.textContent = 'CLOSE';
    } else {
        btn.textContent = 'MENU';
    }
}

// mobile menu helper
function closeMenu() {
    const menu = document.getElementById('mobile-menu');
    const btn  = document.getElementById('menu-btn');
    menu.classList.add('hidden');
    menu.classList.remove('flex');
    btn.textContent = 'MENU';
}

const titleContainer = document.getElementById('title-container');

// floating image functionality
if (titleContainer) {
    const images = [
        'images/photo1.jpg', 'images/photo2.jpg',
        'images/photo3.jpg', 'images/photo4.jpg',
        'images/photo5.jpg', 'images/photo6.jpg',
        'images/photo7.jpg', 'images/photo8.jpg',
        'images/photo9.jpg', 'images/photo10.jpg',
        'images/photo11.jpg', 'images/photo12.jpg',
        'images/photo13.jpg', 'images/photo14.jpg',
        'images/photo15.jpg', 'images/photo16.jpg',
        'images/photo17.jpg', 'images/photo18.jpg',
        'images/photo19.jpg', 'images/photo20.jpg',
        'images/photo21.jpg', 'images/photo22.jpg',
        'images/photo23.jpg', 'images/photo24.jpg',
        'images/photo25.jpg', 'images/photo26.jpg',
    ];

    // preload all images into browser cache on page load
    images.forEach(src => {
        const preload = new Image();
        preload.src = src;
    });

    // shuffle images: every image shows once before any repeats
    let deck = [];
    let lastImage = null;

    function shuffle(arr) {
        // fisher-yates shuffle
        for (let i = arr.length -1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // cursor positioning for image placement
    let lastX = null;
    let lastY = null;
    const DISTANCE_THRESHOLD = 150; // pixels mouse needs to move before a new image shows

    // queue of active image elements (FIFO)
    const activeImages = [];

    // detect if user is on mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    function getRandomImage() {
        if (deck.length === 0) {
            deck = shuffle([...images]);
            // avoid the same image back-to-back across a reshuffle
            if (deck.length > 1 && deck[deck.length - 1] === lastImage) {
                [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
            }
        }
        lastImage = deck.pop();
        return lastImage;
    }

    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    function spawnImage(x, y) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('cursor-img-item');
        wrapper.style.left = x + 'px';
        wrapper.style.top = y + 'px';

        const img = document.createElement('img');
        // pick random image
        img.src = getRandomImage();
        img.loading = 'eager';
        img.style.width = isMobile ? '120px' : '160px';
        img.style.height = isMobile ? '160px' : '213px';
        img.style.objectFit = 'cover';
        img.style.display = 'block';
        img.style.flexShrink = '0';     // prevent stretching

        wrapper.appendChild(img);
        document.body.appendChild(wrapper);
        activeImages.push(wrapper);
        
        // longer visible time on mobile, shorter on desktop
        const visibleDuration = isMobile ? 2000 : 600;
        // fade out image after 1.0 second
        setTimeout(() => {
            fadeOut(wrapper);
        }, 600);

        // remember position of image that appeared
        lastX = x;
        lastY = y;
    }

    function fadeOut(wrapper) {
        const fadeDuration = isMobile ? 0.8 : 0.4;
        requestAnimationFrame(() => {
            wrapper.style.transition = 'opacity 0.4s ease';
            wrapper.style.opacity = '0';
        });
        setTimeout(() => {
            wrapper.remove();
            const index = activeImages.indexOf(wrapper);
            if (index > -1) activeImages.splice(index, 1);
        }, fadeDuration * 1000);    // match transition duration
    }

    titleContainer.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        spawnImage(touch.clientX, touch.clientY);
    });

    titleContainer.addEventListener('mousemove', (e) => {
        // only trigger a new image if cursor moved far enough from last spawn point
        if (lastX === null || getDistance(e.clientX, e.clientY, lastX, lastY) > DISTANCE_THRESHOLD) {
            spawnImage(e.clientX, e.clientY);
        }
            
        const dist = getDistance(e.clientX, e.clientY, lastX, lastY);

        if (dist > DISTANCE_THRESHOLD) {
            // figure out how many images to spawn between last and current position
            const steps = Math.floor(dist / DISTANCE_THRESHOLD);

            for (let i = 1; i <= steps; i++) {
                // interpolate position between last and current
                const t = i / steps;
                const x = lastX + (e.clientX - lastX) * t;
                const y = lastY + (e.clientY - lastY) * t;
                spawnImage(x, y);
            }
        }
    });

    titleContainer.addEventListener('mouseleave', () => {
        lastX = null;
        lastY = null;
    });
}

// fetch an html file and return the inner element matching selector
function fetchInner(file, selector) {
    return fetch(file)
        .then(r => r.text())
        .then(html => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            doc.querySelectorAll('nav, #mobile-menu, script').forEach(el => el.remove());
            return (doc.querySelector(selector) || doc.body).innerHTML;
        });
}
 
// calculate scroll transition progress between two sections
// starts when the bottom of `fromSection` approaches the viewport bottom,
// completes over half a viewport of scroll distance
function transitionProgress(scrollY, fromSection) {
    const sectionBottom = fromSection.offsetTop + fromSection.offsetHeight;
    const triggerStart  = sectionBottom - window.innerHeight;
    const triggerRange  = window.innerHeight * 0.75;
    return Math.min(Math.max((scrollY - triggerStart) / triggerRange, 0), 1);
}
 
// set active nav highlight
function setActiveNav(sectionId) {
    document.querySelectorAll('.nav-link[data-section]').forEach(l => {
        l.classList.toggle('nav-active', l.dataset.section === sectionId);
    });
}

function fadeSection(section, innerEl, inProgress, outProgress) {
    if (!section) return;
    if (inProgress > 0.3) section.classList.add('visible');
    else section.classList.remove('visible');
    if (innerEl) {
        innerEl.style.transform = `scale(${1 - outProgress * 0.15})`;
        innerEl.style.opacity   = Math.max(1 - outProgress * 1.4, 0);
    }
}
 
// SCROLL CONTAINER SETUP
const scrollContainer = document.getElementById('scroll-container');
 
if (scrollContainer) {
    // nav link smooth scrolling (for same-page anchor links)
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.getElementById(link.dataset.section);
            if (target) {
                e.preventDefault();
                scrollContainer.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
            }
        });
    });
 
    // index.html: home -> about -> skills -> projects -> contact
    const homeInner = document.getElementById('home-inner');
    const sectionHome = document.getElementById('section-home');
 
    if (homeInner && sectionHome) {
        const sectionAbout = document.getElementById('section-about');
        const sectionSkills = document.getElementById('section-skills')
        const sectionProjects = document.getElementById('section-projects');
        const sectionContact = document.getElementById('section-contact');
        const sectionCommonplace = document.getElementById('section-commonplace');
 
        // fetch and inject all four downstream pages
        fetchInner('./about.html', '#about-inner')
            .then(html => { document.getElementById('about-content').innerHTML = html; })
            .catch(() => { document.getElementById('about-content').innerHTML =
                '<p style="color:rgba(255,255,255,0.4);text-align:center">About coming soon.</p>'; });
 
        fetchInner('./skills.html', '#skills-inner')
            .then(html => { document.getElementById('skills-content').innerHTML = html; })
            .catch(() => { document.getElementById('skills-content').innerHTML =
                '<p style="color:rgba(255,255,255,0.4);text-align:center">Skills coming soon.</p>'; });

        fetchInner('./projects.html', '#projects-inner')
            .then(html => {
                document.getElementById('projects-content').innerHTML = html;
                buildGrid();
            })
            .catch(() => { document.getElementById('projects-content').innerHTML =
                '<p style="color:rgba(255,255,255,0.4);text-align:center">Projects coming soon.</p>'; });
        
        fetchInner('./contact.html', '#contact-inner')
            .then(html => { document.getElementById('contact-content').innerHTML = html; })
            .catch(() => { document.getElementById('contact-content').innerHTML =
                '<p style="color:rgba(255,255,255,0.4);text-align:center">Contact coming soon.</p>'; });

        fetchInner('./commonplace.html', '#commonplace-inner')
            .then(html => { document.getElementById('commonplace-content').innerHTML = html; })
            .catch(() => { document.getElementById('commonplace-content').innerHTML =
                '<p style="color:rgba(255,255,255,0.4);text-align:center">Commonplace coming soon.</p>'; });
 
        scrollContainer.addEventListener('scroll', () => {
            const scrollY = scrollContainer.scrollTop;
 
            // home fades out as you leave it
            const homeProgress = Math.min(scrollY / sectionHome.offsetHeight, 1);
            homeInner.style.transform = `scale(${1 - homeProgress * 0.15})`;
            homeInner.style.opacity = Math.max(1 - homeProgress * 1.4, 0);
 
            // about
            if (sectionAbout) {
                const inP  = Math.min(Math.max((scrollY - sectionAbout.offsetTop + window.innerHeight) / (window.innerHeight * 0.5), 0), 1);
                const outP = transitionProgress(scrollY, sectionAbout);
                fadeSection(sectionAbout, sectionAbout.querySelector('#about-content'), inP, outP);
            }
 
            // skills
            if (sectionSkills) {
                const inP  = Math.min(Math.max((scrollY - sectionSkills.offsetTop + window.innerHeight) / (window.innerHeight * 0.5), 0), 1);
                const outP = transitionProgress(scrollY, sectionSkills);
                fadeSection(sectionSkills, sectionSkills.querySelector('#skills-content'), inP, outP);
            }
 
            // projects
            if (sectionProjects) {
                const inP  = Math.min(Math.max((scrollY - sectionProjects.offsetTop + window.innerHeight) / (window.innerHeight * 0.5), 0), 1);
                const outP = transitionProgress(scrollY, sectionProjects);
                fadeSection(sectionProjects, sectionProjects.querySelector('#projects-content'), inP, outP);
            }
 
            // contact
            if (sectionContact) {
                const inP = Math.min(Math.max((scrollY - sectionContact.offsetTop + window.innerHeight) / (window.innerHeight * 0.5), 0), 1);
                if (inP > 0.3) sectionContact.classList.add('visible');
                else sectionContact.classList.remove('visible');
            }

            // contact
            if (sectionCommonplace) {
                const inP = Math.min(Math.max((scrollY - sectionCommonplace.offsetTop + window.innerHeight) / (window.innerHeight * 0.5), 0), 1);
                if (inP > 0.3) sectionCommonplace.classList.add('visible');
                else sectionCommonplace.classList.remove('visible');
            }
 
            // active nav
            const navSections = [
                { id: 'section-home', el: sectionHome },
                { id: 'section-about', el: sectionAbout },
                { id: 'section-skills', el: sectionSkills },
                { id: 'section-projects', el: sectionProjects },
                { id: 'section-contact', el: sectionContact },
                { id: 'section-commonplace', el: sectionCommonplace },
            ];
            let activeId = 'section-home';
            navSections.forEach(({ id, el }) => {
                if (el && scrollY >= el.offsetTop - window.innerHeight / 2) activeId = id;
            });
            setActiveNav(activeId);
 
        }, { passive: true });
    }
 
    // about.html: about -> skills
    const aboutInner = document.getElementById('about-inner');
    const sectionAboutStandalone = document.getElementById('section-about');
    const skillsContentEl = document.getElementById('skills-content');
 
    if (aboutInner && sectionAboutStandalone && skillsContentEl) {
        // about is the first section here, show it immediately
        sectionAboutStandalone.classList.add('visible');
        sectionAboutStandalone.style.opacity = '1';
        sectionAboutStandalone.style.transform = 'translateY(0)';
 
        const sectionSkills = document.getElementById('section-skills');
 
        fetchInner('./skills.html', '#skills-inner')
            .then(html => { skillsContentEl.innerHTML = html; })
            .catch(() => { skillsContentEl.innerHTML =
                '<p style="color:rgba(255,255,255,0.4);text-align:center">Skills coming soon.</p>'; });
 
        scrollContainer.addEventListener('scroll', () => {
            const scrollY = scrollContainer.scrollTop;
 
            // about fades out as you scroll toward skills
            const aboutOutProgress = transitionProgress(scrollY, sectionAboutStandalone);
            aboutInner.style.transform = `scale(${1 - aboutOutProgress * 0.15})`;
            aboutInner.style.opacity = Math.max(1 - aboutOutProgress * 1.4, 0);
 
            // skills fades in
            if (sectionSkills) {
                const inP = Math.min(Math.max((scrollY - sectionSkills.offsetTop + window.innerHeight) / (window.innerHeight * 0.5), 0), 1);
                if (inP > 0.3) sectionSkills.classList.add('visible');
                else sectionSkills.classList.remove('visible');
            }
 
            // active nav
            setActiveNav(aboutOutProgress > 0.5 ? 'section-skills' : 'section-about');
 
        }, { passive: true });
    }

    // skills.html: skills -> projects 
    const skillsInner = document.getElementById('skills-inner');
    const sectionSkillsStandalone = document.getElementById('section-skills');
    const projectsContentEl = document.getElementById('projects-content');
 
    if (skillsInner && sectionSkillsStandalone && projectsContentEl) {
        // skills is the first section here, show it immediately
        sectionSkillsStandalone.classList.add('visible');
        sectionSkillsStandalone.style.opacity = '1';
        sectionSkillsStandalone.style.transform = 'translateY(0)';
 
        const sectionProjects = document.getElementById('section-projects');
 
        fetchInner('./projects.html', '#projects-inner')
            .then(html => {
                document.getElementById('projects-content').innerHTML = html;
                buildGrid();
            })
            .catch(() => { document.getElementById('projects-content').innerHTML =
                '<p style="color:rgba(255,255,255,0.4);text-align:center">Projects coming soon.</p>'; });
 
        scrollContainer.addEventListener('scroll', () => {
            const scrollY = scrollContainer.scrollTop;
 
            // skills fades out as you scroll toward projects
            const skillsOutProgress = transitionProgress(scrollY, sectionSkillsStandalone);
            skillsInner.style.transform = `scale(${1 - skillsOutProgress * 0.15})`;
            skillsInner.style.opacity = Math.max(1 - skillsOutProgress * 1.4, 0);
 
            // projects fades in
            if (sectionProjects) {
                const inP = Math.min(Math.max((scrollY - sectionProjects.offsetTop + window.innerHeight) / (window.innerHeight * 0.5), 0), 1);
                if (inP > 0.3) sectionProjects.classList.add('visible');
                else sectionProjects.classList.remove('visible');
            }
 
            // active nav
            setActiveNav(skillsOutProgress > 0.5 ? 'section-projects' : 'section-skills');
 
        }, { passive: true });
    }
 
    // projects.html: projects -> contact
    const projectsInner = document.getElementById('projects-inner');
    const sectionProjectsStandalone = document.getElementById('section-projects');
    const contactContentEl = document.getElementById('contact-content');
 
    if (projectsInner && sectionProjectsStandalone && contactContentEl) {
        // projects is the first section here, show it immediately
        sectionProjectsStandalone.classList.add('visible');
        sectionProjectsStandalone.style.opacity = '1';
        sectionProjectsStandalone.style.transform = 'translateY(0)';
 
        const sectionContact = document.getElementById('section-contact');
 
        fetchInner('./contact.html', '#contact-inner')
            .then(html => { contactContentEl.innerHTML = html; })
            .catch(() => { contactContentEl.innerHTML =
                '<p style="color:rgba(255,255,255,0.4);text-align:center">Contact coming soon.</p>'; });
 
        scrollContainer.addEventListener('scroll', () => {
            const scrollY = scrollContainer.scrollTop;
 
            // projects fades out as you scroll toward contact
            const projectsOutProgress = transitionProgress(scrollY, sectionProjectsStandalone);
            projectsInner.style.transform = `scale(${1 - projectsOutProgress * 0.15})`;
            projectsInner.style.opacity = Math.max(1 - projectsOutProgress * 1.4, 0);
 
            // contact fades in
            if (sectionContact) {
                const inP = Math.min(Math.max((scrollY - sectionContact.offsetTop + window.innerHeight) / (window.innerHeight * 0.5), 0), 1);
                if (inP > 0.3) sectionContact.classList.add('visible');
                else sectionContact.classList.remove('visible');
            }
 
            // active nav
            setActiveNav(projectsOutProgress > 0.5 ? 'section-contact' : 'section-projects');
 
        }, { passive: true });
    }
 
    // contacts.html: contacts -> commonplace
    const contactInner = document.getElementById('contact-inner');
    const sectionContactStandalone = document.getElementById('section-contact');
    const commonplaceContentEl = document.getElementById('commonplace-content');
 
    if (contactInner && sectionContactStandalone && commonplaceContentEl) {
        // contact is the first section here, show it immediately
        sectionContactStandalone.classList.add('visible');
        sectionContactStandalone.style.opacity = '1';
        sectionContactStandalone.style.transform = 'translateY(0)';
 
        const sectionCommonplace = document.getElementById('section-commonplace');
 
        fetchInner('./commonplace.html', '#commonplace-inner')
            .then(html => { commonplaceContentEl.innerHTML = html; })
            .catch(() => { commonplaceContentEl.innerHTML =
                '<p style="color:rgba(255,255,255,0.4);text-align:center">work in progress.</p>'; });
 
        scrollContainer.addEventListener('scroll', () => {
            const scrollY = scrollContainer.scrollTop;
 
            // projects fades out as you scroll toward contact
            const contactOutProgress = transitionProgress(scrollY, sectionContactStandalone);
            contactInner.style.transform = `scale(${1 - contactOutProgress * 0.15})`;
            contactInner.style.opacity = Math.max(1 - contactOutProgress * 1.4, 0);
 
            // contact fades in
            if (sectionCommonplace) {
                const inP = Math.min(Math.max((scrollY - sectionCommonplace.offsetTop + window.innerHeight) / (window.innerHeight * 0.5), 0), 1);
                if (inP > 0.3) sectionCommonplace.classList.add('visible');
                else sectionCommonplace.classList.remove('visible');
            }
 
            // active nav
            setActiveNav(contactOutProgress > 0.5 ? 'section-commonplace' : 'section-contact');
 
        }, { passive: true });
    }

    // commonplace.html: standalone, so nothing to fetch
    const commonplaceInner = document.getElementById('commonplace-inner');
    const sectionCommonplaceStandalone = document.getElementById('section-commonplace');
 
    if (commonplaceInner && sectionCommonplaceStandalone && !sectionContactStandalone) {
        sectionCommonplaceStandalone.classList.add('visible');
        sectionCommonplaceStandalone.style.opacity = '1';
        sectionCommonplaceStandalone.style.transform = 'translateY(0)';
    }
}

// PROJECTS DATA
const PROJECTS = [
    {
        id: 'shadow-check',
        name: 'Shadow Check',
        tagline: 'Detecting image tampering through shadow inconsistency analysis',
        shortDesc: 'Senior capstone - ML + rule-based forensic tool for urban infrastructure photos.',
        year: '2025-2026',
        role: 'Project Lead, TBA',
        type: 'Research / ML',
        stack: ['Python', 'Flask', 'scikit-learn', 'OpenCV', 'NumPy'],
        highlights: ['Dual-Path Analysis', '3 Shadow Modules', '270-Image Dataset', 'Stacked Ensemble', '5-Fold CV'],
        description: `Shadow Check is my senior capstone project at CSUB, co-built with a partner. It detects image tampering
        in ground-level urban infrastructure photographs by analyzing shadow inconsistencies across three
        modules: texture, lighting, and depth. Shadows follow predictable physics (a single light source means 
        consistent brightness ratios, penumbra widths, and directional angles across a scene), which makes
        them a harder thing to convincingly fake than pixel-level artifacts.
        <br><br>
        Two analysis paths run in parallel, a rule-based threshold voter built on handcrafted physical
        thresholds, and a stacked ensemble of Random Forest classifiers feeding a Logistic Regression
        fusion layer. Both paths score the same engineered features, so the site shows users a direct
        compairson between human-designed logic and a computer-learned pattern. It was designed
        to be explainable and human-readable rather than a black box.
        <br><br>
        Evaluated on 270 ground-level images (135 real/tampered pairs) via 5-fold cross-validation, the fused
        model reached 59.6% accuracy. This is modest in absolute terms, but a real signal above the 50%
        random-chance baseline given how subtle and physically constrained shadow tampering cues are. Detection
        varied by edit type: removal edits (shadows erased entirely) were caught more often at 61.9%, 
        followed by compositing at 59.1% with mixed edits (the most difficult category since it involved 
        redirected or elongated shadows) trailing at 56.9%.
        <br><br>
        Pasting in a foreign shadow was actually easier to catch than erasing one. Compositing carries its own
        texture and lighting fingerprint that doesn't match the scene; removal deletes evidence, so the 
        system was left inferring tampering from what should be there but isn't, which was a harder problem
        that what we initially thought.`,
        personal: `This was the first project where I had to do real open-ended research. The rule-based thresholds,
        the feature weights, even the decision to use shadows as the detection signal in the first place all had 
        to be figured out experimentally, through papers that got us partway there and a lot of trial and error the
        rest of the way. It was uncomfortable at first because I didn't have a clear answer to check my work against, 
        but it taught me how to sit with ambiguity and trust a process instead of a known outcome.
        <br><br>
        The other part I've had to make peace with is the result itself. 59.6% accuracy isn't a number I was satisfied
        with, and initially there was an urge to only show the polished parts of this project. However, the honest result
        is more interesting than a clean one. It says something real about how hard shadow-based forensics actually 
        is, and about where the limits of hand-engineered features are versus what machine and deep learning could do 
        instead. Learning to present an imperfect result clearly instead of hiding from it felt like its own kind 
        of growth separate from the technical work.`,
        heroImg: 'images/project2-sc.jpg',
        datashots: [
            {
                src: 'images/project2-chart1-sc.jpg',
                caption: 'Accuracy by pipeline stage'
            },
            {
                src: 'images/project2-chart2-sc.jpg',
                caption: 'Detection rate by edit type'
            },
            {
                src: 'images/project2-chart3-sc.jpg',
                caption: 'Confusion matrix'
            },
        ],
        screenshots: ['images/project2-1-sc.jpg', 'images/project2-2-sc.jpg'],
        liveUrl: 'https://shadowcheck.dev/',
        githubUrl:'https://github.com/clbonoan/senior-project',
        tileGradient: 'linear-gradient(135deg, #0d1117 0%, #1a2332 100%)',
    },
    {
        id: 'smart-lighting',
        name: 'Energy-Efficient Smart Home Automation',
        tagline: 'A Raspberry Pi-based approach to reducing IoT energy consumption',
        shortDesc: 'Computer networks project - software and hardware modifications to add contextual triggers.',
        year: '2025',
        role: 'Project Lead',
        type: 'IoT / Embedded',
        stack: ['Python', 'Raspberry Pi', 'Zigbee2MQTT', 'MQTT', 'IoT sensors'],
        highlights: ['3 Sensor Types', '5-Day Testing', '81% Energy Reduction', 'Real-Time Energy Monitoring'],
        description: `Built during the Computer Networks course, this project explores how much energy a smart 
        lighting system can save when it actually understands its environment. It doesn't just account for motion,
        but presence and daylight as well.
        <br><br>
        Setup: a Raspberry Pi 4 controlling a Philips Hue bulb through Zigbee2MQTT, fed by three sensors: PIR motion,
        mmWave presence, and a BH1750 ambient light sensor. Over five days, I ran a controlled comparison: constant
        full brightness, constant 50% brightness, then progressively smarter automation using the PIR sensor alone, PIR
        + mmWave, and finally all three sensors combined.
        <br><br>
        The results weren't linear. Adding mmWave to PIR actually increased energy use (0.0308 kWh vs. 0.0090 kWh for PIR
        alone). This showed that more accurate presence detection meant the bulb stayed on longer for comfort. It wasn't
        until ambient light was folded in as a third signal that the system found real efficiency, cutting consumption
        to 0.0070 kWh. This created an 81% reduction from the full-brightness baseline.
        <br><br>
        Takeaway: more sensors don't automatically mean more savings. Getting the combination and thresholds right mattered
        more than the sensor count alone.`,
        personal: `This was the first project where I worked with physical hardware - breadboards, GPIO pins, sensors that
        didn't always behave the way the datasheet promised. Up until this point, my experience was almost entirely software
        with only little knowledge about hardware. Debugging a sensor that's giving noisy readings because of its physical 
        position in a room is a completely different kind of problem-solving than debugging code, and I found I genuinely loved
        it.
        <br><br>
        The hardware side of things "clicked" for me after this project. It's a big part of why I've kept chasing project ideas that 
        sit at the intersection of hardware and software. There's something satisfying about being able to solve bugs that relate to 
        both hardware and software, whether it's by moving a sensor three inches to the left or changing a line of code to change its 
        behavior.`,
        heroImg: 'images/project1-sls.jpg',
        datashots: [
            {
                src: 'images/project1-chart1-sls.jpg',
                caption: 'Total energy consumed per test configuration (kWh)'
            },
            {
                src: 'images/project1-chart2-sls.jpg',
                caption: 'Energy cosumption under different lighting conditions'

            },
            {
                src: 'images/project1-chart3-sls.jpg',
                caption: '% energy savings per test configuration'
            },
        ],
        screenshots: [],
        liveUrl: '',
        githubUrl: 'https://github.com/clbonoan/energy-efficiency',
        tileGradient: 'linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 100%)',
    },
    {
        id: 'database-project',
        name: 'Otaku Clash Database',
        tagline: 'A stat-based anime character database with role-based access and admin tools',
        shortDesc: 'Full-stack anime character database web app with role-based authentication.',
        year: '2025',
        role: 'TBA',
        type: 'Databases',
        stack: ['MySQL', 'PHP', 'HTML/CSS'],
        highlights: ['5 Views', '4 Stored Procedures', '6 Triggers', '10 Designed Queries'],
        description: `Built as part of a Databases course, Otaku Clash lets users explore a curated anime 
        character database, browse character stats, and pit two characters against each other in stat-based
        matchups decided by community vote. 
        <br><br>
        The system runs on role-based authentication with separate admin and user experiences: admins review and 
        approve or deny submissions through dedicated tools, while users submit characters and vote on matchups. 
        The MySQL schema leans on 5 views to simplify recurring joins (like combining match, character, and winner data
        into a single readable table), 4 stored procedures handling vote insertion/updates and a top-voter leaderboard,
        and 6 triggers enforcing data integrity. Data integrity triggers include, but are not limited to, one that
        automatically reorders characters alphabetically on match creation to prevent duplicate reversed matchups.
        <br><br>
        Users can browse character details, view show origins, and compare characters in 
        stat-based matchups to determine a winner by votes. The backend is powered by a relational database that uses 
        complex joins and views to dynamically generate leaderboards, character suggestions, and admin dashboards. 
        The project emphasizes data reliability and query performance through validation and optimization techniques, 
        backed by 10 designed queries covering everything from popularity tracking to flagging characters missing key stats.`,
        personal: `I had no prior experience with databases at all going into this project. From writing a basic query to understanding
        what a schema is, everything was new to me. The early weeks of learning database fundamentals and starting the term project was
        genuinely intimidating since I had no foundation to lean on.
        <br><br>
        The ER-to-relational conversion process was where things started to click. It wasn't something where we could follow 
        the steps. We had to actually understand why the model worked the way it did before we could convert it correctly, and we
        had to understand what each relationship meant and why they were the way they were. It was a different kind of learning
        than I was used to. 
        <br><br>
        By the time we got to triggers and stored procedures, my knowledge further shifted. Writing a trigger that keeps
        vote counts in sync automatically, or one that anonymizes user history instead of breaking every foreign key
        on deletion, it meant that I was starting to think in terms of where logic should live in a system, not
        just how to make a query return the right rows. Going from zero to that in one project is what made it feel like
        real growth rather than just coursework.
        <br><br>
        The team aspect mattered as well. Coordinating a shared schema across four people and dividing the work between ER
        design, SQL implementation, and the GUI, was a different kind of collaboration than working solo. Everyone's part 
        depended on the same underlying structure being correct, so getting the schema agreed on early and communicating
        changes to it early ended up being as important as the SQL itself.`,        
        heroImg: 'images/project3-db.jpg',
        datashotsLabel: 'Schema',
        datashots: [
            {
                src: 'images/project3-chart1-db.jpg',
                caption: 'ER diagram - core entities and relationships (Match, Users, Admin, Anime Characters)'
            },
            {
                src: 'images/project3-chart2-db.jpg',
                caption: 'Relational scehma - converted tables with primary and foreign keys'
            },
        ],
        screenshots: [],
        liveUrl: 'https://artemis.cs.csub.edu/~otakuclash/index.php',
        githubUrl: '',
        tileGradient: 'linear-gradient(135deg, #0f0f0f 0%, #1e1a1a 100%)',
    },
    {
        id: 'se-project',
        name: 'Space Busters',
        tagline: 'A modular C++ arcade shooter built on object-oriented design and real-time game loops',
        shortDesc: 'C++ game dev project - collision detection, input handling, and state management built from scratch.',
        year: '2025',
        role: 'Developer',
        type: 'Game Dev',
        stack: ['C++'],
        highlights: ['OpenGL', 'Particle Systems', 'pthreads'],
        description: `Space Busters is a C++ arcade-style game built with a 5-person team for a Software Engineering course,
        rendered with OpenGL. The architecture follows object-oriented design principles with a module class structure, real-time update
        loops, and event-driven state management to handle gameplay transitions between the animated intro, title menu, ship selection,
        gameplay, pause, and game-over screens.
        <br><br>
        I implemented collision detection, input handling, and player state logic to keep actions responsive. Two game modes are supported:
        an endless Arcade mode and a Boss mode, each with distinct enemy behavior and a Life Star pickup that restores health on contact.
        <br><br>
        During development, I diagnosed and resolved a critical bug in the loop execution that was breaking state transitions. A single Enter
        keypress was being processed across two consecutive frames, which broke menu state transitions. The fix was to check the mouse position
        on its own separate thread instead of checking it inside the same loop that handles rendering and game updates. I traced it through the 
        control flow, and fixing it significantly improved program stability and runtime behavior.`,
        personal: `This was the first time I debugged something below the application level. Tracing the mouse-polling bug through the control
        flow and realizing the fix meant restructuring how input and rendering shared time in the same loop. It was a different kind of debugging 
        and problem-solving than anything I've done before. It forced me to think about timing and execution order instead of just logic, and it 
        taught me that a real-time system doesn't wait for you to catch up, so a bug like that doesn't show itself the same way a typical software
        bug does.
        <br><br>
        Working with five people on the same codebase was its own challenge. Beyond just dividing up features, we had to actively avoid stepping
        on each other's code and design decisions, which meant a lot more communication than what I was used to on smaller projects. On top of that,
        OpenGL didn't behave consistently across everyone's machines. It ran fine on some setups but broke on older Intel MacBooks, which meant 
        compatability became a real constraint we had to work around as a team, not just a bug to patch. Between the coordination and cross-device
        issues, this project taught me that getting five people's code to run the same way on every device is sometimes harder than writing the
        code itself.`,        
        heroImg: 'images/project4-se.jpg',
        datashots: [],
        screenshots: ['images/project4-1-se.jpg', 'images/project4-2-se.jpg', 'images/project4-3-se.jpg'],
        liveUrl: '',
        githubUrl: 'https://github.com/clbonoan/space-busters',
        tileGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a0f 100%)',
    },
    {
        id: 'distributed-project',
        name: 'Murder Mystery Gossip Protocol Simulation',
        tagline: 'A Rust-based distributed gossip simulation with decentralized node communication',
        shortDesc: 'Multi-node gossip protocol with WebSocket messaging, Docker, and AWS deployment.',
        year: '2026',
        role: 'Developer',
        type: 'Distributed Systems',
        stack: ['Rust', 'Protobuf', 'WebSockets', 'Docker', 'AWS', 'SST'],
        highlights: ['Rust + Tokio', 'Protobuf Messaging', 'Gossip Network', 'WebSocket Dashboard', 'Radius-Based Consensus'],
        description: `Murder Mystery Gossip Simulation is a collaborative distributed systems project built with a 
        5-person team for a Distributed and Parallel Computation course. It simulates a game where nodes exchange 
        gossip peer-to-peer with no central controller, just radius-based communication with periodic re-broadcast 
        and deduplication to handle dropped messages. 
        <br><br>
        Each node runs independently as either a Murderer or an Innocent with no shared state between them. The Murderer 
        searches for isolated targets within a specified "kill" radius, while Innocents build independent suspicion scores
        from witness reports, corroboration, and gossiped tips from other nodes. The gossiped tips are weighted evidence 
        that decays or compounds based on behavior (e.g., actively cooperating suspects get cleared, silent ones under 
        suspicion accumulate it). Consensus is reached without a leader: once enough deaths have occurred, the majority
        of surviving innocents converge on a shared suspect above a confidence threshold to win.
        <br><br>
        I contributed to the protobuf-based messaging layer, node communication logic, and gossip propagation between
        nodes. I also helped integrate WebSocket communication for real-time updates to the live dashboard along with 
        supporting cloud deployment workflows using AWS and SST.`,
        personal: `Almost everything on this project's stack was new to me. Outside of WebSockets, I hadn't worked with 
        Rust, Tokio, Axum, Protobuf, or SST before this project, so a lot of the work was learning new languages and syntax
        while trying to contribute meaningfully to a team relying on that code working.
        <br><br>
        The hardst part for me was the AWS and SST deployment side. Getting the infrastructure configured correctly and 
        understanding why something wasn't working when it broke took a lot more trial and error than the application logic
        did. This was partly because deployment issues are harder to reason about from just reading code. Rust added its own
        layer of difficulty too: its strict ownership rules meant state couldn't just be shared the way I was used to from other
        languages, so debugging often meant rethinking the approach entirely rather than patching a line.
        <br><br>
        What helped most was leaning on the live dashboard once it existed, where watching gossip propagate (or fail to) in real
        time made bugs obvious in a way that reading async Rust code never did on its own. Going from unfamiliar with nearly the 
        entire stack to shipping something with my team that worked felt like a genuine "learn by doing" experience.`,        
        heroImg: 'images/project5-ds.jpg',
        datashotsLabel: 'System Design',
        datashots: [
            {
                src: 'images/project5-2-ds.jpg',
                caption: 'Live suspicion matrix from the dashboard - each row shows who that node currently suspects'
            },
            {
                src: 'images/project5-3-ds.jpg',
                caption: 'Gossip message lifecycle - Heartbeat, DeathNotice, WitnessReport, Accusation'
            },
            {
                src: 'images/project5-4-ds.jpg',
                caption: 'Evidence scoring algorithm behind the suspicion matrix'
            },                  
        ],
        screenshots: ['images/project5-1-ds.jpg',],
        liveUrl: 'https://d3m4zt8tgf4p3i.cloudfront.net/',
        githubUrl: '',
        tileGradient: 'linear-gradient(135deg, #0a0a0a 0%, #0f1a1a 100%)',
    },
    {
        id: 'hackathon',
        name: 'Hackathon',
        tagline: 'Award-winning data analysis and visualization of a nationally representative gaming survey',
        shortDesc: 'CSU Channel Islands Plot-A-Thon - Best Overall, Best in Data Analysis, Best in Data Communication.',
        year: '2026',
        role: 'Team Member',
        type: 'Hackathon / Data',
        stack: ['Python', 'Pandas', 'Matplotlib'],
        highlights: [],
        description: `At the CSU Channel Islands Plot-A-Thon hackathon, my 4-person team was awarded in three categories: Best 
        Overall, Best in Data Analysis, and Best in Data Communication. We worked with the Gamer Study 2024, a large-scale nationally 
        representative survey dataset, cleaning and analyzing it using Pandas to surface meaningful trends. Our focus was on music 
        discovery through video games, specifically how players find and engage with music in gaming contexts. 
        <br><br>
        The core finding: music is discovered through video games at a higher rate than through other media, and that effect is even
        stronger among multiplayer gamers specifically, who discover new music at a higher rate than solo players. This suggested that
        social interaction itself drives music exposure, not just gameplay alone. We backed this up by looking at communication rates
        across gaming platforms (PC, console, mobile, and VR), which stayed consistently high across all of them, ranging from 63% to 
        67% with no major platform gap. That consistency was the detail that made our case: social interaction is embedded across 
        gaming ecosystems broadly, not tied to any one platform.
        <br><br>
        We estimated the reach of this effect by applying our survey findings to the wider gaming population. If roughly 20% of the world's
        3.2 billion gamers fall into the audience segment our data pointed to, that puts the potential reach of music discovery through 
        games at around 600 million people.
        <br><br>
        I contributed to the data analysis pipeline and helped create Matplotlib visualizations and infographic ("Beats and Battlefields").
        It was used to communicate these findings clearly to a non-technical audience.`,
        personal: `Hackathons are a different kind of pressure I've never experienced. My other projects had months to iterate and be 
        thorough, but this event had a single weekend, so there was no room to second-guess a direction once we picked it. When we did start
        second guessing, we realized how fast time was moving and we knew we had to be more decisive. It taught me what actually matters when
        there's no time to be careful, where we had to get the core finding right first the polish after.
        <br><br>
        Creating the infographic was its own shift. Most of my work is aimed at people who can read and understand the methodology
        directly. With the infographic, the goal was to make a real finding land with someone who hadn't seen our process to get our results.
        Winning Best in Data Communication meant the hard part wasn't just getting the analysis right but also making it convincing at a glance
        and communicating it properly in our presentation.
        <br><br>
        The team came together fast as well despite the four of us not having a previously existing group chemistry. We had to figure out
        each other's work styles and how to divide work and trust each other's parts. It was rewarding to find the direction and result of 
        our project, especially when dealing with different viewpoints. I was nervous going into the event because it was a new and unfamiliar
        environment, but walking away from one weekend with three category wins felt like a payoff that made it worth it.`,
        heroImg: 'images/hackathon.jpg',
        datashots: [
            {
                src: 'images/hackathon-1.jpg',
                caption: 'Beats and Battlefields - infographic'
            }
        ],
        screenshots: ['images/hackathon-2.jpg'],
        liveUrl: '',
        githubUrl: '',
        tileGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a0f1a 100%)',
    },
];

// build catalog grid
function buildGrid() {
    const grid = document.getElementById('proj-grid');
    if (!grid) return;

    PROJECTS.forEach((p, i) => {
        const tile = document.createElement('div');
        tile.className = 'proj-tile';
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '0');
        tile.setAttribute('aria-label', `Open ${p.name} case study`);

        const bgStyle = p.heroImg
            ? `background-image: url('${p.heroImg}'); background-size: cover; background-position: center;`
            : `background: ${p.tileGradient};`;
        
        tile.innerHTML = `
            <div class="proj-tile-bg" style="${bgStyle}"></div>
            <div class="proj-tile-overlay"></div>
            <div class="proj-tile-meta">
                <span class="proj-tile-index">0${i + 1} - ${p.type}</span>
                <span class="proj-tile-name">${p.name}</span>
                <span class="proj-tile-desc">${p.shortDesc}</span>
                <span class="proj-tile-hint">view project →</span>
            </div>
        `;

        tile.addEventListener('click', () => openCase(p.id));
        tile.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') openCase(p.id);
        });

        grid.appendChild(tile);
    });
}

// case study open/close
function openCase(id, addHistory = true) {
    const p = PROJECTS.find(x => x.id === id);
    if (!p) return;

    const panel = document.getElementById('case-study-panel');
    const content = document.getElementById('cs-content')
    const wasOpen = panel.classList.contains('open');

    // build next projects (all except current, max 3)
    // the 3 projects that come after current selected, wrapping back to the start
    const currentIndex = PROJECTS.findIndex(x => x.id === id);
    const count = Math.min(3, PROJECTS.length - 1);
    const others = [];
    for (let i = 1; i <= count; i++) {
        others.push(PROJECTS[(currentIndex + i) % PROJECTS.length]);
    }
    const nextTiles = others.map(o => {
        const bgStyle = o.heroImg
            ? `background-image: url('${o.heroImg}'); background-size: cover; background-position: center;`
            : `background: ${o.tileGradient};`;
        return `
            <div class="cs-next-tile" onclick="openCase('${o.id}')" role="button" tabindex="0"
                    onkeydown="if(event.key==='Enter')openCase('${o.id}')">
                <div class="cs-next-tile-bg" style="${bgStyle}"></div>
                <div class="cs-next-tile-overlay"></div>
                <div class="cs-next-tile-meta">
                    <div class="cs-next-tile-name">${o.name}</div>
                    <div class="cs-next-tile-tag">${o.type} · ${o.year}</div>
                </div>
            </div>
        `;
    }).join('');

    // hero
    const heroHTML = p.heroImg
        ? `<img class="cs-hero" src="${p.heroImg}" alt="${p.name} hero" loading="lazy">`
        : `<div class="cs-hero-placeholder" style="background:${p.tileGradient}">[ hero image ]</div>`;

    // data screenshots
    const datashotsHTML = p.datashots.map(shot =>
        shot.src
            ? `<figure class="cs-datashot-figure">
                <img class="cs-datashot" src="${shot.src}" alt="${shot.caption || p.name + ' datashot'}"
                    loading="lazy" onclick="openLightbox('${shot.src}')"
                    style="cursor:zoom-in;">
                ${shot.caption ? `<figcaption class="cs-datashot-caption">${shot.caption}</figcaption>` : ''}
            </figure>`
            : `<div class="cs-datashot-placeholder">[ datashot ]</div>`
    ).join('');

    // screenshots
    const shotsHTML = p.screenshots.map(src =>
        src
            ? `<img class="cs-screenshot" src="${src}" alt="${p.name} screenshot" 
                loading="lazy" onclick="openLightbox('${src}')" 
                style="cursor:zoom-in;">`
            : `<div class="cs-screenshot-placeholder">[ screenshot ]</div>`
    ).join('');

    // links
    const linksHTML = [
        p.liveUrl ? `<a class="cs-link" href="${p.liveUrl}" target="_blank" rel="noopener">live site ↗</a>` : '',
        p.githubUrl ? `<a class="cs-link" href="${p.githubUrl}" target="_blank" rel="noopener">github ↗</a>` : '',
    ].filter(Boolean).join('');

    // stack pills
    const stackHTML = p.stack.map(t => `<span class="cs-pill">${t}</span>`).join('');

    // highlight pills
    const highlightsHTML = p.highlights.map(s => `<span class="cs-pill">${s}</span>`).join('');

    content.innerHTML = `
        ${heroHTML}

        <div class="cs-body">
            <p class="cs-eyebrow">${p.type} · ${p.year}</p>
            <h1 class="cs-title">${p.name}</h1>
            <p class="cs-tagline">${p.tagline}</p>

            <hr class="cs-divider">

            <div class="cs-meta-grid">
                <div class="cs-meta-block">
                    <div class="cs-meta-item">
                        <div class="cs-meta-item-label">Role</div>
                        <div class="cs-meta-item-value">${p.role}</div>
                    </div>
                    <div class="cs-meta-item">
                        <div class="cs-meta-item-label">Year</div>
                        <div class="cs-meta-item-value">${p.year}</div>
                    </div>
                    ${linksHTML ? `
                    <div class="cs-meta-item">
                        <div class="cs-meta-item-label">Links</div>
                        <div class="cs-links">${linksHTML}</div>
                    </div>` : ''}
                    <div class="cs-meta-item">
                        <div class="cs-meta-item-label">Stack</div>
                        <div class="cs-stack">${stackHTML}</div>
                    </div>
                    ${highlightsHTML ? `
                    <div class="cs-meta-item">
                        <div class="cs-meta-item-label">Highlights</div>
                        <div class="cs-highlights">${highlightsHTML}</div>
                    </div>` : ''}
                </div>

                <div>
                    <p class="cs-section-label">About</p>
                    <p class="cs-text">${p.description}</p>
                    <br>
                    <p class="cs-section-label">Personal Thoughts</p>
                    <p class="cs-text">${p.personal}</p>
                </div>

            </div>

            ${datashotsHTML ? `
            <hr class="cs-divider">
            <p class="cs-section-label">${p.datashotsLabel || 'Data'}</p>
            <div class="cs-datashots">${datashotsHTML}</div>` : ''}

            ${shotsHTML ? `
            <hr class="cs-divider">
            <p class="cs-section-label">Screenshots</p>
            <div class="cs-screenshots">${shotsHTML}</div>` : ''}

            <div class="cs-next">
                <p class="cs-next-label">next projects</p>
                <div class="cs-next-grid">${nextTiles}</div>
            </div>
        </div>
    `;

    panel.scrollTop = 0;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (addHistory) {
        if (wasOpen) history.replaceState({ caseStudy: id }, '');
        else history.pushState({ caseStudy: id }, '');
    }
}

function hideCase() {
    const panel = document.getElementById('case-study-panel');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}   

// close button and Escape: step back in history, which triggers the hide below
function closeCase() {
    if (history.state && history.state.caseStudy) history.back();
    else hideCase();
}

// back/forward buttons
window.addEventListener('popstate', e => {
    closeLightbox();
    if (e.state && e.state.caseStudy) openCase(e.state.caseStudy, false);   // forward button reopens
    else hideCase();
});

// if the page is reloaded while a project was open, start clean
if (history.state && history.state.caseStudy) history.replaceState(null, '');

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const lb = document.getElementById('lightbox');
        if (lb.classList.contains('open')) closeLightbox();
        else closeCase();
    }
});

// lightbox functionality for screenshot images
function openLightbox(src) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
}

// close lightbox on background click
document.addEventListener('click', e => {
    const lb = document.getElementById('lightbox');
    if (e.target === lb) closeLightbox();
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('proj-grid')) {
        buildGrid();
    }
});

