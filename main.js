if(!Settings.colorsFromTheme){
	Settings.themeColors.colorPrimary = "#" + Settings.colorPrimary;
	Settings.themeColors.colorAccent = "#" + Settings.colorAccent;
	Settings.themeColors.colorPrimaryDark = "#" + Settings.colorPrimaryDark;
}

$('nav a').css('color', Settings.themeColors.colorPrimary);
$('head').append(
	'<style>.card-content h1, ' +
	'.card-content h2, .card-content h3,' +
	'.card-content h4  {color: '+Settings.themeColors.colorPrimaryDark+ '}' +
	'.tabs .indicator  {background-color: '+Settings.themeColors.colorPrimaryDark+ '}' +
	'.card .card-title.header {color: '+ Settings.themeColors.colorPrimary + ';}' +
	'.tabs .tab a {color: '+ Settings.themeColors.colorPrimary + ';}' +
	'.material-icons {color: '+ Settings.themeColors.colorPrimary + ';}' +
	'.tabs .tab a:hover {color: '+ Settings.themeColors.colorPrimary + ';}' +
	'.spinner-blue-only {border-color: '+ Settings.themeColors.colorPrimary + ';}' +
	'</style>');
$('.brand-logo').text(Settings.name);
if(!Settings.notificationsEnabled){
	$('.settings').hide();
	if('AppsgeyserJSInterface' in window){
		AppsgeyserJSInterface.setItem('notifications',false);
	}
}

var ONE_HOUR = 1000 * 60 * 60;
function applyNotificationSettings(){
	var notifications = AppsgeyserJSInterface.getItem('notifications');
	if(notifications !== 'false'){
		AppsgeyserJSInterface.registerUpdateChecker('checker.html', ONE_HOUR);
	} else {
		AppsgeyserJSInterface.removeUpdateChecker('checker.html');
	}
}

jQuery(function ($) {


	$(document).on({
		mouseenter: function () {
			if( $.jStorage.get($(this).attr('id')) )
				$(this).html('star_border');
			else
				$(this).html('star');

		},
		mouseleave: function () {
			if( $.jStorage.get($(this).attr('id')) )
				$(this).html('star');
			else
				$(this).html('star_border');

		},
		click: function () {
			var id = $(this).attr('id'), value = $.jStorage.get(id);
			if(!value){
				$('#fav .row h5').remove();
				$.jStorage.set(id,id);
				$(this).html('star');
				$('#fav .row').append($('#post'+id.replace(/fav\-/g, '')).clone());
			} else {
				$.jStorage.deleteKey(id);
				$(this).html('star_border');
				$('#fav .row').find('#post'+id.replace(/fav\-/g, '')).remove();
				$('#'+id).html('star_border');
				if( $('#fav .row div').length == 0 ) $('#fav .row').html('<h5 style="line-height: 40px;" class="center">Tap <i class="material-icons" style="font-size: 2.2em;position: relative;top: 15px;">star_border</i> to add post to favorites</h5>');
			}
		}
	}, ".card-action i");


	$(document).on({
		click: function () {
			var id = $(this).data('local-id'), value =  $.jStorage.get('post'+id);
			if(!value) $.jStorage.set('post'+id,id);
		}

	}, ".card-action a");

	function getFeeds() {
		$('.loader').show();
		$(".feed-collection").html('');
		var li_template =
			'<div class="collection-item  col s12" id="post{{timestamp}}" >' +
			'<div class="card {{class}}">' +
			'<div class="card-content">' +
			'<span class="card-title header">{{title}}</span><br/>' +
			'{{content}}' +
			'' +
			'<div class="post-time">{{localDate}}</div></div>' +
			'<div class="card-action">' +
			'<a style="display:block;margin-bottom: 20px;padding-top: 5px;color: '+ Settings.themeColors.colorAccent
			+'" href="{{link}}" class="left" data-local-id="{{timestamp}}">Open in browser</a>' +
			'<i class="material-icons right" id="fav-{{timestamp}}" style="font-size: 2.2em;color: '+ Settings.themeColors.colorAccent+'">star_border</i>' +
			'</div> ' +
			'</div>' +
			'</div>';

		loadFeeds(
			100,
			function (entries) {
				$('.loader').hide();
				if (!entries) {
					showParseFailedMessage();
					return;
				}
				if('AppsgeyserJSInterface' in window){
					var latest = selectLatestEntry(entries);
					var lastPostTime = parseInt(AppsgeyserJSInterface.getItem('lastPostTime'));
					if(isNaN(lastPostTime) || lastPostTime < latest['timestamp']){
						AppsgeyserJSInterface.setItem('lastPostTime',latest['timestamp'].toString());
						console.log('Last post time ' + latest['timestamp']);
					}
					if('registerUpdateChecker' in AppsgeyserJSInterface){
						applyNotificationSettings()
					}
				}


				var rss = '',
					id_w = Array(),
					id_f = Array();
				for (var i = 0; i < entries.length; i++) {
					rss += li_template.replace(/{{(\w+)}}/ig, function (search, key) {
						if( key == 'timestamp' ) if( $.jStorage.get('post'+entries[i][key]) ) id_w.push(entries[i][key]);

						if( key == 'timestamp' ) if( $.jStorage.get('fav-'+entries[i][key]) ) id_f.push(entries[i][key]);

						return entries[i][key];
					});
				}
				if (!rss.length) {
					showParseFailedMessage();
					return;
				}

				$('.channels-collection').html(rss);

				id_w = jQuery.unique(id_w);
				id_f = jQuery.unique(id_f);

				for ( var i = 0; i <id_w.length; i++ ) $('#post'+id_w[i]+' .card .card-content').addClass('watched');
				if( id_f.length > 0 ) $('#fav .row').html('');
				for ( var i = 0; i <id_f.length; i++ ) {
					$('#fav-'+id_f[i]).html('star');
					$('#fav .row').append($('#post'+id_f[i]).clone());
				}

				setTimeout(function () {
					var hash = location.hash;
					location.hash = "dummy_hash_for_webkit_silly_behavior";
					location.hash = hash;
				},100);
			}
		);
	}

	getFeeds();
	$('#refresh-feed').click(getFeeds);
	
	$('#notifications').click(function(e){
		var value = $(this).prop("checked");
        if('AppsgeyserJSInterface' in window){
            AppsgeyserJSInterface.setItem('notifications',value);
	        applyNotificationSettings();
        }
	});
    if('AppsgeyserJSInterface' in window){
		var notifications = AppsgeyserJSInterface.getItem('notifications');
		if(notifications !== 'false'){
            AppsgeyserJSInterface.setItem('notifications',true);
			$('#notifications').prop('checked', true);
		}else{
            AppsgeyserJSInterface.setItem('notifications',false);
			$('#notifications').prop('checked', false);
		}
	}
});