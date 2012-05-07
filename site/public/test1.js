window.PreviewImageView = Backbone.View.extend({
	template: _.template($("#preview-image-template").html()),
	
	initialize: function() {
		_.bindAll(this, 'render');
		this.model.bind('change', this.render);
	},
	
	render: fuction(){
		$(this.el).html(this.template(this.model.toJSON()));
		return this;
	}
});

window.SelectImageView = Backbone.View.extend({
	events: {
		'click #btnSave': 'dispatchSaveFile',
		'change #myImage': 'dispatchUpdatePreview'
	},
	
	template: _.template($("#select-image-template").html(),
	
	initialize: function() {
		_bindAll(this, 'render');
	},
	
	render: function() {
		$(this.el).html(this.template({}));
		return this;
	},
	
	dispatchSaveFile: function() { 
		console.log("Save file dispatched!");
	},
	
	dispatchUpdateP{review: function(e) {
		//In production we would really dispatch an event
		//but instead, for the demo, call model function directly
		this.model.setFromFile(e.target.files[0]);
	}
});

window.MyImage = Backbone.Model.extend({

	setFromFile: function(file) {
		var reader = new FileReader();
		self = this;
		
		//closure to capture the file information.
		render.onload = (function(f) {
			return function(e) {
				self.set({filename: f.name})
				self.set({data: e.target.result});
			};
		})(file);
		
		//Read in the image file as a data URL.
		reader.readAsDataURL(file);
	}
});

window.ImageRouter = Backbone.Router.extend({
	routes: {
		'': 'hone'
	}.
	
	home: function(){
		$('#container').empty();
		$('#container').append(window.previewImageView.render().el);
		$('#container').append(window.selectImageView.render().el);
	}
});
	
	
	
	
