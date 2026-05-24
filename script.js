document.addEventListener('DOMContentLoaded', function() {
    const channelContainer = document.getElementById('channel-container');
    const categoryContainer = document.getElementById('category-container');
    let allChannels = [];

    // JSON ফাইল থেকে ডাটা লোড করা
    fetch('playlist.json')
        .then(response => response.json())
        .then(data => {
            allChannels = data;
            
            // ১. ইউনিক ক্যাটাগরিগুলো খুঁজে বের করা এবং "All" অপশন যোগ করা
            const categories = ['All'];
            data.forEach(channel => {
                if (channel.category && !categories.includes(channel.category)) {
                    categories.push(channel.category);
                }
            });

            // ২. প্লেয়ারের নিচে ক্যাটাগরি বাটনগুলো রেন্ডার করা
            renderCategories(categories);

            // ৩. প্রথমবার সম্পূর্ণ চ্যানেল লিস্ট প্রদর্শন করা
            displayChannels(allChannels);
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            channelContainer.innerHTML = '<p style="color:red; font-size:10px; padding:10px;">Error loading channels!</p>';
        });

    // ক্যাটাগরি বাটন তৈরি করার ফাংশন
    function renderCategories(categories) {
        categoryContainer.innerHTML = '';
        categories.forEach((cat, index) => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            if (index === 0) button.classList.add('active'); // 'All' বাটন ডিফল্ট সক্রিয় থাকবে
            button.innerText = cat;
            
            button.addEventListener('click', () => {
                // একটিভ ক্লাস টগল করা
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // ফিল্টারিং লজিক
                if (cat === 'All') {
                    displayChannels(allChannels);
                } else {
                    const filtered = allChannels.filter(ch => ch.category === cat);
                    displayChannels(filtered);
                }
            });

            categoryContainer.appendChild(button);
        });
    }

    // চ্যালেন লিস্ট দেখানোর ফাংশন
    function displayChannels(channels) {
        channelContainer.innerHTML = '';
        if (channels.length === 0) {
            channelContainer.innerHTML = '<p style="color:#777; font-size:12px; padding:15px;">No channels found.</p>';
            return;
        }

        channels.forEach(channel => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="${channel.url}" target="player">
                    <img src="${channel.image}" alt="${channel.name}">
                </a>
            `;
            channelContainer.appendChild(li);
        });
    }
});

// রাইট ক্লিক বন্ধ করার অপশন
function disableClick() {
    document.oncontextmenu = function() { return false; };
}
