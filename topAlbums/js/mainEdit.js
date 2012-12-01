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
    //var topArtistName = '';
    var tagName = document.forms["inputForm"].elements["tagInput"].value;
    
    // get weekly artist chart by tag 'trance'
    lastfm.artist.getEvents({artist: tagName ,limit:5, autocorrect:1}, {success: function(data){

        // render upcoming events for the artist using 'lastfmTemplateArtists' template
        $('#top_artists').html(
          $('#lastfmTemplateArtists').render(data.events.event)
        );
		 		
 //var date = data.events.event.startDate;
var margin = {top: 19, right: 20, bottom: 20, left: 19},
    width = 960 - margin.right - margin.left, // width
    height = 136 - margin.top - margin.bottom, // height
    cellSize = 17; // cell size

var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    percent = d3.format(".1%"),
    format = d3.time.format("%Y-%m-%d");

var color = d3.scale.quantize()
    .domain([-.05, .05])
    .range(d3.range(9));

var svg = d3.select("#chart").selectAll("svg")
    .data(d3.range(2012, 2015))
  .enter().append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "RdYlGn")
  .append("g")
    .attr("transform", "translate(" + (margin.left + (width - cellSize * 53) / 2) + "," + (margin.top + (height - cellSize * 7) / 2) + ")");

svg.append("text")
    .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
    .attr("text-anchor", "middle")
    .text(String);

var rect = svg.selectAll("rect.day")
    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return week(d) * cellSize; })
    .attr("y", function(d) { return day(d) * cellSize; })
    .datum(format);

rect.append("title")
    .text(function(d) { return d; });

svg.selectAll("path.month")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);

/*
	var dispElem = new Array();
	var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
	var listy = new Array();
	var listLink = new Array();
	var listLink1 = {};
	
 for (var i=0, len= data.events.event.length;i<len;i++)
 {
	var elemDate = new Date (data.events.event[i].startDate);
	var month = monthNames[elemDate.getMonth()];
	var year = elemDate.getFullYear();
	year = '\''+year+'\'';
	var elemName = data.events.event[i].name;
	
	if (typeof(dispElem[year]) === "undefined")
{
dispElem[year]=new Array();
//dispElem[year].push(month);
dispElem[year][month] = new Array();
dispElem[year][month].push(elemName);
}

else
{
if(typeof(dispElem[year][month]) === "undefined")
//dispElem[year].push(month);
dispElem[year][month] = new Array();
dispElem[year][month].push(elemName);
}
}

			for (var j = 0 ; j < Object.keys(dispElem).length ; j++)
			{ var c = {
				name : Object.keys(dispElem)[j]}
			 for (var k = 0 ; k < Object.keys(dispElem[Object.keys(dispElem)[j]]).length ; k++)
			  {
			    for (var m = 0; m < Object.keys(dispElem[Object.keys(dispElem)[j]][Object.keys(dispElem[Object.keys(dispElem)[j]])[k]]).length ; m++)
				{
				   var f = {
				"children" : 
                {"name": Object.keys(dispElem[Object.keys(dispElem)[j]])[k],"children": [
						{"name":Object.keys(dispElem[Object.keys(dispElem)[j]])[k],"size":1}
							]}
                
				}
				listLink.push(f);
				}
				$.extend(listLink1,{children:listLink});
}
$.extend(c,{children:listLink1});
listy.push(c);
			}

var jsonGraph = {"children":test};
       var json = jsonGraph; */
 
 
for (var i=0, len= data.events.event.length;i<len;i++)
 {  
	var eventDate = data.events.event[i].startDate;
	var eventName = data.events.event[i].name;
	var countsByDate1 = {i:eventDate};
	//console.log(countsByDate1);
	var countsByDate2 = {i: eventName};
	var dateCounts = d3.entries(countsByDate1);
	console.log(JSON.stringify(dateCounts[0]));
	<script language="javascript">
		document.write (dateCounts); //prints the value of dateCounts
	</script> 
 
/*d3.csv("dji.csv", function(csv) {
	var data = d3.nest()
    .key(function(d) { return d.Date; })
   .rollup(function(d) { return (d[0].Close - d[0].Open) / d[0].Open; })
   .map(csv); */

  rect.filter(function(d) { return d in data; })
      .attr("class", function(d) { return "day q" + color(data[d]) + "-9"; })
    .select("title")
      .text(function(eventName) { return d + ": " + percent(data[d]); });
}
//});

function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
	  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}
   }});
});
});