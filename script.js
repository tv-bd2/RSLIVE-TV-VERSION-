document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('channel-container');
    let currentIndex = 0;
    let focusableElements = [];

    // JSON ফাইল থেকে চ্যানেল লোড করা
    fetch('playlist.json')
        .then(response => response.json())
        .then(data => {
            data.forEach((channel, index) => {
                const li = document.createElement('li');
                // tabindex="0" দেওয়া হয়েছে যাতে রিমোটের Arrow Keys দিয়ে এটিকে ফোকাস করা যায়
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

            // চ্যানেলগুলো তৈরি হওয়ার পর তাদের লিস্ট তৈরি করা
            focusableElements = document.querySelectorAll('.tv-focusable');
            
            if (focusableElements.length > 0) {
                // অ্যাপ বা সাইট ওপেন হলেই প্রথম চ্যানেলটি অটোমেটিক ফোকাস (সিলেক্ট) হয়ে থাকবে
                focusableElements[currentIndex].focus();
            }

            // রিমোট কন্ট্রোল কী লিসেনার চালু করা
            initTvNavigation();
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            container.innerHTML = '<p style="color:red; font-size:12px; text-align:center;">Playlist Load ব্যর্থ হয়েছে!</p>';
        });

    // টিভি রিমোটের বাটন কন্ট্রোল ফাংশন
    function initTvNavigation() {
        document.addEventListener('keydown', function(e) {
            if (focusableElements.length === 0) return;

            switch(e.keyCode) {
                case 38: // TV Remote UP Arrow (উপরের বাটন)
                    if (currentIndex > 0) {
                        currentIndex--;
                        focusableElements[currentIndex].focus();
                        scrollToActiveChannel(focusableElements[currentIndex]);
                    }
                    e.preventDefault();
                    break;
                
                case 40: // TV Remote DOWN Arrow (নিচের বাটন)
                    if (currentIndex < focusableElements.length - 1) {
                        currentIndex++;
                        focusableElements[currentIndex].focus();
                        scrollToActiveChannel(focusableElements[currentIndex]);
                    }
                    e.preventDefault();
                    break;
                
                case 13: // TV Remote OK / ENTER Button (মাঝখানের ওকে বাটন)
                    // বর্তমানে যে চ্যানেলটি ফোকাস করা আছে, সেটির URL নেওয়া হবে
                    const streamUrl = focusableElements[currentIndex].getAttribute('data-url');
                    if (streamUrl) {
                        // iframe-এর ভেতরের প্লেয়ারে নতুন চ্যানেল লোড করা হবে এবং চেঞ্জ হবে
                        const iframe = document.getElementById('tv-iframe');
                        if (iframe) {
                            iframe.src = streamUrl;
                        }
                    }
                    e.preventDefault();
                    break;
            }
        });

        // যদি কেউ মাউস বা টাচ স্ক্রিন দিয়ে ক্লিক করে, তাহলেও যাতে চ্যানেল চেঞ্জ হয়
        focusableElements.forEach(elem => {
            elem.addEventListener('click', function() {
                currentIndex = parseInt(this.getAttribute('data-index'));
                const streamUrl = this.getAttribute('data-url');
                const iframe = document.getElementById('tv-iframe');
                if (iframe) {
                    iframe.src = streamUrl;
                }
            });
        });
    }

    // রিমোট দিয়ে নিচে বা উপরে গেলে চ্যানেল লিস্ট স্বয়ংক্রিয়ভাবে স্ক্রোল করার ফাংশন
    function scrollToActiveChannel(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
});

// রাইট ক্লিক বন্ধ করার ফাংশন
function disableClick() {
    document.oncontextmenu = function() { return false; };
}
