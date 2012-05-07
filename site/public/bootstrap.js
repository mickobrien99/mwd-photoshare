(function($) {

	$(document).ready(function() {
		
		window.defaultMyImage = new MyImage({filename: 'preview.png', data: 'img/preview.png'});
		window.previewImageView = new PreviewImageView({model: window.defaultMyImage});
		window.selectImageView = new SelectImageView({model: window.defaultMyImage});
		
		window.App = new window.ImageRouter();
		Backbone.history.start();
		
	});
	
})(jQuery);