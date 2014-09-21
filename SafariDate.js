/**
 * Safari (Version < 7) does not support ISO string format 
 * as a parameter in Date constructor, therefore we override 
 * it here with a custom implementation.
 * 
 * // Include this file only if the following condition is verified:
 * Safari6OrLess = !!navigator.userAgent.match(' Safari/') && 
 *				   !navigator.userAgent.match(' Chrom') && 
 *				   !!navigator.userAgent.match(/ Version\/[0-6]\./);
 */
(function(){
	// Save old Date constructor
	dateConstructor = Date.prototype.constructor;

	Date = function() {
		if (arguments && arguments.length) {
			if (arguments.length === 1 && isNaN(arguments[0]) && "string" === typeof arguments[0]) {
				// Match ISO format
				var ISOformat = /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/;
				var ISOparts = arguments[0].match(ISOformat);

				if (ISOparts[0]) {
					var date = new dateConstructor();

					// Set date
					dateParts = ISOparts[0].match(/(\d+)/g);
					date.setFullYear(dateParts[0], dateParts[1]-1, dateParts[2]);

					if (ISOparts[2]) {
						// Add time parts
						timeParts = ISOparts[2].match(/(\d+)/g);
						date.setHours(timeParts[0]);
						date.setMinutes(timeParts[1]);
						date.setSeconds(timeParts[2]);

						if (timeParts[3]) {
							date.setMilliseconds(timeParts[3]);
						}

						if (ISOparts[3]) {
							// Add UTC part
							utcHours = parseInt(ISOparts[5], 10);
							utcMinutes = parseInt(ISOparts[6], 10);

							if (ISOparts[4] === "+") {
								utcHours *= -1;
								utcMinutes *= -1;
							}

							if (utcHours) {
								date.setUTCHours(date.getHours() + utcHours);
							}

							if (utcMinutes) {
								date.setUTCMinutes(date.getMinutes() + utcMinutes);
							}
						}
					} else {
						date.setHours(0);
						date.setMinutes(0);
						date.setSeconds(0);
					}

					return date;
				}
			}

			switch(arguments.length) {
				case 1: return new dateConstructor(arguments[0]);
				case 2: return new dateConstructor(arguments[0], arguments[1]);
				case 3: return new dateConstructor(arguments[0], arguments[1], arguments[2]);
				case 4: return new dateConstructor(arguments[0], arguments[1], arguments[2], arguments[3]);
				case 5: return new dateConstructor(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
				case 6: return new dateConstructor(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
				case 7: return new dateConstructor(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
			}
		}

		return new dateConstructor();
	};
})();