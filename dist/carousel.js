"use strict";
class Carousel {
    constructor(config = {}) {
        this.currentIndex = 0;
        this.autoPlayTimer = null;
        this.isPlaying = false;
        this.track = this.getElement('#carouselTrack');
        this.slides = document.querySelectorAll('.carousel-slide');
        this.prevBtn = this.getElement('#prevBtn');
        this.nextBtn = this.getElement('#nextBtn');
        this.indicatorsContainer = this.getElement('#carouselIndicators');
        this.currentSlideElement = this.getElement('#currentSlide');
        this.totalSlidesElement = this.getElement('#totalSlides');
        this.playPauseBtn = this.getElement('#playPauseBtn');
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = config.autoPlayInterval || 3000;
        this.enableLoop = config.enableLoop !== undefined ? config.enableLoop : true;
        this.init();
    }
    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element)
            throw new Error(`Élément ${selector} introuvable`);
        return element;
    }
    init() {
        this.createIndicators();
        this.attachEventListeners();
        this.updateCarousel();
        this.updateTotalSlides();
    }
    createIndicators() {
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            indicator.dataset.index = i.toString();
            indicator.addEventListener('click', () => this.goToSlide(i));
            this.indicatorsContainer.appendChild(indicator);
        }
    }
    attachEventListeners() {
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.playPauseBtn.addEventListener('click', () => this.toggleAutoPlay());
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft')
                this.previousSlide();
            else if (e.key === 'ArrowRight')
                this.nextSlide();
        });
        this.addTouchSupport();
    }
    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            const swipeThreshold = 50;
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0)
                    this.nextSlide();
                else
                    this.previousSlide();
            }
        });
    }
    previousSlide() {
        if (this.currentIndex > 0)
            this.currentIndex--;
        else if (this.enableLoop)
            this.currentIndex = this.totalSlides - 1;
        this.updateCarousel();
    }
    nextSlide() {
        if (this.currentIndex < this.totalSlides - 1)
            this.currentIndex++;
        else if (this.enableLoop)
            this.currentIndex = 0;
        this.updateCarousel();
    }
    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.currentIndex = index;
            this.updateCarousel();
        }
    }
    updateCarousel() {
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;
        this.updateIndicators();
        this.currentSlideElement.textContent = (this.currentIndex + 1).toString();
        this.updateNavigationButtons();
        if (this.isPlaying)
            this.resetAutoPlay();
    }
    updateIndicators() {
        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            if (index === this.currentIndex)
                indicator.classList.add('active');
            else
                indicator.classList.remove('active');
        });
    }
    updateNavigationButtons() {
        if (!this.enableLoop) {
            this.prevBtn.disabled = this.currentIndex === 0;
            this.nextBtn.disabled = this.currentIndex === this.totalSlides - 1;
        }
    }
    updateTotalSlides() {
        this.totalSlidesElement.textContent = this.totalSlides.toString();
    }
    toggleAutoPlay() {
        if (this.isPlaying)
            this.stopAutoPlay();
        else
            this.startAutoPlay();
    }
    startAutoPlay() {
        this.isPlaying = true;
        this.playPauseBtn.classList.add('playing');
        const buttonText = this.playPauseBtn.querySelector('span');
        if (buttonText)
            buttonText.textContent = 'Pause';
        const svg = this.playPauseBtn.querySelector('svg');
        if (svg) {
            svg.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="currentColor"></rect><rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>';
        }
        this.autoPlayTimer = window.setInterval(() => this.nextSlide(), this.autoPlayInterval);
    }
    stopAutoPlay() {
        this.isPlaying = false;
        this.playPauseBtn.classList.remove('playing');
        const buttonText = this.playPauseBtn.querySelector('span');
        if (buttonText)
            buttonText.textContent = 'Lecture automatique';
        const svg = this.playPauseBtn.querySelector('svg');
        if (svg) {
            svg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>';
        }
        if (this.autoPlayTimer !== null) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    resetAutoPlay() {
        if (this.autoPlayTimer !== null)
            clearInterval(this.autoPlayTimer);
        this.autoPlayTimer = window.setInterval(() => this.nextSlide(), this.autoPlayInterval);
    }
    getCurrentIndex() {
        return this.currentIndex;
    }
    getTotalSlides() {
        return this.totalSlides;
    }
    destroy() {
        this.stopAutoPlay();
    }
}
// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new Carousel({
        autoPlayInterval: 4000,
        enableLoop: true
    });
    window.carousel = carousel;
    console.log('Carrousel initialisé avec succès !');
});
