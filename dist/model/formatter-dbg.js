sap.ui.define([], function () {
	"use strict";

	return {

		toBoolean: function (sValue) {
			if (sValue === true) {
				return "X";
			} else {
				return "";
			}
		},
		dateFormatter: function (sDate) {
			jQuery.sap.require("sap.ui.core.format.DateFormat");

			if (sDate) {
				var date = new Date(sDate);
				return date.toLocaleDateString().substr(6) + "" + date.toLocaleDateString()
					.substr(3, 2) + '' + date.toLocaleDateString().substr(0, 2);
			} else {
				return "";
			}

		}

	};
});