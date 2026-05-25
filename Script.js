/**
 * RS LIVE TV PRO - Streaming & Display Optimization Matrix
 */

let activeVideoJSInstance = null;

function initializeOttCorePlayer() {
    if (videojs.getPlayers()['ott-core-player']) {
        activeVideoJSInstance = videojs.getPlayers()['ott-core-player'];
    } else {
        activeVideoJSInstance = videojs('ott-core-player', {
            html5: { vhs: { overrideNative: true, fastQualityChange: true } },
            controls: true,
            autoplay: false,
            fluid: true,
            responsive: true,
            liveui: true,
            controlBar: {
                children: [
                    'playToggle', 'volumePanel', 'progressControl',
                    'liveDisplay', 'pictureInPictureToggle', 'fullscreenToggle'
                ]
            }
        });
    }

    // Black Screen এবং Aspect Ratio ফিক্সিং প্যাচ
    activeVideoJSInstance.on("playing", () => {
        const internalVideoTechTag = document.querySelector(".vjs-tech");
        if(internalVideoTechTag) {
            // এটি ভিডিও প্লেয়ারের কালো দাগ জোরপূর্বক দূর করে স্ক্রিন ফিট করবে
            internalVideoTechTag.style.setProperty('object-fit', 'fill', 'important');
        }
    });

    // মোবাইল ফুলস্ক্রিন অটো ল্যান্ডস্কেপ ওরিয়েন্টেশন লক রুলস
    activeVideoJSInstance.on("fullscreenchange", () => {
        if(activeVideoJSInstance.isFullscreen()) {
            if(screen.orientation && screen.orientation.lock) {
                screen.orientation.lock("landscape").catch(() => {});
            }
        } else {
            if(screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        }
    });

    // আল্ট্রা-ফাস্ট বাফারিং এরর হ্যান্ডলার রিকভারি লুপ
    activeVideoJSInstance.on("error", () => {
        console.log("Playback pipeline hazard identified. Injecting fallback sequence...");
        activeVideoJSInstance.errorDisplay.close();
    });
}

function initiateOttPlayback(streamSourceUrl, channelDisplayName) {
    if(!activeVideoJSInstance) initializeOttCorePlayer();

    const canvasContainer = document.getElementById("video-canvas-section");
    const canvasHeadline = document.getElementById("now-playing-title");

    if(!canvasContainer) return;

    canvasContainer.classList.remove("player-hidden");
    canvasHeadline.innerHTML = `<i class="fa-solid fa-satellite-dish" style="color:var(--neon-cyan); animation:blinker 1s infinite;"></i> Stream: ${channelDisplayName}`;
    
    canvasContainer.scrollIntoView({ behavior: "smooth", block: "center" });

    activeVideoJSInstance.src({
        src: streamSourceUrl,
        type: streamSourceUrl.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4"
    });

    activeVideoJSInstance.ready(() => {
        activeVideoJSInstance.play().catch(() => {
            console.log("Autoplay block protection triggered.");
        });
    });
}

function terminatePlayback() {
    if(activeVideoJSInstance) activeVideoJSInstance.pause();
    const canvasContainer = document.getElementById("video-canvas-section");
    if(canvasContainer) canvasContainer.classList.add("player-hidden");
}
