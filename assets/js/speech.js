class TextToSpeech {
    constructor() {
        this.speech = null;
        this.isSpeaking = false;
        this.isPaused = false;
        this.currentText = '';
        this.currentElement = null;
        this.voices = [];
        this.selectedVoice = null;
        this.rate = 1;
        this.volume = 1;
        this.queue = [];
        
        this.init();
    }
    
    async init() {
        if ('speechSynthesis' in window) {
            this.speech = window.speechSynthesis;
            
            this.loadVoices();
            
            this.speech.onvoiceschanged = () => this.loadVoices();
            
            console.log('SpeechSynthesis inicializado');
        } else {
            console.error('Tu navegador no soporta text-to-speech');
            this.showError('Tu navegador no soporta la función de lectura de voz.');
        }
    }
    
    loadVoices() {
        this.voices = this.speech.getVoices();
        
        const spanishVoices = this.voices.filter(voice => 
            voice.lang.startsWith('es') || 
            voice.lang.includes('ES') ||
            voice.name.toLowerCase().includes('spanish')
        );
        
        this.updateVoiceSelect(spanishVoices.length > 0 ? spanishVoices : this.voices);
    }
    
    updateVoiceSelect(voices) {
        const select = document.getElementById('speech-voice-select');
        if (!select) return;
        
        select.innerHTML = '';
        
        if (voices.length === 0) {
            select.innerHTML = '<option value="">No hay voces disponibles</option>';
            return;
        }
        
        // Agregar opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccionar voz...';
        select.appendChild(defaultOption);
        
        // Agregar voces disponibles
        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            
            // Seleccionar voz en español por defecto
            if (voice.lang.startsWith('es') && !this.selectedVoice) {
                option.selected = true;
                this.selectedVoice = voice;
            }
            
            select.appendChild(option);
        });
        
        // Event listener para cambiar voz
        select.addEventListener('change', (e) => {
            const voiceIndex = parseInt(e.target.value);
            if (!isNaN(voiceIndex) && voiceIndex >= 0) {
                this.selectedVoice = this.voices[voiceIndex];
            }
        });
    }
    
    // Extraer texto de la página
    extractPageText() {
        const contentContainer = document.querySelector('.content-container') || document.body;
        
        // Elementos a incluir (en orden de lectura)
        const selectors = [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'li', 'blockquote', 'figcaption',
            '.hero-content', '.dato', '.card p'
        ];
        
        let text = '';
        const elements = [];
        
        selectors.forEach(selector => {
            const foundElements = contentContainer.querySelectorAll(selector);
            foundElements.forEach(el => {
                // Excluir elementos ocultos
                if (el.offsetParent !== null && el.textContent.trim()) {
                    text += el.textContent.trim() + '. ';
                    elements.push({
                        element: el,
                        text: el.textContent.trim()
                    });
                }
            });
        });
        
        return { text, elements };
    }
    
    // Leer página completa
    readPage() {
        if (!this.speech) {
            this.showError('SpeechSynthesis no está disponible');
            return;
        }
        
        // Detener lectura actual
        this.stop();
        
        // Extraer texto
        const { text, elements } = this.extractPageText();
        
        if (!text.trim()) {
            this.showError('No hay texto para leer');
            return;
        }
        
        this.currentText = text;
        this.queue = elements;
        
        // Crear utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configurar voz
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        
        // Configurar propiedades
        utterance.rate = this.rate;
        utterance.volume = this.volume;
        utterance.pitch = 1;
        
        // Eventos
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.isPaused = false;
            this.updateUI(true);
            this.highlightCurrentElement(0);
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.isPaused = false;
            this.updateUI(false);
            this.removeHighlights();
        };
        
        utterance.onpause = () => {
            this.isPaused = true;
            this.updateUI(true);
        };
        
        utterance.onresume = () => {
            this.isPaused = false;
            this.updateUI(true);
        };
        
        utterance.onerror = (event) => {
            console.error('Error en speech:', event);
            this.isSpeaking = false;
            this.isPaused = false;
            this.updateUI(false);
            this.removeHighlights();
        };
        
        // Iniciar lectura
        this.speech.speak(utterance);
    }
    
    // Resaltar elemento actual
    highlightCurrentElement(index) {
        this.removeHighlights();
        
        if (this.queue[index] && this.queue[index].element) {
            this.currentElement = this.queue[index].element;
            this.currentElement.classList.add('speech-reading');
            
            // Scroll suave al elemento
            this.currentElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            
            // Actualizar barra de progreso
            this.updateProgress((index + 1) / this.queue.length * 100);
        }
    }
    
    removeHighlights() {
        document.querySelectorAll('.speech-reading').forEach(el => {
            el.classList.remove('speech-reading');
        });
    }
    
    updateProgress(percentage) {
        const progressBar = document.querySelector('.speech-progress-bar');
        const progressText = document.querySelector('.speech-progress-text');
        
        if (progressBar) {
            progressBar.style.setProperty('--progress-width', `${percentage}%`);
            progressBar.querySelector('::after').style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Leyendo... ${Math.round(percentage)}%`;
        }
    }
    
    updateUI(isActive) {
        const toggleBtn = document.getElementById('speech-toggle');
        const controls = document.getElementById('speech-controls');
        
        if (toggleBtn) {
            if (isActive) {
                toggleBtn.classList.add('active');
            } else {
                toggleBtn.classList.remove('active');
            }
        }
        
        if (controls) {
            if (isActive) {
                controls.style.display = 'block';
            }
        }
        
        // Actualizar estado de botones
        this.updateControlButtons();
    }
    
    updateControlButtons() {
        const pauseBtn = document.getElementById('speech-pause');
        const resumeBtn = document.getElementById('speech-resume');
        const stopBtn = document.getElementById('speech-stop');
        
        if (pauseBtn) {
            pauseBtn.disabled = !this.isSpeaking || this.isPaused;
        }
        
        if (resumeBtn) {
            resumeBtn.disabled = !this.isSpeaking || !this.isPaused;
        }
        
        if (stopBtn) {
            stopBtn.disabled = !this.isSpeaking;
        }
    }
    
    // Controles
    pause() {
        if (this.speech && this.isSpeaking && !this.isPaused) {
            this.speech.pause();
            this.isPaused = true;
            this.updateControlButtons();
        }
    }
    
    resume() {
        if (this.speech && this.isSpeaking && this.isPaused) {
            this.speech.resume();
            this.isPaused = false;
            this.updateControlButtons();
        }
    }
    
    stop() {
        if (this.speech) {
            this.speech.cancel();
            this.isSpeaking = false;
            this.isPaused = false;
            this.updateUI(false);
            this.removeHighlights();
        }
    }
    
    // Cambiar velocidad
    setRate(newRate) {
        this.rate = newRate;
        if (this.isSpeaking) {
            this.stop();
            this.readPage();
        }
    }
    
    // Cambiar volumen
    setVolume(newVolume) {
        this.volume = newVolume;
        if (this.isSpeaking) {
            this.stop();
            this.readPage();
        }
    }
    
    showError(message) {
        console.error(message);
        // Podrías mostrar una notificación al usuario
        alert(message);
    }
}

// =============================
// INICIALIZACIÓN Y EVENTOS
// =============================

let speechEngine = null;

function initSpeech() {
    speechEngine = new TextToSpeech();
    
    // Botón toggle
    const speechToggle = document.getElementById('speech-toggle');
    if (speechToggle) {
        speechToggle.addEventListener('click', () => {
            if (speechEngine.isSpeaking) {
                speechEngine.stop();
            } else {
                speechEngine.readPage();
            }
        });
    }
    
    // Controles
    document.getElementById('speech-pause')?.addEventListener('click', () => speechEngine.pause());
    document.getElementById('speech-resume')?.addEventListener('click', () => speechEngine.resume());
    document.getElementById('speech-stop')?.addEventListener('click', () => speechEngine.stop());
    document.getElementById('speech-close')?.addEventListener('click', () => {
        document.getElementById('speech-controls').style.display = 'none';
        speechEngine.stop();
    });
    
    // Botones de velocidad
    document.querySelectorAll('.speech-buttons button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rate = parseFloat(e.target.dataset.rate);
            if (!isNaN(rate)) {
                // Remover clase active de todos
                document.querySelectorAll('.speech-buttons button').forEach(b => {
                    b.classList.remove('active');
                });
                // Agregar al botón clickeado
                e.target.classList.add('active');
                
                speechEngine.setRate(rate);
            }
        });
    });
    
    // Control de volumen
    const volumeControl = document.getElementById('speech-volume');
    if (volumeControl) {
        volumeControl.addEventListener('input', (e) => {
            speechEngine.setVolume(parseFloat(e.target.value));
        });
    }
    
    console.log('Lector de voz inicializado');
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpeech);
} else {
    initSpeech();
}

// Exportar para uso en navbar.js
export { speechEngine, initSpeech };