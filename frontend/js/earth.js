// Setup globe options
var options = {
  sky: true,
  center: [39.281347, -101.263108],
  zoom: 2.5
}

var panning = false
var spinEnalbled = true

// Enable socket.io
var socket = io()

// Generate the globe
var earth = WE.map('earth_div', options)
var naturalSkinEnabled = true
initialize()

// Toggle globe skin
$('#toggleSkinBtn').click(function () {
  naturalSkinEnabled = !naturalSkinEnabled

  if (naturalSkinEnabled) {
    enableNaturalSkin()
  } else {
    enableCountrySkin()
  }
})

// Toggle globe spin
$('#toggleSpinBtn').click(function () {
  spinEnalbled = !spinEnalbled
})

// Reset tilt button
$('#resetTiltBtn').click(function () {
	earth.setTilt(90)
})

function initialize () {
	// Hard Coded Event

	// addMajorEvent(
	// 	[39.281347, -101.263108],
	// 	"<b>Fire</b><a href='https://news.google.com/news/search/section/q/fire/fire?hl=en&ned=us'> More information </a>"
	// )

	// end hard coded event

	// Globe skin
  enableNaturalSkin()

	// Start a simple rotation animation
  var before = null
  requestAnimationFrame(function animate (now) {
    if (!spinEnalbled) {
      var ticker = setTimeout(function () {
        before = null
        requestAnimationFrame(animate)
        ticker = null
      }, 150)
    } else {
      if (panning) {
        var ticker = setTimeout(function () {
          before = null
          requestAnimationFrame(animate)
          ticker = null
        }, 5200)
      } else {
        var c = earth.getPosition()
        var elapsed = before ? now - before : 0
        before = now
        earth.setCenter([c[0], c[1] + 0.07 * (elapsed / 30)])
        requestAnimationFrame(animate)
      }
    }
  })

	// Remove unwanted text
  $('.cesium-credit-textContainer').remove()
}

function enableNaturalSkin () {
	// Shows natural earth picture
  WE.tileLayer('https://tileserver.maptiler.com/nasa/{z}/{x}/{y}.jpg', {
    minZoom: 0,
    maxZoom: 5,
    attribution: 'NASA'
  }).addTo(earth)
}

function enableCountrySkin () {
	// Shows countries
  WE.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 0,
    maxZoom: 5,
    attribution: 'NASA'
  }).addTo(earth)
}

// Triggers polygon draw
function addMinorEvent (location) {
  var polygonB = WE.polygon([
    location
  ], {
    color: '#000000',
    opacity: 1,
    fillColor: '#000000',
    fillOpacity: 0,
    editable: true,
    weight: 10
  }).addTo(earth)
}

// Triggers popup tooltip with message
function addMajorEvent (location, message) {
	// Pan to event
  earth.panTo(location, 1)
  panning = true

  var timer = setTimeout(function () {
    panning = false
    timer = null
  }, 5000)

  var marker = WE.marker(location).addTo(earth)
  marker.bindPopup(message, {
    maxWidth: 300,
    closeButton: true
  }).openPopup()
}

function addToDisasterLog (msg) {
  $('#disasterLog').prepend(msg)
}

function locationToCountry (location, callback) {
  $.get('/api/' + location[0] + '/' + location[1], function (data, status) {
    var country = JSON.parse(data).countryName
		// if (!country || country == "undefined") {
		// 	var random = ["Europe", "Asia", "North America", "South America", "Africa"]
		// 	callback(random[Math.floor(Math.random()*random.length)]);
		// } else {
		// console.log(country);
    callback(country)
		// }
  })
}

socket.on('super-alert', function (msg) {
	console.log("Super alert");
  var data = {}
  for (var i = 0; i < msg.length; i++) {
    data[msg[i].name] = msg[i].value
  }
  locationToCountry(data.location.split(','), function (country) {

    if (country && country != 'undefined') {
			var eventMsg = '<b>Critical Alert from ' + country + '</b><br>Possible ' + data.report + "<br />" +
			"<span style='font-size:10px;color:#999'>Multiple reports recieved from this area</span><br />" +
			"<a target='_blank' href='https://www.redcross.org/donate/donation'><b>Donate</b></a><br />" +
			"<a target='_blank' href='https://news.google.com/news/search/section/q/fire/fire?hl=en&ned=us'><b>News feed</b></a>";

      addToDisasterLog('CRITICAL DISASTER in ' + country + '\n')
      addMajorEvent(data.location.split(','), eventMsg)
    } else {
			var eventMsg = '<b>Critical Alert from North America</b><br>Possible ' + data.report + "<br />" +
			"<span style='font-size:10px;color:#999'>Multiple reports recieved from this area</span><br />" +
			"<a target='_blank' href='https://www.redcross.org/donate/donation'><b>Donate</b></a><br />" +
			"<a target='_blank' href='https://news.google.com/news/search/section/q/fire/fire?hl=en&ned=us'><b>News feed</b></a>";

			addToDisasterLog('CRITICAL DISASTER in North America\n')
      addMajorEvent(data.location.split(','), eventMsg)
		}
  })
})

socket.on('alert', function (msg) {
	console.log("Alert");

  var data = {}
  for (var i = 0; i < msg.length; i++) {
    data[msg[i].name] = msg[i].value
  }
  locationToCountry(data.location.split(','), function (country) {
    if (country && country != 'undefined') {
      addToDisasterLog(data.report + ' reported in ' + country + '\n')
      addMinorEvent(data.location.split(','))
    } else {
			addToDisasterLog(data.report + ' reported in North America\n')
      addMinorEvent(data.location.split(','))
		}
  })
})
