/*
This will hold the parsed csv file and do the work around file validation
*/
class userFile extends csvFile{
	identifierPositions = [];
	identifierLocations = [];
	identifierDepartments = [];

	
	constructor (table, results, columnIdentifer){
		super(table, results,columnIdentifer);
	}

	//Method that takes in an array and checks that the unique indentifers string contains items in the array.
	checkUniqueIdentifers(identifierString, sourceFile){
		let arrayToLoop;
		switch (sourceFile){
			case 'Position':
				arrayToLoop = this.identifierPositions;
				break;
			case 'Location':
				arrayToLoop = this.identifierLocations;
				break;
			case 'Department':
				arrayToLoop = this.identifierDepartments;
				break;
		}
		for(let i = 0; i < arrayToLoop.length; i++){
			if(identifierString.indexOf(arrayToLoop[i].identifier+";") == -1){
				this.addError("Reference Error","Row "+(arrayToLoop[i].index+2)+" has an identifier_"+ sourceFile.toLowerCase() + " that is not in the " + sourceFile + " file.", (arrayToLoop[i].index+2), "Reference Error");
			}
		}
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
					this.addError("emptyIdentifier","Row "+(index+2)+" has no "+this.columnIdentifer, (index+2), "emptyColumn");
				//Check if the identifier column already exists in the array of identifiers
				}else if (this.uniqueIdentifiers.indexOf(uniqueIdentifier) != -1){
					this.addError("duplicateRow","Row "+(index+2)+" has the same "+this.columnIdentifer+" as another row in your file", (index+2), "duplicateRow");
				}else{
					//Add no errors and put the record into list of identifiers
					this.uniqueIdentifiers += uniqueIdentifier;
					//check if there is a dependant row in the current set of identifiers, if no then add to dependant array for checking with a full identifer list
					//This means we only check for dependant/Parent identifiers which have not showed up yet!
					if(this.uniqueIdentifiers.indexOf(dependantColumn) == -1){
						this.dependantIdentifiers.push({index: index+2, identifier: dependantColumn});
					}

					//This is the USER Specific section. If there are not other problems with the row then check for the position/location/department row and add to the areas
					if(data['identifier_position']){
						this.identifierPositions.push({index: index+2, identifier: data['identifier_position']});
					}
					if(data['identifier_location']){
						this.identifierLocations.push({index: index+2, identifier: data['identifier_location']});
					}
					if(data['identifier_department']){
						this.identifierDepartments.push({index: index+2, identifier: data['identifier_department']});
					}

				}
			})
		}
		if(this.dependantIdentifiers.length > 0){
			this.checkDependencies();
		}
	}


}