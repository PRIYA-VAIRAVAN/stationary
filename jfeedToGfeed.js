function jfeedToGfeed(jFeed){
	var response = {responseData:{}};
	response.responseData.feed = jFeed;
	if(!jFeed.items) return response;
	response.responseData.feed.entries = jFeed.items;
	var entries = response.responseData.feed.entries;
	for(var i = 0; i < entries.length; i++){
		entries[i].publishedDate = entries[i].updated;
		entries[i].contentSnippet = entries[i].description;
	}
	response.responseData.entries = entries;
	return response;
}