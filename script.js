document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('channel-container');
    const searchInput = document.getElementById('tv-search');
    let allChannelsData = [];
    let activeElements = [];
    let currentFocusIndex = -1; // -1 মানে সার্চবার ফোকাসড

    // JSON থেকে ডাটা নেওয়া
    fetch('playlist.json')
        .then(response => response.json())
        .then(data => {
            allChannelsData = data;
            renderChannels(allChannelsData);
            initTvControls();
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            container.innerHTML = '<p style="color:red; text-align:center; grid-column: span 3;">Error Loading Playlist!</p>';
        });

    // চ্যানেল রেন্ডার করার ফাংশন
    function renderChannels(channels) {
        container.innerHTML = '';
        channels.forEach((channel, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="javascript:void(0);" 
                   class="tv-focusable-item" 
                   data-url="${channel.url}"
                   tabindex="0">
                    <img src="${channel.image}" alt="${channel.name}">
                </a>
            `;
            container.appendChild(li);
        });
        
        // ফোকাস এলিমেন্ট আপডেট করা
        updateFocusableList();
    }

    function updateFocusableList() {
        activeElements = Array.from(document.querySelectorAll('.tv-focusable-item'));
    }

    // সার্চবারের টাইপিং ইনপুট লিসেনার (মোবাইল/কীবোর্ড/টিভি কীবোর্ড)
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        const filtered = allChannelsData.filter(ch => ch.name.toLowerCase().includes(query));
        renderChannels(filtered);
        currentFocusIndex = -1; // ফিল্টার হলে ফোকাস সার্চবারে ব্যাক করবে
    });

    // টিভি রিমোটের সম্পূর্ণ ৩-লাইন নেভিগেশন ম্যাপিং
    function initTvControls() {
        searchInput.focus(); // শুরুতে সার্চবার ফোকাস থাকবে

        document.addEventListener('keydown', function(e) {
            updateFocusableList();
            const totalItems = activeElements.length;
            const columns = 3; // ৩ লাইন গ্রিড

            switch(e.keyCode) {
                case 37: // LEFT Arrow
                    if (currentFocusIndex > 0) {
                        currentFocusIndex--;
                        activeElements[currentFocusIndex].focus();
                        scrollToElement(activeElements[currentFocusIndex]);
                    } else if (currentFocusIndex === 0) {
                        // প্রথম চ্যানেল থেকে বামে চাপলে সার্চবারে যাবে
                        currentFocusIndex = -1;
                        searchInput.focus();
                    }
                    e.preventDefault();
                    break;

                case 39: // RIGHT Arrow
                    if (currentFocusIndex < totalItems - 1) {
                        currentFocusIndex++;
                        activeElements[currentFocusIndex].focus();
                        scrollToElement(activeElements[currentFocusIndex]);
                    }
                    e.preventDefault();
                    break;

                case 38: // UP Arrow
                    if (currentFocusIndex === -1) return; // সার্চবারে থাকলে ওপরে যাওয়ার জায়গা নেই
                    
                    if (currentFocusIndex < columns) {
                        // প্রথম লাইনের যেকোনো চ্যানেল থেকে ওপরে চাপলে সার্চবারে যাবে
                        currentFocusIndex = -1;
                        searchInput.focus();
                    } else {
                        currentFocusIndex -= columns;
                        activeElements[currentFocusIndex].focus();
                        scrollToElement(activeElements[currentFocusIndex]);
                    }
                    e.preventDefault();
                    break;

                case 40: // DOWN Arrow
                    if (currentFocusIndex === -1) {
                        // সার্চবার থেকে নিচে চাপলে ১ম চ্যানেলে যাবে
                        if (totalItems > 0) {
                            currentFocusIndex = 0;
                            activeElements[currentFocusIndex].focus();
                            scrollToElement(activeElements[currentFocusIndex]);
                        }
                    } else if (currentFocusIndex + columns < totalItems) {
                        currentFocusIndex += columns;
                        activeElements[currentFocusIndex].focus();
                        scrollToElement(activeElements[currentFocusIndex]);
                    } else {
                        // লাস্ট লাইনের নিচে চাপলে একদম শেষ চ্যানেলে ফোকাস লক হবে
                        currentFocusIndex = totalItems - 1;
                        activeElements[currentFocusIndex].focus();
                        scrollToElement(activeElements[currentFocusIndex]);
                    }
                    e.preventDefault();
                    break;

                case 13: // OK / ENTER Button
                    if (currentFocusIndex !== -1) {
                        const streamUrl = activeElements[currentFocusIndex].getAttribute('data-url');
                        if (streamUrl) {
                            const iframe = document.getElementById('tv-iframe');
                            if (iframe) iframe.src = streamUrl;
                        }
                    }
                    break;
            }
        });

        // মাউস ক্লিকের সাপোর্ট
        container.addEventListener('click', function(e) {
            const target = e.target.closest('.tv-focusable-item');
            if (target) {
                currentFocusIndex = activeElements.indexOf(target);
                const streamUrl = target.getAttribute('data-url');
                const iframe = document.getElementById('tv-iframe');
                if (iframe) iframe.src = streamUrl;
            }
        });
    }

    function scrollToElement(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
});
