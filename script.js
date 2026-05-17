const cardContainer = document.querySelectorAll(".card-container")[0]
const owaspContainer = document.querySelector("#owasp .owasp-container")
const search = document.querySelector(".search")
const input = document.querySelector("#search")
const navLinks = document.querySelector(".nav-links")
const navlist = document.querySelector(".nav-list")
const reportContainer = document.querySelector(".vulns-list")
const imageRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/i;
const pRegex = /<p[^>]*>([^<]*)<\/p>/i
const hackersList = document.querySelector("#hackers-list")
let title = "";
let imageUrl = "";
let readMore = "";
let newsContent = "";
let searchQuery = "";
let rotate = 0;
let view = false


async function fetchFeedData() {
    const response = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Ffeeds.feedburner.com%2FTheHackersNews")
    if (response.status == 200) {
        const data = await response.json();
        data.items = data.items.slice(0, 8)
        data.items.forEach(element => {
            const date = new Date(element.pubDate).toLocaleDateString('en-us', {
                year: "numeric",
                month: "short",
                day: "2-digit"
            })
            newsContent = element.content
            title = element.title;
            readMore = element.link;
            if (element.enclosure && element.enclosure.link) {
                imageUrl = element.enclosure.link;
            } else {

                imageUrl = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80';
            }

            cardContainer.innerHTML += `
            <div class="card">
                <img src="${imageUrl}" loading="lazy">
                <div class="card-info">
                    <h3>${title}</h3>
                    <p>${newsContent}</p>
                    <div class="date">${date}</div> 
                    <a href="${readMore}" target="_blank" class="read-more">read more</a>
                </div>
            </div>
            `
        });
    }
}
async function fetchOwaspData() {
    let id = "";
    let examples = "";
    let description = "";
    const response = await fetch("owasp_top_10_2021.json")
    if (response.status === 200) {
        const data = await response.json();
        let counter = 0;
        data.forEach(element => {
            counter++
            title = element.name;
            id = element.id;
            examples = element.examples;
            description = element.description;
            owaspContainer.innerHTML += `
            <div class="card">
                <div class="card-info">
                    <h3>${counter}. ${title} <br>id: ${id}</h3>
                    <p>${description}</p>
                    <p>examples: <br>${examples}</p>
                </div>
            </div>
            `
        })

    }
}
async function fetchNistData(keyword = "") {
    reportContainer.innerHTML = ""
    const response = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2Ftag%2Fbug-bounty")
    if (response.status == 200) {

        const data = await response.json();
        let reports = [];
        data.items.forEach(element => {
            const author = element.author
            if (keyword != "") {
                if (element.categories.some(category => category.toLowerCase().includes(keyword.toLowerCase()))) {
                    const pMatch = element.description.match(pRegex)
                    newsContent = pMatch ? pMatch[1] : "open to see";
                    const match = element.description.match(imageRegex);
                    imageUrl = match ? match[1] : "https://placehold.co/600x400/1e1e1e/fff?text=Bug+Bounty+Report"
                    title = element.title
                    date = new Date(element.pubDate).toLocaleDateString('en-us', {
                        year: "numeric",
                        month: "short",
                        day: "2-digit"
                    })
                    readMore = element.link


                } else {

                    return;
                }

            } else {


                const pMatch = element.description.match(pRegex)
                newsContent = pMatch ? pMatch[1] : "open to see";
                const match = element.description.match(imageRegex);

                imageUrl = match ? match[1] : "https://placehold.co/600x400/1e1e1e/fff?text=Bug+Bounty+Report"
                title = element.title
                date = new Date(element.pubDate).toLocaleDateString('en-us', {
                    year: "numeric",
                    month: "short",
                    day: "2-digit"
                })
                readMore = element.link
            }
            console.log(element.categories)
            reportContainer.innerHTML += `
                    
            <div class="card">
                <img src="${imageUrl}" loading="lazy">
                <div class="card-info">
                <h2>author: ${author}</h2>
                    <h3>${title}</h3>
                    <p>${newsContent}</p>
                    <div class="date">${date}</div> 
                    <a href="${readMore}" target="_blank" class="read-more">read more</a>
                </div>
            </div>
            `
        })
    }
    if (reportContainer.innerHTML == "") {
        reportContainer.innerHTML = `
                    <div class="not-found">result not found</div>
                    `
    }

}
async function fetchHoF() {
    const response = await fetch("globalRanking.json");
    const data = await response.json()
    data["2026"].forEach((element, index) => {
        const teamName = element.team_name
        const points = element.points
        const teamId = element.team_id
        const rank = index + 1
        hackersList.innerHTML += `<tr>
            <td>${rank}</td>
            <td>${teamName}</td>
            <td>${points}</td>
            <td>${teamId}</td>

        </tr>`
    })



}

function callData() {
    fetchFeedData();
    fetchOwaspData();
    fetchNistData();
    fetchHoF();
}
navlist.onclick = () => {
    rotate += 90
    rotate = rotate == 90 ? 90 : rotate % 90
    navlist.style.transform = `rotate(${rotate}deg)`
    view = !view
    navLinks.style.width = view ? "250px" : "0px"
}
navLinks.addEventListener("click", () => {
    if (view) {
        navLinks.style.width = "0px";
        rotate += 90
        rotate = rotate === 90 ? 90 : rotate % 90
        navlist.style.transform = `rotate(${rotate}deg)`
        view = !view
    }
})

window.onload = callData
search.onclick = () => {
    searchQuery = input.value;
    fetchNistData(searchQuery)
};