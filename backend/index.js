const express = require('express')
const app = express()
const http = require('http').Server(app)
const request = require('request')
const path = require('path')
const io = require('socket.io')(http)

app.use('/', express.static(path.join(__dirname, '..', 'frontend')))

app.get('/earth', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'frontend', 'earth.html'));
})

app.get('/report', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'frontend', 'complain.html'));
})

app.get('/news', function(req, res) {
	res.sendFile(path.join(__dirname, '..', 'frontend', 'more_info.html'));
})

app.get('/api/:lat/:long', function(req, res) {
	var API_ENDPOINT = 'http://ws.geonames.org/countryCodeJSON?lat=' + req.params.lat + '&lng=' + req.params.long + '&username=demo'

	request(API_ENDPOINT, function(error, response, body) {
		res.send(body)
	})
})

app.get('/reset', function(req, res) {
	events = []
	res.send('ok')
})

io.on('connection', function(socket) {
	console.log('A user connected')

	// fakeMachine()

	socket.on('msg', function(msg) {
		io.emit('alert', msg)
		addToEvents(msg)
	})
})

function fakeMachine() {
	setInterval(function() {
		var disasters = ['Tornado', 'Hurricane', 'Earthquake', 'Tsunami', 'Fire', 'Flood']
		var fake = [{
				name: 'name',
				value: 'Bob'
			},
			{
				name: 'report',
				value: disasters[Math.floor(Math.random() * disasters.length)]
			},
			{
				name: 'location',
				value: getRandomInt(-65, 65) + ',' + getRandomInt(-145, 145)
			}
		]

		io.emit('alert', fake)
		addToEvents(fake)
	}, 8000)
}

var port = process.env.PORT || 3000
http.listen(port, function() {
	console.log('Listening on port ' + port)
})

var events = []

function addToEvents(msg) {
	if (events.length > 1000) {
		events = events.slice(500, events.length - 2)
	}
	var data = {}
	for (var i = 0; i < msg.length; i++) {
		data[msg[i].name] = msg[i].value
	}

	var location = data.location.split(',')
	events.push(location)

	if (events.length < 5) {
		return
	}

	var totalDist = []
	for (var i = 0; i < events.length - 1; i++) {
		totalDist.push(latToDistance(
			events[i][0],
			events[i][1],
			location[0],
			location[1]
		))
	}

	totalDist.sort(function(a, b) {
		return a - b
	})
	var starDist = (totalDist[0] + totalDist[1] + totalDist[2] + totalDist[3] + totalDist[4]) / 5

	if (starDist < 150) {
		io.emit('super-alert', msg)
	}

	totalDist /= (events.length - 1)
}

function latToDistance(lat1, lon1, lat2, lon2) {
	var radlat1 = Math.PI * lat1 / 180
	var radlat2 = Math.PI * lat2 / 180
	var theta = lon1 - lon2
	var radtheta = Math.PI * theta / 180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
	dist = Math.acos(dist)
	dist = dist * 180 / Math.PI
	dist = dist * 60 * 1.1515
	return dist
}

function getRandomInt(min, max) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(Math.random() * (max - min)) + min // The maximum is exclusive and the minimum is inclusive
}
