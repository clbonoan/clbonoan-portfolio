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

// floating image functionality
const images = [
    'images/photo1.jpg',
    'images/photo2.jpg',
    'images/photo3.jpg',
    'images/photo4.jpg',
    'images/photo5.jpg',
    'images/photo6.jpg',
    'images/photo7.jpg',
    'images/photo8.jpg',
    'images/photo9.jpg',
    'images/photo10.jpg',
    'images/photo11.jpg',
    'images/photo12.jpg',
    'images/photo13.jpg',
    'images/photo14.jpg',
    'images/photo15.jpg',
    'images/photo16.jpg',
];

// preload all images into browser cache on page load
images.forEach(src => {
    const preload = new Image();
    preload.src = src;
});

// const cursorImg = document.getElementById('cursor-img');
// const cursorImgSrc = document.getElementById('cursor-img-src');
const titleContainer = document.getElementById('title-container');

let lastImageIndex = -1; 
// cursor positioning for image placement
let lastX = null;
let lastY = null;
const DISTANCE_THRESHOLD = 150; // pixels mouse needs to move before a new image shows

// queue of active image elements (FIFO)
const activeImages = [];

// detect if user is on mobile
const isMobile = window.matchMedia('(max-width: 768px)').matches;

function getRandomImage() {
    let index;
    do {
        index = Math.floor(Math.random() * images.length);
    } while (index === lastImageIndex && images.length > 1);
    lastImageIndex = index;
    return images[index];
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