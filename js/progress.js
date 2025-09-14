// ===== PETTY ZEN - SISTEMA DE PROGRESSO =====

class ProgressSystem {
    constructor() {
        this.moodChart = null;
        this.progressData = {
            moodHistory: [],
            achievements: [],
            streak: 0,
            sessions: [],
            photos: []
        };
        
        this.achievementTemplates = [
            {
                id: 'first_day',
                name: 'Primeiro Dia',
                description: 'Iniciou a jornada zen!',
                icon: 'fas fa-seedling',
                condition: () => this.progressData.moodHistory.length >= 1,
                reward: 'Desbloqueou dica personalizada'
            },
            {
                id: 'first_week',
                name: 'Primeira Semana',
                description: '7 dias de dedicação!',
                icon: 'fas fa-star',
                condition: () => this.progressData.streak >= 7,
                reward: 'Áudio bônus desbloqueado'
            },
            {
                id: 'happy_streak',
                name: 'Mamãe Zen',
                description: 'Pet mais calmo detectado',
                icon: 'fas fa-heart',
                condition: () => {
                    const recent = this.progressData.moodHistory.slice(-3);
                    return recent.length >= 3 && recent.every(m => m.mood === 'happy' || m.mood === 'calm');
                },
                reward: 'Badge especial no perfil'
            },
            {
                id: 'consistency_master',
                name: 'Consistência Master',
                description: '14 dias consecutivos',
                icon: 'fas fa-calendar-check',
                condition: () => this.progressData.streak >= 14,
                reward: 'Modo premium por 1 mês'
            },
            {
                id: 'pet_whisperer',
                name: 'Pet Whisperer',
                description: '30 sessões completadas',
                icon: 'fas fa-user-md',
                condition: () => this.progressData.sessions.length >= 30,
                reward: 'Certificado digital'
            },
            {
                id: 'zen_master',
                name: 'Zen Master',
                description: '30 dias de jornada',
                icon: 'fas fa-trophy',
                condition: () => this.progressData.streak >= 30,
                reward: 'Acesso vitalício premium'
            },
            {
                id: 'photographer',
                name: 'Fotógrafa Dedicada',
                description: '10 fotos no diário',
                icon: 'fas fa-camera',
                condition: () => this.progressData.photos.length >= 10,
                reward: 'Template de story personalizado'
            },
            {
                id: 'early_bird',
                name: 'Madrugadora',
                description: '5 sessões antes das 8h',
                icon: 'fas fa-sun',
                condition: () => {
                    return this.progressData.sessions.filter(s => {
                        const hour = new Date(s.timestamp).getHours();
                        return hour >= 5 && hour < 8;
                    }).length >= 5;
                },
                reward: 'Áudio especial "Despertar Suave"'
            },
            {
                id: 'night_owl',
                name: 'Coruja Noturna',
                description: '5 sessões após 22h',
                icon: 'fas fa-moon',
                condition: () => {
                    return this.progressData.sessions.filter(s => {
                        const hour = new Date(s.timestamp).getHours();
                        return hour >= 22 || hour < 5;
                    }).length >= 5;
                },
                reward: 'Áudio especial "Sono Profundo"'
            },
            {
                id: 'weather_master',
                name: 'Master do Clima',
                description: 'Usou app em 3 climas diferentes',
                icon: 'fas fa-cloud-sun',
                condition: () => {
                    const weatherTypes = new Set(this.progressData.sessions.map(s => s.weather || 'normal'));
                    return weatherTypes.size >= 3;
                },
                reward: 'Recomendações meteorológicas'
            }
        ];

        this.init();
    }

    init() {
        console.log('📊 Progress System inicializando...');
        
        this.loadProgressData();
        this.setupEventListeners();
        this.updateDailyStreak();
        
        console.log('✅ Progress System inicializado');
    }

    setupEventListeners() {
        // Botões de humor
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mood = e.currentTarget.dataset.mood;
                this.recordMood(mood);
                this.updateMoodUI(e.currentTarget);
            });
        });

        // Upload de foto (placeholder)
        document.querySelectorAll('.photo-placeholder').forEach(placeholder => {
            placeholder.addEventListener('click', () => {
                this.handlePhotoUpload();
            });
        });

        // Conquistas - clique para detalhes
        document.addEventListener('click', (e) => {
            if (e.target.closest('.achievement-card')) {
                const card = e.target.closest('.achievement-card');
                this.showAchievementDetails(card);
            }
        });

        console.log('🔗 Progress event listeners configurados');
    }

    // ===== GERENCIAMENTO DE DADOS =====
    
    loadProgressData() {
        try {
            const saved = localStorage.getItem('pettyzen_progress_detailed');
            if (saved) {
                this.progressData = { ...this.progressData, ...JSON.parse(saved) };
            }

            // Carregar dados do app principal se disponível
            if (window.pettyZen) {
                this.progressData.moodHistory = window.pettyZen.moodHistory || [];
                this.progressData.achievements = window.pettyZen.achievements || [];
                this.progressData.streak = window.pettyZen.streak || 0;
            }

            console.log('📊 Dados de progresso carregados:', this.progressData);
        } catch (error) {
            console.error('❌ Erro ao carregar progresso:', error);
        }
    }

    saveProgressData() {
        try {
            localStorage.setItem('pettyzen_progress_detailed', JSON.stringify(this.progressData));
            
            // Sincronizar com app principal
            if (window.pettyZen) {
                window.pettyZen.moodHistory = this.progressData.moodHistory;
                window.pettyZen.achievements = this.progressData.achievements;
                window.pettyZen.streak = this.progressData.streak;
                window.pettyZen.saveUserData();
            }

            console.log('💾 Progresso salvo');
        } catch (error) {
            console.error('❌ Erro ao salvar progresso:', error);
        }
    }

    // ===== SISTEMA DE HUMOR =====

    recordMood(mood) {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        // Verificar se já registrou hoje
        const existingIndex = this.progressData.moodHistory.findIndex(entry => 
            entry.date.split('T')[0] === todayString
        );

        const moodEntry = {
            date: today.toISOString(),
            mood: mood,
            petName: window.pettyZen?.currentPet?.name || 'Pet',
            weather: this.getCurrentWeather(),
            notes: ''
        };

        if (existingIndex !== -1) {
            // Atualizar entrada existente
            this.progressData.moodHistory[existingIndex] = moodEntry;
        } else {
            // Nova entrada
            this.progressData.moodHistory.push(moodEntry);
            this.updateStreak();
        }

        // Manter apenas últimos 60 dias
        if (this.progressData.moodHistory.length > 60) {
            this.progressData.moodHistory = this.progressData.moodHistory.slice(-60);
        }

        // Verificar conquistas
        this.checkAchievements();
        
        // Atualizar UI
        this.updateMoodChart();
        this.updateProgressSummary();
        
        this.saveProgressData();

        // Mostrar feedback
        this.showMoodFeedback(mood);

        console.log('😊 Humor registrado:', mood);
    }

    updateMoodUI(selectedBtn) {
        // Remover seleção de outros botões
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Marcar botão selecionado
        selectedBtn.classList.add('selected');

        // Animação de feedback
        selectedBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            selectedBtn.style.transform = 'scale(1)';
        }, 200);
    }

    showMoodFeedback(mood) {
        const messages = {
            'happy': '🎉 Que alegria! O progresso está ótimo!',
            'calm': '😌 Perfeito! Relaxamento conquistado!',
            'anxious': '🫂 Vamos melhorar juntas! Continue firme!'
        };

        const message = messages[mood] || 'Obrigada por registrar!';
        
        if (window.pettyZen) {
            window.pettyZen.showMessage(message, 'success');
        }
    }

    // ===== SISTEMA DE STREAK =====

    updateStreak() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const hasToday = this.hasMoodForDate(today);
        const hasYesterday = this.hasMoodForDate(yesterday);

        if (hasToday) {
            if (this.progressData.streak === 0 || hasYesterday) {
                this.progressData.streak += 1;
            } else {
                // Reset streak se pulou um dia
                this.progressData.streak = 1;
            }
        }

        this.updateStreakDisplay();
    }

    updateDailyStreak() {
        // Verificar se precisa resetar streak (chamado na inicialização)
        const today = new Date();
        const hasToday = this.hasMoodForDate(today);
        
        if (!hasToday && this.progressData.streak > 0) {
            // Verificar se ontem tinha registro
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (!this.hasMoodForDate(yesterday)) {
                // Perdeu o streak
                const oldStreak = this.progressData.streak;
                this.progressData.streak = 0;
                
                if (oldStreak >= 7) {
                    this.showStreakLostMessage(oldStreak);
                }
            }
        }
    }

    hasMoodForDate(date) {
        const dateString = date.toISOString().split('T')[0];
        return this.progressData.moodHistory.some(entry => 
            entry.date.split('T')[0] === dateString
        );
    }

    updateStreakDisplay() {
        const streakCounter = document.querySelector('.streak-counter span');
        if (streakCounter) {
            streakCounter.textContent = `${this.progressData.streak} dias consecutivos!`;
        }

        // Adicionar efeito visual se streak for significativo
        if (this.progressData.streak > 0 && this.progressData.streak % 7 === 0) {
            this.celebrateStreak(this.progressData.streak);
        }
    }

    celebrateStreak(streak) {
        // Animação de celebração
        const streakElement = document.querySelector('.streak-counter');
        if (streakElement) {
            streakElement.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                streakElement.style.animation = '';
            }, 500);
        }

        // Mensagem de parabéns
        const messages = {
            7: '🎉 Uma semana inteira! Você é incrível!',
            14: '🌟 Duas semanas! Que dedicação!',
            21: '💎 Três semanas! Você é uma inspiração!',
            30: '👑 Um mês completo! Zen Master suprema!'
        };

        const message = messages[streak] || `🔥 ${streak} dias! Imparável!`;
        
        if (window.pettyZen) {
            window.pettyZen.showMessage(message, 'success');
        }
    }

    showStreakLostMessage(oldStreak) {
        if (window.pettyZen) {
            window.pettyZen.showMessage(
                `😢 Streak de ${oldStreak} dias perdido. Que tal recomeçar hoje?`, 
                'warning'
            );
        }
    }

    // ===== GRÁFICOS E VISUALIZAÇÃO =====

    updateMoodChart() {
        const canvas = document.getElementById('mood-chart');
        if (!canvas || !window.Chart) return;

        // Preparar dados dos últimos 14 dias
        const labels = [];
        const data = [];
        const backgroundColors = [];
        const borderColors = [];

        for (let i = 13; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            // Label do dia
            if (i === 0) {
                labels.push('Hoje');
            } else if (i === 1) {
                labels.push('Ontem');
            } else {
                labels.push(date.toLocaleDateString('pt-BR', { 
                    weekday: 'short',
                    day: 'numeric'
                }));
            }
            
            // Buscar humor do dia
            const moodEntry = this.progressData.moodHistory.find(entry => 
                entry.date.split('T')[0] === dateString
            );

            if (moodEntry) {
                const moodValues = {
                    'anxious': 1,
                    'calm': 2,
                    'happy': 3
                };
                
                const moodColors = {
                    'anxious': { bg: '#ffcccb', border: '#ff5722' },
                    'calm': { bg: '#bbdefb', border: '#2196f3' },
                    'happy': { bg: '#c8e6c9', border: '#4caf50' }
                };

                data.push(moodValues[moodEntry.mood]);
                backgroundColors.push(moodColors[moodEntry.mood].bg);
                borderColors.push(moodColors[moodEntry.mood].border);
            } else {
                data.push(0);
                backgroundColors.push('#f5f5f5');
                borderColors.push('#e0e0e0');
            }
        }

        // Destruir gráfico anterior se existir
        if (this.moodChart) {
            this.moodChart.destroy();
        }

        // Criar novo gráfico
        this.moodChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Humor',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: backgroundColors,
                    pointBorderColor: borderColors,
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const moods = ['', '😰 Ansioso', '😌 Calmo', '😊 Feliz'];
                                return moods[context.raw] || 'Sem registro';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 3,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const labels = ['', '😰', '😌', '😊'];
                                return labels[value] || '';
                            }
                        },
                        grid: {
                            color: '#f0f0f0'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        console.log('📊 Gráfico de humor atualizado');
    }

    // ===== SISTEMA DE CONQUISTAS =====

    checkAchievements() {
        this.achievementTemplates.forEach(template => {
            const alreadyEarned = this.progressData.achievements.find(a => a.id === template.id);
            
            if (!alreadyEarned && template.condition()) {
                this.earnAchievement(template);
            }
        });
    }

    earnAchievement(template) {
        const achievement = {
            ...template,
            earnedAt: new Date().toISOString(),
            progress: 100
        };
        
        this.progressData.achievements.push(achievement);
        
        // Mostrar celebração
        this.showAchievementCelebration(achievement);
        
        // Atualizar UI
        this.updateAchievementsDisplay();
        
        this.saveProgressData();

        console.log('🏆 Nova conquista:', achievement.name);
    }

    showAchievementCelebration(achievement) {
        // Criar overlay de celebração
        const overlay = document.createElement('div');
        overlay.className = 'achievement-celebration';
        overlay.innerHTML = `
            <div class="celebration-content">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <h2>🎉 Nova Conquista!</h2>
                <h3>${achievement.name}</h3>
                <p>${achievement.description}</p>
                <div class="reward">
                    <strong>Recompensa:</strong> ${achievement.reward}
                </div>
                <button class="celebration-close">Continuar</button>
            </div>
        `;

        // Estilos
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.5s ease'
        });

        document.body.appendChild(overlay);

        // Botão fechar
        overlay.querySelector('.celebration-close').addEventListener('click', () => {
            overlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        });

        // Vibração se disponível
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 300]);
        }

        // Confete (se tiver biblioteca)
        this.triggerConfetti();
    }

    triggerConfetti() {
        // Efeito de confete simples com CSS
        for (let i = 0; i < 50; i++) {
            const confetto = document.createElement('div');
            confetto.className = 'confetto';
            confetto.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${['#ff9800', '#4caf50', '#2196f3', '#e91e63'][Math.floor(Math.random() * 4)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                z-index: 10001;
                animation: fall ${2 + Math.random() * 3}s linear forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            
            document.body.appendChild(confetto);
            
            setTimeout(() => {
                if (confetto.parentNode) {
                    confetto.parentNode.removeChild(confetto);
                }
            }, 5000);
        }
    }

    updateAchievementsDisplay() {
        const achievementsGrid = document.querySelector('.achievements-grid');
        if (!achievementsGrid) return;

        achievementsGrid.innerHTML = '';

        // Mostrar conquistas obtidas e próximas
        const toShow = [...this.progressData.achievements];
        
        // Adicionar próximas conquistas não obtidas
        const nextAchievements = this.achievementTemplates
            .filter(template => !this.progressData.achievements.find(a => a.id === template.id))
            .slice(0, 3);

        nextAchievements.forEach(template => {
            toShow.push({
                ...template,
                earnedAt: null,
                progress: this.calculateAchievementProgress(template)
            });
        });

        toShow.forEach(achievement => {
            const card = this.createAchievementCard(achievement);
            achievementsGrid.appendChild(card);
        });
    }

    createAchievementCard(achievement) {
        const card = document.createElement('div');
        card.className = `achievement-card ${achievement.earnedAt ? 'earned' : ''}`;
        card.dataset.achievementId = achievement.id;
        
        card.innerHTML = `
            <i class="${achievement.icon}"></i>
            <div class="achievement-info">
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
            </div>
            ${!achievement.earnedAt ? `
                <div class="progress-badge">
                    ${achievement.progress}%
                </div>
            ` : ''}
        `;

        return card;
    }

    calculateAchievementProgress(template) {
        switch (template.id) {
            case 'first_week':
                return Math.min(100, (this.progressData.streak / 7) * 100);
            case 'consistency_master':
                return Math.min(100, (this.progressData.streak / 14) * 100);
            case 'zen_master':
                return Math.min(100, (this.progressData.streak / 30) * 100);
            case 'pet_whisperer':
                return Math.min(100, (this.progressData.sessions.length / 30) * 100);
            case 'photographer':
                return Math.min(100, (this.progressData.photos.length / 10) * 100);
            default:
                return 0;
        }
    }

    showAchievementDetails(card) {
        const achievementId = card.dataset.achievementId;
        const achievement = this.progressData.achievements.find(a => a.id === achievementId) ||
                           this.achievementTemplates.find(t => t.id === achievementId);

        if (!achievement) return;

        // Mostrar modal com detalhes
        const modal = document.createElement('div');
        modal.className = 'achievement-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <i class="${achievement.icon}"></i>
                    <h3>${achievement.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${achievement.description}</p>
                    ${achievement.reward ? `<div class="reward"><strong>Recompensa:</strong> ${achievement.reward}</div>` : ''}
                    ${achievement.earnedAt ? `<div class="earned-date">Conquistado em: ${new Date(achievement.earnedAt).toLocaleDateString('pt-BR')}</div>` : ''}
                </div>
            </div>
        `;

        // Estilos do modal
        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        document.body.appendChild(modal);

        // Fechar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // ===== DIÁRIO FOTOGRÁFICO =====

    handlePhotoUpload() {
        // Simular upload de foto
        if (window.pettyZen) {
            window.pettyZen.showMessage('📸 Recurso de câmera em desenvolvimento! Por ora, registre o humor do seu pet. 💕', 'info');
        }

        // Em um app real, você abriria a câmera:
        // navigator.mediaDevices.getUserMedia({ video: true })
    }

    addPhotoToTimeline(photoData) {
        this.progressData.photos.push({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            url: photoData.url,
            mood: photoData.mood,
            notes: photoData.notes || ''
        });

        this.updatePhotoGallery();
        this.checkAchievements();
        this.saveProgressData();
    }

    updatePhotoGallery() {
        const photoGrid = document.querySelector('.photo-grid');
        if (!photoGrid) return;

        // Atualizar galeria com fotos
        // Implementação completa dependeria do sistema real de upload
    }

    // ===== ESTATÍSTICAS E RELATÓRIOS =====

    generateWeeklyReport() {
        const lastWeek = this.progressData.moodHistory.slice(-7);
        
        const moodCounts = {
            happy: lastWeek.filter(m => m.mood === 'happy').length,
            calm: lastWeek.filter(m => m.mood === 'calm').length,
            anxious: lastWeek.filter(m => m.mood === 'anxious').length
        };

        const totalDays = lastWeek.length;
        const positiveRatio = (moodCounts.happy + moodCounts.calm) / totalDays;

        return {
            totalDays,
            moodCounts,
            positiveRatio,
            trend: this.calculateTrend(lastWeek),
            achievements: this.progressData.achievements.filter(a => {
                const earnedDate = new Date(a.earnedAt);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return earnedDate >= weekAgo;
            }).length
        };
    }

    calculateTrend(moodHistory) {
        if (moodHistory.length < 2) return 'stable';

        const recent = moodHistory.slice(-3);
        const older = moodHistory.slice(-6, -3);

        if (recent.length === 0 || older.length === 0) return 'stable';

        const recentAvg = recent.reduce((sum, m) => {
            const values = { anxious: 1, calm: 2, happy: 3 };
            return sum + values[m.mood];
        }, 0) / recent.length;

        const olderAvg = older.reduce((sum, m) => {
            const values = { anxious: 1, calm: 2, happy: 3 };
            return sum + values[m.mood];
        }, 0) / older.length;

        if (recentAvg > olderAvg + 0.3) return 'improving';
        if (recentAvg < olderAvg - 0.3) return 'declining';
        return 'stable';
    }

    updateProgressSummary() {
        const weekProgress = document.querySelector('.week-progress');
        if (!weekProgress) return;

        // Atualizar indicadores visuais da semana
        const progressItems = weekProgress.querySelectorAll('.progress-item');
        const today = new Date().getDay();

        progressItems.forEach((item, index) => {
            const dayDate = new Date();
            dayDate.setDate(dayDate.getDate() - (today - index));
            
            const hasMood = this.hasMoodForDate(dayDate);
            
            item.classList.toggle('completed', hasMood && index < today);
            item.classList.toggle('active', index === today);
            
            const moodIndicator = item.querySelector('.mood-indicator');
            if (hasMood) {
                const entry = this.progressData.moodHistory.find(m => 
                    m.date.split('T')[0] === dayDate.toISOString().split('T')[0]
                );
                if (entry) {
                    moodIndicator.className = `mood-indicator ${entry.mood}`;
                }
            }
        });

        // Atualizar tendência
        const trendInfo = document.querySelector('.trend-info span');
        if (trendInfo) {
            const trend = this.calculateTrend(this.progressData.moodHistory.slice(-7));
            const trendTexts = {
                improving: 'Tendência: Melhorando! 📈',
                declining: 'Tendência: Precisa atenção 📉',
                stable: 'Tendência: Estável 📊'
            };
            trendInfo.textContent = trendTexts[trend];
        }
    }

    // ===== UTILITÁRIOS =====

    getCurrentWeather() {
        // Simular detecção de clima
        // Em um app real, você usaria uma API de clima
        const weathers = ['sunny', 'rainy', 'cloudy', 'stormy'];
        return weathers[Math.floor(Math.random() * weathers.length)];
    }

    exportProgress() {
        const data = {
            ...this.progressData,
            exportDate: new Date().toISOString(),
            petName: window.pettyZen?.currentPet?.name || 'Pet',
            ownerName: window.pettyZen?.currentUser?.name || 'Owner'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `petty-zen-progress-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // ===== MÉTODOS PÚBLICOS =====

    getProgressStats() {
        return {
            totalDays: this.progressData.moodHistory.length,
            currentStreak: this.progressData.streak,
            achievements: this.progressData.achievements.length,
            photos: this.progressData.photos.length,
            sessions: this.progressData.sessions.length,
            weeklyReport: this.generateWeeklyReport()
        };
    }

    resetProgress() {
        if (confirm('Tem certeza que deseja resetar todo o progresso?')) {
            this.progressData = {
                moodHistory: [],
                achievements: [],
                streak: 0,
                sessions: [],
                photos: []
            };
            
            this.saveProgressData();
            
            if (window.pettyZen) {
                window.pettyZen.showMessage('Progress resetado com sucesso!', 'info');
            }
            
            window.location.reload();
        }
    }
}

// ===== CSS PARA CELEBRAÇÕES =====
const progressStyles = document.createElement('style');
progressStyles.textContent = `
    .achievement-celebration {
        backdrop-filter: blur(5px);
    }

    .celebration-content {
        background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
        border-radius: 24px;
        padding: 2rem;
        text-align: center;
        color: white;
        max-width: 350px;
        margin: 1rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }

    .achievement-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: bounce 1s infinite alternate;
    }

    .celebration-content h2 {
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
    }

    .celebration-content h3 {
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }

    .reward {
        background: rgba(255, 255, 255, 0.2);
        padding: 1rem;
        border-radius: 12px;
        margin: 1rem 0;
        backdrop-filter: blur(10px);
    }

    .celebration-close {
        background: white;
        color: #ff9800;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 25px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1rem;
        transition: transform 0.3s ease;
    }

    .celebration-close:hover {
        transform: scale(1.05);
    }

    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(720deg);
        }
    }

    .achievement-modal .modal-content {
        background: white;
        border-radius: 16px;
        padding: 1.5rem;
        max-width: 400px;
        margin: 1rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e0e0e0;
    }

    .modal-close {
        margin-left: auto;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
    }

    .earned-date {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #666;
        font-style: italic;
    }
`;

document.head.appendChild(progressStyles);

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.progressSystem = new ProgressSystem();
    }, 2000);
});

console.log('📊 Progress System carregado!');