// ===== PETTY ZEN - SERVICE WORKER =====

const CACHE_NAME = 'petty-zen-v1.0.0';
const DATA_CACHE_NAME = 'petty-zen-data-v1.0.0';

// Lista de arquivos para cache offline
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/audio-player.js', 
  '/js/chat.js',
  '/js/progress.js',
  '/manifest.json',
  
  // Fontes e bibliotecas externas
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js',

  // Ícones (serão gerados ou usaremos placeholders)
  '/icons/icon-72.png',
  '/icons/icon-96.png', 
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-192.png',
  '/icons/icon-384.png',
  '/icons/icon-512.png',

  // Áudios demo (URLs placeholder)
  '/assets/audio/chuva-suave.mp3',
  '/assets/audio/ondas-mar.mp3',
  '/assets/audio/floresta-calma.mp3',
  '/assets/audio/lareira.mp3',
  '/assets/audio/piano-zen.mp3',
  '/assets/audio/violao-suave.mp3'
];

// URLs que devem sempre vir da rede
const NETWORK_FIRST_URLS = [
  '/api/',
  '/analytics/',
  'googleapis.com',
  'google-analytics.com'
];

// ===== INSTALAÇÃO DO SERVICE WORKER =====
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Instalando Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [SW] Pré-cache de arquivos');
        
        // Cache arquivos essenciais primeiro
        const essentialFiles = [
          '/',
          '/index.html',
          '/css/styles.css',
          '/js/app.js',
          '/manifest.json'
        ];

        return cache.addAll(essentialFiles);
      })
      .then(() => {
        // Cache arquivos adicionais (não críticos)
        return caches.open(CACHE_NAME)
          .then((cache) => {
            // Tentar cachear arquivos não essenciais sem falhar
            FILES_TO_CACHE.slice(5).forEach(url => {
              cache.add(url).catch(err => {
                console.warn(`⚠️ [SW] Falha ao cachear: ${url}`, err);
              });
            });
          });
      })
      .then(() => {
        console.log('✅ [SW] Service Worker instalado com sucesso');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ [SW] Erro na instalação:', error);
      })
  );
});

// ===== ATIVAÇÃO DO SERVICE WORKER =====
self.addEventListener('activate', (event) => {
  console.log('🚀 [SW] Ativando Service Worker...');

  event.waitUntil(
    // Limpar caches antigos
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((thisCacheName) => {
            if (thisCacheName !== CACHE_NAME && thisCacheName !== DATA_CACHE_NAME) {
              console.log('🗑️ [SW] Removendo cache antigo:', thisCacheName);
              return caches.delete(thisCacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ [SW] Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// ===== INTERCEPTAÇÃO DE REQUESTS =====
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Estratégias diferentes baseadas no tipo de request
  if (isDataRequest(request)) {
    // Dados do usuário - Network First com fallback para cache
    event.respondWith(networkFirstStrategy(request));
  } else if (isAudioRequest(request)) {
    // Arquivos de áudio - Cache First (importantes para offline)
    event.respondWith(cacheFirstStrategy(request));
  } else if (isApiRequest(request)) {
    // APIs externas - Network First
    event.respondWith(networkFirstStrategy(request));
  } else {
    // Arquivos estáticos - Cache First com fallback para network
    event.respondWith(cacheFirstStrategy(request));
  }
});

// ===== ESTRATÉGIAS DE CACHE =====

// Cache First - Verifica cache primeiro, depois rede
function cacheFirstStrategy(request) {
  return caches.open(CACHE_NAME)
    .then((cache) => {
      return cache.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log(`📦 [SW] Servindo do cache: ${request.url}`);
            return cachedResponse;
          }

          // Não está no cache, buscar na rede
          return fetch(request)
            .then((networkResponse) => {
              console.log(`🌐 [SW] Buscando da rede: ${request.url}`);
              
              // Cache apenas responses válidos
              if (networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                cache.put(request, responseClone);
              }
              
              return networkResponse;
            })
            .catch(() => {
              console.log(`❌ [SW] Offline, sem cache para: ${request.url}`);
              
              // Fallback para páginas HTML
              if (request.headers.get('accept').includes('text/html')) {
                return cache.match('/');
              }
              
              // Fallback para imagens
              if (request.headers.get('accept').includes('image/')) {
                return new Response(getDefaultImageSVG(), {
                  headers: { 'Content-Type': 'image/svg+xml' }
                });
              }

              return new Response('Offline', { status: 503 });
            });
        });
    });
}

// Network First - Tenta rede primeiro, fallback para cache
function networkFirstStrategy(request) {
  return caches.open(DATA_CACHE_NAME)
    .then((cache) => {
      return fetch(request)
        .then((networkResponse) => {
          console.log(`🌐 [SW] Dados da rede: ${request.url}`);
          
          // Cache apenas se for uma resposta válida
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            cache.put(request, responseClone);
          }
          
          return networkResponse;
        })
        .catch(() => {
          console.log(`📦 [SW] Fallback para cache: ${request.url}`);
          
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Se não tem cache, retornar dados offline padrão
              return new Response(JSON.stringify({
                error: 'offline',
                message: 'Dados não disponíveis offline'
              }), {
                headers: { 'Content-Type': 'application/json' },
                status: 503
              });
            });
        });
    });
}

// ===== HELPERS PARA IDENTIFICAR TIPOS DE REQUEST =====

function isDataRequest(request) {
  return request.url.includes('/api/') || 
         request.url.includes('localStorage') ||
         request.url.includes('indexedDB');
}

function isAudioRequest(request) {
  return request.url.includes('/assets/audio/') ||
         request.headers.get('accept')?.includes('audio/') ||
         request.url.match(/\.(mp3|wav|ogg|m4a)$/);
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return NETWORK_FIRST_URLS.some(pattern => url.hostname.includes(pattern));
}

// ===== SINCRONIZAÇÃO EM BACKGROUND =====
self.addEventListener('sync', (event) => {
  console.log('🔄 [SW] Background Sync:', event.tag);

  if (event.tag === 'sync-mood-data') {
    event.waitUntil(syncMoodData());
  } else if (event.tag === 'sync-progress-data') {
    event.waitUntil(syncProgressData());
  } else if (event.tag === 'sync-playback-stats') {
    event.waitUntil(syncPlaybackStats());
  }
});

// Sincronizar dados de humor
async function syncMoodData() {
  try {
    console.log('📊 [SW] Sincronizando dados de humor...');
    
    // Em um app real, você enviaria para um servidor
    const moodData = await getStoredData('pettyzen_progress');
    
    if (moodData) {
      // Simular envio para servidor
      console.log('✅ [SW] Dados de humor sincronizados');
      
      // Enviar notificação de sucesso para o cliente
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_SUCCESS',
            data: 'Dados sincronizados com sucesso!'
          });
        });
      });
    }
  } catch (error) {
    console.error('❌ [SW] Erro na sincronização de humor:', error);
  }
}

// Sincronizar dados de progresso
async function syncProgressData() {
  try {
    console.log('📈 [SW] Sincronizando progresso...');
    
    const progressData = await getStoredData('pettyzen_sessions');
    
    if (progressData) {
      console.log('✅ [SW] Progresso sincronizado');
    }
  } catch (error) {
    console.error('❌ [SW] Erro na sincronização de progresso:', error);
  }
}

// Sincronizar estatísticas de reprodução
async function syncPlaybackStats() {
  try {
    console.log('🎵 [SW] Sincronizando estatísticas...');
    
    const playbackData = await getStoredData('pettyzen_playback');
    
    if (playbackData) {
      console.log('✅ [SW] Estatísticas sincronizadas');
    }
  } catch (error) {
    console.error('❌ [SW] Erro na sincronização de estatísticas:', error);
  }
}

// ===== NOTIFICAÇÕES PUSH =====
self.addEventListener('push', (event) => {
  console.log('🔔 [SW] Push recebido:', event);

  let notificationData = {
    title: 'Petty Zen',
    body: 'Hora da sessão relaxante!',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: 'petty-reminder',
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: 'open-app',
        title: 'Abrir App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'start-session',
        title: 'Iniciar Sessão',
        icon: '/icons/action-play.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Se há dados no push, usar eles
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (e) {
      console.warn('⚠️ [SW] Erro ao parsear dados do push:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 [SW] Notificação clicada:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'start-session') {
    // Abrir app e iniciar sessão
    event.waitUntil(
      clients.openWindow('/?action=emergency')
    );
  } else if (action === 'open-app' || !action) {
    // Abrir app normalmente
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Se o app já está aberto, focar
          for (let client of clientList) {
            if (client.url === data.url || client.url.includes('pettys-zen')) {
              return client.focus();
            }
          }
          
          // Se não está aberto, abrir nova janela
          return clients.openWindow(data.url || '/');
        })
    );
  }
});

// ===== MENSAGENS DO CLIENTE =====
self.addEventListener('message', (event) => {
  console.log('💬 [SW] Mensagem recebida:', event.data);

  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_AUDIO':
      cacheAudioFile(data.url, data.name);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;

    case 'SCHEDULE_REMINDER':
      scheduleReminder(data);
      break;
  }
});

// ===== FUNÇÕES UTILITÁRIAS =====

// Obter dados do localStorage (simulação)
async function getStoredData(key) {
  return new Promise((resolve) => {
    // Em um SW real, você usaria IndexedDB
    // Por ora, simular
    resolve({ key, synced: true });
  });
}

// Cache manual de arquivo de áudio
async function cacheAudioFile(url, name) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(url);
    
    if (response.status === 200) {
      await cache.put(url, response);
      console.log(`🎵 [SW] Áudio cacheado: ${name}`);
      
      // Notificar cliente
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'AUDIO_CACHED',
            name: name,
            url: url
          });
        });
      });
    }
  } catch (error) {
    console.error('❌ [SW] Erro ao cachear áudio:', error);
  }
}

// Limpar todos os caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    console.log('🗑️ [SW] Todos os caches limpos');
  } catch (error) {
    console.error('❌ [SW] Erro ao limpar caches:', error);
  }
}

// Calcular tamanho do cache
async function getCacheSize() {
  try {
    let totalSize = 0;
    const cacheNames = await caches.keys();
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('❌ [SW] Erro ao calcular tamanho:', error);
    return 0;
  }
}

// Agendar lembrete
async function scheduleReminder(data) {
  console.log('⏰ [SW] Agendando lembrete:', data);
  
  // Em um app real, você usaria Web Push API
  // Por ora, simular com setTimeout
  setTimeout(() => {
    self.registration.showNotification(
      `Hora do ${data.petName}! 🐾`,
      {
        body: `Que tal uma sessão relaxante com ${data.audioName}?`,
        icon: '/icons/icon-192.png',
        tag: 'scheduled-reminder',
        actions: [
          { action: 'start-session', title: 'Iniciar Agora' },
          { action: 'snooze', title: 'Lembrar em 10min' }
        ]
      }
    );
  }, data.delay || 60000);
}

// Imagem SVG padrão para fallback
function getDefaultImageSVG() {
  return `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f0f0f0"/>
      <circle cx="100" cy="80" r="30" fill="#ff9800"/>
      <circle cx="85" cy="75" r="5" fill="white"/>
      <circle cx="115" cy="75" r="5" fill="white"/>
      <path d="M 80 100 Q 100 120 120 100" stroke="#ff9800" stroke-width="3" fill="none"/>
      <text x="100" y="150" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
        Offline
      </text>
    </svg>
  `;
}

// ===== ATUALIZAÇÃO DO SERVICE WORKER =====
self.addEventListener('install', (event) => {
  // Forçar ativação imediata da nova versão
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Assumir controle de todos os clientes imediatamente
  event.waitUntil(self.clients.claim());
});

console.log('🚀 Petty Zen Service Worker carregado!');