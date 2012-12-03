// on page load
var lastfm;
 $(window).load(function() {

    // define api keys
    var apiKey = 'c4065c4468f69134f9f5d558c364a7ce';
    var apiSecret = '0784b173d4b9f31d71d921a82a654ec2';
 
    // create a Cache object
    var cache = new LastFMCache();

    // create a LastFM object
     lastfm = new LastFM({
        apiKey    : apiKey,
        apiSecret : apiSecret,
        cache     : cache
    });
	var query = window.location.search;
  // Skip the leading ?, which should always be there,
  // but be careful anyway
  if (query.substring(0, 1) == '?') {
    query = query.substring(1);
  }
  var data = query.split(',');
  for (i = 0; (i < data.length); i++) {
    data[i] = unescape(data[i]);
  }
   
  drawSunburst(data[0]);
  getArtist(data[0],"left");
    
  //change html on sunburst blocks
  sunburst(data[0], data[1], "left");
  sunburst(data[1], data[0], "right");
  graphComparison(data[0], data[1]);
    
});

function graphComparison(artistName, artist2Name)
{
	var div = "#centerfootercol2";
	$(div).html("Graph Comparison<br><a href='../ArtistGraph/layout.html?" + artistName + "," + artist2Name + "'><img src='bargraph.png' alt='Double Bar Graph'></a>");

}
   
function sunburst(artistName, artistOther, leftOrRight)
{
 var artist = artistName;
        
		if(leftOrRight == "left")
		{
			var div = "#leftfootercol";
		}
		else
		{
			var div = "#rightfootercol";
		}
        
        // Check if a value has been entered into the search
        
        $(div).html("Historical-Sunburst: " + artist + "<br><a href='../Sunburst/index.html?" + artist + "," + artistOther + "'><img src='wheel.png' alt='Sunburst'></a>");

}
   
   
   
     function drawSunburst(artistName) {
    var topArtistName = '';
    //var tagName = document.forms["inputForm"].elements["tagInput"].value;
    
    // get weekly artist chart by tag 'trance'
    lastfm.artist.getPastEvents({artist: artistName}, {success: function(data){

        // render top weekly artist using 'lastfmTemplateArtists' template
       // $('#top_artists').html(
         //   $('#lastfmTemplateArtists').render(data.events.event)
			
        //);
		var test = new Array();
		var pastEventsArray = new Array();
		var listLink = new Array();
		var listLink1 = {};
		var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
		for (var i=0, len = data.events.event.length; i < len; i++){
		
		}
for (var i=0, len = data.events.event.length; i < len; i++){
var d = new Date (data.events.event[i].startDate);
var month = monthNames[d.getMonth()];
var year = d.getFullYear();
year = ''+year+'';

if (typeof(test[year]) === "undefined")
{
test[year]=new Array();
//test[year].push(month);
test[year][month] = new Array();
test[year][month][data.events.event[i].title + "/"+ data.events.event[i].venue.name + "/"+ data.events.event[i].venue.location.city] = new Array();
//test[year][month].push(data.events.event[i].title);
}

else
{
if(typeof(test[year][month]) === "undefined")
//test[year].push(month);
test[year][month] = new Array();
test[year][month][data.events.event[i].title + "/"+ data.events.event[i].venue.name + "/" + data.events.event[i].venue.location.city] = new Array();
//test[year][month].push(data.events.event[i].title);
}

			}
			for (var j = 0 ; j < Object.keys(test).length ; j++)
			{ 
				var yearEvents = new Array();
				for (var k = 0 ; k < Object.keys(test[Object.keys(test)[j]]).length ; k++)
			  {
			    var monthEvents = new Array();
			    for (var m = 0; m < Object.keys(test[Object.keys(test)[j]][Object.keys(test[Object.keys(test)[j]])[k]]).length ; m++)
				{
			 // $.extend(c, {children:{"name": Object.keys(test[Object.keys(test)[j]])[k],"children": [
				//		{"name":"hello","size":i+1}
					//		]}});
					
			    monthEvents.push({name:Object.keys(test[Object.keys(test)[j]][Object.keys(test[Object.keys(test)[j]])[k]])[m],colour:"#FEE8D6"});
				}
				yearEvents.push({name:Object.keys(test[Object.keys(test)[j]])[k],children:monthEvents});
			 }
			 
pastEventsArray.push({name:Object.keys(test)[j],children:yearEvents});
			}
var pastEventsJson = {"children":pastEventsArray};


var width = 840,
    height = width,
    radius = width / 2,
    x = d3.scale.linear().range([0, 2 * Math.PI]),
    y = d3.scale.pow().exponent(2.8).domain([0, 1]).range([0, radius]),
    padding = 4,
    duration = 1000;

var div = d3.select("#centercol");

div.select("img").remove();

var vis = div.append("svg")
    .attr("width", width + padding * 2)
    .attr("height", height + padding * 2)
  .append("g")
    .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

div.append("p")
    .attr("id", "intro")
    .text("Click to zoom!");

var partition = d3.layout.partition()
    .sort(null)
    .value(function(d) { return 5.8 - d.depth; });

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, d.y ? y(d.y) : d.y); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });


  var nodes = partition.nodes(pastEventsJson);
//vis.data([pastEventsJson]).selectAll("path")
  var path = vis.selectAll("path").data(nodes);
  path.enter().append("path")
      .attr("id", function(d, i) { return "path-" + i; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", colour)
      .on("click", click);

  var text = vis.selectAll("text").data(nodes);
  var textEnter = text.enter().append("text")
      .style("fill-opacity", 1)
      .style("fill", function(d) {
        return brightness(d3.rgb(colour(d))) < 125 ? "#eee" : "#000";
      })
      .attr("text-anchor", function(d) {
        return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
      })
      .attr("dy", "0em")
      .attr("transform", function(d) {
        var multiline = (d.name || "").split("/").length > 1,
            angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
            rotate = angle + (multiline ? -.5 : 0);
        return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
      })
      .on("click", click);
      
var act = textEnter.append("tspan")
    .attr("id", "EvEvent")
    .attr("title", d.name)
      .attr("x", 0)
	  .attr("dy", "-.5em")
      .attr("fill", function(d){return (d.depth < 3) ? "black" : "#A64100"})
      .text(function(d) { return d.depth ? nameTooLong(d.depth, d.name.split("/")[0], 40) : ""; });
      
var venue = textEnter.append("tspan")
    .attr("id", "EvVenue")
      .attr("x", 0)
      .attr("dy", ".9em")
      .attr("fill", "#0F4DA8")
      .text(function(d) { return d.depth ? nameTooLong(d.depth, d.name.split("/")[1], 40) || "" : ""; });

var loc =  textEnter.append("tspan")
    .attr("id", "EvLocation")
    .attr("x", 0)
      .attr("dy", ".9em")
      .attr("fill", "#34D800")
      .text(function(d) { return d.depth ? nameTooLong(d.depth, d.name.split("/")[2], 40 ) || "" : ""; });

  function click(d) {
    path.transition()
      .duration(duration)
      .attrTween("d", arcTween(d));

    // Somewhat of a hack as we rely on arcTween updating the scales.
    text.style("visibility", function(e) {
          return isParentOf(d, e) ? null : d3.select(this).style("visibility");
        })
      .transition()
        .duration(duration)
        .attrTween("text-anchor", function(d) {
          return function() {
            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
          };
        })
        .attrTween("transform", function(d) {
          var multiline = (d.name || "").split(" ").length > 1;
          return function() {
            var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                rotate = angle + (multiline ? -.5 : 0);
            return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
          };
        })
        .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
        .each("end", function(e) {
          d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
        });
  }
;

function nameTooLong(depth, inputStr, strLen){
    if(depth >= 3){
        if(inputStr.length > strLen){
            return inputStr.slice(0,strLen);
        }else{return inputStr;}
    }else{
        return inputStr;
    }
}

function isParentOf(p, c) {
  if (p === c) return true;
  if (p.children) {
    return p.children.some(function(d) {
      return isParentOf(d, c);
    });
  }
  return false;
}

function colour(d) {
  if (d.children) {
    // There is a maximum of two children!
    var colours = d.children.map(colour),
        a = d3.hsl(colours[0]),
        b = d3.hsl(colours[1]);
    // L*a*b* might be better here...
    return d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2);
  }
  return d.colour || "#fff";
}

// Interpolate the scales!
function arcTween(d) {
  var my = maxY(d),
      xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
      yd = d3.interpolate(y.domain(), [d.y, my]),
      yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
  return function(d) {
    return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
}

function maxY(d) {
  return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
}

// http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
function brightness(rgb) {
  return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
}
    }});
	
}
function getArtist(artistName, leftOrRight){
   	    // Save Search Term
        var artist = artistName;
        
		if(leftOrRight == "left")
		{
			var header = "h1Left";
			var div = "#leftcol";
		}
		else
		{
			var header = "h1Right";
			var div = "#rightcol";
		}
        
        // Check if a value has been entered into the search
        if(artist == ''){
        	$(div).html("<h2 class='loading'>We Can't Find Related Artists Without an Artist! Enter One!</h2>");
        } 
        else {
            $.getJSON("http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + encodeURIComponent(artist) + "&api_key=6be25b22a1523c79be75513d30d14e99&limit=12&format=json&callback=?", function(data) {
                console.log(encodeURI(artist))
                var html = '';
                console.log(data.artist.name)
        		//$.each(data.artist.url, function(i, item) {
            		html += "<h1>" + data.artist.name + "</h1><center><a href='" + data.artist.url + "'><img src='" + data.artist.image[2]['#text'] + " ' alt=' " + data.artist.name + " 'style='border: 1px solid black;' /></a></center>" +
					data.artist.bio.summary;
        		//}); // End each
        		
        		$(div).html("<ul class='clearfix'>" +html+ "</ul>");
    		}); // End getJSON

        } // End Else
   		return false;
   } // End getArtists
