let allChannels = []; // সমস্ত চ্যানেল ডাটা রাখার জন্য গ্লোবাল ভেরিয়েবল
let currentFocusIndex = -1; // রিমোট কন্ট্রোল ফোকাস ট্র্যাকিং

document.addEventListener('DOMContentLoaded', function() {
    // JSON ফাইল থেকে চ্যানেল লোড করা
    fetch('playlist.json')
        .then(response => response.json())
        .then(data => {
            allChannels = data;
            displayChannels(allChannels); // শুরুতে সব চ্যানেল দেখাবে
            setupRemoteControl(); // রিমোট কন্ট্রোল অ্যাক্টিভেট করা
        })
        .catch(error => {
            console.error('Error loading playlist:', error);
            const container = document.getElementById('channel-container');
            if(container) container.innerHTML = '<p style="color:red; font-size:12px; text-align:center;">Error loading channels!</p>';
        });
});

// চ্যানেলগুলো স্ক্রিনে রেন্ডার করার ফাংশন
function displayChannels(channels) {
    const container = document.getElementById('channel-container');
    container.innerHTML = ''; // আগের লিস্ট ক্লিয়ার করা
    currentFocusIndex = -1; // ফোকাস ইনডেক্স রিসেট

    if(channels.length === 0) {
        container.innerHTML = '<p style="color:#777; font-size:12px; text-align:center; padding-top:20px;">No channels found in this category</p>';
        return;
    }

    channels.forEach((channel, index) => {
        const li = document.createElement('li');
        li.style.listStyle = "none";
        li.style.marginBottom = "15px";

        // প্রতিটি লিংকে ট্যাব ইনডেক্স ও অনক্লিক ইভেন্টসহ ৩ নম্বর পয়েন্ট (লোগোর নিচে নাম) ডিজাইন করা হয়েছে
        li.innerHTML = `
            <a href="${channel.url}" target="player" class="channel-item" data-index="${index}" tabindex="0">
                <img src="${channel.image}" alt="${channel.name}" style="width:100%; height:auto; border-radius:5px; display:block;">
                <span class="channel-name">${channel.name}</span>
            </a>
        `;
        container.appendChild(li);
    });
}

// ১. ক্যাটাগরি ফিল্টার করার ফাংশন
function filterCategory(categoryName) {
    // অ্যাক্টিভ বাটন স্টাইল পরিবর্তন
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const event = window.event;
    if(event && event.target) {
        event.target.classList.add('active');
    }

    if (categoryName === 'All') {
        displayChannels(allChannels);
    } else {
        const filtered = allChannels.filter(channel => channel.category === categoryName);
        displayChannels(filtered);
    }
}

// ২. রিমোট কন্ট্রোল (টিভি বক্স / কিবোর্ড) হ্যান্ডলার ফাংশন
function setupRemoteControl() {
    document.addEventListener('keydown', function(e) {
        const visibleChannels = document.querySelectorAll('.channel-item');
        if (visibleChannels.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocusIndex++;
            if (currentFocusIndex >= visibleChannels.length) currentFocusIndex = 0; // শেষে গেলে আবার প্রথমে আসবে
            updateRemoteFocus(visibleChannels);
        } 
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocusIndex--;
            if (currentFocusIndex < 0) currentFocusIndex = visibleChannels.length - 1; // প্রথমে থাকলে শেষে যাবে
            updateRemoteFocus(visibleChannels);
        } 
        else if (e.key === 'Enter') {
            if (currentFocusIndex >= 0 && currentFocusIndex < visibleChannels.length) {
                e.preventDefault();
                visibleChannels[currentFocusIndex].click(); // ফোকাসড চ্যানেলটি প্লে করবে
            }
        }
    });
}

// রিমোট দিয়ে সিলেক্ট করলে স্ক্রল ও ফোকাস ক্লাস ম্যানেজ করার ফাংশন
function updateRemoteFocus(elements) {
    elements.forEach(el => el.classList.remove('remote-focus'));
    
    if (currentFocusIndex >= 0 && elements[currentFocusIndex]) {
        const activeEl = elements[currentFocusIndex];
        activeEl.classList.add('remote-focus');
        activeEl.focus(); // টিভি ব্রাউজারের অটো-ফোকাস নিশ্চিত করা
        
        // রিমোট দিয়ে নিচে বা উপরে গেলে চ্যানেল লিস্ট স্ক্রল হবে স্বয়ংক্রিয়ভাবে
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// রাইট ক্লিক বন্ধ করার ফাংশন
function disableClick() {
    document.oncontextmenu = function() { return false; };
}
