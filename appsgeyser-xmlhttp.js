function AppsgeyserXmlHttpRequest() {
	this.method = 'get';
	this.url = "";
	this.async = true;
	this.asyncCallback = null;
	this.readyState = 0;
	this.status = null;
	this.responseText = "";

	function getJSInterface(){
		if('AppsgeyserJSInterface' in window){
			return AppsgeyserJSInterface;
		} else if('NotificationInterface' in window){
			return NotificationInterface;
		} else {
			return null;
		}
	}

	this.open = function(method, url, async){
		this.method = method;//TODO: method and status support
		this.url = url;
		this.async = async;
		this.readyState = 0;
		this.status = null;
		this.responseText = "";
	};

	this.generateCallbackName = function(){
		this.asyncCallback = "asyncCallback" + (Math.round(Math.random()*10000000000000000));
		return this.asyncCallback;
	};

	this.sendAsync = function(body){
		var that = this;
		var callback = this.generateCallbackName();
		window[callback] = function(response){
			that.responseText = response;
			that.readyState = 4;
			if(that.responseText.length > 0){
				that.status = 200;
			} else {
				that.status = 400;
			}
			if(typeof that.onreadystatechange == 'function') that.onreadystatechange();
			if(that.status == 200){
				if(typeof that.onload == 'function') that.onload();
			} else {
				if(typeof that.onerror == 'function') that.onerror();
			}
		};

		getJSInterface().sendXMLHTTPRequest(this.url, callback);
	};

	this.send = function(body){
		if(this.async){
			this.sendAsync(body);
		} else {
			throw "Unsupported";
			this.sendSync(body);
		}
	};

	this.setRequestHeader = function(){
		//TODO: unsupported
	};

	this.getAllResponseHeaders = function(){
		//TODO: unsupported
	};
}