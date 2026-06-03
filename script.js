document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('channel-container');
    const searchInput = document.getElementById('channelSearch');

    fetch('playlist.json?t=' + Date.now())
        .then(response => response.json())
        .then(data => {
            container.innerHTML = ''; 

            data.forEach((channel, index) => {
                const li = document.createElement('li');
                li.setAttribute('tabindex', '0');
                
                li.innerHTML = `
                    <div style="display: block; text-decoration: none; pointer-events: none; width: 100%;">
                        <img src="${channel.image}" alt="${channel.name}" loading="lazy">
                        <div class="channel-info-box">
                            <p class="channel-title">${channel.name}</p>
                        </div>
                    </div>
                `;

                // 🎯 ক্লিক করলে প্লে হবে এবং সার্চবক্স অটো-ক্লিয়ার হয়ে যাবে
                li.addEventListener('click', function() {
                    if (window.frames['player']) {
                        window.frames['player'].location.href = channel.url;
                    } else {
                        player.location.href = channel.url;
                    }

                    // ✨ ম্যাজিক লজিক: চ্যানেল প্লে হওয়ার সাথে সাথে সার্চবক্স একদম ফাকা হয়ে যাবে
                    if (searchInput) {
                        searchInput.value = ''; // লেখা মুছে যাবে
                        // সমস্ত চ্যানেলকে আবার দৃশ্যমান করে দেওয়া হলো
                        const channelItems = container.querySelectorAll('li');
                        channelItems.forEach(item => item.style.display = "");
                    }
                });
                
                container.appendChild(li);
            });

            // 🔍 ইনস্ট্যান্ট লাইভ চ্যানেল ফিল্টার সার্চ লজিক
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    const filterValue = this.value.toLowerCase().trim();
                    const channelItems = container.querySelectorAll('li');

                    channelItems.forEach(item => {
                        const channelTitle = item.querySelector('.channel-title').textContent.toLowerCase();
                        if (channelTitle.includes(filterValue)) {
                            item.style.display = ""; 
                        } else {
                            item.style.display = "none"; 
                        }
                    });
                });
            }

            // প্লেলিস্ট লোড সম্পন্ন হলে টিভি ফোকাস সচল হবে
            if (typeof initTVFocus === 'function') {
                initTVFocus();
            }
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            container.innerHTML = '<p style="color:red; font-size:10px; text-align:center; padding:20px;">Playlist Load Error!</p>';
        });
});
