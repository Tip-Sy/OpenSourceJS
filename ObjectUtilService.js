/**
 * Util for Object manipulation in JS, created as an Angular service
 * 
 * For non-Angular projects:
 *   The code inside 'objectUtilService' is Angular independant,
 *   thus can be used outside of an Angular project;
 *   just make sure to use 'jQuery' framework from 1.4,
 *   or rededefine the function '$.isEmptyObject'
 * 
 * Note:
 *   This code can be considered as an extension of Underscore library 
 *   in case of objects containing objects, for the following functions:
 *   - Difference
 *   - Union (called 'Merge' here)
 * 
 * Prerequisite:
 * - Each Object is assumed to have an "id" field
 * - Must include "Underscore.js" library (for 'difference' and 'union' functions)
 */
var myModule = angular.module('myModule', []);
myModule.factory('objectUtilService', function() {
	
	/**
	 * Compare two objects according to their ID
	 * 
	 * @param {Object} o1
	 * @param {Object} o2
	 * @returns {int} comparisonResult: 0 if equal, > 0 if o1 before o2, and < 0 if o1 after o2
	 */
	var compare = function(o1, o2) {
		if(!o1.id || !o2.id) {
			return null;
		}
		return o1.id - o2.id;
	};
	
	/**
	* Merge two objects, following 3 rules:
	* - keep unchanged attributes
	* - override o1 attributes with the ones of o2
	* - ignore attributes that don't exist in o1
	* 
	* Plus, an extra rule:
	* - If deleteIfMissing mode is true: delete objects in arrays of o1 that are missing in o2
	* - Else, keep every objects in arrays of o1, and simply add the new ones from o2
	* 
	* @param {Object} o1
	* @param {Object} o2
	* @param {boolean} deleteIfMissing: merge mode => If true, delete Objects in Array of o1 that are missing in o2
	*/
	var merge = function(o1, o2, deleteIfMissing) {
		if(o1 instanceof Object && o2 instanceof Object) {
			
			// Compare each attribute of o1 with each one of o2
			for(var key in o1) {
				if(o1[key] instanceof Array && o2[key] instanceof Array) {
					// If the attribute is an array: merge the two arrays
					var length1 = o1[key].length;
					var length2 = o2[key].length;
					
					if(deleteIfMissing === true && length2 === 0) {
						o1[key] = [];
					} else if((length1 > 0 && o1[key][0] instanceof Object) || (length2 > 0 && o2[key][0] instanceof Object)) {
						// Special case of an array of objects
						var i=0;
						var j=0;
						o1[key].sort(compare);
						o2[key].sort(compare);
						
						while(j < length2) {
							if(i === length1 || compare(o1[key][i], o2[key][j]) > 0) {
								o1[key].push(o2[key][j]);
								j++;
								
							} else if(compare(o1[key][i], o2[key][j]) === 0) {
								merge(o1[key][i], o2[key][j], deleteIfMissing);
								i++;
								j++;
								
							} else if(compare(o1[key][i], o2[key][j]) < 0) {
								if(deleteIfMissing === true) {
									o1[key].splice(i,1);
									length1--;
								} else {
									i++;
								}
							}
						}
					} else {
						o1[key] = _.union(o1[key], o2[key]);
					}
				} else if(o1[key] instanceof Object) {
					// If the attribute is an object: call mergeObject recursively
					merge(o1[key], o2[key], deleteIfMissing);
					
				} else if(o1[key] !== o2[key] && typeof o2[key] !== 'undefined') {
					// Finally, if the attribute values are different between the two objects, override o1 value
					o1[key] = o2[key];
				}
			}
		} else if(o1 !== o2 && typeof o2 !== 'undefined') {
			o1 = o2;
		}
	};
	
	/**
	* Compare (recursively) two similar objects and return the modified attributes (with values of o2)
	* In case of arrays, objects in array of o1 that are missing in o2 are not added to the result
	* 
	* @param {Object} o1: old object
	* @param {Object} o2: new object
	* @param {Object} result: object with modified attributes between o1 and o2 only
	*/
	var differenceRec = function(o1, o2, result) {
		if(o1 instanceof Object && o2 instanceof Object) {
			
			// Compare each attribute of o1 with each one of o2
			for(var key in o1) {
				if(o1[key] instanceof Array && o2[key] instanceof Array) {
					// If the attribute is an array: get the differences between the two arrays
					result[key] = [];
					var length1 = o1[key].length;
					var length2 = o2[key].length;
					
					if((length1 > 0 && o1[key][0] instanceof Object) || (length2 > 0 && o2[key][0] instanceof Object)) {
						// The case of an array of objects is treated here
						var i=0;
						var j=0;
						o1[key].sort(compare);
						o2[key].sort(compare);
						
						while(j < length2) {
							if(i === length1 || compare(o1[key][i], o2[key][j]) > 0) {
								// Objects in array of o2 that are missing in o1 are added to the result
								result[key].push(o2[key][j]);
								j++;
								
							} else if(compare(o1[key][i], o2[key][j]) === 0) {
								var tmpResult = {};
								differenceRec(o1[key][i], o2[key][j], tmpResult);
								
								if(!$.isEmptyObject(tmpResult)) {
									tmpResult.id = o1[key][i].id;
									result[key].push(tmpResult);
								}
								
								i++;
								j++;
								
							} else if(compare(o1[key][i], o2[key][j]) < 0) {
								// Objects in array of o1 that are missing in o2 are not added to the result
								i++;
								
							} else {
								// This case should never occur
								console.log("Something wrong happened...");
								j++;
							}
						}
					} else {
						result[key] = _.difference(o2[key], o1[key]);
					}
					
					if(result[key].length === 0 && (length1 === 0 || length2 > 0)) {
						// If there are no differences between the arrays of o1 and 02, the empty result array is deleted
						delete result[key];
					}
					
				} else if(o1[key] instanceof Object) {
					// If the attribute is an object: call difference recursively
					var tmpResult = {};
					differenceRec(o1[key], o2[key], tmpResult);
					
					if(!$.isEmptyObject(tmpResult)) {
						tmpResult.id = o1[key].id;
						result[key] = tmpResult;
					}
					
				} else if(o1[key] !== o2[key] && typeof o2[key] !== 'undefined') {
					// Finally, if the attribute values are different between the two objects, get o2 value
					result[key] = o2[key];
				}
			}
		} else if(o1 !== o2 && typeof o2 !== 'undefined') {
			result = o2;
		}
	};
	
	/**
	* Function based on its recursive equivalent previously defined
	* It constructs the result and returns it after calling "differenceRec"
	* 
	* @param {Object} o1
	* @param {Object} o2
	* @return {Object} result: object with modified attributes between o1 and o2 only
	*/
	var difference = function(o1, o2) {
		var result = {};
		
		if(o1.id === o2.id) {
			result = {id: o1.id};
			differenceRec(o1, o2, result);
		}
		
		return result;
	}
	
	var objectService = {
		compare: compare,
		merge: merge,
		difference: difference
	};

	return objectService;
});
