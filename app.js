const lastFmUsername = 'zaksoryal';
const apiKey = 'bf0701b5a81598bd134b1fcd63918820';
const spotifyClientId = '5eb05fc56a1f42b797a9aa423f6813f0';
const spotifyClientSecret = 'e9f9ddd250c94bcbbe1dafd6ee361956';
const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastFmUsername}&api_key=${apiKey}&format=json&limit=1`;

// Function to fetch the currently playing song
async function getCurrentlyPlayingSong() {
    const recentTracksApiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${lastFmUsername}&api_key=${apiKey}&format=json&limit=1`;

    try {
        // Fetch the most recent track
        const recentTracksResponse = await fetch(recentTracksApiUrl);
        const recentTracksData = await recentTracksResponse.json();
        const track = recentTracksData.recenttracks.track[0]; // Get the first track (most recent)
        const isPlaying = track['@attr'] && track['@attr'].nowplaying === 'true';
        const songElement = document.getElementById('song');

        if (isPlaying) {
            const trackInfoApiUrl = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=${apiKey}&artist=${encodeURIComponent(track.artist['#text'])}&track=${encodeURIComponent(track.name)}&username=${lastFmUsername}&format=json`;
        
            const trackInfoResponse = await fetch(trackInfoApiUrl);
            const trackInfoData = await trackInfoResponse.json();
            const trackInfo = trackInfoData.track;
        
            const durationMs = trackInfo.duration;
            const minutes = Math.floor(durationMs / 60000);
            const seconds = ((durationMs % 60000) / 1000).toFixed(0);
        
            const previewUrl = await getSpotifyPreviewUrl(track.artist['#text'], track.name);

            songElement.innerHTML = `
                <div class="song-container">
                    <div class="current-song">
                        <h2 id="currentlyPlaying">Currently Playing</h2>
                        <h3><a href="${track.url}" target="_blank">${track.name}</a></h3>
                        <h3>by <span><b>${track.artist['#text']}</b></span> on <i>${track.album['#text']}</i></h3>
                        <img id="albumArt" src="${track.image[2]['#text'] || 'default-image.jpg'}" alt="Album Art">
                        </br>
                    </div>
                    <div class="song-stats">
                        <p>Duration: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}</p>
                        <p>Personal plays: ${trackInfo.userplaycount}</p>
                        <p>Total listeners: ${trackInfo.listeners}</p>
                        <p>Total playcount: ${trackInfo.playcount}</p>
                    </div>
                    <audio id="previewAudio" src="${previewUrl}" preload="none"></audio>
                </div>
            `;
            const albumArt = document.getElementById('albumArt');
            const previewAudio = document.getElementById('previewAudio');

            if (previewUrl) {
                previewAudio.src = previewUrl;

                let audioEnabled = false;

                albumArt.addEventListener('click', () => {
                    if (!audioEnabled) {
                        previewAudio.play().then(() => {
                            audioEnabled = true;
                            previewAudio.pause();
                        }).catch(error => {
                            console.error('Error playing audio:', error);
                        });
                    }
                });

                albumArt.addEventListener('mouseover', () => {
                    if (audioEnabled) {
                        previewAudio.play();
                    }
                });

                albumArt.addEventListener('mouseout', () => {
                    if (audioEnabled) {
                        previewAudio.pause();
                    }
                });

            } else {
                console.error('No preview URL available:', error);
            }

        } else {
            songElement.innerHTML = `
                <p>I'm not listening to anything right now :(</p>
            `;
        }

    } catch (error) {
        console.error('Error fetching currently playing song:', error);
    }
    
}

// Function to get Spotify preview URL
async function getSpotifyPreviewUrl(artist, track) {
    const authUrl = 'https://accounts.spotify.com/api/token';
    const searchUrl = `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(track)}%20artist:${encodeURIComponent(artist)}&type=track&limit=1`;

    try {
        // Get access token
        const authResponse = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(spotifyClientId + ':' + spotifyClientSecret),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        const authData = await authResponse.json();
        const accessToken = authData.access_token;

        // Fetch track preview URL
        const response = await fetch(searchUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
            const trackItem = data.tracks.items[0];
            console.log(`Found track: ${trackItem.name} by ${trackItem.artists.map(artist => artist.name).join(', ')}`);
            if (trackItem.preview_url) {
                console.log(`Preview URL for ${trackItem.name}: ${trackItem.preview_url}`);
                return trackItem.preview_url;
            } else {
                console.log(`No preview URL available for ${trackItem.name}`);
                return null;
            }
        } else {
            throw new Error('No tracks found');
        }
    } catch (error) {
        console.error('Error fetching Spotify preview URL:', error);
        return null;
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
            let tracksHtml = '<h2>Recently Played</h2> <ul class="two-columns">';
            filteredTracks.forEach(track => {
                const trackName = track.name;
                const artistName = track.artist['#text'];
                const albumArt = track.image[1]['#text'] || 'default-image.jpg';
                const listenedAt = track.date ? new Date(track.date.uts * 1000).toLocaleString() : 'Unknown time';

                tracksHtml += `
                    <li>
                        <img src="${albumArt}" alt="Album Art" width="50" height="50">
                        <strong><a href="${track.url}" target="_blank">${trackName}</a></strong> by ${artistName}
                        <br>
                        <small>Listened at: ${listenedAt}</small>
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

// Fetch top artists
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

// Fetch top albums
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
                albumsHtml += `<li><strong>${album.name}</strong> by ${album.artist.name} - ${album.playcount} plays</li>`;
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

// Fetch top tracks
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
                tracksHtml += `<li><strong>${track.name}</strong> by ${track.artist.name} - ${track.playcount} plays</li>`;
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
        let statsHtml = `<p>Total number of songs listened to since September 2nd, 2024: <b>${userData.user.playcount}</b></p>`;
        
        // Calculate and display average songs per day
        const accountCreationDate = new Date('2024-09-02');
        const currentDate = new Date();
        const daysSinceCreation = Math.floor((currentDate - accountCreationDate) / (1000 * 60 * 60 * 24));
        const averageSongsPerDay = Math.round(userData.user.playcount / daysSinceCreation);
        statsHtml += `<p>That's an average of <b>${averageSongsPerDay}</b> songs per day!</p>`;

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
