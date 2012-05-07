var i = 0

var app = {
  model: {},
  view: {},  
  social: [{name:'twitter'},{name:'facebook'}],
  tabs: {
    hometab:  { index:i++, icon:'home', },
    capture:  { index:i++, icon:'86-camera', },
    share:    { index:i++, icon:'share', },
    map:      { index:i++, icon:'map', },
    info:     { index:i++, icon:'info', },
  },
  platform: /Android/.test(navigator.userAgent)?'android':'ios',
  initialtab: 'hometab'
}

console.log(app)


var bb = {
  model: {},
  view: {}
}


bb.init = function() {

  bb.model.State = Backbone.Model.extend({    
    defaults: {
      content: 'none'
    },
  })


  bb.view.Navigation = Backbone.View.extend({    
    initialize: function( items ) {
      var self = this
      _.bindAll(self)

      self.elem = {
        header: $("#header"),
        footer: $("#footer")
      }

      self.elem.header.css({zIndex:1000})
      self.elem.footer.css({zIndex:1000})

      function handletab(tabname) {
        return function(){
          app.model.state.set({current:tabname})
        }
      }

      var tabindex = 0
      for( var tabname in app.tabs ) {
        console.log(tabname)
        $("#tab_"+tabname).tap(handletab(tabname))
      }

      app.scrollheight = window.innerHeight - self.elem.header.height() - self.elem.footer.height()
      if( 'android' == app.platform ) {
        app.scrollheight += self.elem.header.height()
      }
    },

    render: function() {
    }
  })

  
  bb.view.Header = Backbone.View.extend({    
    initialize: function( items ) {
      var self = this
      _.bindAll(self)

      self.elem = {
        login_btn: $('#header_login'),
        logout_btn: $('#header_logout')
      }

      app.model.state.on('change:user',self.render)
    },

    render: function() {
      var self = this

      var user = app.model.state.get('user')
      
      if( user ) {
        self.elem.login_btn.hide()
        self.elem.logout_btn.show()
      }
      else {
        self.elem.login_btn.show()
        self.elem.logout_btn.hide()
      }
    }
  })
  
  
  bb.view.SocialMsg = Backbone.View.extend({    
    initialize: function( items ) {
      var self = this
      _.bindAll(self)

      self.elem = {msg:{}}
      app.social.forEach(function(service){
        self.elem.msg[service.name] = $('#social_msg_'+service.name)
        self.elem.msg[service.name].tap(function(){
          self.socialmsg(service)
        })
      })

      app.model.state.on('change:user',self.render)
    },

    render: function() {
      var self = this

      var user = app.model.state.get('user')
      app.social.forEach(function(service){
        var btn = self.elem.msg[service.name].show()

        if( user && user.service === service.name ) {
          btn.show()
        }
        else {
          btn.hide()
        }
      })
    },

    socialmsg: function( service ) {
      console.log(service.name)
      
	  http.post('/user/socialmsg/Hi',{},function(res){
        alert( res.ok ? 'Message sent!' : 'Unable to send message.')
      })
    }
  })
  
  
  bb.view.Content = Backbone.View.extend({    
    initialize: function( initialtab ) {
      var self = this
      _.bindAll(self)

      self.current = initialtab
      self.scrollers = {}

      app.model.state.on('change:current',self.tabchange)

      window.onresize = function() {
        self.render()
      }

      app.model.state.on('scroll-refresh',function(){
        self.render()
      })
    },

    render: function() {
      var self = this

      app.view[self.current] && app.view[self.current].render()

      var content = $("#content_"+self.current)
      if( !self.scrollers[self.current] ) {
        self.scrollers[self.current] = new iScroll("content_"+self.current)      
      }

      content.height( app.scrollheight ) 

      setTimeout( function() {
        self.scrollers[self.current].refresh()
      },300 )
    },

    tabchange: function() {
      var self = this

      var previous = self.current
      var current = app.model.state.get('current')
      console.log( 'tabchange prev='+previous+' cur='+current)

      $("#content_"+previous).hide().removeClass('leftin').removeClass('rightin')
      $("#content_"+current).show().addClass( app.tabs[previous].index <= app.tabs[current].index ?'leftin':'rightin')
      self.current = current

      self.render()
    }
  })


  bb.view.Hometab = Backbone.View.extend({
    initialize: function() {
      var self = this
      _.bindAll(self)

      self.elem = {
        accel_watch_btn: $('#hometab_accel_watch'),
        accel_stop_btn:  $('#hometab_accel_stop'),
        accel_x: $('#hometab_accel_x'),
        accel_y: $('#hometab_accel_y'),
        accel_z: $('#hometab_accel_z'),
        accel_x_val: $('#hometab_accel_x_val'),
        accel_y_val: $('#hometab_accel_y_val'),
        accel_z_val: $('#hometab_accel_z_val'),

        button: $('#hometab_button')
      }

      self.elem.accel_watch_btn.tap(function(){
        self.watchID = navigator.accelerometer.watchAcceleration(self.update_accel,app.erroralert,{frequency:10})
      })

      self.elem.accel_stop_btn.tap(function(){
        self.watchID && navigator.accelerometer.clearWatch(self.watchID)
      })

      function call_update_button(name) {
        return function() { self.update_button(name) }
      }

      document.addEventListener("backbutton", call_update_button('back'))
      document.addEventListener("menubutton", call_update_button('menu'))
      document.addEventListener("searchbutton", call_update_button('search'))
    },

    render: function() {
    },

    update_accel: function(data) {
      var self = this
      self.elem.accel_x.css({marginLeft:data.x<0?70+(70*data.x):70, width:Math.abs(70*data.x)})
      self.elem.accel_y.css({marginLeft:data.y<0?70+(70*data.y):70, width:Math.abs(70*data.y)})
      self.elem.accel_z.css({marginLeft:data.z<0?70+(70*data.z):70, width:Math.abs(70*data.z)})
      self.elem.accel_x_val.text(data.x)
      self.elem.accel_y_val.text(data.y)
      self.elem.accel_z_val.text(data.z)
    },

    update_button: function(name) {
      var self = this
      self.elem.button.text(name)
    }
  })


  bb.view.Capture = Backbone.View.extend({
    initialize: function() {
      var self = this
      _.bindAll(self)

      self.elem = {
        image_btn: $('#capture_image'),
        select_btn: $('#select_image'),
        upload_btn: $('#upload_image'),
        image_play: $('#display_image')        
      }

      self.elem.image_btn.tap(function(){
        navigator.device.capture.captureImage(function(mediafiles){
          console.log('mick22222');
          console.log(JSON.stringify(JSON.stringify(mediafiles)));
          self.elem.image_play.attr({src:'file://'+mediafiles[0].fullPath})
          app.model.state.trigger('scroll-refresh')
        },app.erroralert)
      })

	  self.elem.select_btn.tap(function(){
		navigator.camera.getPicture(function(uri){
                //var img = document.getElementById('display_image');
                console.log('mick111');
                console.log(JSON.stringify(uri));
                self.elem.image_play.style.display = 'block';
                self.elem.image_play.src = uri;
                //document.getElementById('camera_status').innerHTML = "Success";
            },
            function(e){
                console.log("Error getting picture: " + e);
                //document.getElementById('camera_status').innerHTML = "Error getting picture.";
            },
            {quality: 50, destinationType: navigator.camera.DestinationType.FILE_URI, sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY});
	  })
	  
	  
	  self.elem.upload_btn.tap(function(){
		// Get URI of picture to upload
        var imageURI = self.elem.image_play.src;
        if (!imageURI) { // || (self.elem.image_play.style.display == "none")) {
			console.log('no image uri defined - ' + JSON.stringify(imageURI));
            //document.getElementById('camera_status').innerHTML = "Take picture or select picture from library first.";
            return;
        }
        
        // Verify server has been entered
        server = 'http://127.0.0.1:8081/newimage/';
        if (server) {
			console.log("starting upload");
            // Specify transfer options
            var options = new FileUploadOptions();
            options.fileKey="file";
            options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
            options.mimeType="image/jpg";
            options.chunkedMode = false;

            // Transfer picture to server
            var ft = new FileTransfer();
            ft.upload(imageURI, server, function(r) {
				console.log("upload successful");
                //document.getElementById('camera_status').innerHTML = "Upload successful: "+r.bytesSent+" bytes uploaded.";
            }, function(error) {
                console.log("upload failed");
				//document.getElementById('camera_status').innerHTML = "Upload failed: Code = "+error.code;
            }, options);
        }
	  })
	  
      //self.elem.select_btn.tap(function(){
      //  navigator.device.capture.captureVideo(function(mediafiles){
      //    self.elem.video_play.show().attr({href:'file://'+mediafiles[0].fullPath})
      //    app.model.state.trigger('scroll-refresh')
      //  },app.erroralert)
      //})

      //self.elem.upload_btn.tap(function(){
      //  navigator.device.capture.captureAudio(function(mediafiles){
      //    self.elem.audio_play.show().attr({href:'file://'+mediafiles[0].fullPath})
      //    app.model.state.trigger('scroll-refresh')
      //  },app.erroralert)
      //})

    },
    render: function() {
    }
  })

  bb.view.Share = Backbone.View.extend({
    initialize: function() {
      var self = this
      _.bindAll(self)

      self.elem = {
      }
    },
    render: function() {
    }
  })

  bb.view.Map = Backbone.View.extend({
    initialize: function() {
      var self = this
      _.bindAll(self)

      self.elem = {
		getlocation_btn: $('#getLocation')
      }
	
		self.elem.getlocation_btn.tap(function(){
			navigator.geolocation.getCurrentPosition(function (position){
				var image_url = "http://maps.google.com/maps/api/staticmap?sensor=true&center=" + position.coords.latitude + "," +
				position.coords.longitude + "&zoom=15&size=300x400&markers=color:green|" +
				position.coords.latitude + ',' + position.coords.longitude;

				jQuery("#mymap").remove();
				jQuery("#mapdisplay").append(
					jQuery(document.createElement("img")).attr("src", image_url).attr('id','mymap')
					);
			},function (error)
			{
				switch(error.code)
				{
					case error.PERMISSION_DENIED:
						alert("user did not share geolocation data");
						break;

					case error.POSITION_UNAVAILABLE:
						alert("could not detect current position");
						break;

					case error.TIMEOUT:
						alert("retrieving position timed out");
						break;

					default:
						alert("unknown error");
						break;
				}
			});
		})
    },
    render: function() {
    }
  })

  bb.view.Info = Backbone.View.extend({
    initialize: function() {
      var self = this
      _.bindAll(self)

      self.elem = {
        name: $('#phonegap_name'),
	    settings: $('#phonegap_phonegap'),
		platform: $('#phonegap_platform'),
		uuid: $('#phonegap_uuid'),
		version: $('#phonegap_version'),
      }
    },

    render: function() {
      var self = this

      //self.elem.name.txt(device.name)
      //self.elem.phonegap.txt(device.phonegap)
      //self.elem.platform.txt(device.platform)
      //self.elem.uuid.txt(device.uuid)
      //self.elem.version.txt(device.version)
    }
  })

}


app.boot = function() {
  document.ontouchmove = function(e){ e.preventDefault(); }
  $( '#main' ).live( 'pagebeforecreate',function(){
    app.boot_platform()
  })
}

app.boot_platform = function() {
  if( 'android' == app.platform ) {
    $('#header').hide()
    $('#footer').attr({'data-role':'header'})
    $('#content').css({'margin-top':59})
  }
}

app.init_platform = function() {
  if( 'android' == app.platform ) {
    $('li span.ui-icon').css({'margin-top':-4})
  }
}

app.start = function() {
  http.get('/user',function(user){
    if( user.id ) {
      app.model.state.set({user:user})
    }
  })
  
  $("#tab_"+app.initialtab).tap()
}

app.erroralert = function( error ) {
  alert(error)
}


app.init = function() {
  console.log('start init')
  
  app.init_platform()
  
  app.dc = new DataCapsule({
    prefix:'capsule',
    acc:'001',
    coll:'entry',
    spec:'app=sdc',
    makeid: function(item) {
      return 1+'_'+now()
    }
  })
  
  bb.init()
  
  app.model.state = new bb.model.State()
  
  app.view.navigation = new bb.view.Navigation(app.initialtab)
  app.view.navigation.render()

  app.view.content = new bb.view.Content(app.initialtab)
  app.view.content.render()
  
  app.view.header = new bb.view.Header()
  app.view.header.render()
  
  app.view.socialmsg = new bb.view.SocialMsg()
  app.view.socialmsg.render()
  
  app.view.hometab  = new bb.view.Hometab()
  app.view.capture  = new bb.view.Capture()
  app.view.share    = new bb.view.Share()
  app.view.map      = new bb.view.Map()
  app.view.info     = new bb.view.Info()
  
  app.start()
  
  console.log('end init')
}

app.boot()
$(app.init)