// Setup globe options
var options = {
	sky: true,
	center: [39.281347, -101.263108],
	zoom: 2.5
}

// Generate the globe
var earth = new WE.map('earth_div', options)
var naturalSkinEnabled = true
initialize()

// Toggle globe skin
$('#toggleSkinBtn').click(function() {
	naturalSkinEnabled = !naturalSkinEnabled

	if (naturalSkinEnabled) {
		enableNaturalSkin()
	} else {
		enableCountrySkin()
	}
})

function initialize() {
	// Generate marker on the globe

	addMajorEvent(
    [39.281347, -101.263108],
    "<b>Hey!</b><br>A disaster occurred here.<br /><span style='font-size:10px;color:#999'>Millions have died</span>"
  )

	addMinorEvent(
    [46.15700, 5.9765625]
  )

	// Globe skin
	enableNaturalSkin()

	// Start a simple rotation animation
	var before = null
	requestAnimationFrame(function animate(now) {
		var c = earth.getPosition()
		var elapsed = before ? now - before : 0
		before = now
		earth.setCenter([c[0], c[1] + 0.1 * (elapsed / 30)])
		requestAnimationFrame(animate)
	})

	// Remove unwanted text
	$('.cesium-credit-textContainer').remove()
}

function enableNaturalSkin() {
	// Shows natural earth picture
	WE.tileLayer('http://tileserver.maptiler.com/nasa/{z}/{x}/{y}.jpg', {
		minZoom: 0,
		maxZoom: 5,
		attribution: 'NASA'
	}).addTo(earth)
}

function enableCountrySkin() {
	// Shows countries
	WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		minZoom: 0,
		maxZoom: 5,
		attribution: 'NASA'
	}).addTo(earth)
}

// Triggers polygon draw
function addMinorEvent(location) {
	var polygonB = WE.polygon([
		location
	], {
		color: '#000000',
		opacity: 1,
		fillColor: '#000000',
		fillOpacity: 0,
		editable: true,
		weight: 10
	}).addTo(earth);
}

// Triggers popup tooltip with message
function addMajorEvent(location, message) {
	var marker = WE.marker(location).addTo(earth)
	marker.bindPopup(message, {
		maxWidth: 300,
		closeButton: true
	}).openPopup()
}
