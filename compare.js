let errorTable = document.getElementById("tbl-errors");
let btn_compareCsv = document.getElementById("compareButton").addEventListener("click", mainExecutor);
let parsedPositionCsv;

async function mainExecutor() {
	//clear the error table
	errorTable.innerHTML = "<thead><th>Row Id</th><th>File</th><th>Error Code</th><th>Error</th></thead><tbody></tbody>";
	//Initiate the Placeholders for the final files
	let positionCsvFile, locationCsvFile, departmentCsvFile, userCsvFile;
	let positionFile = document.getElementById('positionFile').files[0];
	let locationFile = document.getElementById('locationFile').files[0];
	let departmentFile = document.getElementById('departmentFile').files[0];
	let userFileUpload = document.getElementById('userFile').files[0];

	//Read and process the files
	try{
		if(positionFile){
			let parsedPositionCsv = await parseCsv(positionFile);
			positionCsvFile = new csvFile(errorTable.getElementsByTagName('tbody')[0], parsedPositionCsv, "Position ID");
			positionCsvFile.processFile();
		}
		if(locationFile){
			let parsedLocationCsv = await parseCsv(locationFile);
			locationCsvFile = new csvFile(errorTable.getElementsByTagName('tbody')[0], parsedLocationCsv, "Location ID");
			locationCsvFile.processFile();
		}
		if(departmentFile){
			let parsedDepartmentCsv = await parseCsv(departmentFile);
			departmentCsvFile = new csvFile(errorTable.getElementsByTagName('tbody')[0], parsedDepartmentCsv, "Department ID");
			departmentCsvFile.processFile();
		}
		if(userFileUpload){
			let parsedUserCsv = await parseCsv(userFileUpload);
			userCsvFile = new userFile(errorTable.getElementsByTagName('tbody')[0], parsedUserCsv, "username");
			userCsvFile.processFile();
			//Check if there are Position/Location/Department files and if the identifying column is in the User file then check the reference
			if(typeof positionCsvFile != "undefined" && userCsvFile.identifierPositions.length > 0){
				userCsvFile.checkUniqueIdentifers(positionCsvFile.uniqueIdentifiers, 'Position');
			}
			if(typeof locationCsvFile != "undefined" && userCsvFile.identifierLocations.length > 0){
				userCsvFile.checkUniqueIdentifers(locationCsvFile.uniqueIdentifiers, 'Location');
			}
			if(typeof departmentCsvFile != "undefined" && userCsvFile.identifierLocations.length > 0){
				userCsvFile.checkUniqueIdentifers(departmentCsvFile.uniqueIdentifiers, 'Location');
			}
			userCsvFile.drawErrors();
		}
		
	} catch (err){
		console.error('Could not pass the files', err);
	}

}

//Returns a promis with the parsed file if successful. See https://stackoverflow.com/questions/56427009/how-to-return-papa-parsed-csv-via-promise-async-await for more details
function parseCsv(file){
	return new Promise((resolve, reject) => {
		Papa.parse(file, {
			delimiter: ",",
			header: true, 
			download: true,
			complete: function(results){
				resolve(results);
			},
			error(err, file){
				reject(err);
			}
		});
	});
}

//Two functions which are used to draw the table
function generateTableRows(table, fileName, row, errorType, errorMessage){
	let newRow = table.insertRow();
	//Add row id to the table
	newRow.appendChild(createTableElement("td",fileName));
	newRow.appendChild(createTableElement("td",row));
	newRow.appendChild(createTableElement("td",errorType));
	//add error message
	newRow.appendChild(createTableElement("td",errorMessage));
}

function createTableElement(htmlElement, htmlText){
	let element = document.createElement(htmlElement);
	let textToAdd = document.createTextNode(htmlText);
	element.appendChild(textToAdd);
	return element;
}