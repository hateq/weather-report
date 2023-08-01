const input = document.querySelector('.input');
const form = document.querySelector('.form');
const btn = document.querySelector('.button');
const header = document.querySelector('.header');
const img = document.querySelector('.card-img');
const title = document.querySelector('.title');
const tempSwitch = document.querySelector('.temp-switch');
const langSwitch = document.querySelector('.lang-switch');
const card = document.querySelector('.card');
const apiKey = 'a2f79bd9793f4f44b32105229233007';
let temp = 'C';
let currentTemperature = '';
let lang = 'ru';
let condText = '';
let city;
function showUserCard () {
	navigator.geolocation.getCurrentPosition(async (position) => {
		const {latitude, longitude} = position.coords;
		const geoApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
		const response = await fetch(geoApiUrl);
		const data = await response.json();
		let userCity = data.city;
	const urlCity = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${userCity}`;
			const result = await fetch(urlCity);
			const userData = await result.json();
			showCard(userData);
			const prevCard = document.querySelector('.card');
			if (prevCard) prevCard.remove();
	})
}
document.querySelectorAll('.switch').forEach(item => {
	item.addEventListener('click', () => {
		item.classList.toggle('selected');
		if(tempSwitch.classList.contains('selected')) {
			temp = 'F';
		} else {
			temp = 'C';
		}
		if (langSwitch.classList.contains('selected')) {
			lang = 'en';
			title.innerText = 'Weather Report';
			input.setAttribute('placeholder', 'Enter the name of the city');
			btn.innerText = 'Show';
			card.innerText = 'Allow access to location to see weather report of your city'
		} else {
			lang = 'ru';
			title.innerText = 'Прогноз погоды';
			input.setAttribute('placeholder', 'Введите название городa');
			btn.innerText = 'Показать';
			card.innerText = 'Разрешите доступ к местоположению чтобы увидеть погоду в вашем городе';
		}
	})
})
function removeCard () {
	const prevCard = document.querySelector('.card');
	if (prevCard) prevCard.remove();
}
async function getConditions (data) {
	const info = conditions.find((el) => {
		if (el.code == data.current.condition.code) {
			return true;
		}
	})
	return info;
}
async function setConditions (data) {
	const info = await getConditions(data);
	if (data.current.is_day == 1 && lang == 'ru') {
		condText = info.languages[23].day_text;
	} else if (data.current.is_day == 0 && lang == 'ru') {
		condText = info.languages[23].night_text;
	}
	else if (data.current.is_day == 1 && lang == 'en') {
		condText = info.day;
	}
	else if (data.current.is_day == 0 && lang == 'en') {
		condText = info.night;
	}
	return condText;
}
async function setImage (data) {
	const info = await getConditions(data);
	let currentImg = '';
	if (data.current.is_day == 1) {
		currentImg = `day/${info.day}.png`;
	} else if (data.current.is_day == 0) {
		currentImg = `night/${info.night}.png`;
	}
	return currentImg;
}

async function showCard (data) {
	const realText = await setConditions(data);
	const currentImg = await setImage(data);
	if (temp == 'C') {
		currentTemperature = data.current.temp_c.toFixed();
	} else if (temp == 'F') {
		currentTemperature = data.current.temp_f.toFixed();
	}
	const html =`<div class="card">
		<h2 class="card-city">
			${data.location.name} <span>${data.location.country}</span>
		</h2>
		<div class="card-weather">
			<h3 class="card-value">${currentTemperature} <sup>°${temp}</sup></h3>
			<img class='card-img' src="images/${currentImg}" alt="Weather">
		</div>
		<h3 class="card-discription">${realText}</h3>
	</div>`
	header.insertAdjacentHTML('afterend', html);
}
function showError(errorMessage) {
	const html = `<div class="card">${errorMessage.error.message}</div>`;
			header.insertAdjacentHTML('afterend', html);
}
showUserCard();
form.addEventListener('submit', async (event) => {
	event.preventDefault();
	async function getweather() {
		const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
		const response = await fetch(url);
		const data = await response.json();
		return data;
	}
	city = input.value.trim();
	const data = await getweather(city);
	if (data.error) {
		removeCard();
		showError	(data);
	} else {
		removeCard();
		showCard(data);
	}
})