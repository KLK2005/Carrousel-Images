/**
 * Classe Carousel - Gère l'ensemble des fonctionnalités du carrousel
 * Version JavaScript compilée depuis TypeScript
 */
class Carousel {
    /**
     * Constructeur du carrousel
     * @param {Object} config - Configuration optionnelle du carrousel
     */
    constructor(config = {}) {
        // Initialisation des éléments DOM
        this.track = this.getElement('#carouselTrack');
        this.slides = document.querySelectorAll('.carousel-slide');
        this.prevBtn = this.getElement('#prevBtn');
        this.nextBtn = this.getElement('#nextBtn');
        this.indicatorsContainer = this.getElement('#carouselIndicators');
        this.currentSlideElement = this.getElement('#currentSlide');
        this.totalSlidesElement = this.getElement('#totalSlides');
        this.playPauseBtn = this.getElement('#playPauseBtn');

        // Configuration
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.autoPlayInterval = config.autoPlayInterval || 3000;
        this.autoPlayTimer = null;
        this.isPlaying = false;
        this.enableLoop = config.enableLoop !== undefined ? config.enableLoop : true;

        // Initialisation
        this.init();
    }

    /**
     * Méthode utilitaire pour récupérer un élément du DOM avec gestion d'erreur
     */
    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Élément ${selector} introuvable`);
        }
        return element;
    }

    /**
     * Initialisation du carrousel
     */
    init() {
        this.createIndicators();
        this.attachEventListeners();
        this.updateCarousel();
        this.updateTotalSlides();
    }

    /**
     * Création des indicateurs de navigation
     */
    createIndicators() {
        for (let i = 0; i < this.totalSlides; i++) {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            indicator.dataset.index = i.toString();
            
            indicator.addEventListener('click', () => {
                this.goToSlide(i);
            });

            this.indicatorsContainer.appendChild(indicator);
        }
    }

    /**
     * Attachement des écouteurs d'événements
     */
    attachEventListeners() {
        // Boutons de navigation
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        // Bouton lecture/pause
        this.playPauseBtn.addEventListener('click', () => this.toggleAutoPlay());

        // Navigation au clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                this.nextSlide();
            }
        });

        // Support du swipe sur mobile
        this.addTouchSupport();
    }

    /**
     * Ajout du support tactile pour mobile
     */
    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;

        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
        });
    }

    /**
     * Navigation vers la slide précédente
     */
    previousSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else if (this.enableLoop) {
            this.currentIndex = this.totalSlides - 1;
        }
        this.updateCarousel();
    }

    /**
     * Navigation vers la slide suivante
     */
    nextSlide() {
        if (this.currentIndex < this.totalSlides - 1) {
            this.currentIndex++;
        } else if (this.enableLoop) {
            this.currentIndex = 0;
        }
        this.updateCarousel();
    }

    /**
     * Navigation vers une slide spécifique
     * @param {number} index - Index de la slide cible
     */
    goToSlide(index) {
        if (index >= 0 && index < this.totalSlides) {
            this.currentIndex = index;
            this.updateCarousel();
        }
    }

    /**
     * Mise à jour de l'affichage du carrousel
     */
    updateCarousel() {
        // Déplacement de la piste
        const offset = -this.currentIndex * 100;
        this.track.style.transform = `translateX(${offset}%)`;

        // Mise à jour des indicateurs
        this.updateIndicators();

        // Mise à jour du compteur
        this.currentSlideElement.textContent = (this.currentIndex + 1).toString();

        // Mise à jour des boutons
        this.updateNavigationButtons();

        // Reset du timer de lecture automatique
        if (this.isPlaying) {
            this.resetAutoPlay();
        }
    }

    /**
     * Mise à jour des indicateurs actifs
     */
    updateIndicators() {
        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            if (index === this.currentIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    /**
     * Mise à jour de l'état des boutons de navigation
     */
    updateNavigationButtons() {
        if (!this.enableLoop) {
            this.prevBtn.disabled = this.currentIndex === 0;
            this.nextBtn.disabled = this.currentIndex === this.totalSlides - 1;
        }
    }

    /**
     * Mise à jour de l'affichage du nombre total de slides
     */
    updateTotalSlides() {
        this.totalSlidesElement.textContent = this.totalSlides.toString();
    }

    /**
     * Basculer la lecture automatique
     */
    toggleAutoPlay() {
        if (this.isPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    /**
     * Démarrer la lecture automatique
     */
    startAutoPlay() {
        this.isPlaying = true;
        this.playPauseBtn.classList.add('playing');
        
        // Mise à jour du texte du bouton
        const buttonText = this.playPauseBtn.querySelector('span');
        if (buttonText) {
            buttonText.textContent = 'Pause';
        }

        // Mise à jour de l'icône
        const svg = this.playPauseBtn.querySelector('svg');
        if (svg) {
            svg.innerHTML = '<rect x="6" y="4" width="4" height="16" fill="currentColor"></rect><rect x="14" y="4" width="4" height="16" fill="currentColor"></rect>';
        }

        this.autoPlayTimer = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayInterval);
    }

    /**
     * Arrêter la lecture automatique
     */
    stopAutoPlay() {
        this.isPlaying = false;
        this.playPauseBtn.classList.remove('playing');

        // Mise à jour du texte du bouton
        const buttonText = this.playPauseBtn.querySelector('span');
        if (buttonText) {
            buttonText.textContent = 'Lecture automatique';
        }

        // Mise à jour de l'icône
        const svg = this.playPauseBtn.querySelector('svg');
        if (svg) {
            svg.innerHTML = '<polygon points="5 3 19 12 5 21 5 3" fill="currentColor"></polygon>';
        }

        if (this.autoPlayTimer !== null) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    /**
     * Réinitialiser le timer de lecture automatique
     */
    resetAutoPlay() {
        if (this.autoPlayTimer !== null) {
            clearInterval(this.autoPlayTimer);
        }
        this.autoPlayTimer = setInterval(() => {
            this.nextSlide();
        }, this.autoPlayInterval);
    }

    /**
     * Obtenir l'index actuel
     */
    getCurrentIndex() {
        return this.currentIndex;
    }

    /**
     * Obtenir le nombre total de slides
     */
    getTotalSlides() {
        return this.totalSlides;
    }

    /**
     * Détruire le carrousel et nettoyer les ressources
     */
    destroy() {
        this.stopAutoPlay();
    }
}

// Initialisation du carrousel au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const carousel = new Carousel({
        autoPlayInterval: 4000,
        enableAutoPlay: false,
        enableLoop: true
    });

    // Exposer l'instance pour le debugging (optionnel)
    window.carousel = carousel;
    
    console.log('Carrousel initialisé avec succès !');
});