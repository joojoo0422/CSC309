/* E2 Library - JS */

/*-----------------------------------------------------------*/
/* Starter code - DO NOT edit the code below. */
/*-----------------------------------------------------------*/

// global counts
let numberOfBooks = 0; // total number of books
let numberOfPatrons = 0; // total number of patrons

// global arrays
const libraryBooks = [] // Array of books owned by the library (whether they are loaned or not)
const patrons = [] // Array of library patrons.

// Book 'class'
class Book {
	constructor(title, author, genre) {
		this.title = title;
		this.author = author;
		this.genre = genre;
		this.patron = null; // will be the patron objet

		// set book ID
		this.bookId = numberOfBooks;
		numberOfBooks++;
	}

	setLoanTime() {
		// Create a setTimeout that waits 3 seconds before indicating a book is overdue

		const self = this; // keep book in scope of anon function (why? the call-site for 'this' in the anon function is the DOM window)
		setTimeout(function() {
			
			console.log('overdue book!', self.title)
			changeToOverdue(self);

		}, 3000)

	}
}

// Patron constructor
const Patron = function(name) {
	this.name = name;
	this.cardNumber = numberOfPatrons;

	numberOfPatrons++;
}


// Adding these books does not change the DOM - we are simply setting up the 
// book and patron arrays as they appear initially in the DOM.
libraryBooks.push(new Book('Harry Potter', 'J.K. Rowling', 'Fantasy'));
libraryBooks.push(new Book('1984', 'G. Orwell', 'Dystopian Fiction'));
libraryBooks.push(new Book('A Brief History of Time', 'S. Hawking', 'Cosmology'));

patrons.push(new Patron('Jim John'))
patrons.push(new Patron('Kelly Jones'))

// Patron 0 loans book 0
libraryBooks[0].patron = patrons[0]
// Set the overdue timeout
libraryBooks[0].setLoanTime()  // check console to see a log after 3 seconds


/* Select all DOM form elements you'll need. */ 
const bookAddForm = document.querySelector('#bookAddForm');
const bookInfoForm = document.querySelector('#bookInfoForm');
const bookLoanForm = document.querySelector('#bookLoanForm');
const patronAddForm = document.querySelector('#patronAddForm');

/* bookTable element */
const bookTable = document.querySelector('#bookTable')
/* bookInfo element */
const bookInfo = document.querySelector('#bookInfo')
/* Full patrons entries element */
const patronEntries = document.querySelector('#patrons')

/* Event listeners for button submit and button click */

bookAddForm.addEventListener('submit', addNewBookToBookList);
bookLoanForm.addEventListener('submit', loanBookToPatron);
patronAddForm.addEventListener('submit', addNewPatron)
bookInfoForm.addEventListener('submit', getBookInfo);

/* Listen for click patron entries - will have to check if it is a return button in returnBookToLibrary */
patronEntries.addEventListener('click', returnBookToLibrary)

/*-----------------------------------------------------------*/
/* End of starter code - do *not* edit the code above. */
/*-----------------------------------------------------------*/


/** ADD your code to the functions below. DO NOT change the function signatures. **/


/*** Functions that don't edit DOM themselves, but can call DOM functions 
     Use the book and patron arrays appropriately in these functions.
 ***/

// Adds a new book to the global book list and calls addBookToLibraryTable()
function addNewBookToBookList(e) {
	e.preventDefault();

	// Add book book to global array
	const newName = document.querySelector('#newBookName').value;
	const newAuthor = document.querySelector('#newBookAuthor').value;
	const newGenre = document.querySelector('#newBookGenre').value;

	const newBook = new Book(newName, newAuthor, newGenre)

	libraryBooks.push(newBook);

	// Call addBookToLibraryTable properly to add book to the DOM
	addBookToLibraryTable(newBook);
}

// Changes book patron information, and calls 
function loanBookToPatron(e) {
	e.preventDefault();

	// Get correct book and patron
	const loanBookId = document.querySelector('#loanBookId').value;
	const loanCardNum = document.querySelector('#loanCardNum').value;
	// book object
	const loanBook = libraryBooks[loanBookId];

	// Add patron to the book's patron property
	// check if the book is already loaned
	if (loanBook.patron != null){
		// book is already loaned so can't be loaned
		return;
	}
	loanBook.patron = patrons[loanCardNum];

	// update patron card number on bookTable
	const numRows = bookTable.rows.length;
    let i = 0;
    while (i <= numRows){
        let currRow = bookTable.rows[i];
        let currBookId = currRow.cells[0];
        if (parseInt(currBookId.innerText) == loanBook.bookId){
            currRow.cells[2].innerText = loanCardNum;
            break;
        }
        i++;
    }

	// Add book to the patron's book table in the DOM by calling addBookToPatronLoans()
	addBookToPatronLoans(loanBook);

	// Start the book loan timer.
	loanBook.setLoanTime();

}

// Changes book patron information and calls returnBookToLibraryTable()
function returnBookToLibrary(e){
	e.preventDefault();
	// check if return button was clicked, otherwise do nothing.
	if (e.target.classList.contains('return')) {
		const rowToReturn = e.target.parentElement.parentElement;
		const bookIdReturn = parseInt(rowToReturn.querySelector('td').innerText);
		const bookToReturn = libraryBooks[bookIdReturn];
		//console.log('bookToReturn: '+bookToReturn.title);
	// Call removeBookFromPatronTable()
		removeBookFromPatronTable(bookToReturn);

	// Change the book object to have a patron of 'null'
		bookToReturn.patron = null;

		// update patron card number on bookTable
		const numRows = bookTable.rows.length;
	    let i = 0;
	    while (i <= numRows){
	        let currRow = bookTable.rows[i];
	        let currBookId = currRow.cells[0];
	        if (parseInt(currBookId.innerText) == bookIdReturn){
	            currRow.cells[2].innerText = '';
	            break;
	        }
	        i++;
	    }
	}
}

// Creates and adds a new patron
function addNewPatron(e) {
	e.preventDefault();

	// Add a new patron to global array
	const newPatronN = document.querySelector('#newPatronName').value;
	const newPatron = new Patron(newPatronN);

	patrons.push(newPatron);

	// Call addNewPatronEntry() to add patron to the DOM
	addNewPatronEntry(newPatron);
}

// Gets book info and then displays
function getBookInfo(e) {
	e.preventDefault();

	// Get correct book
	const currBook = libraryBooks[document.querySelector('#bookInfoId').value];
	// Call displayBookInfo()	
	displayBookInfo(currBook);
}


/*-----------------------------------------------------------*/
/*** DOM functions below - use these to create and edit DOM objects ***/

// Adds a book to the library table.
function addBookToLibraryTable(book) {
	// Add code here
	// create <tr> element - row
	let row = bookTable.insertRow(bookTable.lastIndex); 

	// create <td> elements - cells
	let newBookIdCell = row.insertCell(0);
	let newTitleCell = row.insertCell(1);
	
	let newPatronNumberCell = row.insertCell(2);

	// add info to the new cells
	newBookIdCell.innerHTML = book.bookId;
	// title is bold
	let bold = document.createElement('strong');
	bold.appendChild(document.createTextNode(book.title));
	newTitleCell.appendChild(bold);
	newPatronNumberCell.innerHTML = book.patron;
}


// Displays deatiled info on the book in the Book Info Section
function displayBookInfo(book) {
	// Add code here
	const bookInfos = bookInfo.querySelectorAll('span');
	bookInfos[0].innerText = book.bookId;
	bookInfos[1].innerText = book.title;
	bookInfos[2].innerText = book.author;
	bookInfos[3].innerText = book.genre;
	// if lent out display name
	if (book.patron == null){
		bookInfos[4].innerText = 'N/A';
	}else{
		bookInfos[4].innerText = book.patron.name;
	}
	
}

// Adds a book to a patron's book list with a status of 'Within due date'. 
// (don't forget to add a 'return' button).
function addBookToPatronLoans(book) {
	// Add code here
	// find Talbe of Patron lending the book
	const currPatron = patronEntries.querySelectorAll('div')[book.patron.cardNumber];
	const patronLoanTable = currPatron.querySelector('table').querySelector('tbody');
	
	// add row to that table w/ info
	const newTableRow = document.createElement('tr');

	// create cells
	const bookIdCell = document.createElement('td');
	const titleCell = document.createElement('td');
	const statusCell = document.createElement('td');
	const returnButtonCell = document.createElement('td');

	// add info to cells and add to row
	bookIdCell.innerHTML = book.bookId;
	newTableRow.appendChild(bookIdCell);

	//bold title
	const bold = document.createElement('strong');
	bold.appendChild(document.createTextNode(book.title));
	titleCell.appendChild(bold);
	newTableRow.appendChild(titleCell);

	statusCell.innerHTML = `<span class='green'>Within due date</span>`;
	newTableRow.appendChild(statusCell);

	returnButtonCell.innerHTML = `<button class='return'>return</button>`;
	newTableRow.appendChild(returnButtonCell);
	
	// row to table
	patronLoanTable.appendChild(newTableRow);
}

// Adds a new patron with no books in their table to the DOM, including name, card number,
// and blank book list (with only the <th> headers: BookID, Title, Status).
function addNewPatronEntry(patron) {
	// Add code here
	// retrieve patron info
	const patName = patron.name;
	const patCardNum = patron.cardNumber;

	// create elements for Patron's name, card number and Books on loan table
	const newPatName = document.createElement('p');
	newPatName.innerHTML = `Name: <span class='bold'>${patName}</span>`;

	const newPatCardNum = document.createElement('p');
	newPatCardNum.innerHTML = `Card Number: <span class='bold'>${patCardNum}</span>`;
	
	const newPatLoan = document.createElement('h4');
	newPatLoan.innerText = 'Books on loan:';

	const newPatLoanTable = document.createElement('table');
	newPatLoanTable.setAttribute('class', 'patronLoansTable');
	const loanTableBody = document.createElement('tbody');
	const loanTableTitle = document.createElement('tr');
	loanTableTitle.innerHTML = `<th>BookID</th><th>Title</th><th>Status</th><th>Return</th>`;
	loanTableBody.appendChild(loanTableTitle);
	newPatLoanTable.appendChild(loanTableBody);

	// create new patron
	const newPatron = document.createElement('div');
	newPatron.setAttribute('class', 'patron');
	newPatron.appendChild(newPatName);
	newPatron.appendChild(newPatCardNum);
	newPatron.appendChild(newPatLoan);
	newPatron.appendChild(newPatLoanTable);

	// add to list of patrons
	patronEntries.appendChild(newPatron);
}


// Removes book from patron's book table and remove patron card number from library book table
function removeBookFromPatronTable(book) {
	// Add code here
	// retrieve the table of patron that is returning the book
	const returnPatron = parseInt(book.patron.cardNumber);
	//console.log('check' + patronEntries.querySelectorAll('table')[0]);
	const returnTable = patronEntries.querySelectorAll('table')[returnPatron];

	const returnTableBody = returnTable.querySelector('tbody');
	const rowDelete = returnTableBody.querySelectorAll('tr');
	
	//console.log('rowDelete'+ rowDelete[1].cells[0].innerText);

	// find the row to delete
	const numRows = rowDelete.length;
	let i = 0;
	while (i <= numRows){
		//console.log('loged'+rowDelete[i].cells[0].textContent);
		if (parseInt(rowDelete[i].cells[0].innerText) == book.bookId){
			//delete row
			returnTable.deleteRow(i);
			break;
		}
		i++;
	}

}

// Set status to red 'Overdue' in the book's patron's book table.
function changeToOverdue(book) {
	// Add code here
	// find the card number of overdue patron
	const overduePatron = book.patron.cardNumber;

	// if the book has already been returned, do nothing
	if (book.patron == null){
		return;
	}

	// find the table of overduePatron
	const overduePatronTable = patronEntries.querySelectorAll('div')[overduePatron];
	// find the span with class=green
	const overdueStatus = overduePatronTable.querySelector('.green');

	// change color and text
	overdueStatus.setAttribute('class','red');
	overdueStatus.innerHTML = 'Overdue';

}

