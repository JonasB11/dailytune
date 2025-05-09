document.addEventListener('DOMContentLoaded', async () => {
    await loadSongs();
    setupEventListeners();
});

function setupEventListeners() {
    const addSongForm = document.getElementById('addSongForm');
    addSongForm.addEventListener('submit', handleAddSong);

    const startNewBattle = document.getElementById('startNewBattle');
    startNewBattle.addEventListener('click', handleStartNewBattle);
}

async function handleAddSong(event) {
    event.preventDefault();
    
    const songData = {
        title: document.getElementById('songTitle').value,
        artist: document.getElementById('artist').value,
        year: document.getElementById('year').value,
        previewUrl: document.getElementById('previewUrl').value
    };

    try {
        const response = await fetch('/api/songs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(songData)
        });

        if (!response.ok) {
            throw new Error('Failed to add song');
        }

        // Reset form and reload songs
        event.target.reset();
        await loadSongs();
    } catch (error) {
        console.error('Error adding song:', error);
        alert('Failed to add song. Please try again.');
    }
}

async function deleteSong(songId) {
    if (!confirm('Are you sure you want to delete this song?')) {
        return;
    }

    try {
        const response = await fetch(`/api/songs/${songId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete song');
        }

        await loadSongs();
    } catch (error) {
        console.error('Error deleting song:', error);
        alert('Failed to delete song. Please try again.');
    }
}

async function loadSongs() {
    try {
        const response = await fetch('/api/songs');
        const songs = await response.json();
        
        const tableBody = document.getElementById('songTableBody');
        tableBody.innerHTML = '';

        songs.forEach(song => {
            const totalBattles = song.wins + song.losses;
            const winRate = totalBattles > 0 ? ((song.wins / totalBattles) * 100).toFixed(1) : '0.0';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${song.id}</td>
                <td>${song.title}</td>
                <td>${song.artist}</td>
                <td>${song.year}</td>
                <td>${song.total_votes || 0}</td>
                <td>${song.wins || 0}</td>
                <td>${song.losses || 0}</td>
                <td>${winRate}%</td>
                <td>
                    <button onclick="deleteSong(${song.id})" class="delete-button">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading songs:', error);
        alert('Failed to load songs. Please try again.');
    }
}

async function handleStartNewBattle() {
    try {
        const response = await fetch('/api/start-new-battle', {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to start new battle');
        }

        alert('New vote started successfully!');
        window.location.href = '/'; // Redirect to main page to see the new battle
    } catch (error) {
        console.error('Error starting new battle:', error);
        alert('Failed to start new vote. Please try again.');
    }
} 