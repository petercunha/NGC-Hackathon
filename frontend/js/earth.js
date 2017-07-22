// Setup globe options
var options = {
	sky: true,
	center: [39.281347, -101.263108],
	zoom: 2.5
};

// Generate the globe
var earth = new WE.map('earth_div', options);

var naturalSkinEnabled = true;

// Toggle globe skin
$('#toggleSkinBtn').click(function() {
	naturalSkinEnabled = !naturalSkinEnabled

	if (naturalSkinEnabled) {
		enableNaturalSkin()
	} else {
		enableCountrySkin()
	}
});

function initialize() {
	// Generate marker on the globe
	var marker = WE.marker([39.281347, -101.263108]).addTo(earth);
	marker.bindPopup("<b>Hey!</b><br>A disaster occurred here.<br /><span style='font-size:10px;color:#999'>Millions have died</span>", {
		maxWidth: 300,
		closeButton: true
	}).openPopup();

	// Globe skin
	enableNaturalSkin();

	// Start a simple rotation animation
	var before = null;
	requestAnimationFrame(function animate(now) {
		var c = earth.getPosition();
		var elapsed = before ? now - before : 0;
		before = now;
		earth.setCenter([c[0], c[1] + 0.1 * (elapsed / 30)]);
		requestAnimationFrame(animate);
	});

	// Remove unwanted text
	$('.cesium-credit-textContainer').remove();
}

function enableNaturalSkin() {
	// Shows natural earth picture
	WE.tileLayer('http://tileserver.maptiler.com/nasa/{z}/{x}/{y}.jpg', {
		minZoom: 0,
		maxZoom: 5,
		attribution: 'NASA'
	}).addTo(earth);
}

function enableCountrySkin() {
	// Shows countries
	WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		minZoom: 0,
		maxZoom: 5,
		attribution: 'NASA'
	}).addTo(earth);
}
