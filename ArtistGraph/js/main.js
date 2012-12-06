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

	var numArtists = 18;
    var numDrawnArtistsCap = 7;
    var numDrawnArtists = 0;
	var minEdgeLen = 80;
    var firstRun = true;
    var tagCloudLimit = 12;
	var artistSelected = false;
    var artistInput = ""
    var tagLimit = 50;
    var linkDistanceMax = 300;
    var edgeWidth = 40;
    
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
	
	svg.selectAll("text").data(["Loading"])
            .enter().append("text")
            .text(function(d, i) { return d; })
            .attr("class", "loading")
            .attr("x", width/2)
            .attr("y", height/4)
            .attr("fill", "black")
            .attr("opacity", 0);

	
    var svgTagCloud = d3.select("#filterCloudDiv")
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
                                            
    //manual tag entry for filter in                       
    $('#filter-in-form').submit(function (){
        var tag = $("#filter-in-form input:text").val(); 
        if(filterInList.indexOf(tag)==-1){
	        filterInList.push(tag);
	        updateFilterIn(1);
	        if(artistSelected && $("#filter-in-form input:checkbox").attr('checked')){refilterGraph(globalName, globalArtistData, globalArtistSupp)}
        }
        return false;
    });
    
    $("#filter-pop-radio-form").change(function(){
        if($("#filter-pop-radio-form input:radio").attr("checked")=="checked"){
            filterPCount = 1; 
        }
        else{ 
            filterPCount = 0; 
        }
        if(artistSelected){refilterGraph(globalName, globalArtistData, globalArtistSupp)}
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
            //delete filtered items
		    svgFilterIn.selectAll("text.tnode").on("click", function (d){
		        ind = filterInList.indexOf(d);
		        filterInList = filterInList.slice(0,ind).concat(filterInList.slice(ind+1, filterInList.length));
		        updateFilterIn(0);
		    });
        }
        else{
            svgFilterIn.selectAll('text.tnode').data(filterInList).exit().remove()
            svgFilterIn.selectAll('text.tnode')
                            .data(filterInList)
                            .transition()
                            .text(function(d) { return d; })
                            .attr("y", function(d,i){return i*11+10})
        }
        console.log($("#filter-in-form input:checkbox"))
        if(artistSelected && $("#filter-in-form input:checkbox").attr('checked')){refilterGraph(globalName, globalArtistData, globalArtistSupp)}
    }

    //manual tag entry for filter out
    $('#filter-out-form').submit(function (){
        var tag = $("#filter-out-form input:text").val(); 
       	if(filterOutList.indexOf(tag)==-1){
	        filterOutList.push(tag);
	        updateFilterOut(1)
	        if(artistSelected && $("#filter-out-form input:checkbox").attr('checked')){refilterGraph(globalName, globalArtistData, globalArtistSupp)}
        }
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
	            .attr("y", function(d,i){return i*11+10});
           	    //delete filtered items
		    svgFilterOut.selectAll("text.tnode").on("click", function (d){
		        ind = filterOutList.indexOf(d);
		        filterOutList = filterOutList.slice(0,ind).concat(filterOutList.slice(ind+1, filterOutList.length));
		        updateFilterOut(0);
		    });
        }
        else{
            svgFilterOut.selectAll('text.tnode').data(filterOutList).exit().remove()
            svgFilterOut.selectAll('text.tnode')
                            .data(filterOutList)
                            .transition()
                            .text(function(d) { return d; })
                            .attr("y", function(d,i){return i*11+10})
        }
        if(artistSelected && $("#filter-out-form input:checkbox").attr('checked')){refilterGraph(globalName, globalArtistData, globalArtistSupp)}
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
        
    if(data[0].length > 0){
        lastfm.artist.getCorrection({artist: data[0]}, {success: function(newName){			
			if(!((typeof newName.corrections.correction) === "undefined")){
				globalName = newName.corrections.correction.artist.name;		
				console.log("Corrected artist to:" + newName.corrections.correction.artist.name);}
            else{globalName = data[0];}
        	artistSelected = true;
        	
            $("input:first").val(globalName); 
            updateTagCloud(globalName, tagCloudLimit, firstRun);
                        
            rebuildGraph(globalName, function (){return false;});
			}});
    }
    
    
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
		.style("stroke-width", function(d) { return Math.sqrt(edgeWidth*d.value)+1; });      
		
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
		.linkDistance(function(d){return Math.max((linkDistanceMax-d.value*linkDistanceMax), minEdgeLen);})
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
			.linkDistance(function(d){return Math.max((linkDistanceMax-d.value*linkDistanceMax), minEdgeLen);})
            .start()
            .alpha(.1);
	}
    

    
    function updateTagCloud(artistName, tagLimit, initial){
        if(initial){
            lastfm.artist.getTopTags({artist:artistName}, {success: function(topTagData){
            var tags = topTagData.toptags.tag;
			var tagArray = new Array();
			for(var i=0; i < tags.length; i++){
				tagArray.push(tags[i].name);
			}
			
			var fill = d3.scale.category20();

			d3.layout.cloud().size([200, 200])
			  .words(tagArray.map(function(d) {
				return {text: d, size: 10 + Math.random() * 20};
			  }))
			  .rotate(function() { return ~~(Math.random() * 2) * 90; })
			  .font("Impact")
			  .fontSize(function(d) { return d.size; })
			  .on("end", draw)
			  .start();
			
            }});
        }else{
            lastfm.artist.getTopTags({artist:artistName}, {success: function(topTagData){
               
                var tags = topTagData.toptags.tag;
			
				var tagArray = new Array();
				
				for(var i=0; i < tags.length; i++){
					tagArray.push(tags[i].name);
				}
				var fill = d3.scale.category20();

				d3.layout.cloud().size([200, 200])
				  .words(tagArray.map(function(d) {
					return {text: d, size: 10 + Math.random() * 20};
				  }))
				  .rotate(function() { return ~~(Math.random() * 2) * 90; })
				  .font("Impact")
				  .fontSize(function(d) { return d.size; })
				  .on("end", draw)
				  .start();
            }});        
        }
    }
	function draw(words) {
		var fill = d3.scale.category20();
		d3.select("#filterCloudDiv").select("svg").remove();
	    d3.select("#filterCloudDiv").append("svg")
	        .attr("width", 200)
	        .attr("height", 200)
	      .append("g")
	        .attr("transform", "translate(90 ,100)")
	      .selectAll("text")
	        .data(words)
	      .enter().append("text")
	        .style("font-size", function(d) { return d.size + "px"; })
	        .style("font-family", "Impact")
	        .style("fill", function(d, i) { return 15; })
	        .attr("text-anchor", "middle")
	        .attr("transform", function(d) {
	          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
	        })
	        .text(function(d) { return d.text; });
  	}
    
    function contains(list, element){
    	lenn = list.length;
    	for(var i = 0; i < lenn; i++){
    		if(list[i].name.toLowerCase() == element.toLowerCase()){return true;}
    	}
    	return false;
    }
    
    function filterIn(){
         for (art in globalArtistData){
            breakout = 0;
            for (tag in filterInList) {
            	if(contains(globalArtistData[art].tags, filterInList[tag])){
                    breakout = 1;
                    break;
            	}
                if(breakout){break;}
            }
            if(breakout){globalArtistData[art].include = 1;}
            else{globalArtistData[art].include = 0;}
        }
    }
    
    function filterOut(){
        for (art in globalArtistData){
            breakout = 0;
            if(globalArtistData[art].include){
	            for (tag in filterOutList) {
	                if(contains(globalArtistData[art].tags, filterOutList[tag])){
	                        breakout = 1;
	                        globalArtistData[art].include = 0;
	                        break;
	                }
	                if(breakout){break;}
	           	}
 	        }
        }
    }
    
    //returns the index of the most popular viable artist
    function mostPopularArtist(){
        var maxine = -1;
        var maxind = -1;
        for (ind in globalArtistData){
            if(filterPCount){
                if(globalArtistData[ind].include && globalArtistData[ind].playcount > maxine){
                    maxind = ind;
                    maxine = globalArtistData[ind].playcount; 
                }
            }else{
                if(globalArtistData[ind].include && globalArtistData[ind].listeners > maxine){
                    maxind = ind;
                    maxine = globalArtistData[ind].listeners; 
                }
            }
        }
        return maxind;
    }
    
    function filterPopularity(){
        //take out the top 
        for (var i=0; i < filterPopFlag; i++){
            alert("Dropping " + globalArtistData[mostPopularArtist(globalArtistData)].name)
            globalArtistData[mostPopularArtist(globalArtistData)].include = 0;
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
            sleep(1);
            lastfm.artist.getInfo({artist: similarArtists[i].name}, {success: function(artInfo){
                getAllTheTags(artInfo.artist.name, function(ttags) {
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
    
    function resetArtistViability(){
        for (i in globalArtistData){
            globalArtistData[i].include = 1;
         }
    }
    
	function artistIncludes(){
     	incl = [];
        for (i in globalArtistData){
            incl.push(globalArtistData[i].include)
         }
         return incl;
    }
    
    function rebuildGraph(name, callback){
    	svg.selectAll("text.loading").transition().duration(550).attr("opacity", .75);
        lastfm.artist.getSimilar({artist: name, limit:numArtists}, {success: function(data1){
        	name = data1.similarartists["@attr"].artist;
        	globalName = name;
            getSimilarArtistInfo(data1.similarartists.artist, function(artistData2){
                //set the designated poor-form globals
                globalArtistData = artistData2;
                globalArtistSupp = data1;
                //Filter the users
                refilterGraph(name, globalArtistSupp);
                svg.selectAll("text.loading").transition().duration(750).attr("opacity", 0);
                //make a call to the comparison screen!
                callback();
            });
        }}); //get similar+transition
    }
    
    function refilterGraph(name, data1){
        var listy1 = [];
        var listLink1 = [];
        var jsonGraph1 = {};
        
        resetArtistViability();
        
        if(filterInFlag){filterIn();}
        if(filterOutFlag){filterOut();}
        if(filterPopFlag){filterPopularity(globalArtistData);}
        listy1.push({"name":name});
        var c = 0;
        for (var i=0, len = globalArtistData.length; i < len; i++){
            if(globalArtistData[i].include && c < numDrawnArtistsCap){
                listy1.push({"name":globalArtistData[i].name})
                listLink1.push({"source":0, "target":c+1, "value":globalArtistSupp.similarartists.artist[i].match})
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
        runGraphListeners();
        numDrawnArtists = c;
    }
    
    
    function runGraphListeners(){
        d3.selectAll("circle.node").on("click", function(node) {
            updateTagCloud(node.name, tagCloudLimit, firstRun);
            globalName = node.name;
            rebuildGraph(node.name, function() {return false;});
        });//node click
        
        d3.selectAll("line.link").on("click", function(d) {
                   // console.log(d.source.name +"---"+ d.target.name)
                    sendData(d.source.name, d.target.name);
        });
    }
    
    
    function runListeners(){        
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
        

    }

    function sendData(artist1, artist2){
      // Initialize packed or we get the word 'undefined'      
      var delim = ",";
      window.location = "layout.html?" + artist1 + delim + artist2;
    }
	
	runListeners();

	$('#submitter').submit(function() {
        var jsonGraph = {}; 
        var listy = [];
        var listLink = [];	
        artistInput = $("input:first").val(); 
        artistSelected = true;
        
        //svg.selectAll("text.loading").transition().duration(550).attr("opacity", 0.75);
        
        //Check for artist correction
		lastfm.artist.getCorrection({artist: artistInput}, {success: function(newName){			
			if(!((typeof newName.corrections.correction) === "undefined")){
				artistInput = newName.corrections.correction.artist.name;		
				console.log("Corrected artist to:" + newName.corrections.correction.artist.name);}
        
            globalName = artistInput; 
            updateTagCloud(artistInput, tagCloudLimit, firstRun);
                        
            rebuildGraph(artistInput, function (){return false;});
			}, error: function(code, message){
				alert(message);
			}});// name correction 
		return false;
		});//d3 select button
	});//on window load jquery
