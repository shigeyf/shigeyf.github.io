/*jshint jquery:true */

$(document).ready(function ($) {
    "use strict";

    /*jshint -W018 */

    /* ---------------------------------------------------------------------- */
	/*	background dark-light toggle
	/* ---------------------------------------------------------------------- */

    var togButton = $('a.toggle-dark');

    togButton.on('click', function (event) {
        event.preventDefault();
        $('body').toggleClass('dark');
    });


});
