// API Endpoint - Relative URL verwenden
const API_URL = '/api';

// Globale Variablen
let currentBattle = null;

// DOM Elemente
const adminButton = document.getElementById('adminButton');
const adminModal = document.getElementById('adminModal');
const closeButton = document.querySelector('.close-button');
const loginForm = document.getElementById('loginForm');
const adminPanel = document.getElementById('adminPanel');
const adminLogin = document.getElementById('adminLogin');
const addSongForm = document.getElementById('addSongForm');
const songsList = document.getElementById('songsList');
const countdown = document.getElementById('countdown');
const previousBattlesList = document.getElementById('previousBattlesList');

// Seite initialisieren
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentBattle();
    loadBattleHistory();
    setInterval(updateCountdown, 1000);
    updateCountdown();
});

// Admin Modal Funktionen
adminButton.addEventListener('click', () => {
    adminModal.style.display = 'block';
    checkAdminStatus();
});

closeButton.addEventListener('click', () => {
    adminModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === adminModal) {
        adminModal.style.display = 'none';
    }
});

// Admin Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    if (password === 'admin123') { // In einer echten Anwendung würde das sicherer sein
        localStorage.setItem('adminToken', Date.now().toString());
        showAdminPanel();
        loginForm.reset();
    } else {
        alert('Falsches Passwort!');
    }
});

// Admin Status prüfen
function checkAdminStatus() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

function showAdminPanel() {
    adminLogin.style.display = 'none';
    adminPanel.style.display = 'block';
    loadSongs();
}

function showLoginForm() {
    adminLogin.style.display = 'block';
    adminPanel.style.display = 'none';
}

// Songs laden und anzeigen
async function loadSongs() {
    try {
        const response = await fetch(`${API_URL}/songs`);
        const songs = await response.json();
        renderSongsList(songs);
    } catch (error) {
        console.error('Fehler beim Laden der Songs:', error);
    }
}

// Songs Liste rendern
function renderSongsList(songs) {
    songsList.innerHTML = '';
    songs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'song-list-item';
        songElement.innerHTML = `
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
                <div class="song-year">${song.year}</div>
                <div class="song-preview"></div>
            </div>
            <button class="delete-button" onclick="deleteSong(${song.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        // Preview erstellen
        if (song.previewUrl) {
            createPreview(song.previewUrl, songElement.querySelector('.song-preview'));
        }
        
        songsList.appendChild(songElement);
    });
}

// Song löschen
async function deleteSong(id) {
    if (!confirm('Möchtest du diesen Song wirklich löschen?')) return;

    try {
        const response = await fetch(`${API_URL}/songs/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadSongs();
            loadCurrentBattle();
        } else {
            const error = await response.json();
            alert(error.message);
        }
    } catch (error) {
        console.error('Fehler beim Löschen des Songs:', error);
    }
}

// Hilfsfunktion zum Formatieren der Zeit
function formatTime(time) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Countdown Timer aktualisieren
function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setHours(24, 0, 0, 0);
    const timeLeft = Math.floor((tomorrow - now) / 1000);
    countdown.textContent = formatTime(timeLeft);
}

// Aktuelles Battle laden
async function loadCurrentBattle() {
    try {
        const response = await fetch(`${API_URL}/current-battle`);
        const battle = await response.json();
        
        if (battle.error) {
            document.querySelector('.battle-container').innerHTML = 
                '<p style="text-align: center; padding: 20px;">Nicht genügend Songs verfügbar. Bitte füge mehr Songs im Admin-Bereich hinzu!</p>';
            return;
        }
        
        currentBattle = battle;
        updateBattleDisplay();
        
        // Preview URLs laden
        const song1Preview = document.querySelector('#song1 .song-preview');
        const song2Preview = document.querySelector('#song2 .song-preview');
        if (currentBattle.song1_previewUrl) {
            createPreview(currentBattle.song1_previewUrl, song1Preview);
        }
        if (currentBattle.song2_previewUrl) {
            createPreview(currentBattle.song2_previewUrl, song2Preview);
        }
    } catch (error) {
        console.error('Fehler beim Laden des Battles:', error);
        document.querySelector('.battle-container').innerHTML = 
            '<p style="text-align: center; padding: 20px;">Fehler beim Laden des Battles. Bitte versuche es später erneut.</p>';
    }
}

// Battle-Anzeige aktualisieren
function updateBattleDisplay() {
    if (!currentBattle) return;

    const song1Element = document.getElementById('song1');
    const song2Element = document.getElementById('song2');

    // Song 1 aktualisieren
    song1Element.querySelector('.song-title').textContent = currentBattle.song1_title;
    song1Element.querySelector('.song-artist').textContent = currentBattle.song1_artist;
    song1Element.querySelector('.song-year').textContent = currentBattle.song1_year;

    // Song 2 aktualisieren
    song2Element.querySelector('.song-title').textContent = currentBattle.song2_title;
    song2Element.querySelector('.song-artist').textContent = currentBattle.song2_artist;
    song2Element.querySelector('.song-year').textContent = currentBattle.song2_year;

    // Abstimmungsergebnisse aktualisieren
    const totalVotes = currentBattle.song1_votes + currentBattle.song2_votes;
    if (totalVotes > 0) {
        const song1Percentage = (currentBattle.song1_votes / totalVotes) * 100;
        const song2Percentage = (currentBattle.song2_votes / totalVotes) * 100;
        
        song1Element.querySelector('.vote-percentage').style.width = `${song1Percentage}%`;
        song2Element.querySelector('.vote-percentage').style.width = `${song2Percentage}%`;
    }
}

// Für einen Song abstimmen
async function voteSong(songNumber) {
    if (!currentBattle) return;

    try {
        const response = await fetch(`${API_URL}/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                battleId: currentBattle.id,
                songNumber
            })
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.error || 'Fehler beim Abstimmen');
            return;
        }

        // Battle neu laden um die aktualisierten Stimmen zu sehen
        await loadCurrentBattle();
    } catch (error) {
        console.error('Fehler beim Abstimmen:', error);
        alert('Fehler beim Abstimmen. Bitte versuche es später erneut.');
    }
}

// Battle-Historie laden
async function loadBattleHistory() {
    try {
        const response = await fetch(`${API_URL}/battle-history`);
        const battles = await response.json();
        displayPreviousBattles(battles);
    } catch (error) {
        console.error('Fehler beim Laden der Battle-Historie:', error);
    }
}

// Vorherige Battles anzeigen
function displayPreviousBattles(battles) {
    previousBattlesList.innerHTML = '';
    battles.forEach(battle => {
        const battleElement = document.createElement('div');
        battleElement.className = 'previous-battle-item';
        
        const winner = battle.song1_votes > battle.song2_votes ? 
            { title: battle.song1_title, votes: battle.song1_votes } :
            { title: battle.song2_title, votes: battle.song2_votes };
            
        const totalVotes = battle.song1_votes + battle.song2_votes;
        const winPercentage = ((winner.votes / totalVotes) * 100).toFixed(1);
        
        battleElement.innerHTML = `
            <div>
                ${battle.song1_title} vs ${battle.song2_title}
            </div>
            <div>
                Gewinner: <span class="winner">${winner.title}</span> (${winPercentage}%)
            </div>
        `;
        previousBattlesList.appendChild(battleElement);
    });
}

// Preview erstellen
function createPreview(url, container) {
    if (!url) return;
    
    // Spotify URL
    if (url.includes('spotify.com')) {
        const trackId = url.split('/').pop().split('?')[0];
        container.innerHTML = `
            <iframe src="https://open.spotify.com/embed/track/${trackId}" 
                width="100%" 
                height="80" 
                frameborder="0" 
                allowtransparency="true" 
                allow="encrypted-media">
            </iframe>
        `;
    }
    // SoundCloud URL
    else if (url.includes('soundcloud.com')) {
        container.innerHTML = `
            <iframe width="100%" 
                height="80" 
                scrolling="no" 
                frameborder="no" 
                src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false">
            </iframe>
        `;
    }
}

// Song-Karte aktualisieren
function updateSongCard(cardId, song) {
    const card = document.getElementById(cardId);
    if (!card) return;

    card.querySelector('.song-title').textContent = song.title;
    card.querySelector('.song-artist').textContent = song.artist;
    card.querySelector('.song-year').textContent = song.year;
    
    // Preview erstellen
    const previewContainer = card.querySelector('.song-preview');
    if (song.previewUrl) {
        createPreview(song.previewUrl, previewContainer);
    }
}

// Song-Formular absenden
document.getElementById('addSongForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('songTitle').value;
    const artist = document.getElementById('artist').value;
    const year = document.getElementById('year').value;
    const previewUrl = document.getElementById('previewUrl').value;
    
    try {
        const response = await fetch('/api/songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, artist, year, previewUrl })
        });
        
        if (!response.ok) throw new Error('Fehler beim Hinzufügen des Songs');
        
        // Formular zurücksetzen
        e.target.reset();
        document.getElementById('previewContainer').innerHTML = '';
        
        // Songs neu laden
        loadSongs();
        showNotification('Song erfolgreich hinzugefügt', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
});

// Preview URL Vorschau
document.getElementById('previewUrl').addEventListener('input', function(e) {
    const url = e.target.value;
    const container = document.getElementById('previewContainer');
    if (url) {
        createPreview(url, container);
    } else {
        container.innerHTML = '';
    }
});

// SoundCloud SDK laden
const script = document.createElement('script');
script.src = 'https://connect.soundcloud.com/sdk/sdk-3.3.2.js';
script.onload = () => {
    SC.initialize({
        client_id: 'YOUR_SOUNDCLOUD_CLIENT_ID' // Sie müssen einen SoundCloud Client ID erstellen
    });
};
document.body.appendChild(script); 