/* E4 server.js */
'use strict';
const log = console.log;

// Express
const express = require('express')
const app = express();
const bodyParser = require('body-parser')
app.use(bodyParser.json());

// Mongo and Mongoose
const { ObjectID } = require('mongodb')
const { mongoose } = require('./db/mongoose');
const { Restaurant } = require('./models/restaurant')


/// Route for adding restaurant, with *no* reservations (an empty array).
/* 
Request body expects:
{
	"name": <restaurant name>
	"description": <restaurant description>
}
Returned JSON should be the database document added.
*/
// POST /restaurants
app.post('/restaurants', (req, res) => {

	// check mongoose connection established.
	if (mongoose.connection.readyState != 1) {
		res.status(500).send('Internal server error')
		return;
	} 
	
	// create new restaurant using mongoose model
	const restaurant = new Restaurant({
		name: req.body.name,
		description: req.body.description,
		reservations: []
	})

	// Save restaurant to the database
	restaurant.save().then((result) => {
		res.send(result)
	}).catch((error) => {
		res.status(400).send(error) // bad request sent to client
	})


})


/// Route for getting all restaurant information.
// GET /restaurants
app.get('/restaurants', (req, res) => {

	// check mongoose connection established.
	if (mongoose.connection.readyState != 1) {
		res.status(500).send('Internal server error')
		return;
	} 
	
	Restaurant.find().then((restaurants) => {
		res.send({restaurants})
	})
	.catch((error) => {
		res.status(500).send(error) // send Internal Server Error to server
	})

})


/// Route for getting information for one restaurant.
// GET /restaurants/id
app.get('/restaurants/:id', (req, res) => {
	
	const id = req.params.id

	// Validate id
	if (!ObjectID.isValid(id)) {
		// invalid id
		res.status(404).send('Resource not found')  
		return;
	}

	// check mongoose connection established.
	if (mongoose.connection.readyState != 1) {
		res.status(500).send('Internal server error')
		return;
	} 

	// find restaurant by id
	Restaurant.findById(id).then((restaurant) => {
		if (!restaurant) {
			res.status(404).send('Resource not found')
		} else{
			res.send(restaurant)
		}
	}).catch((error) => {
		res.status(500).send(error) // server error
	})

})


/// Route for adding reservation to a particular restaurant.
/* 
Request body expects:
{
	"time": <time>
	"people": <number of people>
}
*/
// Returned JSON should have the updated restaurant database 
//   document that the reservation was added to, AND the reservation subdocument:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// POST /restaurants/id
app.post('/restaurants/:id', (req, res) => {
	
	const id = req.params.id

	// Validate id in the beginning
	if (!ObjectID.isValid(id)) {
		// invalid id
		res.status(404).send('Resource not found')  
		return;
	}

	// check mongoose connection established.
	if (mongoose.connection.readyState != 1) {
		res.status(500).send('Internal server error')
		return;
	} 

	// create a reservation subdocument
	const reservation = {
		"time" : req.body.time,
		"people" : req.body.people
	}

	// find the restaurant w/ id and add reservation
	Restaurant.findById(id).then((reservedRest) => {
		if (!reservedRest) { // if not found
			res.status(404).send('Resource not found')
		} else{ 
			// add reservation to found restaurant
			reservedRest.reservations.push(reservation)
			// save the restaurant w/ resevation
			reservedRest.save()
			// update the restaurant database with style given above
			res.send({
				"reservation": reservation,
				"restaurant": reservedRest
			})
		}
	}).catch((error) => {
		res.status(500).send(error) // server error
	})

})


/// Route for getting information for one reservation of a restaurant (subdocument)
// GET /restaurants/id
app.get('/restaurants/:id/:resv_id', (req, res) => {
	
	const restaurant_id = req.params.id
	const reservation_id = req.params.resv_id

	// Validate rest_id in the beginning
	if (!ObjectID.isValid(restaurant_id)) {
		// invalid rest_id
		res.status(404).send('Resource not found')  
		return;
	}

	// check mongoose connection established.
	if (mongoose.connection.readyState != 1) {
		res.status(500).send('Internal server error')
		return;
	} 

	// find restaurant by id
	Restaurant.findById(restaurant_id).then((restaurant) => {
		if (!restaurant) {
			res.status(404).send('Resource not found')
		} else{
			// find reservation w/ reservation_id
			const reservation = restaurant.reservations.id(reservation_id)
			res.send(reservation)
		}
	}).catch((error) => {
		res.status(500).send(error) // server error
	})
	

})


/// Route for deleting reservation
// Returned JSON should have the updated restaurant database
//   document from which the reservation was deleted, AND the reservation subdocument deleted:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// DELETE restaurant/<restaurant_id>/<reservation_id>
app.delete('/restaurants/:id/:resv_id', (req, res) => {
	
	const restaurant_id = req.params.id
	const reservation_id = req.params.resv_id

	// Validate rest_id in the beginning
	if (!ObjectID.isValid(restaurant_id)) {
		// invalid rest_id
		res.status(404).send('Resource not found')  
		return;
	}

	// check mongoose connection established.
	if (mongoose.connection.readyState != 1) {
		log('Issue with mongoose connection')
		res.status(500).send('Internal server error')
		return;
	} 

	// find restaurant by id
	Restaurant.findById(restaurant_id).then((restaurant) => {
		if (!restaurant) {
			res.status(404).send('Resource not found')
		} else{
			// find reservation to remove
			const deleted = restaurant.reservations.id(reservation_id)
			// remove it
			restaurant.reservations.remove(reservation_id)
			// save and send 
			restaurant.save()
			res.send({"reservation": deleted, "restaurant": restaurant})
		}
	}).catch((error) => {
		//log("caught error")
		res.status(500).send(error) // server error
	})

})

/// Route for changing reservation information
/* 
Request body expects:
{
	"time": <time>
	"people": <number of people>
}
*/
// Returned JSON should have the updated restaurant database
//   document in which the reservation was changed, AND the reservation subdocument changed:
//   { "reservation": <reservation subdocument>, "restaurant": <entire restaurant document>}
// PATCH restaurant/<restaurant_id>/<reservation_id>
app.patch('/restaurants/:id/:resv_id', (req, res) => {
	
	const restaurant_id = req.params.id
	const reservation_id = req.params.resv_id

	// Validate rest_id in the beginning
	if (!ObjectID.isValid(restaurant_id)) {
		// invalid rest_id
		res.status(404).send('Resource not found')  
		return;
	}

	// check mongoose connection established.
	if (mongoose.connection.readyState != 1) {
		log('Issue with mongoose connection')
		res.status(500).send('Internal server error')
		return;
	} 

	// find restaurant by id
	Restaurant.findById(restaurant_id).then((restaurant) => {
		if (!restaurant) {
			res.status(404).send('Resource not found')
		} else{
			// find reservation to update
			const updated = restaurant.reservations.id(reservation_id)

			// change values of updated to given values
			updated.time = req.body.time
			updated.people = req.body.people

			// save and send 
			restaurant.save()
			res.send({"reservation": updated, "restaurant": restaurant})
		}
	}).catch((error) => {
		//log("caught error")
		res.status(500).send(error) // server error
	})

})

////////// DO NOT CHANGE THE CODE OR PORT NUMBER BELOW
const port = process.env.PORT || 5000
app.listen(port, () => {
	log(`Listening on port ${port}...`)
});
