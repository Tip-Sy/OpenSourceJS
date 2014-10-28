/**
 * Util for Object manipulation in JS
 * 
 * Note:
 *   This code can be considered as an extension of Underscore lib
 *   in case of complex objects, for the following functions:
 *   - Difference
 *   - Union (called 'Merge' here)
 * 
 * Prerequisite:
 * - Must include "Underscore.js" library
 */
var objectUtil = (function() {
  
  // Identifier attribute name
  var ID = 'id';
  
  
  /**
   * Compare two objects according to their ID
   * Note: if there is no ID, the objects are treated as identical
   * 
   * Result:
   *   0 if equal
   *   > 0 if o1 before o2
   *   < 0 if o1 after o2
   * 
   * @param {Object} o1
   * @param {Object} o2
   * @returns {int} comparisonResult
   */
  var compare = function(o1, o2) {
    if(typeof o1[ID] === "undefined" || typeof o2[ID] === "undefined") {
      return 0;
    }
    return o1[ID] - o2[ID];
  };
  
  
  /**
  * Merge two objects by calling appropriate function mergeObject or mergeArray
  * 
  * @param {Object} o1
  * @param {Object} o2
  * @param {boolean} deleteIfMissing: merge mode => If true, delete Objects in Array of o1 that are missing in o2
  */
  var merge = function(o1, o2, deleteIfMissing) {
    if(o1 instanceof Array || o2 instanceof Array) {
      mergeArray(o1, o2, deleteIfMissing);
      
    } else if(o1 instanceof Object || o2 instanceof Object) {
      mergeObject(o1, o2, deleteIfMissing);
      
    } else if(o1 !== o2 && typeof o2 !== 'undefined') {
      o1 = o2;
    }
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
  mergeObject = function(o1, o2, deleteIfMissing) {
    if(o2) {
      if(o1 instanceof Object) {
        for(var key in o1) {
          if(o1[key] instanceof Array || o2[key] instanceof Array) {
            // If the attribute is an array: merge the two arrays
            mergeArray(o1[key], o2[key], deleteIfMissing);
            
          } else if(o1[key] instanceof Object) {
            // If the attribute is an object: call mergeObject recursively
            mergeObject(o1[key], o2[key], deleteIfMissing);
            
          } else if(o1[key] !== o2[key]) {
            // Finally, if the attribute values are different between the two objects, override o1 value
            o1[key] = o2[key];
          }
        }
      } else {
        o1 = o2;
      }
    }
  }
  
  
  /**
  * Merge two arrays, following one rule:
  * - If deleteIfMissing mode is true: delete objects in a1 that are missing in a2
  * - Else, keep every objects in a1, and simply add the new ones from a2
  * 
  * @param {Array} a1
  * @param {Array} a2
  * @param {boolean} deleteIfMissing: merge mode => If true, delete Objects in a1 that are missing in a2
  */
  mergeArray = function(a1, a2, deleteIfMissing) {
    var length1 = (typeof a1 !== 'undefined' && a1.length) ? a1.length : 0;
    var length2 = (typeof a2 !== 'undefined' && a2.length) ? a2.length : 0;
    
    if(deleteIfMissing === true && length2 === 0) {
      a1 = [];
    } else if((length1 > 0 && a1[0] instanceof Object) || (length2 > 0 && a2[0] instanceof Object)) {
      // Special case of an array of objects (or multi-array)
      var i=0;
      var j=0;
      a1.sort(compare);
      a2.sort(compare);
      
      while(j < length2) {
        if(i === length1 || compare(a1[i], a2[j]) > 0) {
          a1.push(a2[j]);
          j++;
          
        } else if(compare(a1[i], a2[j]) === 0) {
          // Call merge recursively to handle multi-arrays and arrays of objects 
          merge(a1[i], a2[j], deleteIfMissing);
          i++;
          j++;
          
        } else if(compare(a1[i], a2[j]) < 0) {
          
          if(deleteIfMissing === true) {
            a1.splice(i,1);
            length1--;
            
          } else {
            i++;
          }
        }
      }
    } else {
      a1 = _.union(a1, a2);
    }
  }
  
  
  /**
   * Compare (recursively) two similar objects and return the modified attributes (with values of o2)
   * Note: In case of arrays, objects in array of o1 that are missing in o2 are not added to the result
   * 
   * @param {Object} o1: old object
   * @param {Object} o2: new object
   * @param {Object} result: object with modified attributes between o1 and o2 only
   */
  var differenceObject = function(o1, o2, result) {
    if(o1 instanceof Object && o2 instanceof Object) {
      
  	  // Compare objects only if their ID is equal (or both undefined)
	    if(o1[ID] === o2[ID]) {
  	    
        // Compare each attribute of o1 with each one of o2
        for(var key in o1) {
          if(o1[key] instanceof Array && o2[key] instanceof Array) {
            
            // If the attribute is an array: get the differences between the two arrays
            result[key] = [];
            differenceArray(o1[key], o2[key], result[key], true);
            
            if(result[key].length === 0 && (o1[key].length === 0 || o2[key].length > 0)) {
              
              // If there are no differences between the arrays of o1 and 02, the empty result array is deleted
              delete result[key];
            }
            
          } else if(o1[key] instanceof Object) {
            
            // If the attribute is an object: call difference recursively
            var tmpResult = {};
            differenceObject(o1[key], o2[key], tmpResult);
            
            if(!_.isEmpty(tmpResult)) {
              if(typeof o1[key][ID] !== 'undefined') {
                tmpResult[ID] = o1[key][ID];
              }
              result[key] = tmpResult;
            }
            
          } else if(o1[key] !== o2[key] && typeof o2[key] !== 'undefined') {
            
            // Finally, if the attribute values are different between the two objects, get o2 value
            result[key] = o2[key];
          }
        }
      }
    }
  };
  
  /**
   * Compare (recursively) two arrays and return the modified attributes (with values of a2)
   * Note: Objects in a1 that are missing in a2 are not added to the result
   * 
   * When "addIfEqual" mode is ON:
   *   In case of equality between objects from a1 and a2,
   *   the id attribute of the object is added to the result
   * 
   * @param {Array} a1: old array
   * @param {Array} a2: new array
   * @param {boolean} addIfEqual: optional mode
   * @param {Array} result: object with modified attributes between o1 and o2 only
   */
  var differenceArray = function(a1, a2, result, addIfEqual) {
    if(a1 instanceof Array && a2 instanceof Array) {
      var length1 = a1.length;
      var length2 = a2.length;
      
      if((length1 > 0 && a1[0] instanceof Object) || (length2 > 0 && a2[0] instanceof Object)) {
        
        // In case of arrays containing complex objects
        a1.sort(compare);
        a2.sort(compare);
        var i=0;
        var j=0;
        while(j < length2) {
          if(i === length1 || compare(a1[i], a2[j]) > 0) {
            
            // Objects in a2 that are missing in a1 are added to the result
            result.push(a2[j]);
            j++;
            
          } else if(compare(a1[i], a2[j]) === 0) {
            var tmpResult = {};
            differenceObject(a1[i], a2[j], tmpResult);
            
            if(!_.isEmpty(tmpResult) || addIfEqual) {
              if(typeof a1[i][ID] !== 'undefined') {
                tmpResult[ID] = a1[i][ID];
              }
              result.push(tmpResult);
            }
            
            i++;
            j++;
            
          } else if(compare(a1[i], a2[j]) < 0) {
            
            // Objects in a1 that are missing in a2 are not added to the result
            i++;
            
          } else {
            
            // This case should never occur
            console.log("Something wrong happened...");
            j++;
          }
        }
      } else {
        
        // Otherwise, difference function from Underscore lib is used
        result = _.difference(a2, a1);
      }
    }
  };
  
  
  /**
   * Compare two objects and return the differences
   * (using differenceObject and differenceArray functions)
   * 
   * When "addIfEqual" mode is ON:
   *   In case of equality between objects from arrays of o1 and o2,
   *   the id attribute of the object is added to the result
   * 
   * @param {Object} o1
   * @param {Object} o2
   * @param {boolean} addIfEqual: optional mode
   * @return {Object} result: object with modified attributes between o1 and o2 only
   */
  var difference = function(o1, o2, addIfEqual) {
    
    var result;
    
    if(o1 instanceof Array && o2 instanceof Array) {
      
      // Case of two arrays
      result = [];
      differenceArray(o1, o2, result, addIfEqual);
      if(!result.length) {
        result = null;
      }
      
    } else if(o1 instanceof Object && o2 instanceof Object) {
      
      // Case of two objects
      result = {};
      differenceObject(o1, o2, result);
      
      if(_.isEmpty(result)) {
        result = null;
      } else if(typeof o1[ID] !== "undefined") {
        result[ID] = o1[ID];
      }
      
    } else if(o1 !== o2) {
      
      // Case of different inputs
      result = o2;
      
    } else {
      result = null;
    }
    
    return result;
  };
  
  
  var objectUtil = {
    compare: compare,
    merge: merge,
    difference: difference
  };
  
  
  return objectUtil;
})();
