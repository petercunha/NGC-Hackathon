// Setup globe options
var options = {
	sky: true,
	center: [39.281347, -101.263108],
	zoom: 2.5
}

var panning = false;

// Enable socket.io
var socket = io();

// Generate the globe
var earth = WE.map('earth_div', options)
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

	// Globe skin
	enableNaturalSkin()

	// Start a simple rotation animation
	var before = null
	requestAnimationFrame(function animate(now) {
		if (panning) {
			var ticker = setTimeout(function() {
				before = null;
				requestAnimationFrame(animate)
				ticker = null
			}, 5200);
		} else {
			var c = earth.getPosition()
			var elapsed = before ? now - before : 0
			before = now
			earth.setCenter([c[0], c[1] + 0.07 * (elapsed / 30)])
			requestAnimationFrame(animate)
		}
	})

	// Remove unwanted text
	$('.cesium-credit-textContainer').remove()
}

function enableNaturalSkin() {
	// Shows natural earth picture
	WE.tileLayer('https://tileserver.maptiler.com/nasa/{z}/{x}/{y}.jpg', {
		minZoom: 0,
		maxZoom: 5,
		attribution: 'NASA'
	}).addTo(earth)
}

function enableCountrySkin() {
	// Shows countries
	WE.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

	// Pan to event
	earth.panTo(location, 1)
	panning = true;

	var timer = setTimeout(function() {
		panning = false;
		timer = null;
	}, 5000);

	var marker = WE.marker(location).addTo(earth)
	marker.bindPopup(message, {
		maxWidth: 300,
		closeButton: true
	}).openPopup()
}

function locationToCountry(location, callback) {
  console.log(location[0] + " and long " + location[1]);
  $.get("https://ws.geonames.org/countryCodeJSON?lat=" + location[0] + "&lng=" + location[1] + "&username=demo", function(data, status) {
    console.log(data);
    callback(data.countryName);
  });
}

socket.on('super-alert', function(msg) {
	var data = {};
	console.log(msg);
	for (var i = 0; i < msg.length; i++) {
		data[msg[i].name] = msg[i].value;
	}
  locationToCountry(data.location.split(','), function(country) {
    var eventMsg = "<b>Critical Alert from " + country + "</b><br>Possible " + data.report + "<br /><span style='font-size:10px;color:#999'>Multiple reports recieved from this area</span>";
  	addMajorEvent(data.location.split(','), eventMsg);
  })
});

socket.on('alert', function(msg) {
	var data = {};
	for (var i = 0; i < msg.length; i++) {
		data[msg[i].name] = msg[i].value;
	}
	addMinorEvent(data.location.split(','));
});
