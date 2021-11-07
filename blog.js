function getBlogFeed(url, blogType) {

	var a = document.createElement('A');
	a.href = url;
	if (blogType == 'wordpress') {
		if (_.last(a.pathname) != '/') {
			a.pathname += '/';
		}
		a.pathname += 'feed/';
	} else if (blogType == 'blogger') {
		if (_.last(a.pathname) != '/') {
			a.pathname += '/';
		}
		a.pathname += 'feeds/posts/default';
		a.search = '?alt=rss';
	} else if (blogType == 'tumblr') {
		if (_.last(a.pathname) != '/') {
			a.pathname += '/';
		}
		a.pathname += 'rss';
	} else if (blogType == 'pinterest') {
		if (_.last(a.pathname) != '/') {
			a.pathname += '/';
		}
		a.pathname += 'feed.rss/';
	}

	return a.href;
}

function loadFeeds(number, callback) {
	var blogFeed = getBlogFeed(Settings.blogUrl, Settings.blogType);
	var blogUrl = blogFeed.replace(/&quot;/ig, ' ');
	var method = 'load';
	var url =
		'https://ajax.googleapis.com/ajax/services/feed/' + method + '?v=1.0&num='+number+'&q=' + encodeURIComponent(blogUrl);
	$.getFeed({
		url: blogUrl,
		success: function (jfeed) {
			var json = jfeedToGfeed(jfeed);
			if (!json['responseData']) {
				callback(null);
				return;
			}
			var entries = json["responseData"]["feed"]["entries"];
			if (json["responseData"] != undefined && entries != undefined) {
				if (entries.length == 0) {
					callback(null);
					return;
				}
				for (var i = 0; i < entries.length; i++) {
					entries[i]['class'] =
						i == 0 ? ' class="first" ' : i == entries.length - 1 ? ' class="end" ' : '';
					entries[i]['img'] = '';

					if(entries[i]['publishedDate']){
						var d = new Date(entries[i]['publishedDate']);
						entries[i]['timestamp'] = d.getTime();
						entries[i]['localDate'] = d.toLocaleString();
					}

					if (entries[i]["mediaGroups"] != undefined && /^image/.test(entries[i]["mediaGroups"][0]["contents"][0]["type"])) {
						entries[i]['img'] = entries[i]["mediaGroups"][0]["contents"][0]["url"];
					} else {
						try {
							var $img = $(entries[i]['content']).find('img').addBack('img').eq(0);
							if ($img.length) {
								var src = $img.attr('src');
								if (src) {
									if (src.indexOf('//') == 0) {
										src = 'http:' + src;
									}
									entries[i]['img'] = src;
								}
							}
						} catch (e) {
						}
					}

				}
				callback(entries);
			} else {
				callback(null);
			}
		},
		error: function(xhr,text,error){
			callback(null);
		}
	});
}

function showParseFailedMessage() {
	if ('AppsgeyserJSInterface' in window) {
		return;
	}
	$('#index-banner').find('.container').html("Sorry, grabbing blog posts failed!<br>" +
	"- Make sure you are using blog home page url <br>" +
	"- Double check you selected correct blog type <br>" +
	"- Remove unneeded url parameters<br>" +
	"- If it didn't help, try another blog url or contact us");
}

function selectLatestEntry(entries){
	var maxTime = 0;
	var entry = null;
	for(var i = 0; i < entries.length; i++){
		if(entries[i]['timestamp'] > maxTime){
			maxTime = entries[i]['timestamp'];
			entry = entries[i];
		}
	}
	return entry;
}