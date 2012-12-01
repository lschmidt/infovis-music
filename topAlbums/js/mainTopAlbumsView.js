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

    var artistName1 = document.forms["inputForm"].elements["artistInput"].value;
   
    // get weekly artist chart by tag 'trance'
    lastfm.artist.getTopAlbums({artist: artistName1, limit: 5}, {success: function(data){

        // render top weekly artist using 'lastfmTemplateArtists' template
        $('#top_artists').html(
            $('#lastfmTemplateArtists').render(data.topalbums.album)
        );
	
    }});
	//});

//d3.select("button").on("click", function() {
	var artistName2 = document.forms["inputForm"].elements["artistInput2"].value;
	lastfm.artist.getTopAlbums({artist: artistName2, limit: 5}, {success: function(data){

        // render top weekly artist using 'lastfmTemplateArtists' template
        $('#top_artists2').html(
            $('#lastfmTemplateArtists2').render(data.topalbums.album)
        );

    }});
	});
	
});