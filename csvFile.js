/*
This will hold the parsed csv file and do the work around file validation
*/
class csvFile{
	uniqueIdentifiers = "";
	dependantIdentifiers = [];
	fileIdentifier;
	parentRow;
	
	constructor (table, results,columnIdentifer){
		this.table = table;
		this.results = results;
		this.columnIdentifer = columnIdentifer;
		switch(columnIdentifer){
			case 'Position ID':
				this.fileIdentifier = "Position";
				break;
			case 'Department ID':
				this.fileIdentifier = "Department";
				break;
			case 'Location ID':
				this.fileIdentifier = "Location";
				break;
			case 'username':
				this.fileIdentifier = "User";
				break;
		}
	}

	addError(code, message, row, type){
		this.results.errors.push({type: type, code: code, message: message, row: row});
	}

	drawErrors(){
		this.results.errors.forEach(error => {
			this.table.row.add({"Row Id" : error.row, "File": this.fileIdentifier, "Error Code": error.type, "Error": error.message}).draw();
		});
	}
	
	//Errors are linked to the array index, because of the header and arrays starting at 0 they are 2 below what excel or notepad would show
	adjustErrorIndex(){
		this.results.errors.forEach((indexValue, index) => this.results.errors[index]['row'] = indexValue['row']+2);
	}

	//If there is a parent or dependant column, search the unique identifier string for each dependant and errors where there is none
	//The processFile method looks at it's current identifer set, this one works on the full set of identifiers
	checkDependencies(){
		this.dependantIdentifiers.forEach(dependantIdentifier => {
			if(this.uniqueIdentifiers.indexOf(dependantIdentifier.identifier) == -1){
				this.addError("Missing Dependency", "The "+this.parentRow+" "+ dependantIdentifier.identifier.substring(0, dependantIdentifier.identifier.length -1) + " does not exist in " + this.columnIdentifer, dependantIdentifier.index,"Data Error");
			}
		});
	}
	
	//Check for Column identifier and the parent id/manager
	checkForColumnIdentifiers(headerFields){
		//Checking for rows which are dependant on the identifier in the same file eg. Parent ID or Manager
		if(headerFields.indexOf('identifier_manager') != -1){
			this.parentRow = "identifier_manager";
		}else if(headerFields.indexOf('Parent ID') != -1){
			this.parentRow = "Parent ID";
		}
		//Checking for the Position/Location/Department header in the User file
		if(this.fileIdentifier == "User" && headerFields.indexOf("identifier_position") == -1){
			this.addError("Missing Identifier", "User File is missing the identifier_position column, positions will not be linked", 0, "FileSetup");
		}
		if(this.fileIdentifier == "User" && headerFields.indexOf("identifier_department") == -1){
			this.addError("Missing Identifier", "User File is missing the identifier_department column, departments will not be linked", 0, "FileSetup");
		}
		if(this.fileIdentifier == "User" && headerFields.indexOf("identifier_location") == -1){
			this.addError("Missing Identifier", "User File is missing the identifier_location column, locations will not be linked", 0, "FileSetup");
		}
		if(this.fileIdentifier == "User" && headerFields.indexOf("email") == -1){
			this.addError("Missing Email", "User File is missing the email column, User records cannot be created without an email address", 0, "FileSetup");
		}

		//Checking for the unique file identifier
		if (headerFields.indexOf(this.columnIdentifer) == -1){
			this.addError("Missing Identifier", "File is missing the "+ this.columnIdentifer+" header", 0, "FileSetup");
			return false;
		}
		return true;
	}

	
	processFile(){
		this.adjustErrorIndex();
		
		//If the identifier isn't in the file then throw an error and then do nothing
		if(this.checkForColumnIdentifiers(this.results.meta.fields)){
			
			//Loop through the results adding values to the identifier array if they are not there and are not blank
			this.results.data.map((data,index) => {
				let uniqueIdentifier = data[this.columnIdentifer] + ";";
				//This is the column for Parent ID or identifier_manager
				let dependantColumn = "";
				if(this.parentRow && data[this.parentRow] != ""){
					dependantColumn = data[this.parentRow] + ";";
				}

				//Check if the identifier column is blank
				if (uniqueIdentifier == ";"){
					this.addError("Empty Identifier","Row "+(index+2)+" has no "+this.columnIdentifer, (index+2), "Empty Identifier");
				//Check if the identifier column already exists in the array of identifiers
				}else if (this.uniqueIdentifiers.indexOf(uniqueIdentifier) != -1){
					this.addError("Duplicate Row","Row "+(index+2)+" has the same "+this.columnIdentifer+" as another row in your file", (index+2), "Duplicate Row");
				}else{
					//Add no errors and put the record into list of identifiers
					this.uniqueIdentifiers += uniqueIdentifier;
					//check if there is a dependant row in the current set of identifiers, if no then add to dependant array for checking with a full identifer list
					//This means we only check for dependant/Parent identifiers which have not showed up yet!
					if(this.uniqueIdentifiers.indexOf(dependantColumn) == -1){
						this.dependantIdentifiers.push({index: index+2,identifier: dependantColumn});
					}

				}
			})
		}
		if(this.dependantIdentifiers.length > 0){
			this.checkDependencies();
		}
		this.drawErrors();
	}
}