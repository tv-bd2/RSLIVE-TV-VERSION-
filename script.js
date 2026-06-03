// 📋 চ্যানেল ডাটাবেস (আপনার প্রয়োজন অনুযায়ী চ্যানেল এবং সোর্স লিঙ্ক আপডেট করে নিবেন)
const channels = [
    { name: "Sony Sports Ten 1 HD", category: "Sports", id: "sony_sports_1", src: "https://example.com/stream1" },
    { name: "Star Sports Select 1", category: "Sports", id: "star_sports", src: "https://example.com/stream2" },
    { name: "Somoy TV Live", category: "News", id: "somoy_tv", src: "https://example.com/stream3" },
    { name: "Jamuna Television", category: "News", id: "jamuna_tv", src: "https://example.com/stream4" },
    { name: "Zee Bangla HD", category: "Entertainment", id: "zee_bangla", src: "https://example.com/stream5" },
    { name: "Star Jalsha Entertainment", category: "Entertainment", id: "star_jalsha", src: "https://example.com/stream6" },
    { name: "HBO Premium Movies", category: "Movies", id: "hbo", src: "https://example.com/stream7" },
    { name: "Sony Pix Action HD", category: "Movies", id: "sony_pix", src: "https://example.com/stream8" }
];

// 🚀 পেজ লোড হওয়ার সাথে সাথে চ্যানেল লিস্ট জেনারেট করা
document.addEventListener("DOMContentLoaded", () => {
    generateChannelList(channels);
});

// 📺 চ্যানেল লিস্ট ডাইনামিকালি তৈরি করার ফাংশন
function generateChannelList(channelArray) {
    const container = document.getElementById("channel-container");
    if (!container) return;

    container.innerHTML = ""; // আগের লিস্ট ক্লিয়ার করা

    channelArray.forEach((channel) => {
        const li = document.createElement("li");
        li.setAttribute("data-category", channel.category);
        li.setAttribute("tabindex", "0"); // রিমোট বা কিবোর্ড নেভিগেশনের জন্য
        
        /* 
           💡 CSS ইনলাইন স্টাইল দিয়ে নামগুলোকে ১ লাইনে ফিক্সড করা হয়েছে। 
           নাম বেশি বড় হলে যেন ভেঙে নিচে না যায়, বরং শেষে সুন্দর করে '...' দেখায়।
        */
        li.innerHTML = `
            <div class="channel-card-item" onclick="playChannel('${channel.src}')" style="display: flex; flex-direction: column; gap: 4px; padding: 8px; background: #111116; border-radius: 6px; margin-bottom: 6px; cursor: pointer; border: 1px solid rgba(255,255,255,0.02);">
                <span class="channel-name-text" style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; font-size: 12px; font-weight: 600; width: 100%;">
                    ${channel.name}
                </span>
                <span class="badge-category" style="font-size: 9px; color: #00f0ff; opacity: 0.7; font-weight: bold; text-transform: uppercase;">
                    ${channel.category}
                </span>
            </div>
        `;
        
        container.appendChild(li);
    });
}

// 🎬 ভিডিও প্লেয়ারে চ্যানেল প্লে করার আল্ট্রা-স্মুথ ফাংশন (জিরো ঝাঁকি প্রোটেকশন)
function playChannel(streamUrl) {
    const iframe = document.getElementById("tv-player-iframe");
    if (!iframe) return;

    // 🔒 স্ক্রোল পজিশন লক রাখা হলো যেন এক পিক্সেলও পেজ না লাফায়
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // আইফ্রেমে সোর্স পাস করা
    iframe.src = `channel.html?id=${encodeURIComponent(streamUrl)}`;

    // ক্লিক করার পর স্ক্রোল পজিশন আগের জায়গায় লক করে রাখা
    setTimeout(() => {
        window.scrollTo(scrollX, scrollY);
    }, 0);
}
