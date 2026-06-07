const container =
document.getElementById("channel-container");

function renderChannels(list){

container.innerHTML="";

list.forEach(channel=>{

const li =
document.createElement("li");

li.dataset.category =
channel.category;

li.innerHTML=`
<img
src="${channel.logo}"
class="channel-logo">

<span>${channel.name}</span>
`;

li.onclick=()=>{

document
.querySelectorAll("#channel-container li")
.forEach(i=>i.classList.remove("channel-active"));

li.classList.add("channel-active");

document
.getElementById("tv-player-iframe")
.src=
`channel.html?url=${encodeURIComponent(channel.url)}`;

};

container.appendChild(li);

});

}

renderChannels(channels);

function filterCategory(category,btn){

document
.querySelectorAll(".category-bar button")
.forEach(b=>b.classList.remove("active"));

btn.classList.add("active");

const filtered=
category==="All"
? channels
: channels.filter(
c=>c.category===category
);

renderChannels(filtered);

}

document
.getElementById("channelSearch")
.addEventListener("input",function(){

const value=
this.value.toLowerCase();

renderChannels(

channels.filter(c=>
c.name
.toLowerCase()
.includes(value)
)

);

});
