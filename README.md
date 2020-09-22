# initial_import_file_checker
When creating initial libraries all reference fields to be checked and confirmed. This page allows for the addition of files and will return errors found after parsing and reviewing the data.

##Background
There are four library files which need to be imported at the beginning of any project, these are csv files and are used to build the DB.
To avoid the manual checking of files, where there is room for human error, this page will take in the library files and run checks within code.

__Checks which need to be done__
* Users department exists in the Department file
* Users location exists in the Location file
* Users position exists in the Position file
* Parent ID exists in the Position ID Column of the Position file
* Parent ID exists in the Location ID Column of the Location file
* Parent ID exists in the Department ID Column of the Department file
* Manager name exists in the Username column of the User file
* Check for the same email address on Mulitple Users in the User file
* The right number of columns are in rows of the .csv's
* The right header names are used for identifying columns
* Identifying columns in all of the files (Primary keys) are not blank
* Identifying columns in all of the files (Primary keys) are not duplicated
