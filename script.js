document.addEventListener('DOMContentLoaded', function() {
    const channelContainer = document.getElementById('channel-container');
    const categoryContainer = document.getElementById('category-container');
    let allChannels = [];

    // JSON ফাইল থেকে ডাটা লোড করা
    fetch('playlist.json')
        .then(response => response.json())
        .then(data => {
            allChannels = data;
            
            // ১. ইউনিক ক্যাটাগরি বের করা এবং 'All' যোগ করা
            const categories = ['All'];
            data.forEach(channel => {
                if (channel.category && !categories.includes(channel.category)) {
                    categories.push(channel.category);
                }
            });

            // ২. প্লেয়ারের নিচে ক্যাটাগরি বাটন তৈরি করা
            renderCategories(categories);

            // ৩. প্রথমবার সব চ্যানেল দেখানো
            displayChannels(allChannels);
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            channelContainer.innerHTML = '<p style="color:#ff4444; font-size:12px; padding:10px;">Error loading channels!</p>';
        });

    // ক্যাটাগরি বাটন রেন্ডার করার ফাংশন
    function renderCategories(categories) {
        categoryContainer.innerHTML = '';
        categories.forEach((cat, index) => {
            const button = document.createElement('button');
            button.className = 'category-btn';
            if (index === 0) button.classList.add('active'); // ডিফল্ট 'All' একটিভ থাকবে
            button.innerText = cat;
            
            button.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

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

    // চ্যালেন লিস্ট শো করার ফাংশન (আপনার ওরিজিনাল ওনক্লিক মেথডসহ)
    function displayChannels(channels) {
        channelContainer.innerHTML = '';
        if (channels.length === 0) {
            channelContainer.innerHTML = '<p style="color:#777; font-size:12px; padding:15px; text-align:center;">No channels available.</p>';
            return;
        }

        channels.forEach(channel => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="javascript:void(0);" onclick="player.location.href='${channel.url}'">
                    <img src="${channel.image}" alt="${channel.name}">
                </a>
            `;
            channelContainer.appendChild(li);
        });
    }
});

// রাইট ক্লিক প্রটেকশন
document.addEventListener('contextmenu', event => event.preventDefault());
