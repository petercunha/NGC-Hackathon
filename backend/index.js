const express = require('express')
const app = express()
const http = require('http').Server(app)
const path = require('path')
const io = require('socket.io')(http)

app.use('/', express.static(path.join(__dirname, '..', 'frontend')))

io.on('connection', function(socket) {
	console.log('A user connected')

	// setInterval(function() {
	// 	var fake = [{
	// 			name: 'name',
	// 			value: 'Bob'
	// 		},
	// 		{
	// 			name: 'report',
	// 			value: 'Tornado'
	// 		},
	// 		{
	// 			name: 'location',
	// 			value: getRandomInt(-75, 75) + ',' + getRandomInt(-175, 175)
	// 		}
	// 	]
  //
  //   io.emit('alert', fake)
  //   addToEvents(fake)
  //
  //   console.log("adding: " + fake);
	// }, 250);

	socket.on('msg', function(msg) {
		console.log(msg);
		io.emit('alert', msg)
		addToEvents(msg)
	})
})

http.listen(3000, function() {
	console.log('listening on *:3000')
})

var events = []

function addToEvents(msg) {
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
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
