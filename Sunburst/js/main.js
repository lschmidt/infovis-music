// on page load
 $(window).load(function() {

    // define api keys
    var apiKey = 'c4065c4468f69134f9f5d558c364a7ce';
    var apiSecret = '0784b173d4b9f31d71d921a82a654ec2';
 
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
    lastfm.artist.getPastEvents({artist: tagName}, {success: function(data){

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
year = '\''+year+'\'';

if (typeof(test[year]) === "undefined")
{
test[year]=new Array();
//test[year].push(month);
test[year][month] = new Array();
test[year][month]["Event name: "+data.events.event[i].title + "/" +"Venue Name: "+ data.events.event[i].venue.name + "/"+"City: " + data.events.event[i].venue.location.city] = new Array();
//test[year][month].push(data.events.event[i].title);
}

else
{
if(typeof(test[year][month]) === "undefined")
//test[year].push(month);
test[year][month] = new Array();
test[year][month]["Event name: "+data.events.event[i].title + "/" +"Venue Name: "+ data.events.event[i].venue.name + "/"+"City: " + data.events.event[i].venue.location.city] = new Array();
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
    y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]),
    padding = 5,
    duration = 1000;

var div = d3.select("#vis");

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
  textEnter.append("tspan")
      .attr("x", 0)
	  .attr("dy", "1em")
      .text(function(d) { return d.depth ? d.name.split("/")[0] : ""; });
 textEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "2em")
      .text(function(d) { return d.depth ? d.name.split("/")[1] || "" : ""; });
  textEnter.append("tspan")
      .attr("x", 0)
      .attr("dy", "3em")
      .text(function(d) { return d.depth ? d.name.split("/")[2] || "" : ""; });


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
	
});
});