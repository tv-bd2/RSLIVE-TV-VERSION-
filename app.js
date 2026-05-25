/**
 * RS LIVE TV PRO - Operational Logic Controller
 */

let masterChannelsPayload = [];
let storedFavoritesList = JSON.parse(localStorage.getItem('rs_pro_favs')) || [];
let selectedFilterCategory = 'all';

document.addEventListener("DOMContentLoaded", () => {
    runClockEngine();
    fetchPayloadManifest();
    bindInterfaceTriggers();
    wireSmartTVRemoteController();
});

function runClockEngine() {
    const clockDisplay = document.getElementById("live-clock");
    setInterval(() => {
        if(clockDisplay) {
            clockDisplay.innerText = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        }
    }, 1000);
}

function fetchPayloadManifest() {
    renderGridSkeletons(12);
    fetch('playlist.json')
        .then(response => {
            if(!response.ok) throw new Error("Manifest invalid entry layout.");
            return response.json();
        })
        .then(data => {
            // নেটলিফাই বা কোনো থার্ড-পার্টি রিডাইরেক্ট প্রি-ফিল্টারিং লুপ
            masterChannelsPayload = data.map(item => {
                if (item.url && item.url.includes('?url=')) {
                    item.url = item.url.split('?url=')[1];
                }
                return item;
            });
            
            dismissLoader();
            buildCategoryChips();
            displayChannelsGrid(masterChannelsPayload);
            initHeroBannerAction();
        })
        .catch(err => {
            console.error(err);
            document.getElementById("ott-main-grid").innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#ff3366;padding:20px;">Failed to link server database configurations.</p>`;
            dismissLoader();
        });
}

function buildCategoryChips() {
    const parsedCategories = ['all', ...new Set(masterChannelsPayload.map(c => c.category || 'Live TV'))];
    const targetShelf = document.getElementById("dynamic-category-shelf");
    if(!targetShelf) return;

    targetShelf.innerHTML = parsedCategories.map(cat => `
        <div class="chip-element ${cat === selectedFilterCategory ? 'active' : ''}" data-category="${cat}">
            ${cat.toUpperCase()}
        </div>
    `).join('');

    document.querySelectorAll(".chip-element").forEach(chip => {
        chip.addEventListener("click", (e) => {
            document.querySelectorAll(".chip-element").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            selectedFilterCategory = chip.dataset.category;
            executeChannelsFiltering();
        });
    });
}

function displayChannelsGrid(dataset) {
    const mainGrid = document.getElementById("ott-main-grid");
    const countBadge = document.getElementById("stream-total-counter");
    if(!mainGrid) return;

    if(dataset.length === 0) {
        mainGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:30px;">No streams available inside this selection matrix.</p>`;
        if(countBadge) countBadge.innerText = "0 Streams";
        return;
    }

    if(countBadge) countBadge.innerText = `${dataset.length} Streams`;

    mainGrid.innerHTML = dataset.map((channel, pos) => {
        const isFav = storedFavoritesList.some(f => f.url === channel.url);
        return `
            <div class="channel-card-shell" data-stream-url="${channel.url}" data-title="${channel.name}" tabindex="${10 + pos}">
                <button class="card-fav-trigger-btn ${isFav ? 'is-fav' : ''}" data-position="${pos}"><i class="fa-solid fa-heart"></i></button>
                <div class="img-container-box">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" data-src="${channel.image}" alt="${channel.name}" class="logo-img-asset lazy-image">
                </div>
                <div class="card-label-title">${channel.name}</div>
            </div>
        `;
    }).join('');

    activateLazyLoading();
    attachCardPlaybackTriggers();
}

function executeChannelsFiltering() {
    let processBuffer = masterChannelsPayload;

    if(selectedFilterCategory === 'favs') {
        processBuffer = storedFavoritesList;
    } else if (selectedFilterCategory !== 'all') {
        processBuffer = masterChannelsPayload.filter(c => (c.category || 'Live TV') === selectedFilterCategory);
    }

    const searchStr = document.getElementById("search-input").value.toLowerCase().trim();
    if(searchStr !== "") {
        processBuffer = processBuffer.filter(c => c.name.toLowerCase().includes(searchStr));
    }

    displayChannelsGrid(processBuffer);
}

function activateLazyLoading() {
    const targetImages = document.querySelectorAll(".lazy-image");
    if('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    const loadedImg = entry.target;
                    loadedImg.src = loadedImg.dataset.src;
                    loadedImg.classList.remove("lazy-image");
                    observer.unobserve(loadedImg);
                }
            });
        });
        targetImages.forEach(img => io.observe(img));
    } else {
        targetImages.forEach(img => img.src = img.dataset.src);
    }
}

function attachCardPlaybackTriggers() {
    document.querySelectorAll(".channel-card-shell").forEach(card => {
        card.addEventListener("click", (e) => {
            if(e.target.closest('.card-fav-trigger-btn')) {
                handleFavAction(e.target.closest('.card-fav-trigger-btn'));
                return;
            }
            initiateOttPlayback(card.dataset.streamUrl, card.dataset.title);
        });
        card.addEventListener("keydown", (e) => {
            if(e.key === "Enter") initiateOttPlayback(card.dataset.streamUrl, card.dataset.title);
        });
    });
}

function handleFavAction(button) {
    const arrayIndex = button.dataset.position;
    const targets = masterChannelsPayload[arrayIndex];
    const matchIdx = storedFavoritesList.findIndex(f => f.url === targets.url);

    if(matchIdx > -1) {
        storedFavoritesList.splice(matchIdx, 1);
        button.classList.remove("is-fav");
        triggerPopupAlert("Removed from Dashboard Favs");
    } else {
        storedFavoritesList.push(targets);
        button.classList.add("is-fav");
        triggerPopupAlert("Channel Added to Favorites");
    }
    localStorage.setItem('rs_pro_favs', JSON.stringify(storedFavoritesList));
    if(selectedFilterCategory === 'favs') executeChannelsFiltering();
}

function initHeroBannerAction() {
    const trigger = document.getElementById("featured-play-trigger");
    if(trigger && masterChannelsPayload.length > 0) {
        trigger.onclick = () => initiateOttPlayback(masterChannelsPayload[0].url, masterChannelsPayload[0].name);
    }
}

function bindInterfaceTriggers() {
    document.getElementById("search-input").addEventListener("input", executeChannelsFiltering);

    const mapNavigationSelectors = (elements) => {
        document.querySelectorAll(elements).forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                document.querySelectorAll(elements).forEach(i => i.classList.remove("active"));
                item.classList.add("active");
                selectedFilterCategory = item.dataset.target;
                executeChannelsFiltering();
            });
        });
    };
    mapNavigationSelectors(".nav-btn");
    mapNavigationSelectors(".m-dock-btn");
}

function wireSmartTVRemoteController() {
    document.addEventListener("keydown", (e) => {
        const currentActive = document.activeElement;
        if(!currentActive) return;

        let focusDestination = null;
        switch (e.key) {
            case "ArrowLeft":
                if(currentActive.previousElementSibling) focusDestination = currentActive.previousElementSibling;
                break;
            case "ArrowRight":
                if(currentActive.nextElementSibling) focusDestination = currentActive.nextElementSibling;
                break;
            case "Escape":
            case "Backspace":
                terminatePlayback();
                break;
        }
        if(focusDestination && focusDestination.hasAttribute('tabindex')) {
            focusDestination.focus();
        }
    });
}

function renderGridSkeletons(itemsCount) {
    document.getElementById("ott-main-grid").innerHTML = Array(itemsCount).fill('<div class="skeleton-box"></div>').join('');
}

function dismissLoader() {
    const targetLoader = document.getElementById("app-loader");
    if(targetLoader) {
        targetLoader.style.opacity = "0";
        setTimeout(() => targetLoader.style.display = "none", 400);
    }
}

function triggerPopupAlert(msg) {
    const banner = document.getElementById("toast");
    if(!banner) return;
    banner.innerText = msg;
    banner.className = "";
    setTimeout(() => { banner.className = "toast-hidden"; }, 3000);
}
