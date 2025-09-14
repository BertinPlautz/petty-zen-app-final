// ===== PETTY ZEN - ASSISTENTE VIRTUAL PETTY =====

class PettyAssistant {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-message');
        this.questionChips = document.querySelectorAll('.question-chip');
        
        this.conversationHistory = [];
        this.botPersonality = 'maternal'; // maternal, friendly, professional
        this.userContext = {};
        
        // Base de conhecimento sobre cães e ansiedade
        this.knowledgeBase = {
            breeds: {
                'labrador': { energy: 'high', anxiety_prone: 'medium', best_sounds: ['ondas-mar', 'floresta-calma'] },
                'golden': { energy: 'high', anxiety_prone: 'low', best_sounds: ['piano-zen', 'chuva-suave'] },
                'bulldog': { energy: 'low', anxiety_prone: 'medium', best_sounds: ['lareira', 'ondas-mar'] },
                'poodle': { energy: 'medium', anxiety_prone: 'high', best_sounds: ['chuva-suave', 'piano-zen'] },
                'husky': { energy: 'very_high', anxiety_prone: 'high', best_sounds: ['floresta-calma', 'ondas-mar'] },
                'yorkshire': { energy: 'high', anxiety_prone: 'very_high', best_sounds: ['piano-zen', 'violao-suave'] }
            },
            symptoms: {
                'latindo': ['chuva-suave', 'piano-zen'],
                'inquieto': ['ondas-mar', 'floresta-calma'],
                'destruindo': ['lareira', 'chuva-suave'],
                'tremendo': ['piano-zen', 'violao-suave'],
                'ofegante': ['ondas-mar', 'chuva-suave'],
                'escondido': ['lareira', 'piano-zen']
            },
            situations: {
                'chuva': ['chuva-suave', 'lareira'],
                'fogos': ['piano-zen', 'ondas-mar'],
                'sozinho': ['lareira', 'piano-zen'],
                'visitas': ['floresta-calma', 'violao-suave'],
                'veterinario': ['ondas-mar', 'piano-zen'],
                'mudanca': ['chuva-suave', 'lareira']
            }
        };

        // Respostas pré-definidas por categoria
        this.responses = {
            greeting: [
                "Oi, querida! 🐾 Como posso ajudar você e seu cãozinho hoje?",
                "Olá! 💕 Sou a Petty, especialista em bem-estar canino. No que posso te ajudar?",
                "Que bom te ver aqui! 🥰 Vamos cuidar juntas do seu bebê de quatro patas?"
            ],
            audio_recommendation: [
                "Para essa situação, recomendo {audio}. É perfeito para {reason}! 🎵",
                "Já experimentou {audio}? Funciona muito bem para {reason}. ✨",
                "Minha sugestão é {audio}. Vai ajudar bastante com {reason}! 💫"
            ],
            encouragement: [
                "Você está fazendo um trabalho maravilhoso cuidando dele! 💕",
                "Que mamãe dedicada você é! Ele é muito sortudo de ter você. 🥰",
                "Continue assim! O amor e cuidado que você dá fazem toda diferença. ✨",
                "Você está no caminho certo! Paciência e carinho são a chave. 💖"
            ],
            progress: [
                "Que progresso incrível! 📈 Vocês estão indo muito bem juntas!",
                "Estou muito orgulhosa de vocês duas! 🎉 Continue assim!",
                "Os resultados mostram que seu dedicação está dando frutos! 🌟"
            ],
            tips: [
                "💡 Dica: Mantenha o volume sempre baixo, cães têm audição sensível!",
                "💡 Lembre-se: Consistência é fundamental. Use diariamente para melhores resultados!",
                "💡 Importante: Combine os áudios com carinho físico para potencializar o efeito!",
                "💡 Observe: Cada cão é único. Note qual áudio seu pet prefere!"
            ]
        };

        this.init();
    }

    init() {
        console.log('🤖 Assistente Petty inicializando...');
        
        this.setupEventListeners();
        this.loadConversationHistory();
        this.updateUserContext();
        
        // Mensagem inicial personalizada
        setTimeout(() => {
            this.sendInitialMessage();
        }, 1000);

        console.log('✅ Assistente Petty inicializado');
    }

    setupEventListeners() {
        // Enviar mensagem
        if (this.sendButton) {
            this.sendButton.addEventListener('click', () => this.handleSendMessage());
        }

        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSendMessage();
                }
            });
        }

        // Quick questions
        this.questionChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const question = e.target.textContent;
                this.handleQuickQuestion(question);
            });
        });

        console.log('🔗 Chat event listeners configurados');
    }

    // ===== GERENCIAMENTO DE CONTEXTO =====

    updateUserContext() {
        if (window.pettyZen?.currentUser && window.pettyZen?.currentPet) {
            this.userContext = {
                userName: window.pettyZen.currentUser.name,
                petName: window.pettyZen.currentPet.name,
                petBreed: window.pettyZen.currentPet.breed,
                petAge: window.pettyZen.currentPet.age,
                anxietyLevel: window.pettyZen.currentPet.anxietyLevel,
                moodHistory: window.pettyZen.moodHistory || [],
                streak: window.pettyZen.streak || 0
            };
        }
        
        console.log('👤 Contexto do usuário atualizado:', this.userContext);
    }

    // ===== PROCESSAMENTO DE MENSAGENS =====

    handleSendMessage() {
        if (!this.chatInput) return;

        const message = this.chatInput.value.trim();
        if (!message) return;

        // Mostrar mensagem do usuário
        this.addUserMessage(message);

        // Limpar input
        this.chatInput.value = '';

        // Processar resposta
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addBotMessage(response);
        }, 800 + Math.random() * 1200); // Simular tempo de "pensamento"

        // Salvar na conversa
        this.conversationHistory.push({
            type: 'user',
            message: message,
            timestamp: new Date().toISOString()
        });

        this.saveConversationHistory();
    }

    handleQuickQuestion(question) {
        // Simular clique do usuário
        this.addUserMessage(question);

        // Processar resposta
        setTimeout(() => {
            const response = this.generateResponse(question);
            this.addBotMessage(response);
        }, 600);

        // Salvar na conversa
        this.conversationHistory.push({
            type: 'user',
            message: question,
            timestamp: new Date().toISOString()
        });
    }

    generateResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Identificar intenção da mensagem
        const intent = this.identifyIntent(message);
        
        // Gerar resposta baseada na intenção
        let response = this.generateResponseByIntent(intent, message);
        
        // Personalizar com contexto do usuário
        response = this.personalizeResponse(response);
        
        // Salvar resposta na conversa
        this.conversationHistory.push({
            type: 'bot',
            message: response,
            timestamp: new Date().toISOString()
        });

        this.saveConversationHistory();
        
        return response;
    }

    identifyIntent(message) {
        // Palavras-chave para identificar intenções
        const intents = {
            audio_recommendation: ['qual áudio', 'que som', 'recomenda', 'melhor áudio', 'usar hoje', 'tocar'],
            anxiety_help: ['ansioso', 'nervoso', 'latindo', 'agitado', 'estressado', 'inquieto'],
            progress_check: ['funcionando', 'melhorando', 'progresso', 'resultado', 'mudança'],
            breed_specific: ['raça', this.userContext.petBreed?.toLowerCase()],
            weather_related: ['chuva', 'trovão', 'tempestade', 'clima', 'tempo'],
            situation_help: ['sozinho', 'trabalho', 'sair', 'visita', 'veterinário', 'mudança'],
            encouragement: ['difícil', 'não está funcionando', 'desanimada', 'cansada'],
            greeting: ['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'help', 'ajuda'],
            goodbye: ['tchau', 'obrigada', 'valeu', 'até mais']
        };

        // Encontrar a intenção mais provável
        let bestIntent = 'general';
        let maxMatches = 0;

        for (const [intent, keywords] of Object.entries(intents)) {
            let matches = 0;
            keywords.forEach(keyword => {
                if (message.includes(keyword)) {
                    matches++;
                }
            });

            if (matches > maxMatches) {
                maxMatches = matches;
                bestIntent = intent;
            }
        }

        console.log(`🎯 Intenção identificada: ${bestIntent} (${maxMatches} matches)`);
        return bestIntent;
    }

    generateResponseByIntent(intent, message) {
        switch (intent) {
            case 'greeting':
                return this.getGreetingResponse();
                
            case 'audio_recommendation':
                return this.getAudioRecommendation(message);
                
            case 'anxiety_help':
                return this.getAnxietyHelp(message);
                
            case 'progress_check':
                return this.getProgressResponse();
                
            case 'weather_related':
                return this.getWeatherResponse(message);
                
            case 'situation_help':
                return this.getSituationHelp(message);
                
            case 'encouragement':
                return this.getEncouragementResponse();
                
            case 'breed_specific':
                return this.getBreedSpecificAdvice();
                
            case 'goodbye':
                return this.getGoodbyeResponse();
                
            default:
                return this.getGeneralResponse(message);
        }
    }

    // ===== TIPOS DE RESPOSTA =====

    getGreetingResponse() {
        const greetings = this.responses.greeting;
        return this.getRandomResponse(greetings);
    }

    getAudioRecommendation(message) {
        let recommendedAudio = 'chuva-suave';
        let reason = 'relaxamento geral';

        // Analisar contexto da mensagem
        if (message.includes('latindo') || message.includes('barulho')) {
            recommendedAudio = 'chuva-suave';
            reason = 'mascarar ruídos externos';
        } else if (message.includes('noite') || message.includes('dormir')) {
            recommendedAudio = 'ondas-mar';
            reason = 'induzir o sono';
        } else if (message.includes('ansioso') || message.includes('nervoso')) {
            recommendedAudio = 'piano-zen';
            reason = 'acalmar a ansiedade';
        } else if (message.includes('chuva') || message.includes('tempestade')) {
            recommendedAudio = 'lareira';
            reason = 'conforto em dias chuvosos';
        } else {
            // Usar recomendação baseada na raça
            const breedInfo = this.knowledgeBase.breeds[this.userContext.petBreed?.toLowerCase()];
            if (breedInfo && breedInfo.best_sounds.length > 0) {
                recommendedAudio = breedInfo.best_sounds[0];
                reason = `ideal para a raça ${this.userContext.petBreed}`;
            }
        }

        const audioTitle = this.getAudioTitle(recommendedAudio);
        const templates = this.responses.audio_recommendation;
        let response = this.getRandomResponse(templates);
        
        return response
            .replace('{audio}', audioTitle)
            .replace('{reason}', reason);
    }

    getAnxietyHelp(message) {
        const symptoms = [];
        
        // Identificar sintomas na mensagem
        for (const [symptom, audios] of Object.entries(this.knowledgeBase.symptoms)) {
            if (message.includes(symptom)) {
                symptoms.push({ symptom, recommendedAudio: audios[0] });
            }
        }

        if (symptoms.length > 0) {
            const mainSymptom = symptoms[0];
            const audioTitle = this.getAudioTitle(mainSymptom.recommendedAudio);
            
            return `Para ${mainSymptom.symptom}, recomendo ${audioTitle}. 🎵\n\nTambém é importante:\n• Manter ambiente calmo\n• Evitar reforçar o comportamento ansioso\n• Usar carinho para tranquilizar\n\nSe persistir, consulte um veterinário! 💕`;
        }

        return `Entendo sua preocupação com a ansiedade do ${this.userContext.petName}. 😔\n\nVamos começar com "Chuva Suave" - é muito eficaz para ansiedade geral! 🎵\n\n💡 Dicas importantes:\n• Use volume baixo\n• Mantenha rotina consistente\n• Combine com carinho físico\n• Observe qual áudio ele prefere\n\nVocê está fazendo a coisa certa procurando ajuda! 💖`;
    }

    getProgressResponse() {
        const moodHistory = this.userContext.moodHistory || [];
        const streak = this.userContext.streak || 0;
        
        if (streak >= 7) {
            return `Que progresso incrível! 🎉 Vocês já têm ${streak} dias consecutivos!\n\nPelo que vejo, o ${this.userContext.petName} está respondendo muito bem. Os áudios relaxantes estão fazendo efeito! 📈\n\n${this.getRandomResponse(this.responses.encouragement)}\n\nContinue assim - vocês estão no caminho certo! ✨`;
        } else if (streak >= 3) {
            return `Ótimo! ${streak} dias já é um bom começo! 💪\n\nO ${this.userContext.petName} está se adaptando aos áudios. É normal levar alguns dias para ver mudanças significativas.\n\n${this.getRandomResponse(this.responses.tips)}\n\nPersistência é a chave! 🔑`;
        } else {
            return `Ainda é cedo para ver grandes mudanças, mas você está no caminho certo! 🌱\n\nOs primeiros dias são de adaptação. O ${this.userContext.petName} está aprendendo a associar os sons com relaxamento.\n\nContinue usando diariamente e logo verá os resultados! 💕`;
        }
    }

    getWeatherResponse(message) {
        if (message.includes('chuva') || message.includes('tempestade')) {
            return `Dias chuvosos podem deixar alguns pets ansiosos! 🌧️\n\nRecomendo:\n🎵 "Lareira Acolhedora" - cria sensação de aconchego\n🎵 "Piano Zen" - se ele estiver muito agitado\n\n💡 Dica extra: Feche cortinas para abafar o som da chuva e mantenha uma luz suave acesa. O ${this.userContext.petName} vai se sentir mais seguro! 🏠✨`;
        }
        
        return `O clima pode afetar o humor dos pets! 🌤️\n\nEm dias diferentes, experimente:\n• ☀️ Manhãs ensolaradas: "Floresta Calma"\n• 🌧️ Dias chuvosos: "Lareira Acolhedora"\n• 🌙 Noites: "Ondas do Mar"\n\nO ${this.userContext.petName} vai adorar essa rotina! 💕`;
    }

    getSituationHelp(message) {
        let situation = 'geral';
        let recommendedAudios = ['chuva-suave'];

        // Identificar situação específica
        for (const [sit, audios] of Object.entries(this.knowledgeBase.situations)) {
            if (message.includes(sit)) {
                situation = sit;
                recommendedAudios = audios;
                break;
            }
        }

        const audioTitle = this.getAudioTitle(recommendedAudios[0]);
        
        const situationAdvice = {
            'sozinho': `Quando você sair, deixe "${audioTitle}" tocando para o ${this.userContext.petName}! 🏠\n\n💡 Dicas para quando ele fica sozinho:\n• Comece com saídas curtas\n• Deixe brinquedos\n• Volume baixinho\n• Timer de 2-3 horas`,
            'fogos': `Fogos de artifício são muito estressantes! 😰\n\nUse "${audioTitle}" e:\n• Volume um pouco mais alto\n• Feche janelas e cortinas\n• Fique perto dele\n• Mantenha calma (eles sentem nosso nervosismo!)`,
            'visitas': `Visitas podem deixar alguns pets agitados! 👥\n\n"${audioTitle}" vai ajudar! Também:\n• Apresente as visitas gradualmente\n• Mantenha rotina normal\n• Recompense comportamento calmo`,
            'mudanca': `Mudanças são estressantes para pets! 📦\n\n"${audioTitle}" vai dar segurança. Durante a mudança:\n• Mantenha objetos familiares por perto\n• Use os áudios na casa nova desde o primeiro dia\n• Seja paciente - adaptação leva tempo`
        };

        return situationAdvice[situation] || `Para essa situação, "${audioTitle}" é uma ótima escolha! 🎵\n\n${this.getRandomResponse(this.responses.encouragement)}`;
    }

    getEncouragementResponse() {
        return `Ei, eu sei que às vezes pode ser desafiador! 🤗\n\nMas saiba que você está fazendo TUDO certo! O ${this.userContext.petName} sente seu amor e dedicação. ❤️\n\n${this.getRandomResponse(this.responses.encouragement)}\n\nLembre-se: cada pet tem seu tempo. Alguns respondem em dias, outros em semanas. O importante é não desistir! 💪\n\nEu estou aqui sempre que precisar! 🤖💕`;
    }

    getBreedSpecificAdvice() {
        const breed = this.userContext.petBreed?.toLowerCase();
        const breedInfo = this.knowledgeBase.breeds[breed];
        
        if (breedInfo) {
            const audioTitle = this.getAudioTitle(breedInfo.best_sounds[0]);
            
            const advice = {
                'labrador': `Labradores são cheios de energia! 🦮 "${audioTitle}" é perfeito para acalmá-los após atividades.`,
                'golden': `Golden Retrievers são naturalmente calmos! 🐕 "${audioTitle}" potencializa essa tranquilidade natural.`,
                'poodle': `Poodles podem ser ansiosos por serem muito inteligentes! 🐩 "${audioTitle}" ajuda a relaxar a mente ativa.`,
                'husky': `Huskies têm muita energia! 🐺 "${audioTitle}" é essencial após exercícios para acalmá-los.`,
                'yorkshire': `Yorkshires são sensíveis a ruídos! 🐕 "${audioTitle}" mascara sons que os irritam.`
            };

            const breedAdvice = advice[breed] || `Para a raça ${this.userContext.petBreed}, "${audioTitle}" é uma excelente escolha!`;
            
            return `${breedAdvice}\n\n💡 Específico para ${this.userContext.petBreed}s:\n• ${breedInfo.energy === 'high' ? 'Use após exercícios' : 'Pode usar a qualquer hora'}\n• ${breedInfo.anxiety_prone === 'high' ? 'Use diariamente para prevenir ansiedade' : 'Use conforme necessário'}\n\nCada ${this.userContext.petBreed} é único, mas essa é a base! 🎯`;
        }

        return `Cada raça tem suas particularidades! 🐕\n\nO ${this.userContext.petName} vai te mostrar qual áudio prefere. Observe as reações dele e ajuste conforme necessário! 💡`;
    }

    getGoodbyeResponse() {
        const goodbyes = [
            `Foi um prazer ajudar você e o ${this.userContext.petName}! 💕 Volte sempre!`,
            `Até logo! Cuidem-se bem! 🐾 Estou sempre aqui quando precisarem!`,
            `Tchau, querida! ${this.userContext.petName} é muito sortudo de ter você! 🥰`,
            `Obrigada pela conversa! Boa sorte com o tratamento! ✨`
        ];

        return this.getRandomResponse(goodbyes);
    }

    getGeneralResponse(message) {
        // Resposta geral para quando não identifica a intenção
        const generalResponses = [
            `Interessante! Conte-me mais sobre o ${this.userContext.petName}. Como ele tem se comportado? 🤔`,
            `Entendi! Para te ajudar melhor, preciso saber: qual é a principal preocupação com o ${this.userContext.petName}? 💭`,
            `Hmm, vamos focar no que mais te preocupa no ${this.userContext.petName}. Ele está ansioso, agitado, ou tem outro comportamento? 🐾`,
            `Me fale mais! O que exatamente o ${this.userContext.petName} está fazendo que te deixa preocupada? 💬`
        ];

        return this.getRandomResponse(generalResponses);
    }

    // ===== PERSONALIZAÇÃO =====

    personalizeResponse(response) {
        // Substituir placeholders com informações do usuário
        response = response.replace(/\{userName\}/g, this.userContext.userName || 'querida');
        response = response.replace(/\{petName\}/g, this.userContext.petName || 'seu pet');
        response = response.replace(/\{petBreed\}/g, this.userContext.petBreed || 'cãozinho');
        
        return response;
    }

    sendInitialMessage() {
        let initialMessage;
        
        if (this.userContext.userName && this.userContext.petName) {
            const hour = new Date().getHours();
            let greeting = 'Oi';
            
            if (hour < 12) greeting = 'Bom dia';
            else if (hour < 18) greeting = 'Boa tarde';
            else greeting = 'Boa noite';
            
            initialMessage = `${greeting}, ${this.userContext.userName}! 🌟\n\nSou a Petty, sua assistente especialista em bem-estar canino! Estou aqui para ajudar você e o ${this.userContext.petName} na jornada zen! 🐾💕\n\nComo posso ajudar hoje? Está com alguma dúvida sobre os áudios ou o comportamento do ${this.userContext.petName}? 🤗`;
        } else {
            initialMessage = this.getRandomResponse(this.responses.greeting);
        }

        this.addBotMessage(initialMessage);
    }

    // ===== INTERFACE DO CHAT =====

    addUserMessage(message) {
        const messageElement = this.createMessageElement('user', message);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        // Mostrar indicador de digitação
        this.showTypingIndicator();

        setTimeout(() => {
            this.hideTypingIndicator();
            const messageElement = this.createMessageElement('bot', message);
            this.chatMessages.appendChild(messageElement);
            this.scrollToBottom();
        }, 800 + Math.random() * 1000);
    }

    createMessageElement(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Converter quebras de linha para <br>
        contentDiv.innerHTML = content.replace(/\n/g, '<br>');

        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeSpan);

        return messageDiv;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    // ===== UTILITÁRIOS =====

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    getAudioTitle(audioId) {
        const audioTitles = {
            'chuva-suave': 'Chuva Suave',
            'ondas-mar': 'Ondas do Mar',
            'floresta-calma': 'Floresta Calma',
            'lareira': 'Lareira Acolhedora',
            'piano-zen': 'Piano Zen',
            'violao-suave': 'Violão Suave'
        };

        return audioTitles[audioId] || 'Áudio Relaxante';
    }

    // ===== PERSISTÊNCIA =====

    saveConversationHistory() {
        try {
            // Manter apenas as últimas 50 mensagens
            const recentHistory = this.conversationHistory.slice(-50);
            localStorage.setItem('pettyzen_chat_history', JSON.stringify(recentHistory));
        } catch (error) {
            console.error('❌ Erro ao salvar histórico do chat:', error);
        }
    }

    loadConversationHistory() {
        try {
            const history = localStorage.getItem('pettyzen_chat_history');
            if (history) {
                this.conversationHistory = JSON.parse(history);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar histórico do chat:', error);
            this.conversationHistory = [];
        }
    }

    // ===== MÉTODOS PÚBLICOS =====

    clearChat() {
        this.chatMessages.innerHTML = '';
        this.conversationHistory = [];
        this.saveConversationHistory();
        this.sendInitialMessage();
    }

    exportConversation() {
        const conversation = this.conversationHistory.map(msg => 
            `${msg.type === 'user' ? 'Você' : 'Petty'}: ${msg.message}`
        ).join('\n\n');

        return conversation;
    }

    getConversationStats() {
        const userMessages = this.conversationHistory.filter(msg => msg.type === 'user').length;
        const botMessages = this.conversationHistory.filter(msg => msg.type === 'bot').length;

        return {
            totalMessages: this.conversationHistory.length,
            userMessages,
            botMessages,
            lastInteraction: this.conversationHistory.length > 0 
                ? new Date(this.conversationHistory[this.conversationHistory.length - 1].timestamp)
                : null
        };
    }
}

// ===== CSS PARA INDICADOR DE DIGITAÇÃO =====
const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .typing-indicator .message-content {
        padding: 0.75rem 1rem !important;
    }

    .typing-dots {
        display: flex;
        gap: 4px;
        align-items: center;
    }

    .typing-dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #999;
        animation: typingBounce 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) {
        animation-delay: -0.32s;
    }

    .typing-dots span:nth-child(2) {
        animation-delay: -0.16s;
    }

    @keyframes typingBounce {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;

document.head.appendChild(chatStyles);

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.pettyAssistant = new PettyAssistant();
    }, 1500);
});

console.log('🤖 Assistente Petty carregado!');