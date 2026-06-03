// 📥 playlist.json থেকে ডাটা ফেচ করে চ্যানেল তৈরি করার স্ক্রিপ্ট
document.addEventListener("DOMContentLoaded", function () {
    const channelContainer = document.getElementById("channel-container");

    // প্লেলিস্ট ডট জেফন ফাইল রিড করা
    fetch("playlist.json")
        .then(response => response.json())
        .then(data => {
            channelContainer.innerHTML = ""; // আগের ডামি কন্টেন্ট ক্লিয়ার

            data.forEach((channel, index) => {
                const li = document.createElement("li");
                
                // 🎮 স্মার্ট টিভির জন্য ফোকাস ট্যাব ইনডেক্স
                li.tabIndex = 0; 
                
                // 🏷️ ক্যাটাগরি ফিল্টার করার জন্য ডাটা এট্রিবিউট সেট (সবচেয়ে গুরুত্বপূর্ণ লাইন)
                const channelCategory = channel.category ? channel.category : "All";
                li.setAttribute("data-category", channelCategory);

                // প্রথম চ্যানেলটিকে বাই-ডিফল্ট একটিভ ক্লাস দেওয়া
                if (index === 0) {
                    li.className = "active";
                }

                // চ্যানেল কার্ডের ডিজাইন লেআউট জেনারেশন
                li.innerHTML = `
                    <div class="channel-card-wrapper">
                        <img src="${channel.image}" alt="${channel.name}" onerror="this.src='https://i.postimg.cc/mD1VCt2C/RS-Live.png'">
                        <div class="channel-details">
                            <span class="ch-name">${channel.name}</span>
                            <span class="ch-cat-badge">${channelCategory}</span>
                        </div>
                    </div>
                `;

                // চ্যানেল কার্ডে ক্লিক করলে প্লেয়ার আইফ্রেমে সোর্স চেঞ্জ হওয়া
                li.addEventListener("click", function () {
                    // একটিভ ক্লাস অদলবদল
                    document.querySelectorAll("#channel-container li").forEach(item => item.classList.remove("active"));
                    li.classList.add("active");

                    // আইফ্রেম প্লেয়ার আপডেট
                    const playerIframe = document.getElementById("tv-player-iframe");
                    if (playerIframe) {
                        playerIframe.src = channel.url;
                    }
                });

                channelContainer.appendChild(li);
            });

            // চ্যানেল লোড শেষ হওয়ার পর যদি ক্যাটাগরি স্ক্রিপ্ট থাকে তবে তা ইনিশিয়াল সিঙ্ক করা
            if (typeof applyInstantChannelFilter === "function") {
                applyInstantChannelFilter();
            }
        })
        .catch(error => console.error("Error loading playlist:", error));
});
