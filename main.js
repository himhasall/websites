class TigerExperience {
    constructor() {
        this.frameCount = 242;
        this.currentFrame = { index: 1 };
        this.images = [];
        this.imagesLoaded = 0;
        
        // DOM Elements
        this.ambientCanvas = document.getElementById('ambient-canvas');
        this.ambientCtx = this.ambientCanvas.getContext('2d');
        
        this.tigerCanvas = document.getElementById('tiger-canvas');
        this.tigerCtx = this.tigerCanvas.getContext('2d');
        
        this.heroSection = document.querySelector('.hero');
        
        // Bind methods
        this.render = this.render.bind(this);
        this.resize = this.resize.bind(this);
        
        this.init();
    }
    
    init() {
        this.preloadImages();
        
        window.addEventListener('resize', this.debounce(this.resize, 100));
        this.resize();
    }
    
    preloadImages() {
        // Preload first image immediately to show something
        const firstImg = new Image();
        firstImg.src = this.getImagePath(1);
        firstImg.onload = () => {
            this.images[1] = firstImg;
            this.imagesLoaded++;
            this.render(); // Render immediately
            
            // Setup GSAP once the first image is loaded
            this.setupScrollTrigger();
        };
        
        // Load the rest
        for (let i = 2; i <= this.frameCount; i++) {
            const img = new Image();
            img.src = this.getImagePath(i);
            img.onload = () => {
                this.images[i] = img;
                this.imagesLoaded++;
            };
        }
    }
    
    getImagePath(index) {
        // Format index with leading zeros: 001, 002, etc.
        const paddedIndex = index.toString().padStart(3, '0');
        // Encode URI in case of spaces in the path
        return encodeURI(`assets/Nike tiger images/ezgif-frame-${paddedIndex}.jpg`);
    }
    
    setupScrollTrigger() {
        gsap.registerPlugin(ScrollTrigger);
        
        gsap.to(this.currentFrame, {
            index: this.frameCount,
            snap: "index",
            ease: "none",
            scrollTrigger: {
                trigger: this.heroSection,
                start: "top top",
                end: "bottom bottom",
                scrub: 1, // Slower, more consistent scrubbing
                onUpdate: () => this.render()
            }
        });
    }
    
    resize() {
        const { innerWidth, innerHeight } = window;
        
        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        
        // Ambient canvas sizing (covers screen)
        this.ambientCanvas.width = innerWidth * dpr;
        this.ambientCanvas.height = innerHeight * dpr;
        
        // Tiger canvas sizing (covers screen)
        this.tigerCanvas.width = innerWidth * dpr;
        this.tigerCanvas.height = innerHeight * dpr;
        
        this.ambientCtx.scale(dpr, dpr);
        this.tigerCtx.scale(dpr, dpr);
        
        this.render();
    }
    
    render() {
        const index = Math.round(this.currentFrame.index);
        const img = this.images[index];
        
        if (!img) return;
        
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Clear canvases
        this.ambientCtx.clearRect(0, 0, w, h);
        this.tigerCtx.clearRect(0, 0, w, h);
        
        // 1. Draw Ambient Canvas (object-fit: cover equivalent)
        const imageAspect = img.width / img.height;
        const canvasAspect = w / h;
        
        let drawW, drawH, drawX, drawY;
        
        if (canvasAspect > imageAspect) {
            drawW = w;
            drawH = w / imageAspect;
            drawX = 0;
            drawY = (h - drawH) / 2;
        } else {
            drawW = h * imageAspect;
            drawH = h;
            drawX = (w - drawW) / 2;
            drawY = 0;
        }
        
        // Draw to ambient canvas (CSS handles the blur and scale)
        this.ambientCtx.drawImage(img, drawX, drawY, drawW, drawH);
        
        // 2. Draw Tiger Canvas (object-fit: contain equivalent)
        let containW, containH, containX, containY;
        
        if (canvasAspect > imageAspect) {
            containH = h;
            containW = h * imageAspect;
            containX = (w - containW) / 2;
            containY = 0;
        } else {
            containW = w;
            containH = w / imageAspect;
            containX = 0;
            containY = (h - containH) / 2;
        }
        
        // Draw to tiger canvas (CSS handles the mask)
        this.tigerCtx.drawImage(img, containX, containY, containW, containH);
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

class Carousel {
    constructor() {
        this.track = document.getElementById('product-carousel');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');
        
        if (!this.track || !this.prevBtn || !this.nextBtn) return;
        
        this.init();
    }
    
    init() {
        this.prevBtn.addEventListener('click', () => {
            const itemWidth = this.track.querySelector('.carousel-item').offsetWidth + 32; // width + gap
            this.track.scrollBy({ left: -itemWidth, behavior: 'smooth' });
        });
        
        this.nextBtn.addEventListener('click', () => {
            const itemWidth = this.track.querySelector('.carousel-item').offsetWidth + 32; // width + gap
            this.track.scrollBy({ left: itemWidth, behavior: 'smooth' });
        });
    }
}

// Initialize everything on load
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
        duration: 2.0,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);

    // 2. Initialize Tiger Experience
    new TigerExperience();
    
    // 3. Initialize Carousel
    new Carousel();
});
