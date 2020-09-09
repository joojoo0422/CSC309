/* E3 app.js */
'use strict';

const log = console.log
const yargs = require('yargs').option('addRest', {
    type: 'array' // Allows you to have an array of arguments for particular command
  }).option('addResv', {
    type: 'array' 
  }).option('addDelay', {
    type: 'array' 
  })

const reservations = require('./reservations');

// datetime available if needed
const datetime = require('date-and-time') 
// added PLUGIN.md for formating of date-and-time
require('date-and-time/plugin/meridiem');
datetime.plugin('meridiem');

const yargs_argv = yargs.argv
//log(yargs_argv) // uncomment to see what is in the argument array

if ('addRest' in yargs_argv) {
	const args = yargs_argv['addRest']
	const rest = reservations.addRestaurant(args[0], args[1]);	
	if (rest.length > 0) {
		/* complete */ 
		log(`Added restaurant ${args[0]}.`)
	} else {
		/* complete */ 
		log("Duplicate restaurant not added.")
	}
}

if ('addResv' in yargs_argv) {
	const args = yargs_argv['addResv']
	const resv = reservations.addReservation(args[0], args[1], args[2]);

	// Produce output below
	log(`Added reservation at ${resv.restaurant} on ${datetime.format(resv.time, "MMM DD YYYY")} at ${datetime.format(resv.time, "h:mm aa")} for ${resv.people} people.`)
}

if ('allRest' in yargs_argv) {
	const restaurants = reservations.getAllRestaurants(); // get the array
	
	// Produce output below
	restaurants.forEach((restaurant) => log(`${restaurant.name}: ${restaurant.description} - ${restaurant.numReservations} active reservations`))
}

if ('restInfo' in yargs_argv) {
	const restaurants = reservations.getRestaurantByName(yargs_argv['restInfo']);

	// Produce output below
	if (JSON.stringify(restaurants) === '{}'){
		log('Non-existing Restaurant!');
	}else{
		log(`${restaurants.name}: ${restaurants.description} - ${restaurants.numReservations} active reservations`)
	}

}

if ('allResv' in yargs_argv) {
	const restaurantName = yargs_argv['allResv']
	const reservationsForRestaurant = reservations.getAllReservationsForRestaurant(restaurantName); // get the arary
	
	// Produce output below
	log(`Reservations for ${restaurantName}:`);
	reservationsForRestaurant.forEach((resv) => 
		log(`- ${datetime.format(resv.time, "MMM DD YYYY")}, ${datetime.format(resv.time, "h:mm aa")}, table for ${resv.people}`)
	);
}

if ('hourResv' in yargs_argv) {
	const time = yargs_argv['hourResv']
	const reservationsForRestaurant = reservations.getReservationsForHour(time); // get the arary
	
	// Produce output below
	log("Reservations in the next hour:");
	reservationsForRestaurant.forEach((resv) => 
		log(`- ${resv.restaurant}: ${datetime.format(resv.time, "MMM DD YYYY")}, ${datetime.format(resv.time, "h:mm aa")}, table for ${resv.people}`)
	);
}

if ('checkOff' in yargs_argv) {
	const restaurantName = yargs_argv['checkOff']
	const earliestReservation = reservations.checkOffEarliestReservation(restaurantName); 

	// Produce output below
	log(`Checked off reservation on ${datetime.format(earliestReservation.time, "MMM DD YYYY")}, ${datetime.format(earliestReservation.time, "h:mm aa")}, table for ${earliestReservation.people}`);
}

if ('addDelay' in yargs_argv) {
	const args = yargs_argv['addDelay']
	const resv = reservations.addDelayToReservations(args[0], args[1]);	

	// Produce output below
	log(`Reservations for ${args[0]}:`);
	resv.forEach((reservation) => 
		log(`- ${datetime.format(reservation.time, "MMM DD YYYY")}, ${datetime.format(reservation.time, "h:mm aa")}, table for ${reservation.people}`)
	);
}

if ('status' in yargs_argv) {
	const status = reservations.getSystemStatus()

	// Produce output below
/*$ node app.js --status
Number of restaurants: 2
Number of total reservations: 3
Busiest restaurant: Red Lobster
System started at: Mar 17 2019, 2:14 p.m.*/
	log(`Number of restaurants: ${status.numRestaurants}`);
	log(`Number of total reservations: ${status.totalReservations}`);
	log(`Busiest restaurant: ${status.currentBusiestRestaurantName}`);
	log(`System started at: ${datetime.format(status.systemStartTime, "MMM DD YYYY")}, ${datetime.format(status.systemStartTime, "h:mm aa")}`);
}

