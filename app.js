fetch("data.json")
.then(r => r.json())
.then(data => {

  document.getElementById("updated").innerText =
    `Atualizado: ${data.updated}`;

  const marketContainer =
    document.getElementById("markets");

  data.markets.forEach(item => {
    marketContainer.innerHTML += `
      <div class="card">
        <h3>${item.name}</h3>
        <div class="value">${item.value}</div>
      </div>
    `;
  });

  const news =
    document.getElementById("news");

  data.news.forEach(item => {
    news.innerHTML += `
      <div class="news-item">
        <h3>${item.title}</h3>
        <p>${item.text}</p>
      </div>
    `;
  });

  const fear =
    document.getElementById("fearValue");

  if(fear && data.fearGreed){
    fear.innerHTML =
      `<div class="card">
         <div class="value">
           ${data.fearGreed}
         </div>
       </div>`;
  }
});
