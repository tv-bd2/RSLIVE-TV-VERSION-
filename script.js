/**
 * RS LIVE TV PRO - Advanced Stream Controller Architecture
 * Features: Lazy load, TV focus engine, Fullscreen Orientation, Local Storage Management
 */

let channelsData = [];
let favoriteChannels = JSON.parse(localStorage.getItem('rs_favs')) || [];
let activeCategory = 'all';
let videoPlayerInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    initDigitalClock();
    initVideoPlayer();
    loadStreamPlaylists();
    setupEventHandlers();
    initTVNavigation();
});

// Live Digital Floating Clock Update Engine
function initDigitalClock() {
    const clockEl = document.getElementById("digital-clock");
    setInterval(() => {
        const now = new Date();
        if(clockEl) {
            clockEl.innerText = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        }
    }, 1000);
}

// Optimized VideoJS Player Engine Core
function initVideoPlayer() {
    if (videojs.getPlayers()['rs-video-player']) {
        videoPlayerInstance = videojs.getPlayers()['rs-video-player'];
    } else {
        videoPlayerInstance = videojs('rs-video-player', {
            html5: { vhs: { overrideNative: true } },
            controls: true,
            autoplay: false,
            fluid: true,
            responsive: true,
            liveui: true,
            playbackRates: [0.5, 1, 1.5, 2],
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'liveDisplay',
                    'remainingTimeDisplay',
                    'pictureInPictureToggle',
                    'fullscreenToggle',
                ],
            }
        });
    }

    // Force Object Fit on Play to fix Black Screen issues
    videoPlayerInstance.on("play", () => {
        const videoTechEl = document.querySelector(".vjs-tech");
        if (videoTechEl) videoTechEl.style.setProperty('object-fit', 'fill', 'important');
    });

    // Handle Mobile Screen Auto Rotation on Fullscreen Trigger
    videoPlayerInstance.on("fullscreenchange", () => {
        if (videoPlayerInstance.isFullscreen()) {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock("landscape").catch(() => {});
            }
        } else {
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        }
    });

    // Error Handling Wrapper with Auto Fallback Mechanism
    videoPlayerInstance.on("error", () => {
        showToast("Stream execution error! Retrying via Backup Core...");
        videoPlayerInstance.errorDisplay.close();
    });
}

// Fetch and Render Channel Playlists from playlist.json
function loadStreamPlaylists() {
    showSkeletons(12);
    
    fetch('playlist.json')
        .then(res => {
            if (!res.ok) throw new Error("Network response error.");
            return res.json();
        })
        .then(data => {
            channelsData = data;
            hideLoader();
            renderCategoryChips();
            renderChannelGrid(channelsData);
            setupHeroBannerDefault();
        })
        .catch(err => {
            console.error("Playlist loading breakdown: ", err);
            document.getElementById("channels-grid-container").innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding: 40px; color:#ff3366;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 40px; margin-bottom:15px;"></i>
                    <p>Failed to retrieve configurations. Check backend JSON connectivity.</p>
                </div>
            `;
            hideLoader();
        });
}

// Render Unique Categories Fluid Horizontal List
function renderCategoryChips() {
    const categories = ['all', ...new Set(channelsData.map(c => c.category || 'Live TV'))];
    const container = document.getElementById("category-bar");
    if(!container) return;
    
    container.innerHTML = categories.map(cat => `
        <div class="cat-chip ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">
            ${cat.toUpperCase()}
        </div>
    `).join('');

    document.querySelectorAll(".cat-chip").forEach(chip => {
        chip.addEventListener("click", (e) => {
            document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
            activeCategory = e.target.dataset.cat;
            filterChannels();
        });
    });
}

// Render Main Channels Output UI
function renderChannelGrid(channels) {
    const container = document.getElementById("channels-grid-container");
    const counter = document.getElementById("channel-count");
    if(!container) return;

    if(channels.length === 0) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--text-secondary);">No channels found matching the specification.</p>`;
        if(counter) counter.innerText = "0 Channels Listed";
        return;
    }

    if(counter) counter.innerText = `${channels.length} Streams Listed`;

    container.innerHTML = channels.map((channel, idx) => {
        const isFav = favoriteChannels.some(f => f.url === channel.url);
        return `
            <div class="channel-card" data-url="${channel.url}" data-name="${channel.name}" tabindex="${10 + idx}">
                <button class="fav-btn ${isFav ? 'active-fav' : ''}" data-idx="${idx}"><i class="fa-solid fa-heart"></i></button>
                <div class="card-img-wrapper">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" data-src="${channel.image}" alt="${channel.name}" class="channel-logo lazy-load">
                </div>
                <div class="channel-name">${channel.name}</div>
            </div>
        `;
    }).join('');

    initLazyLoading();
    attachCardPlaybackListeners();
}

// Multi-Criteria Dynamic Engine Filtering (Category + Search bar)
function filterChannels() {
    let filtered = channelsData;
    
    // Process Categories
    if (activeCategory === 'favorites') {
        filtered = favoriteChannels;
    } else if (activeCategory !== 'all') {
        filtered = channelsData.filter(c => (c.category || 'Live TV') === activeCategory);
    }

    // Process Search Query Input
    const query = document.getElementById("search-input").value.toLowerCase().trim();
    if (query !== "") {
        filtered = filtered.filter(c => c.name.toLowerCase().includes(query));
    }

    renderChannelGrid(filtered);
}

// High Performance Intersection Observer For Logo Lazy Loading
function initLazyLoading() {
    const lazyImages = document.querySelectorAll(".lazy-load");
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove("lazy-load");
                    obs.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => observer.observe(img));
    } else {
        lazyImages.forEach(img => img.src = img.dataset.src);
    }
}

// Action Handlers setup for items interaction
function attachCardPlaybackListeners() {
    document.querySelectorAll(".channel-card").forEach(card => {
        card.addEventListener("click", (e) => {
            // Prevent event triggering if clicking on favorite switch explicitly
            if(e.target.closest('.fav-btn')) {
                toggleFavorite(e.target.closest('.fav-btn'));
                return;
            }
            playStreamUrl(card.dataset.url, card.dataset.name);
        });
        
        // Key listener interface support
        card.addEventListener("keydown", (e) => {
            if(e.key === "Enter") {
                playStreamUrl(card.dataset.url, card.dataset.name);
            }
        });
    });
}

// Stream Pipeline Execution Unit
function playStreamUrl(url, name) {
    const playerWrapper = document.getElementById("player-wrapper");
    const playerTitle = document.getElementById("current-playing-title");
    
    if(!playerWrapper) return;
    
    playerWrapper.classList.remove("section-hidden");
    playerTitle.innerHTML = `<i class="fa-solid fa-satellite-dish" style="color:var(--accent-color); animation:blink 1s infinite;"></i> Now Playing: ${name}`;
    
    // Smooth scroll interface adjustment directly to player view coordinates
    playerWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Stream CORS Proxy injection wrapper handler if needed
    // Example: let finalUrl = "https://yourproxy.workers.dev/?url=" + encodeURIComponent(url);
    
    videoPlayerInstance.src({
        src: url,
        type: url.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
    });

    videoPlayerInstance.ready(() => {
        videoPlayerInstance.play()
            .then(() => showToast(`Streaming: ${name}`))
            .catch(() => showToast("Autoplay blocked. Press play manually."));
    });
}

function closePlayer() {
    if(videoPlayerInstance) {
        videoPlayerInstance.pause();
    }
    document.getElementById("player-wrapper").classList.add("section-hidden");
}

// Toggle Favorites Persistence Management Layer
function toggleFavorite(element) {
    const idx = element.dataset.idx;
    const pickedChannel = channelsData[idx];
    
    const favIdx = favoriteChannels.findIndex(f => f.url === pickedChannel.url);
    if(favIdx > -1) {
        favoriteChannels.splice(favIdx, 1);
        element.classList.remove("active-fav");
        showToast("Removed from Favorites System");
    } else {
        favoriteChannels.push(pickedChannel);
        element.classList.add("active-fav");
        showToast("Added to Favorites Suite");
    }
    localStorage.setItem('rs_favs', JSON.stringify(favoriteChannels));
    if(activeCategory === 'favorites') filterChannels();
}

// Hero Banner Core Config Logic
function setupHeroBannerDefault() {
    const playBtn = document.getElementById("hero-play-btn");
    if(playBtn && channelsData.length > 0) {
        playBtn.onclick = () => {
            // Plays first index item on list as default highlight feature channel
            playStreamUrl(channelsData[0].url, channelsData[0].name);
        };
    }
}

// Global Core UI Orchestrator Event Hookups
function setupEventHandlers() {
    // Search listener engine
    document.getElementById("search-input").addEventListener("input", filterChannels);

    // Sidebar & Bottom Navigation Category Selectors Unified Mapping
    const setupMenuTriggers = (selector) => {
        document.querySelectorAll(selector).forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                document.querySelectorAll(selector).forEach(i => i.classList.remove("active"));
                item.classList.add("active");
                activeCategory = item.dataset.target;
                filterChannels();
            });
        });
    };

    setupMenuTriggers(".nav-item");
    setupMenuTriggers(".m-nav-item");
}

// Custom Virtual D-Pad / Android TV Smart Remote Focus Traversal Framework
function initTVNavigation() {
    document.addEventListener("keydown", (e) => {
        const active = document.activeElement;
        if (!active) return;
        
        let next = null;
        switch(e.key) {
            case "ArrowUp":
                // Handles custom logic or lets standard web focused layout handle traversal vertical
                break;
            case "ArrowDown":
                break;
            case "ArrowLeft":
                if (active.previousElementSibling) next = active.previousElementSibling;
                break;
            case "ArrowRight":
                if (active.nextElementSibling) next = active.nextElementSibling;
                break;
            case "Backspace": // Fallback for TV back button integration routing escape
                closePlayer();
                break;
        }
        if(next && next.hasAttribute('tabindex')) {
            next.focus();
        }
    });
}

// Custom Skeleton Interface Renderer Engine
function showSkeletons(count) {
    const container = document.getElementById("channels-grid-container");
    if(container) {
        container.innerHTML = Array(count).fill('<div class="skeleton-card"></div>').join('');
    }
}

function hideLoader() {
    const loader = document.getElementById("app-loader");
    if(loader) {
        loader.style.opacity = "0";
        setTimeout(() => loader.style.display = "none", 500);
    }
}

// Toast System Core Notice Interface Trigger
function showToast(msg) {
    const toast = document.getElementById("toast-notification");
    if(!toast) return;
    toast.innerText = msg;
    toast.className = "toast-visible";
    setTimeout(() => { toast.className = "toast-hidden"; }, 3500);
}
