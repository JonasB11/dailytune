const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Hilfsfunktionen für die Datenverwaltung
function readData() {
    try {
        const data = fs.readFileSync('data.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { songs: [], battles: [], votes: [] };
    }
}

function writeData(data) {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

// API Routen

// Songs mit Statistiken abrufen
app.get('/api/songs', (req, res) => {
    const data = readData();
    const songsWithStats = data.songs.map(song => {
        const wins = data.battles.filter(battle => 
            (battle.song1_id === song.id && battle.song1_votes > battle.song2_votes) ||
            (battle.song2_id === song.id && battle.song2_votes > battle.song1_votes)
        ).length;
        
        const losses = data.battles.filter(battle => 
            (battle.song1_id === song.id && battle.song1_votes < battle.song2_votes) ||
            (battle.song2_id === song.id && battle.song2_votes < battle.song1_votes)
        ).length;
        
        const totalVotes = data.battles.reduce((sum, battle) => {
            if (battle.song1_id === song.id) return sum + battle.song1_votes;
            if (battle.song2_id === song.id) return sum + battle.song2_votes;
            return sum;
        }, 0);

        return {
            ...song,
            wins,
            losses,
            total_votes: totalVotes
        };
    });
    
    res.json(songsWithStats);
});

// Song hinzufügen
app.post('/api/songs', (req, res) => {
    const { title, artist, year, previewUrl } = req.body;
    if (!title || !artist || !year || !previewUrl) {
        res.status(400).json({ error: 'Titel, Artist, Jahr und Preview-URL sind erforderlich' });
        return;
    }
    
    const data = readData();
    const newSong = {
        id: Date.now(),
        title,
        artist,
        year: parseInt(year),
        previewUrl,
        created_at: new Date().toISOString()
    };
    
    data.songs.push(newSong);
    writeData(data);
    res.json(newSong);
});

// Song löschen
app.delete('/api/songs/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const data = readData();
    
    data.songs = data.songs.filter(song => song.id !== id);
    writeData(data);
    
    res.json({ message: 'Song erfolgreich gelöscht' });
});

// Aktuelles Battle abrufen
app.get('/api/current-battle', (req, res) => {
    try {
        const data = readData();
        const today = new Date().toISOString().split('T')[0];
        
        // Prüfen ob es bereits ein Battle für heute gibt
        const currentBattle = data.battles.find(battle => battle.battle_date === today);
        
        if (currentBattle) {
            const song1 = data.songs.find(song => song.id === currentBattle.song1_id);
            const song2 = data.songs.find(song => song.id === currentBattle.song2_id);
            
            // Prüfen ob beide Songs existieren
            if (!song1 || !song2) {
                // Songs wurden gelöscht, altes Battle entfernen
                data.battles = data.battles.filter(b => b.id !== currentBattle.id);
                data.votes = data.votes.filter(v => v.battle_id !== currentBattle.id);
                writeData(data);
                createNewBattle(res);
                return;
            }
            
            res.json({
                ...currentBattle,
                song1_title: song1.title,
                song1_artist: song1.artist,
                song1_year: song1.year,
                song1_previewUrl: song1.previewUrl,
                song2_title: song2.title,
                song2_artist: song2.artist,
                song2_year: song2.year,
                song2_previewUrl: song2.previewUrl
            });
        } else {
            createNewBattle(res);
        }
    } catch (error) {
        console.error('Fehler beim Abrufen des Battles:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen des Battles' });
    }
});

// Neues Battle erstellen
function createNewBattle(res) {
    const data = readData();
    
    if (data.songs.length < 2) {
        res.json({ error: 'Nicht genügend Songs verfügbar' });
        return;
    }
    
    try {
        // Zwei zufällige Songs auswählen
        const availableSongs = [...data.songs]; // Kopie des Arrays erstellen
        const song1Index = Math.floor(Math.random() * availableSongs.length);
        const song1 = availableSongs.splice(song1Index, 1)[0];
        const song2Index = Math.floor(Math.random() * availableSongs.length);
        const song2 = availableSongs[song2Index];
        
        const newBattle = {
            id: Date.now(),
            song1_id: song1.id,
            song2_id: song2.id,
            song1_votes: 0,
            song2_votes: 0,
            battle_date: new Date().toISOString().split('T')[0]
        };
        
        // Altes Battle für heute löschen falls vorhanden
        const today = new Date().toISOString().split('T')[0];
        data.battles = data.battles.filter(battle => battle.battle_date !== today);
        data.votes = data.votes.filter(vote => vote.vote_date !== today);
        
        // Neues Battle hinzufügen
        data.battles.push(newBattle);
        writeData(data);
        
        res.json({
            ...newBattle,
            song1_title: song1.title,
            song1_artist: song1.artist,
            song1_year: song1.year,
            song1_previewUrl: song1.previewUrl,
            song2_title: song2.title,
            song2_artist: song2.artist,
            song2_year: song2.year,
            song2_previewUrl: song2.previewUrl
        });
    } catch (error) {
        console.error('Fehler beim Erstellen des Battles:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen des Battles' });
    }
}

// Für Song abstimmen
app.post('/api/vote', (req, res) => {
    const { battleId, songNumber } = req.body;
    const userIp = req.ip;
    const today = new Date().toISOString().split('T')[0];
    
    const data = readData();
    
    // Prüfen ob User heute schon abgestimmt hat
    const hasVoted = data.votes.some(vote => 
        vote.user_ip === userIp && vote.vote_date === today
    );
    
    if (hasVoted) {
        res.status(400).json({ error: 'Du hast heute bereits abgestimmt' });
        return;
    }
    
    // Battle finden und Vote zählen
    const battle = data.battles.find(b => b.id === battleId);
    if (battle) {
        if (songNumber === 1) {
            battle.song1_votes++;
        } else {
            battle.song2_votes++;
        }
        
        // Vote speichern
        data.votes.push({
            id: Date.now(),
            battle_id: battleId,
            user_ip: userIp,
            vote_date: today
        });
        
        writeData(data);
        res.json({ message: 'Vote erfolgreich gespeichert' });
    } else {
        res.status(404).json({ error: 'Battle nicht gefunden' });
    }
});

// Battle-Historie abrufen
app.get('/api/battle-history', (req, res) => {
    const data = readData();
    
    const history = data.battles
        .sort((a, b) => new Date(b.battle_date) - new Date(a.battle_date))
        .slice(0, 5)
        .map(battle => {
            const song1 = data.songs.find(song => song.id === battle.song1_id);
            const song2 = data.songs.find(song => song.id === battle.song2_id);
            
            // Prüfen ob beide Songs existieren
            if (!song1 || !song2) {
                return null;
            }
            
            return {
                ...battle,
                song1_title: song1.title,
                song1_artist: song1.artist,
                song1_year: song1.year,
                song1_previewUrl: song1.previewUrl,
                song2_title: song2.title,
                song2_artist: song2.artist,
                song2_year: song2.year,
                song2_previewUrl: song2.previewUrl
            };
        })
        .filter(battle => battle !== null); // Entferne Battles mit gelöschten Songs
    
    res.json(history);
});

// Neuen Battle manuell starten
app.post('/api/start-new-battle', (req, res) => {
    const data = readData();
    const today = new Date().toISOString().split('T')[0];
    
    // Altes Battle für heute löschen falls vorhanden
    data.battles = data.battles.filter(battle => battle.battle_date !== today);
    data.votes = data.votes.filter(vote => vote.vote_date !== today);
    
    writeData(data);
    createNewBattle(res);
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
}); 