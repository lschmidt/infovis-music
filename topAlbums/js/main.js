// on page load
 $(window).load(function() {

    // define api keys
    var apiKey = 'fa1830abafe042c4a5a8a49d9f966288';
    var apiSecret = '6296e2516b3980a5e884dc037336766d';
 
    // create a Cache object
    var cache = new LastFMCache();

    // create a LastFM object
    var lastfm = new LastFM({
        apiKey    : apiKey,
        apiSecret : apiSecret,
        cache     : cache
    });
    d3.select("button").on("click", function() {
    var topArtistName = '';
    var tagName = document.forms["inputForm"].elements["tagInput"].value;
    
    // get weekly artist chart by tag 'trance'
    lastfm.tag.getWeeklyArtistChart({tag: tagName, limit: 5}, {success: function(data){

        // render top weekly artist using 'lastfmTemplateArtists' template
        $('#top_artists').html(
            $('#lastfmTemplateArtists').render(data.weeklyartistchart.artist)
        );

        // define top artist name
        topArtistName = data.weeklyartistchart.artist[0].name;
		
    }});
});
});