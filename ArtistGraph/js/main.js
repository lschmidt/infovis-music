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

	var width = 700,
	height = 500;

	var numArtists = 15;
    var numDrawnArtistsCap = 4;
    var numDrawnArtists = 0;
	var minEdgeLen = 60;
    var firstRun = true;
    var tagCloudLimit = 12;
	var artistSelected = false;
    var artistInput = ""
    var tagLimit = 50;
    
    var filterInList = []
    var filterOutList = []
    var filterInFlag = 0;
    var filterOutFlag = 0;
    var filterPopFlag = 0;
    var filterPCount = 0;
    
    var globalArtistData = [];
    var globalArtistSupp = [];
    var globalName = "";
    
	var color = d3.scale.category20();

	var force = d3.layout.force()
	.charge(-1000)
    .gravity(.3)
	.friction(.8)
	.size([width, height]);

	var svg = d3.select("#chart").append("svg")
	.attr("width", width)
	.attr("height", height);
   
    var svgTagCloud = d3.select("#filterCloudDiv").append("svg")
                        .attr("width", 200)
                        .attr("height", 60)
                       // .call(dragAll);
    var svgFilterIn = d3.select("#filterInDivLabels").append("svg")
                        .attr("width", 190)
                        .attr("height", 60)
    var svgFilterOut = d3.select("#filterOutDivLabels").append("svg")
                        .attr("width", 190)
                        .attr("height", 60) 
    var query = window.location.search;
    // Skip the leading ?, which should always be there,
    // but be careful anyway
    if (query.substring(0, 1) == '?') {
        query = query.substring(1);
    }
    var data = query.split(',');
    for (i = 0; (i < data.length); i++) {
        data[i] = decodeURIComponent(data[i]);
    }
    if(data[0].length > 0){
        lastfm.artist.getCorrection({artist: data[0]}, {success: function(newName){			
			if(!((typeof newName.corrections.correction) === "undefined")){
				globalName = newName.corrections.correction.artist.name;		
				console.log("Corrected artist to:" + newName.corrections.correction.artist.name);}
            else{globalName = data[0];}
        
            $("input:first").val(globalName); 
            updateTagCloud(globalName, tagCloudLimit, firstRun);
                        
            rebuildGraph(globalName, function (){return false;});
			}});
    }
                        
                        
    //manual tag entry for filter in                       
    $('#filter-in-form').submit(function (){
        var tag = $("#filter-in-form input:text").val(); 
        filterInList.push(tag);
        updateFilterIn(1);
        if(artistSelected && $("#filter-in-form input:checkbox").attr('checked')){refilterGraph(globalName, globalArtistData, globalArtistSupp)}
        return false;
    });
    
    $("#filter-pop-radio-form").change(function(){
        if($("#filter-pop-radio-form input:radio").attr("checked")=="checked"){
            filterPCount = 1; 
        }
        else{ 
            filterPCount = 0; 
        }
    });
    
    //checkbox activation for filter in
    function updateFilterIn(firstRun){
        console.log(filterInList)
        if(firstRun){
            svgFilterIn.selectAll('text.tnode')
            .data(filterInList)
            .enter().append("text")
            .text(function(d, i) { return d; })
            .attr("class", "tnode")
            .attr("fill", "#1a1a1a")
            .attr("y", function(d,i){return i*11+10})
        }
        else{
            svgFilterIn.selectAll('text.tnode').data(filterInList).exit().remove()
            svgFilterIn.selectAll('text.tnode')
                            .data(filterInList)
                            .transition()
                            .text(function(d) { return d; })
                            .attr("y", function(d,i){return i*11+10})
        }
    }

    //manual tag entry for filter out
    $('#filter-out-form').submit(function (){
        var tag = $("#filter-out-form input:text").val(); 
        filterOutList.push(tag);
        updateFilterOut(1)
        if(artistSelected && $("#filter-out-form input:checkbox").attr('checked')){refilterGraph(globalName, globalArtistData, globalArtistSupp)}
        return false;
    });
    
    function updateFilterOut(firstRun){
        console.log(filterOutList)
        if(firstRun){
            svgFilterOut.selectAll('text.tnode')
            .data(filterOutList)
            .enter().append("text")
            .text(function(d, i) { return d; })
            .attr("class", "tnode")
            .attr("fill", "#1a1a1a")
            .attr("y", function(d,i){return i*11+10})
        }
        else{
            svgFilterOut.selectAll('text.tnode').data(filterOutList).exit().remove()
            svgFilterOut.selectAll('text.tnode')
                            .data(filterOutList)
                            .transition()
                            .text(function(d) { return d; })
                            .attr("y", function(d,i){return i*11+10})
        }
    }

    
    $('#artist-text-form').submit(function (){
        var num = $("#artist-text-form input:text").val(); 
        if(num < 3){
            $("#artist-text-form input:text").val(3);
        }else{
            numDrawnArtistsCap = Math.min(num, numArtists);
            $("#artist-text-form input:text").val(numDrawnArtistsCap); 
        }
        if(artistSelected){refilterGraph(globalName, globalArtistData, globalArtistSupp)}
        return false;
    });
   
    $('#filter-pop-form').submit(function (){
        var num = $("#filter-pop-form input:text").val(); 
        if(num < 0){
            $("#filter-pop-form input:text").val(0);
        }else{
            filterPopFlag = Math.min($("#filter-pop-form input:text").val(), numArtists); 
            $("#filter-pop-form input:text").val(filterPopFlag); 
        }
        if(artistSelected){refilterGraph(globalName, globalArtistData, globalArtistSupp)}
        return false;
    });
    
    
    function drawGraph(jsonGraph){
		var link = svg.selectAll("line.link")
		.data(jsonGraph.links)
		.attr("x1", width/2)
		.attr("y1", height/2)
		.attr("x2", width/2)
		.attr("y2", height/2)
		.enter().append("line")
		.attr("opacity", 0.8)
		.attr("class", "link")
		.style("stroke-width", function(d) { return Math.sqrt(30*d.value); });      
		
		var node = svg.selectAll("circle.node")
		.data(jsonGraph.nodes)
		.attr("cx", function(d){ return 200; } )
		.attr("cy", function(d){ return 200; } )
		.enter().append("circle")
		.attr("class", "node")
		.attr("r", function(d, i) { if(i==0){return 10}else{return 8}});
		//.style("fill", function(d) { return "#b70300"})
		
		var labels = svg.selectAll("text.tnode")
		.data(jsonGraph.nodes)
		.enter().append("text")
		.text(function(d) { return d.name; })
		.attr("class", "tnode")
		.attr("fill", "#1a1a1a")
		.attr("x", function(d){ return d.x; } )
		.attr("y", function(d){ return d.y; } );

		force
		.nodes(jsonGraph.nodes)
		.links(jsonGraph.links)
		.linkDistance(function(d){return Math.max((200-d.value*200), minEdgeLen);})
		.start();

		node.call(force.drag);
		
		force.on("tick", function() {
			link.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

			node.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });

			labels.attr("x", function(d) { return d.x+10; })
			.attr("y", function(d) { return d.y+10; });
		});
	}
	
	function transitionGraph(updatedJsonGraph){
		//force.stop()
		svg.selectAll("circle.node")
			.data(updatedJsonGraph.nodes)
            .exit().remove();
        
        svg.selectAll("line.link")
			.data(updatedJsonGraph.links)
            .exit().remove();
        
        svg.selectAll("text.tnode")
			.data(updatedJsonGraph.nodes)
            .exit().remove();
        
        svg.selectAll("circle.node")
			.data(updatedJsonGraph.nodes)
			.transition()
		   	//.style("fill", function() {return '#'+(Math.random()*0xFFFFFF<<0).toString(16);})
			.duration(500);
			
	    svg.selectAll("line.link")
			.data(updatedJsonGraph.links)
			.transition()
			.style("stroke-width", function(d) { return Math.sqrt(30*d.value);})      
			.duration(500);

	
	 	svg.selectAll("text.tnode")
			.data(updatedJsonGraph.nodes)
			.transition()
			.text(function(d) { return d.name; })
			.duration(500);

		force
			.nodes(updatedJsonGraph.nodes)
			.links(updatedJsonGraph.links)
			.linkDistance(function(d){return Math.max((200-d.value*200), minEdgeLen);})
            .start()
            .alpha(.1);
	}
    

    
    function updateTagCloud(artistName, tagLimit, initial){
        if(initial){
            lastfm.artist.getTopTags({artist:artistName}, {success: function(topTagData){
                svgTagCloud.selectAll("text.tnode")
                    .data(topTagData.toptags.tag.slice(0,tagLimit))
                    .enter().append("text")
                    .text(function(d) { return d.name; })
                    .attr("class", "tnode")
                    .attr("fill", "#1a1a1a")
                    .attr("x", function(d,i){return Math.random()*30 +(i%2)*90})
                    .attr("y", function(d,i){return Math.floor(i/2)*10+8})
            }});
        }else{
            lastfm.artist.getTopTags({artist:artistName}, {success: function(topTagData){
                svgTagCloud.selectAll("text.tnode")
                    .data(topTagData.toptags.tag.slice(0,tagLimit))
                    .text(function(d) { return d.name; })
                    .attr("class", "tnode")
                    .attr("fill", "#1a1a1a")
                    .attr("x", function(d,i){return Math.random()*30+(i%2)*90})
                    .attr("y", function(d,i){return Math.floor(i/2)*10+8})
            }});        
        }
    }
    
    
    function filterIn(artistData, filterIn){
         for (art in artistData){
            breakout = 0;
            for (tag in filterIn) {
                for(atag in artistData[art].tags){
                    if(filterIn[tag] == artistData[art].tags[atag].name){
                        breakout = 1;
                        break;
                    }
                }
                if(breakout){break;}
            }
            if(breakout){artistData[art].include = 1;}
            else{artistData[art].include = 0;}
        }
    }
    
    function filterOut(artistData, filterOut){
        for (art in artistData){
            breakout = 0;
            for (tag in filterOut) {
                for(atag in artistData[art].tags){
                    if(filterOut[tag] == artistData[art].tags[atag].name){
                        breakout = 1;
                        break;
                    }
                }
                if(breakout){break;}
            }
            if(breakout){
                artistData[art].include = 0;
            }
        }
    }
    
    //THIS IS SO BROKEN, SIGH -2:41am
    function filterEvents(artData, callback){
        callback(artData);
    }  
    
    //returns the index of the most popular viable artist
    function mostPopularArtist(artistData){
        var maxine = -1;
        var maxind = -1;
        for (ind in artistData){
            if(filterPCount){
                if(artistData[ind].include && artistData[ind].playcount > maxine){
                    maxind = ind;
                    maxine = artistData[ind].playcount; 
                }
            }else{
                if(artistData[ind].include && artistData[ind].listeners > maxine){
                    maxind = ind;
                    maxine = artistData[ind].listeners; 
                }
            }
        }
        return maxind;
    }
    
    function filterPopularity(artistData){
        //take out the top 
        for (var i=0; i < filterPopFlag; i++){
            alert("Dropping " + artistData[mostPopularArtist(artistData)].name)
            artistData[mostPopularArtist(artistData)].include = 0;
         } 
    }
    
    function sleep(ms){
        var dateTime = new Date();
		dateTime.setTime(dateTime.getTime() + ms);
		while (new Date().getTime() < dateTime.getTime());
    }
    
    function getAllTheTags(name, callback){
        lastfm.artist.getTopTags({artist: name}, {success: function(taggies){
            callback(taggies.toptags.tag.slice(0,tagLimit))
        }});
    }
    
    function getSimilarArtistInfo(similarArtists, callback){
        var simArtistData = [];
        for (i in similarArtists){
            sleep(50);
            lastfm.artist.getInfo({artist: similarArtists[i].name}, {success: function(artInfo){ 
                getAllTheTags(similarArtists[i].name, function(ttags) {
                    simArtistData.push({name:artInfo.artist.name,
                                         mbid:artInfo.artist.mbid, 
                                         listeners:Number(artInfo.artist.stats.listeners),
                                         playcount:Number(artInfo.artist.stats.playcount),
                                         url:artInfo.artist.url,
                                         tags:ttags,
                                         include:"1"});
                    if(simArtistData.length == similarArtists.length){callback(simArtistData);}
                    return 0;
                });//get top tags
            }});//getinfo
        }
    }
    
    function resetArtistViability(localArtistData){
        for (i in globalArtistData){
            globalArtistData[i].include = 1;
         }
        for (j in localArtistData){
            localArtistData[j].include = 1;
        }
        return localArtistData;
    }
    
    function rebuildGraph(name, callback){
        lastfm.artist.getSimilar({artist: name, limit:numArtists}, {success: function(data1){
            getSimilarArtistInfo(data1.similarartists.artist, function(artistData2){
                //set the designated poor-form globals
                globalArtistData = artistData2;
                globalArtistSupp = data1;
                //Filter the users
                refilterGraph(name, globalArtistData, globalArtistSupp);
                //make a call to the comparison screen!
                callback();
            });
        }}); //get similar+transition
    }
    
    function refilterGraph(name, artistData, data1){
        var listy1 = [];
        var listLink1 = [];
        var jsonGraph1 = {};
        
        artistData = resetArtistViability(artistData);
        if(filterInFlag){filterIn(artistData, filterInList);}
        if(filterOutFlag){filterOut(artistData, filterOutList);}
        if(filterPopFlag){filterPopularity(artistData);}
        listy1.push({"name":name});
        var c = 0;
        for (var i=0, len = artistData.length; i < len; i++){
            if(artistData[i].include && c < numDrawnArtistsCap){
                listy1.push({"name":artistData[i].name})
                listLink1.push({"source":0, "target":c+1, "value":data1.similarartists.artist[i].match})
                c += 1;
            }
        }

        jsonGraph1 = {"nodes":listy1, "links":listLink1};
    
        if(firstRun){
            drawGraph(jsonGraph1);
            firstRun = false;
        }else if(c <= numDrawnArtists) {
            transitionGraph(jsonGraph1);
        }else if(c > numDrawnArtists) {
            svg.selectAll("circle.node").remove();
            svg.selectAll("line.link").remove();
            svg.selectAll("text.tnode").remove();
            drawGraph(jsonGraph1);
        }
        runListeners();
        numDrawnArtists = c;
    }
    
    function runListeners(){
        d3.selectAll("line.link").on("click", function(d) {
                    console.log(d.source.name +"---"+ d.target.name)
                    sendData(d.source.name, d.target.name);
        })
        //delete filtered items
        svgFilterIn.selectAll("text.tnode").on("click", function (d){
            ind = filterInList.indexOf(d);
            filterInList = filterInList.slice(0,ind).concat(filterInList.slice(ind+1, filterInList.length));
            updateFilterIn(0);
        });
        
        //delete filtered items
        svgFilterOut.selectAll("text.tnode").on("click", function (d){
            ind = filterOutList.indexOf(d);
            filterOutList = filterOutList.slice(0,ind).concat(filterOutList.slice(ind+1, filterOutList.length));
            updateFilterOut(0);
        });
        
        //check box activation for filter in    
        $("#filter-in-check input:checkbox").change(function(){                
//        $("#filter-in-form input:checkbox").change(function(){
            if($(this).attr('checked')){filterInFlag=1; console.log('Filtering In');}
            else{filterInFlag=0;resetArtistViability();console.log('!Filtering In');}
            refilterGraph(globalName, globalArtistData, globalArtistSupp);
            return false;
        });
        
        //check box activation for filter out
        $("#filter-out-check input:checkbox").change(function(){
            if($(this).attr('checked')){filterOutFlag=1; console.log('Filtering Out');}
            else{filterOutFlag=0;resetArtistViability();console.log('!Filtering Out');}
            refilterGraph(globalName, globalArtistData, globalArtistSupp);
            return false;
        }); 
        
        d3.selectAll("circle.node").on("click", function(node) {
            updateTagCloud(node.name, tagCloudLimit, firstRun);
            globalName = node.name;
            rebuildGraph(node.name, function() {return false;});
        });//node click

    }

    function sendData(artist1, artist2){
      // Initialize packed or we get the word 'undefined'      
      var delim = ",";
      window.location = "layout.html?" + artist1 + delim + artist2;
    }


	$('#submitter').submit(function() {
        var jsonGraph = {}; 
        var listy = [];
        var listLink = [];	
        artistInput = $("input:first").val(); 
        artistSelected = true;
        
        
        //Check for artist correction
		lastfm.artist.getCorrection({artist: artistInput}, {success: function(newName){			
			if(!((typeof newName.corrections.correction) === "undefined")){
				artistInput = newName.corrections.correction.artist.name;		
				console.log("Corrected artist to:" + newName.corrections.correction.artist.name);}
        
            globalName = artistInput; 
            updateTagCloud(artistInput, tagCloudLimit, firstRun);
                        
            rebuildGraph(artistInput, function (){return false;});
			}});// name correction 
		return false;
		});//d3 select button
	});//on window load jquery
