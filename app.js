// Replace with your Last.fm username and API key
const lastFmUsername = 'zaksoryal';
const apiKey = 'bf0701b5a81598bd134b1fcd63918820';
const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastFmUsername}&api_key=${apiKey}&format=json&limit=1`;

// Function to fetch the currently playing song
async function getCurrentlyPlayingSong() {
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastFmUsername}&api_key=${apiKey}&format=json&limit=1`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const track = data.recenttracks.track[0];  // Get the first track (most recent)
        const isPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';
        const songElement = document.getElementById('song');

        if (isPlaying) {
            songElement.innerHTML = `
                <h3>${track.name} <span>by</span> <span>${track.artist['#text']}</span></h3>
                <img src="${track.image[2]['#text'] || 'default-image.jpg'}" alt="Album Art">
                <p>Album: ${track.album['#text']}</p>
                <div class="equalizer">
                    <div class="equalizer-bar"></div>
                    <div class="equalizer-bar"></div>
                    <div class="equalizer-bar"></div>
                </div>
            `;
        } else {
            songElement.innerHTML = `
                <p>Nothing :(</p>
            `;
        }
    } catch (error) {
        console.error('Error fetching currently playing song:', error);
    }
}

// Function to display recently played tracks
async function getRecentTracks() {
    const recentTracksUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastFmUsername}&api_key=${apiKey}&format=json&limit=20`; // Fetch 20 tracks

    try {
        const response = await fetch(recentTracksUrl);
        const data = await response.json();

        const tracks = data.recenttracks.track;
        const recentTracksElement = document.getElementById('recent-tracks');

        // Find the currently playing track
        const nowPlayingTrack = tracks.find(track => track['@attr'] && track['@attr'].nowplaying === 'true');

        // Filter out the currently playing track
        const filteredTracks = tracks.filter(track => track !== nowPlayingTrack);

        if (filteredTracks.length > 0) {
            let tracksHtml = '<ul>';
            filteredTracks.forEach(track => {
                const trackName = track.name;
                const artistName = track.artist['#text'];
                const albumArt = track.image[1]['#text'] || 'default-image.jpg'; // Medium size image

                tracksHtml += `
                    <li>
                        <img src="${albumArt}" alt="Album Art" width="50" height="50">
                        <strong>${trackName}</strong> by ${artistName}
                    </li>
                `;
            });
            tracksHtml += '</ul>';
            recentTracksElement.innerHTML = tracksHtml;
        } else {
            recentTracksElement.innerHTML = '<p>No recent tracks found.</p>';
        }
    } catch (error) {
        console.error('Error fetching recent tracks:', error);
    }
}

// Function to display user stats
async function getUserStats() {
    const userInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${lastFmUsername}&api_key=${apiKey}&format=json`;

    try {
        const response = await fetch(userInfoUrl);
        const data = await response.json();

        const user = data.user;
        const statsElement = document.getElementById('stats');
        statsElement.innerHTML = `
            <p>Total number of songs listened to since September 2nd, 2024: ${user.playcount}</p>
        `;
    } catch (error) {
        console.error('Error fetching user stats:', error);
    }
}

// Function to refresh all data
function refreshData() {
    getCurrentlyPlayingSong();
    getUserStats();
    getRecentTracks();
}

// Initial call to load the data
refreshData();

// Refresh all data every 10 seconds
setInterval(refreshData, 10000);  // 10000 ms = 10 seconds
