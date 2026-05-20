document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('channel-container');
    let currentIndex = 0;

    // JSON ফাইল থেকে চ্যানেল লোড করা
    fetch('playlist.json')
        .then(response => response.json())
        .then(data => {
            data.forEach((channel, index) => {
                const li = document.createElement('li');
                // tabindex="0" দেওয়া হয়েছে যাতে রিমোট দিয়ে এগুলোকে ফোকাস করা যায়
                li.innerHTML = `
                    <a href="javascript:void(0);" 
                       class="tv-focusable" 
                       data-index="${index}" 
                       data-url="${channel.url}"
                       tabindex="0">
                        <img src="${channel.image}" alt="${channel.name}">
                    </a>
                `;
                container.appendChild(li);
            });

            // চ্যানেল লোড হওয়ার পর রিমোট কন্ট্রোল হ্যান্ডলিং শুরু
            initTvNavigation();
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            container.innerHTML = '<p style="color:red; font-size:12px; text-align:center;">Error Loading Channels!</p>';
        });

    function initTvNavigation() {
        const focusableElements = document.querySelectorAll('.tv-focusable');
        
        if (focusableElements.length > 0) {
            // প্রথম চ্যানেলটি অটোমেটিক ফোকাস হবে
            focusableElements[currentIndex].focus();
        }

        // রিমোট কন্ট্রোল কী ইভেন্ট লিসেনার
        document.addEventListener('keydown', function(e) {
            if (focusableElements.length === 0) return;

            switch(e.keyCode) {
                case 38: // TV Remote UP Arrow
                    if (currentIndex > 0) {
                        currentIndex--;
                        focusableElements[currentIndex].focus();
                        scrollToActiveChannel(focusableElements[currentIndex]);
                    }
                    e.preventDefault();
                    break;
                
                case 40: // TV Remote DOWN Arrow
                    if (currentIndex < focusableElements.length - 1) {
                        currentIndex++;
                        focusableElements[currentIndex].focus();
                        scrollToActiveChannel(focusableElements[currentIndex]);
                    }
                    e.preventDefault();
                    break;
                
                case 13: // TV Remote OK / ENTER Button
                    const streamUrl = focusableElements[currentIndex].getAttribute('data-url');
                    if (streamUrl) {
                        window.frames['player'].location.href = streamUrl;
                    }
                    break;
            }
        });

        // মাউস দিয়ে ক্লিক করলেও যাতে ইনডেক্স ঠিক থাকে
        focusableElements.forEach(elem => {
            elem.addEventListener('click', function() {
                currentIndex = parseInt(this.getAttribute('data-index'));
                const streamUrl = this.getAttribute('data-url');
                window.frames['player'].location.href = streamUrl;
            });
        });
    }

    // ফোকাস করা চ্যানেলটি স্ক্রিনের বাইরে চলে গেলে অটোমেটিক স্ক্রোল করার ফাংশন
    function scrollToActiveChannel(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
});

function disableClick() {
    document.oncontextmenu = function() { return false; };
}
