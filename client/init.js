$(document).ready(function(){
	$(document).on("click", 'img', function (e) {
	    var url = $(this).attr('data-src');
	    Meteor.call('openFile', url);
	});
});