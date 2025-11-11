interface CarouselConfig {
    autoPlayInterval?: number;
    enableLoop?: boolean;
}

class Carousel {
    private track: HTMLElement;
    private slides: NodeListOf<HTMLElement>;
    private prevBtn: HTMLButtonElement;
    private nextBtn: HTMLButtonElement;
    private indicatorsContainer: HTMLElement;
    private currentSlideElement: HTMLElement;
    private totalSlidesElement: HTMLElement;
    private playPauseBtn: HTMLButtonElement;

    private currentIndex: number = 0;
    private totalSlides: number;
    private autoPlayInterval: number;
    private autoPlayTimer: number | null = null;
    private isPlaying: boolean = false;
    private enableLoop: boolean;

    constructor(config: CarouselConfig = {}) {
        this.track = this.getElement<HTMLElement>('#carouselTrack');
        this.slides = document.querySelectorAll<HTMLElement>('.carousel-slide');
        this.prevBtn = this.getElement<HTMLButtonElement>('#prevBtn');
        this.nextBtn = this.getElement<HTMLButtonElement>('#nextBtn');
        this.indicatorsContainer = this.getElement<HTMLElement>('#carouselIndicators');
        this.currentSlideElement = this.getElement<HTMLElement>('#currentSlide');
        this.totalSlidesElement = this.getElement<HTMLElement>('#totalSlides');
        this.playPauseBtn = this.getElement<HTMLButtonElement>('#playPauseBtn');

        this.totalSlides = this.slides.length;
        this.autoPlayInterval = config.autoPlayInterval || 3000;
        this.enableLoop = config.enableLoop !== undefined ? config.enableLoop : true;

        this.init();
    }

    private getElement<T extends HTMLElement>(selector: string): T {
        const element = document.querySelector<T>(selector);
        if (!element) throw new Error(`Élément ${selector} introuvable`);
        return element;
    }

    private init(): void {
        this.createIndicators();
        this.attachEventListeners();
        this.updateCarousel();
        this.updateTotalSlides();
    }

    private createIndicators(): void {
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            indicator.dataset.index = i.toString();
            indicator.addEventListener('click', () => this.goToSlide(i));
            this.indicatorsContainer.appendChild(indicator);
        }
    }

    private attachEventListeners(): void {
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.playPauseBtn.addEventListener('click', () => this.toggleAutoPlay());

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') this.previousSlide();
            else if (e.key === 'ArrowRight') this.nextSlide();
        });

        this.addTouchSupport();
    }

    private addTouchSupport(): void {
        let touchStartX = 0;
        let touchEndX = 0;

        this.track.addEventListener('touchstart', (e: TouchEvent) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.track.addEventListener('touchend', (e: TouchEvent) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            const swipeThreshold = 50;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) this.nextSlide();
                else this.previousSlide();
            }
        });
    }

    public previousSlide(): void {
        if (this.currentIndex > 0) this.currentIndex--;
        else if (this.enableLoop) this.currentIndex = this.totalSlides - 1;
        this.updateCarousel();
    }

    public nextSlide(): void {
        if (this.currentIndex < this.totalSlides - 1) this.currentIndex++;
        else if (this.enableLoop) this.currentIndex = 0;
        this.updateCarousel();
    }

    public goToSlide(index: number): void {
        if (index >= 0 && index < this.totalSlides) {
            this.currentIndex = index;
            this.updateCarousel();
        }
    }

    private updateCarousel(): void {
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;
        this.updateIndicators();
        this.currentSlideElement.textContent = (this.currentIndex + 1).toString();
        this.updateNavigationButtons();
        if (this.isPlaying) this.resetAutoPlay();
    }

    private updateIndicators(): void {
        const indicators = this.indicatorsContainer.querySelectorAll<HTMLElement>('.indicator');
        indicators.forEach((indicator, index) => {
            if (index === this.currentIndex) indicator.classList.add('active');
            else indicator.classList.remove('active');
        });
    }

    private updateNavigationButtons(): void {
        if (!this.enableLoop) {
            this.prevBtn.disabled = this.currentIndex === 0;
            this.nextBtn.disabled = this.currentIndex === this.totalSlides - 1;
        }
    }

    private updateTotalSlides(): void {
        this.totalSlidesElement.textContent = this.totalSlides.toString();
    }

    public toggleAutoPlay(): void {
        if (this.isPlaying) this.stopAutoPlay();
        else this.startAutoPlay();
    }

    public startAutoPlay(): void {
        this.isPlaying = true;
        this.playPauseBtn.classList.add('playing');

        const buttonText = this.playPauseBtn.querySelector('span');
        if (buttonText) buttonText.textContent = 'Pause';

        const svg = this.playPauseBtn.querySelector('svg');
        if (svg) {
            svg.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="currentColor"></rect><rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>';
        }

        this.autoPlayTimer = window.setInterval(() => this.nextSlide(), this.autoPlayInterval);
    }

    public stopAutoPlay(): void {
        this.isPlaying = false;
        this.playPauseBtn.classList.remove('playing');

        const buttonText = this.playPauseBtn.querySelector('span');
        if (buttonText) buttonText.textContent = 'Lecture automatique';

        const svg = this.playPauseBtn.querySelector('svg');
        if (svg) {
            svg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>';
        }

        if (this.autoPlayTimer !== null) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    private resetAutoPlay(): void {
        if (this.autoPlayTimer !== null) clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = window.setInterval(() => this.nextSlide(), this.autoPlayInterval);
    }

    public getCurrentIndex(): number {
        return this.currentIndex;
    }

    public getTotalSlides(): number {
        return this.totalSlides;
    }

    public destroy(): void {
        this.stopAutoPlay();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new Carousel({
        autoPlayInterval: 4000,
        enableLoop: true
    });

    (window as any).carousel = carousel;
    console.log('Carrousel initialisé avec succès !');
});
