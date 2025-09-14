// ===== PETTY ZEN - AUDIO PLAYER =====

class AudioPlayer {
    constructor() {
        this.audioElement = document.getElementById('audio-player');
        this.currentTrack = null;
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 300; // 5 minutos padrão
        this.volume = 0.5;
        this.timer = null;
        this.timerDuration = 0;
        this.timerRemaining = 0;
        this.playlist = [];
        this.currentTrackIndex = 0;
        
        this.audioLibrary = {
            'rain': {
                title: 'Chuva Suave',
                description: 'Sons naturais de chuva para relaxamento profundo',
                duration: 300,
                frequency: '50Hz',
                rating: 4.9,
                url: 'assets/audio/rain.mp3',
                icon: '🌧️',
                category: 'natureza'
            },
            'ocean': {
                title: 'Ondas do Mar',
                description: 'Tranquilidade infinita com sons do oceano',
                duration: 300,
                frequency: '45Hz',
                rating: 4.8,
                url: 'assets/audio/ocean.mp3',
                icon: '🌊',
                category: 'natureza'
            },
            'forest': {
                title: 'Floresta Calma',
                description: 'Paz da natureza com sons da mata',
                duration: 300,
                frequency: '55Hz',
                rating: 4.7,
                url: 'assets/audio/forest.mp3',
                icon: '🌲',
                category: 'natureza'
            },
            'spa': {
                title: 'Spa Relaxante',
                description: 'Ambiente de spa para relaxamento total',
                duration: 300,
                frequency: '48Hz',
                rating: 4.9,
                url: 'assets/audio/spa.mp3',
                icon: '🧘',
                category: 'wellness'
            },
            'meditation': {
                title: 'Flauta Tibetana',
                description: 'Sons meditativos da flauta tibetana',
                duration: 300,
                frequency: '52Hz',
                rating: 4.8,
                url: 'assets/audio/meditation.mp3',
                icon: '🪕',
                category: 'meditacao'
            }
        };

        this.init();
    }

    init() {
        console.log('🎵 Audio Player inicializando...');
        
        this.setupEventListeners();
        this.setupAudioElement();
        this.updatePlayerUI();
        
        console.log('✅ Audio Player inicializado');
    }

    setupEventListeners() {
        // Controles do player
        const playPauseBtn = document.getElementById('play-pause-btn');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const volumeSlider = document.querySelector('.volume-slider');
        const progressBar = document.querySelector('.progress-bar');

        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousTrack());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextTrack());
        }

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }

        if (progressBar) {
            progressBar.addEventListener('click', (e) => {
                this.seekTo(e);
            });
        }

        // Timer buttons
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.target.dataset.minutes);
                this.setTimer(minutes);
            });
        });

        // Audio cards
        document.querySelectorAll('.audio-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const audioId = e.currentTarget.dataset.audio;
                this.loadTrack(audioId);
            });
        });

        // Play buttons em outras telas
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const audioId = e.currentTarget.dataset.audio;
                this.playTrack(audioId);
            });
        });

        console.log('🔗 Audio Player event listeners configurados');
    }

    setupAudioElement() {
        if (!this.audioElement) {
            console.warn('⚠️ Elemento de áudio não encontrado');
            return;
        }

        // Event listeners do elemento audio
        this.audioElement.addEventListener('loadedmetadata', () => {
            this.duration = this.audioElement.duration;
            this.updateTimeDisplay();
        });

        this.audioElement.addEventListener('timeupdate', () => {
            this.currentTime = this.audioElement.currentTime;
            this.updateProgressBar();
            this.updateTimeDisplay();
        });

        this.audioElement.addEventListener('ended', () => {
            this.handleTrackEnd();
        });

        this.audioElement.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
            this.startVisualAnimation();
        });

        this.audioElement.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
            this.stopVisualAnimation();
        });

        this.audioElement.addEventListener('error', (e) => {
            console.error('❌ Erro no áudio:', e);
            this.showAudioError();
        });

        // Configurar volume inicial
        this.audioElement.volume = this.volume;

        console.log('🔊 Elemento de áudio configurado');
    }

    // ===== CONTROLE DE REPRODUÇÃO =====
    
    loadTrack(audioId) {
        const trackInfo = this.audioLibrary[audioId];
        if (!trackInfo) {
            console.error(`❌ Áudio não encontrado: ${audioId}`);
            return;
        }

        this.currentTrack = audioId;
        this.duration = trackInfo.duration;

        // Atualizar UI
        this.updatePlayerInfo(trackInfo);
        this.updateAudioSelection(audioId);

        // Para demonstração, vamos simular o carregamento
        // Em produção, você carregaria o arquivo real
        this.simulateAudioLoad(trackInfo);

        console.log(`🎵 Áudio carregado: ${trackInfo.title}`);
    }

    simulateAudioLoad(trackInfo) {
        // Simular carregamento do áudio
        // Em um app real, você faria: this.audioElement.src = trackInfo.url;
        
        // Para demo, vamos apenas simular
        setTimeout(() => {
            this.duration = trackInfo.duration;
            this.currentTime = 0;
            this.updateTimeDisplay();
            this.updateProgressBar();
            
            // Mostrar mensagem
            if (window.pettyZen) {
                window.pettyZen.showMessage(`🎵 ${trackInfo.title} pronto para reproduzir!`, 'success');
            }
        }, 500);
    }

    playTrack(audioId) {
        this.loadTrack(audioId);
        
        // Pequeno delay para carregar, depois reproduzir
        setTimeout(() => {
            this.play();
        }, 600);

        // Registrar reprodução
        this.recordPlayback(audioId);
    }

    play() {
        if (!this.currentTrack) {
            this.showMessage('Selecione um áudio primeiro!', 'warning');
            return;
        }

        // Para demo, simular reprodução
        this.isPlaying = true;
        this.updatePlayButton();
        this.startVisualAnimation();
        this.startProgressSimulation();

        // Em produção seria: this.audioElement.play();
        
        console.log(`▶️ Reproduzindo: ${this.currentTrack}`);
        
        // Mostrar notificação
        const trackInfo = this.audioLibrary[this.currentTrack];
        if (window.pettyZen) {
            window.pettyZen.showMessage(`▶️ Tocando: ${trackInfo.title}`, 'info');
        }
    }

    pause() {
        this.isPlaying = false;
        this.updatePlayButton();
        this.stopVisualAnimation();
        this.stopProgressSimulation();

        // Em produção seria: this.audioElement.pause();
        
        console.log('⏸️ Áudio pausado');
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    stop() {
        this.pause();
        this.currentTime = 0;
        this.updateProgressBar();
        this.updateTimeDisplay();
        
        console.log('⏹️ Áudio parado');
    }

    // ===== NAVEGAÇÃO DE PLAYLIST =====

    createPlaylistFromCurrent() {
        // Criar playlist baseada na seleção atual
        this.playlist = Object.keys(this.audioLibrary);
        this.currentTrackIndex = this.playlist.indexOf(this.currentTrack);
        
        if (this.currentTrackIndex === -1) {
            this.currentTrackIndex = 0;
        }
    }

    nextTrack() {
        if (this.playlist.length === 0) {
            this.createPlaylistFromCurrent();
        }

        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        const nextTrackId = this.playlist[this.currentTrackIndex];
        
        this.playTrack(nextTrackId);
        
        console.log(`⏭️ Próximo: ${nextTrackId}`);
    }

    previousTrack() {
        if (this.playlist.length === 0) {
            this.createPlaylistFromCurrent();
        }

        this.currentTrackIndex = this.currentTrackIndex > 0 
            ? this.currentTrackIndex - 1 
            : this.playlist.length - 1;
        
        const prevTrackId = this.playlist[this.currentTrackIndex];
        
        this.playTrack(prevTrackId);
        
        console.log(`⏮️ Anterior: ${prevTrackId}`);
    }

    handleTrackEnd() {
        // Quando o áudio termina
        this.recordSessionComplete();
        
        // Auto-play próximo (opcional)
        if (this.playlist.length > 1) {
            setTimeout(() => {
                this.nextTrack();
            }, 2000);
        }
    }

    // ===== CONTROLE DE VOLUME =====

    setVolume(volumeLevel) {
        this.volume = Math.max(0, Math.min(1, volumeLevel));
        
        if (this.audioElement) {
            this.audioElement.volume = this.volume;
        }

        // Atualizar slider visual
        const volumeSlider = document.querySelector('.volume-slider');
        if (volumeSlider) {
            volumeSlider.value = this.volume * 100;
        }

        console.log(`🔊 Volume: ${Math.round(this.volume * 100)}%`);
    }

    // ===== CONTROLE DE PROGRESSO =====

    seekTo(event) {
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        
        this.currentTime = percent * this.duration;
        
        if (this.audioElement) {
            this.audioElement.currentTime = this.currentTime;
        }

        this.updateProgressBar();
        this.updateTimeDisplay();

        console.log(`⏩ Seek para: ${this.formatTime(this.currentTime)}`);
    }

    updateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        const progressHandle = document.querySelector('.progress-handle');
        
        if (progressFill && this.duration > 0) {
            const percent = (this.currentTime / this.duration) * 100;
            progressFill.style.width = `${percent}%`;
            
            if (progressHandle) {
                progressHandle.style.left = `${percent}%`;
            }
        }
    }

    updateTimeDisplay() {
        const currentTimeEl = document.querySelector('.time-current');
        const totalTimeEl = document.querySelector('.time-total');

        if (currentTimeEl) {
            currentTimeEl.textContent = this.formatTime(this.currentTime);
        }

        if (totalTimeEl) {
            totalTimeEl.textContent = this.formatTime(this.duration);
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // ===== SIMULAÇÃO DE PROGRESSO (PARA DEMO) =====

    startProgressSimulation() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        this.progressInterval = setInterval(() => {
            if (this.isPlaying) {
                this.currentTime += 1;
                
                if (this.currentTime >= this.duration) {
                    this.currentTime = this.duration;
                    this.handleTrackEnd();
                    this.stopProgressSimulation();
                }
                
                this.updateProgressBar();
                this.updateTimeDisplay();
            }
        }, 1000);
    }

    stopProgressSimulation() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    // ===== SISTEMA DE TIMER =====

    setTimer(minutes) {
        // Limpar timer anterior
        this.clearTimer();

        this.timerDuration = minutes * 60;
        this.timerRemaining = this.timerDuration;

        // Atualizar UI dos botões
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`.timer-btn[data-minutes="${minutes}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Iniciar timer
        this.startTimer();

        // Mostrar confirmação
        if (window.pettyZen) {
            window.pettyZen.showMessage(`⏰ Timer configurado para ${minutes} minutos`, 'success');
        }

        console.log(`⏰ Timer configurado: ${minutes} minutos`);
    }

    startTimer() {
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timerRemaining--;
            this.updateTimerDisplay();

            if (this.timerRemaining <= 0) {
                this.handleTimerEnd();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerDisplay = document.getElementById('timer-remaining');
        if (timerDisplay) {
            if (this.timerRemaining > 0) {
                const minutes = Math.floor(this.timerRemaining / 60);
                const seconds = this.timerRemaining % 60;
                timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} restantes`;
            } else {
                timerDisplay.textContent = '';
            }
        }
    }

    handleTimerEnd() {
        this.clearTimer();
        this.stop();

        // Notificação de timer finalizado
        if (window.pettyZen) {
            window.pettyZen.showMessage('⏰ Timer finalizado! Sessão completa.', 'success');
        }

        // Vibração se disponível
        if (navigator.vibrate) {
            navigator.vibrate([300, 100, 300]);
        }

        console.log('⏰ Timer finalizado');
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        this.timerDuration = 0;
        this.timerRemaining = 0;
        this.updateTimerDisplay();

        // Remover seleção dos botões
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    // ===== INTERFACE DO USUÁRIO =====

    updatePlayerUI() {
        this.updatePlayButton();
        this.updateTimeDisplay();
        this.updateProgressBar();
        this.updateTimerDisplay();
    }

    updatePlayButton() {
        const playPauseBtn = document.getElementById('play-pause-btn');
        if (playPauseBtn) {
            const icon = playPauseBtn.querySelector('i');
            if (icon) {
                icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
            }
        }
    }

    updatePlayerInfo(trackInfo) {
        const titleElement = document.getElementById('current-audio-title');
        const descriptionElement = document.getElementById('current-audio-description');

        if (titleElement) {
            titleElement.textContent = trackInfo.title;
        }

        if (descriptionElement) {
            descriptionElement.textContent = trackInfo.description;
        }
    }

    updateAudioSelection(audioId) {
        // Remover seleção anterior
        document.querySelectorAll('.audio-card').forEach(card => {
            card.classList.remove('active');
        });

        // Selecionar atual
        const audioCard = document.querySelector(`.audio-card[data-audio="${audioId}"]`);
        if (audioCard) {
            audioCard.classList.add('active');
        }
    }

    // ===== ANIMAÇÕES VISUAIS =====

    startVisualAnimation() {
        const waveCircles = document.querySelectorAll('.wave-circle');
        waveCircles.forEach(circle => {
            circle.style.animationPlayState = 'running';
        });
    }

    stopVisualAnimation() {
        const waveCircles = document.querySelectorAll('.wave-circle');
        waveCircles.forEach(circle => {
            circle.style.animationPlayState = 'paused';
        });
    }

    // ===== ESTATÍSTICAS E ANALYTICS =====

    recordPlayback(audioId) {
        const playbackData = {
            audioId: audioId,
            timestamp: new Date().toISOString(),
            petName: window.pettyZen?.currentPet?.name || 'Unknown',
            duration: this.duration
        };

        // Salvar no localStorage
        let playbackHistory = JSON.parse(localStorage.getItem('pettyzen_playback') || '[]');
        playbackHistory.push(playbackData);

        // Manter apenas os últimos 100 registros
        if (playbackHistory.length > 100) {
            playbackHistory = playbackHistory.slice(-100);
        }

        localStorage.setItem('pettyzen_playback', JSON.stringify(playbackHistory));

        console.log('📊 Reprodução registrada:', audioId);
    }

    recordSessionComplete() {
        const sessionData = {
            audioId: this.currentTrack,
            completedAt: new Date().toISOString(),
            duration: this.currentTime,
            timerUsed: this.timerDuration > 0
        };

        // Registrar sessão completa
        let sessions = JSON.parse(localStorage.getItem('pettyzen_sessions') || '[]');
        sessions.push(sessionData);

        if (sessions.length > 50) {
            sessions = sessions.slice(-50);
        }

        localStorage.setItem('pettyzen_sessions', JSON.stringify(sessions));

        // Notificar conclusão
        if (window.pettyZen) {
            window.pettyZen.showMessage('🎉 Sessão de relaxamento concluída!', 'success');
        }

        console.log('✅ Sessão registrada:', sessionData);
    }

    // ===== RECOMENDAÇÕES INTELIGENTES =====

    getRecommendedAudio() {
        const hour = new Date().getHours();
        const playbackHistory = JSON.parse(localStorage.getItem('pettyzen_playback') || '[]');
        
        // Lógica baseada no horário
        let recommendedId = 'chuva-suave'; // padrão

        if (hour >= 6 && hour < 12) {
            // Manhã - sons suaves
            recommendedId = 'piano-zen';
        } else if (hour >= 12 && hour < 18) {
            // Tarde - natureza
            recommendedId = 'floresta-calma';
        } else if (hour >= 18 && hour < 22) {
            // Noite - sons aconchegantes
            recommendedId = 'lareira';
        } else {
            // Madrugada - muito suave
            recommendedId = 'ondas-mar';
        }

        // Verificar histórico de preferências
        if (playbackHistory.length > 0) {
            const mostPlayed = this.getMostPlayedAudio(playbackHistory);
            if (mostPlayed && Math.random() > 0.5) {
                recommendedId = mostPlayed;
            }
        }

        return recommendedId;
    }

    getMostPlayedAudio(playbackHistory) {
        const counts = {};
        
        playbackHistory.forEach(record => {
            counts[record.audioId] = (counts[record.audioId] || 0) + 1;
        });

        let mostPlayed = null;
        let maxCount = 0;

        for (const [audioId, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                mostPlayed = audioId;
            }
        }

        return mostPlayed;
    }

    updateDailyRecommendation() {
        const recommendedId = this.getRecommendedAudio();
        const recommendedInfo = this.audioLibrary[recommendedId];

        // Atualizar card de recomendação na home
        const sessionImage = document.querySelector('.session-image i');
        const sessionTitle = document.querySelector('.session-info h3');
        const sessionDescription = document.querySelector('.session-info p');
        const playBtn = document.querySelector('.play-btn');

        if (sessionImage) {
            const iconClass = this.getAudioIconClass(recommendedId);
            sessionImage.className = iconClass;
        }

        if (sessionTitle) {
            sessionTitle.textContent = recommendedInfo.title;
        }

        if (sessionDescription) {
            sessionDescription.textContent = recommendedInfo.description;
        }

        if (playBtn) {
            playBtn.dataset.audio = recommendedId;
        }

        console.log(`💡 Recomendação atualizada: ${recommendedInfo.title}`);
    }

    getAudioIconClass(audioId) {
        const iconMap = {
            'chuva-suave': 'fas fa-cloud-rain',
            'ondas-mar': 'fas fa-water',
            'floresta-calma': 'fas fa-tree',
            'lareira': 'fas fa-fire',
            'piano-zen': 'fas fa-music',
            'violao-suave': 'fas fa-guitar'
        };

        return iconMap[audioId] || 'fas fa-music';
    }

    // ===== TRATAMENTO DE ERROS =====

    showAudioError() {
        if (window.pettyZen) {
            window.pettyZen.showMessage('❌ Erro ao carregar áudio. Verifique sua conexão.', 'error');
        }

        this.stop();
        console.error('❌ Erro no player de áudio');
    }

    showMessage(message, type = 'info') {
        if (window.pettyZen) {
            window.pettyZen.showMessage(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // ===== MÉTODOS PÚBLICOS =====

    getCurrentTrack() {
        return this.currentTrack;
    }

    isCurrentlyPlaying() {
        return this.isPlaying;
    }

    getPlaybackStats() {
        const playbackHistory = JSON.parse(localStorage.getItem('pettyzen_playback') || '[]');
        const sessions = JSON.parse(localStorage.getItem('pettyzen_sessions') || '[]');

        return {
            totalPlaybacks: playbackHistory.length,
            totalSessions: sessions.length,
            mostPlayed: this.getMostPlayedAudio(playbackHistory),
            averageSessionDuration: this.getAverageSessionDuration(sessions)
        };
    }

    getAverageSessionDuration(sessions) {
        if (sessions.length === 0) return 0;

        const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
        return totalDuration / sessions.length;
    }

    // ===== CLEANUP =====

    destroy() {
        this.stopProgressSimulation();
        this.clearTimer();
        
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.src = '';
        }

        console.log('🗑️ Audio Player destruído');
    }
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar o app principal carregar
    setTimeout(() => {
        window.audioPlayer = new AudioPlayer();
        
        // Atualizar recomendação diária
        if (window.audioPlayer) {
            window.audioPlayer.updateDailyRecommendation();
        }
    }, 1000);
});

console.log('🎵 Audio Player carregado!');