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

// Fetch top artists for the user
async function getTopArtists() {
    const topArtistsUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${lastFmUsername}&api_key=${apiKey}&format=json&limit=5`;

    try {
        const response = await fetch(topArtistsUrl);
        const data = await response.json();

        const topArtists = data.topartists.artist; // Get top artists from the response
        const topArtistsElement = document.getElementById('top-artists');

        if (topArtists.length > 0) {
            let artistsHtml = '<ul>';
            topArtists.forEach(artist => {
                artistsHtml += `<li><strong>${artist.name}</strong> - ${artist.playcount} plays</li>`;
            });
            artistsHtml += '</ul>';
            topArtistsElement.innerHTML = artistsHtml;
        } else {
            topArtistsElement.innerHTML = '<p>No top artists found.</p>';
        }
    } catch (error) {
        console.error('Error fetching top artists:', error);
        document.getElementById('top-artists').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Fetch top albums for the user
async function getTopAlbums() {
    const topAlbumsUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${lastFmUsername}&api_key=${apiKey}&format=json&limit=5`;

    try {
        const response = await fetch(topAlbumsUrl);
        const data = await response.json();

        const topAlbums = data.topalbums.album; // Get top albums from the response
        const topAlbumsElement = document.getElementById('top-albums');

        if (topAlbums.length > 0) {
            let albumsHtml = '<ul>';
            topAlbums.forEach(album => {
                albumsHtml += `<li><strong>${album.name}</strong> by ${album.artist.name}</li>`;
            });
            albumsHtml += '</ul>';
            topAlbumsElement.innerHTML = albumsHtml;
        } else {
            topAlbumsElement.innerHTML = '<p>No top albums found.</p>';
        }
    } catch (error) {
        console.error('Error fetching top albums:', error);
        document.getElementById('top-albums').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Fetch top tracks for the user
async function getTopTracks() {
    const topTracksUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettoptracks&user=${lastFmUsername}&api_key=${apiKey}&format=json&limit=5`;

    try {
        const response = await fetch(topTracksUrl);
        const data = await response.json();

        const topTracks = data.toptracks.track; // Get top tracks from the response
        const topTracksElement = document.getElementById('top-tracks');

        if (topTracks.length > 0) {
            let tracksHtml = '<ul>';
            topTracks.forEach(track => {
                tracksHtml += `<li><strong>${track.name}</strong> by ${track.artist.name}</li>`;
            });
            tracksHtml += '</ul>';
            topTracksElement.innerHTML = tracksHtml;
        } else {
            topTracksElement.innerHTML = '<p>No top tracks found.</p>';
        }
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        document.getElementById('top-tracks').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Function to display user stats
async function getUserStats() {
    const userInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${lastFmUsername}&api_key=${apiKey}&format=json`;
    const topArtistsUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${lastFmUsername}&api_key=${apiKey}&format=json&limit=5`;
    const weeklyTopArtistsUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getweeklyartistchart&user=${lastFmUsername}&api_key=${apiKey}&format=json&limit=5`;

    try {
        // Fetch all data concurrently
        const [userInfoResponse, topArtistsResponse, weeklyTopArtistsResponse] = await Promise.all([
            fetch(userInfoUrl),
            fetch(topArtistsUrl),
            fetch(weeklyTopArtistsUrl)
        ]);

        // Parse JSON from all responses
        const userData = await userInfoResponse.json();
        const topArtistsData = await topArtistsResponse.json();
        const weeklyTopArtistsData = await weeklyTopArtistsResponse.json();

        // Construct HTML content
        let statsHtml = `<p>Total number of songs listened to since September 2nd, 2024: ${userData.user.playcount}</p>`;

        // Adding top genres from top artists
        statsHtml += `<p><b>Top Genres (based on top artists):</b></p><ul>`;
        const topArtists = topArtistsData.topartists.artist;
        for (const artist of topArtists) {
            const artistInfoUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist.name)}&api_key=${apiKey}&format=json`;
            const artistInfoResponse = await fetch(artistInfoUrl);
            const artistInfoData = await artistInfoResponse.json();

            // Try to fetch artist's tags as genres
            const genres = artistInfoData.artist.tags.tag.map(tag => tag.name).slice(0, 3); // Top 3 genres
            statsHtml += `<li>${artist.name}: ${genres.join(', ')}</li>`;
        }
        statsHtml += `</ul>`;

        // Adding weekly top artists
        statsHtml += `<p><b>Weekly Top Artists:</b></p><ul>`;
        weeklyTopArtistsData.weeklyartistchart.artist.forEach(artist => {
            statsHtml += `<li>${artist.name} - ${artist.playcount} plays</li>`;
        });
        statsHtml += `</ul>`;

        // Update the DOM
        const statsElement = document.getElementById('stats');
        statsElement.innerHTML = statsHtml;

    } catch (error) {
        console.error('Error fetching user stats:', error);
        const statsElement = document.getElementById('stats');
        statsElement.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}


// Function to refresh all data
function refreshData() {
    getCurrentlyPlayingSong();
    getUserStats();
    getRecentTracks();
    getTopArtists();
    getTopAlbums();
    getTopTracks();
}


// Initial call to load the data
refreshData();

// Refresh all data every 10 seconds
setInterval(refreshData, 10000);  // 10000 ms = 10 seconds
