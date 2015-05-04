$(document).ready(function(){
	$(document).on("click", 'img.movie', function (e) {
	    var url = $(this).attr('data-src');
	    Meteor.call('openFile', url);
	});
	$(document).on("click", 'a.movie', function (e) {
		e.preventDefault();
	    var url = $(this).attr('href');
	    Meteor.call('openFile', url);
	});
});