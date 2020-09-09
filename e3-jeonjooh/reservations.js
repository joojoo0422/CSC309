/* Reservations.js */ 
'use strict';

const log = console.log
const fs = require('fs');
const datetime = require('date-and-time')

const startSystem = () => {

	let status = {};

	try {
		status = getSystemStatus();
	} catch(e) {
		status = {
			numRestaurants: 0,
			totalReservations: 0,
			currentBusiestRestaurantName: null,
			systemStartTime: new Date(),
		}

		fs.writeFileSync('status.json', JSON.stringify(status))
	}

	return status;
}

/*********/


// You may edit getSystemStatus below.  You will need to call updateSystemStatus() here, which will write to the json file
const getSystemStatus = () => {

	updateSystemStatus();

	const status = fs.readFileSync('status.json');

	// update systemStartTime - gives TypeError if I don't do this
	const statusParsed = JSON.parse(status);
	statusParsed.systemStartTime = new Date(statusParsed.systemStartTime);
	//log(JSON.parse(status));
	return statusParsed;
}

/* Helper functions to save JSON */
// HELPER FUNCTION: find the busiest restaurant
// returns the busiest restaurant's name
const findBusiest = (restaurants) => {
	let busiest = restaurants[0];
	restaurants.forEach( (currRestaurant) => {
		if (currRestaurant.numReservations > busiest.numReservations){
			busiest = currRestaurant;
		}
	})
	return busiest.name;
}

// You can add arguments to updateSystemStatus if you want.
const updateSystemStatus = () => {
	/* Add your code below */
	try {
		// current status from status.json
		const status = JSON.parse(fs.readFileSync('status.json'));
		
		// get + set number of restaurants
		const restaurants = getAllRestaurants();
		status.numRestaurants = restaurants.length;

		// get + set number of reservations
		const reservations = getAllReservations();
		status.totalReservations = reservations.length;

		// find + set current busiest restaurant
		const busiest = findBusiest(restaurants);
		status.currentBusiestRestaurantName = busiest;

		fs.writeFileSync('status.json', JSON.stringify(status));
	} catch (e) {
		// log('ERROR: cannot update system status!');
	}
}

const saveRestaurantsToJSONFile = (restaurants) => {
	/* Add your code below */
	fs.writeFileSync('restaurants.json', JSON.stringify(restaurants));
};

const saveReservationsToJSONFile = (reservations) => {
	/* Add your code below */
	fs.writeFileSync('reservations.json', JSON.stringify(reservations));
};

/*********/

// Should return an array of length 0 or 1.
const addRestaurant = (name, description) => {
	// Check for duplicate names
	const restaurants = getAllRestaurants();

	// there is duplicate name
	if ((restaurants.filter((restaurant) => restaurant.name === name)).length > 0){
		return [];
	}

	// if no duplicate names:
	const restaurant = {
		name: name,
		description: description,
		numReservations: 0
	}

	restaurants.push(restaurant);
	saveRestaurantsToJSONFile(restaurants);

	return [restaurant];
}

// should return the added reservation object
const addReservation = (restaurant, time, people) => {
	
	/* Add your code below */
	const reservation = {
		restaurant: restaurant,
		time: datetime.parse(time, "MMM DD YYYY HH:mm:ss"),
		people: people
	}
	// add the new reservation into list
	const reservations = getAllReservations();
	reservations.push(reservation);
	saveReservationsToJSONFile(reservations);

	// modify the reservation count for the restaurant
	const restaurants = getAllRestaurants();
	const addIndex = restaurants.findIndex((reserved) => reserved.name === restaurant);
	restaurants[addIndex].numReservations++;
	saveRestaurantsToJSONFile(restaurants);

	return reservation;

}


/// Getters - use functional array methods when possible! ///

// Should return an array - check to make sure restaurants.json exists
const getAllRestaurants = () => {
	/* Add your code below */
	try{ 
		const restaurants = fs.readFileSync('restaurants.json');
		return JSON.parse(restaurants);
	}
	catch (e) {
		// if restaurants.json doesnt exist - return empty array
		return [];
	}
};

// Should return the restaurant object if found, or an empty object if the restaurant is not found.
const getRestaurantByName = (name) => {
	/* Add your code below */
	const restaurants = getAllRestaurants();

	const curr = restaurants.filter((restaurant) => restaurant.name === name);
	// restaurant not found
	if (curr.length === 0){
		return {};
	}else{
		return curr[0]; // return current restaurant object
	}
};

// Should return an array - check to make sure reservations.json exists
const getAllReservations = () => {
  /* Add your code below */
  try{ 
		const reservations = fs.readFileSync('reservations.json');
		const currReservation = JSON.parse(reservations);

		// set each time as new Date obj
		currReservation.forEach( (curr) => {
			curr.restaurant = curr.restaurant;
			curr.time = new Date(curr.time);
			curr.people = curr.people;
		});

		// return the updated array of reservations
		return currReservation;
	}
	catch (e) {
		// if reservations.json doesnt exist - return empty array
		return [];
	}
};

// Should return an array
const getAllReservationsForRestaurant = (name) => {
	/* Add your code below */
	// get all reservations
	const reservations = getAllReservations();

	// find all reservations for given name
	const currReservation = reservations.filter((curr) => curr.restaurant === name);

	// sort the reservations by time
	const sorted = currReservation.sort((resv1, resv2) => resv1.time - resv2.time);

	return sorted;
};

// HELPER FUNCTION: decides if reservation is between given time interval
// returns 1 if true, 0 if false
const inInterval = (from, until, reservation) => {
	if ((reservation.time <= until) && (reservation.time >= from)){
		return 1;
	}else{
		return 0;
	}
}

// Should return an array
const getReservationsForHour = (time) => {
	/* Add your code below */
	// get all reservations
	const reservations = getAllReservations();
	// get time intervals
	const from = datetime.parse(time, 'MMM D YYYY hh:mm:ss');
	const until = datetime.addHours(from, 1);

	// find all reservations for given time
	const currReservation = reservations.filter((curr) => inInterval(from, until, curr) === 1);

	// sort the reservations by time
	const sorted = currReservation.sort((resv1, resv2) => resv1.time - resv2.time);

	return sorted;
}

// HELPER FUNCTION: Compares two reservations
// returns boolean
const compareReservation = (resv1, resv2) => {
	if ((resv1.restaurant === resv2.restaurant) && (resv1.time === resv2.time) && (resv1.people === resv2.people)){
		return true;
	}else{
		return false;
	}
}

// should return a reservation object
const checkOffEarliestReservation = (restaurantName) => {

	// update numReservations for restaurant
	const restaurants = getAllRestaurants();
	const toRemoveIndex = restaurants.findIndex((restaurant) => restaurant.name === restaurantName);
	restaurants[toRemoveIndex].numReservations--;
	// write back
	saveRestaurantsToJSONFile(restaurants);
	
	// get the list of reservations in sorted order
	const orderedReservations = getAllReservationsForRestaurant(restaurantName);

	// the first element will be the earliest reservation - to remove
	const checkedOffReservation = orderedReservations[0];

	// also get the list of reservations EXCLUDING orderedReservations
	const reservations = getAllReservations();
	const leftReservations = reservations.filter((reservation) => restaurantName !== reservation.restaurant);

	// remove the ealiest reservation + combine with other reservations
	const reservationToKeep = orderedReservations.filter((reservation) => reservation !== checkedOffReservation);
	const newReservations = leftReservations.concat(reservationToKeep);

	// write back the rest of the reservations
	saveReservationsToJSONFile(newReservations);

 	return checkedOffReservation;
}


const addDelayToReservations = (restaurant, minutes) => {
	// Hint: try to use a functional array method

	// get the reservations for given restaurant
	const delayedReservations = getAllReservationsForRestaurant(restaurant);

	// add the minutes to each reservation
	delayedReservations.forEach( (reservation) => {
		reservation.time = datetime.addMinutes(reservation.time, minutes);
	})

	// get the list of reservations EXCLUDING delayedReservations
	const reservations = getAllReservations();
	const leftReservations = reservations.filter((reservation) => restaurant !== reservation.restaurant);

	// combine and write back
	const newReservations = leftReservations.concat(delayedReservations);
	saveReservationsToJSONFile(newReservations);

	return delayedReservations;
}

startSystem(); // start the system to create status.json (should not be called in app.js)


// DO NOT modify the contents of module.exports.  You may not need all of these in app.js..but they're here.
module.exports = {
	addRestaurant,
	getSystemStatus,
	getRestaurantByName,
	getAllRestaurants,
	getAllReservations,
	getAllReservationsForRestaurant,
	addReservation,
	checkOffEarliestReservation,
	getReservationsForHour,
	addDelayToReservations
}

