// Width and height
var w = 1400;
var h = 600;
var centered;

var minIncome, maxIncome, minMaleIncome, maxMaleIncome, 
minFemaleIncome, maxFemaleIncome;


var tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);

var incomeArray = ["#edf8e9", "#bae4b3", "#74c476", "#31a354","#006d2c"];
var maleIncomeArray = ["#edf8e9", "#bae4b3", "#74c476", "#31a354","#006d2c"];
var femaleIncomeArray = ["#edf8e9", "#bae4b3", "#74c476", "#31a354","#006d2c"];

var incomeColor = d3.scale.threshold()
                    .range(["#edf8e9", "#bae4b3", "#74c476", "#31a354","#006d2c"])
                    .domain([0, 40000, 60000, 80000, 140000]);
                    
var maleIncomeColor = d3.scale.threshold()
                    .range(["#edf8e9", "#bae4b3", "#74c476", "#31a354","#006d2c"])
                    .domain([0, 40000, 60000, 80000, 140000]);
                    
var femaleIncomeColor = d3.scale.threshold()
                    .range(["#edf8e9", "#bae4b3", "#74c476", "#31a354","#006d2c"])
                    .domain([0, 40000, 60000, 80000, 140000]);

 var colorScale = d3.scale.threshold()
    .domain([0, 5, 10, 15, 20])
    .range([0].concat(incomeColor.range()));

// Set up projections

//Geomap template code taken from http://bost.ocks.org/mike/map/
var SFProjection = d3.geo.mercator()
   	.center([-122.433701, 37.767683])
    .scale(660000)
    .translate([w / 2 - 510, h /2 - 60]);
    

var femaleSFProjection = d3.geo.mercator()
   	.center([-122.433701, 37.767683])
    .scale(260000)
    .translate([w / 2 -60, h / 2 - 60 ]);

var maleSFProjection = d3.geo.mercator()
   	.center([-122.433701, 37.767683])
    .scale(260000)
    .translate([w / 2 + 390, h / 2 - 60 ]);
               
// Set up paths
var SFpath = d3.geo.path()
   	.projection(SFProjection)

var fSFpath = d3.geo.path()
   	.projection(femaleSFProjection)

// Set up paths
var mSFpath = d3.geo.path()
   	.projection(maleSFProjection)



document.write('<div id= "Titles"><div id="leftCol"><div id= "mapTitle1">Average Income</div></div>');

document.write('<div id="midCol"><div id= "mapTitle2">Average Female Income</div></div>');
document.write('<div id="rightCol"><div id= "mapTitle3">Average Male Income</div></div></div>');

var incomeLegend = ["0 - 20,000", "20,000 - 50,000", "50,000 - 80,000", "80,000 - 100,000", "100,000 +"];
			    
// Set up SVGs


var svg = d3.select("body").append("svg")
    .attr("width", w)
    .attr("height", h);

svg.append("rect")
    .attr("class", "background")
    .attr("width", w)
    .attr("height", h)
    .style("fill", "#fff")

var g = svg.append("g");

//legend creation attached to the svg
var legend = svg.selectAll(".legend")
    .data(colorScale.domain(), function(d) { return d; })
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(-60,-80 )");

//the appending of the legend by color
 legend.append("rect")
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", function(d,i){ return 250 + (200 * i);})
        .attr("y", h-60)
        .attr("width", 200)
        .attr("height", 30)
        .attr("fill", function(d, i){ return incomeArray[i];})
        .style("stroke", "white")
        .style("stroke-width", "1px");  

//appends the text in the legend color boxes
 legend.append("text")
        .attr("x", function(d,i){ return 260 + (200 * i);})
        .attr("y", h-40)
        .attr("width", 200)
        .attr("height", 30)
        .style("fill", "black")
        //.style("font-weight", "bold")
        .text(function(d, i) { return incomeLegend[i];});



d3.csv("SFData.csv", function(data) {
    
    minIncome = d3.min(data, function(d) { return d.income; });
    maxIncome = d3.max(data, function(d) { return d.income; });
    
    minMaleIncome = d3.min(data, function(d) { return d.maleIncome; });
    maxMaleIncome = d3.max(data, function(d) { return d.maleIncome; });
    
    minFemaleIncome = d3.min(data, function(d) { return d.femaleIncome; });
    maxFemaleIncome = d3.max(data, function(d) { return d.femaleIncome; });
   
        
    d3.json("incomeSF.json", function(json) {
        // Loop through once for each pop data value
        for (var i = 0; i < data.length; i++) {
            // Grab area name
            var dataArea = data[i].Id2;
            
            // Grab data value, and convert from string to float
            var incomeData = parseFloat(data[i].income);
            var femaleIncomeData = parseFloat(data[i].femaleIncome);  
            var maleIncomeData = parseFloat(data[i].maleIncome);  
            //Find the corresponding area inside the GeoJSON
            //console.log(json.features.length);
            for (var j = 0; j < json.features.length; j++) {
              var jsonArea = json.features[j].properties.geoid;
              var geoID = jsonArea.substring(1, 11);
               if (dataArea == geoID) {
                	json.features[j].properties.income = incomeData;
                    json.features[j].properties.femaleIncome = femaleIncomeData;
                    json.features[j].properties.maleIncome = maleIncomeData;
                	break;
        		}
    		}           
   		}   
   	        g.append("g")
   		       .selectAll("path")
        	.data(json.features)
            .enter()
            .append("path")
            .attr("d", SFpath)
            .style("stroke", "white")
            .style("fill", function(d) {
		        //Get data value
		        var value = d.properties.income;
            
		        if (value) {
		        	//If value exists…
		            return incomeColor(value);
		        } else {
		            //If value is undefined…
		            return "#ccc";
		        }
             })
            
            .on("mouseover", function(e){
                tooltip.transition()
                        .duration(20)
                        .style("opacity", .9);
                  tooltip.html("Average Income: " + Math.round(e.properties.income / 1000) + ",000" +"<br>Female Income: $" + Math.round(e.properties.femaleIncome / 1000) + ",000" +"<br>Male Income: $" + Math.round(e.properties.maleIncome / 1000) + ",000" )

                        .style("left", (d3.event.pageX + 5) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");})
            .on("mouseout", function(e){
                tooltip.transition()
                   .duration(20)
                   .style("opacity", 0);});
           		});

});


d3.csv("SFData.csv", function(data) {
    
    minIncome = d3.min(data, function(d) { return d.income; });
    maxIncome = d3.max(data, function(d) { return d.income; });
    
    minMaleIncome = d3.min(data, function(d) { return d.maleIncome; });
    maxMaleIncome = d3.max(data, function(d) { return d.maleIncome; });
    
    minFemaleIncome = d3.min(data, function(d) { return d.femaleIncome; });
    maxFemaleIncome = d3.max(data, function(d) { return d.femaleIncome; });
   
    
        
        
    d3.json("fIncomeSF.json", function(json) {
        // Loop through once for each pop data value
        for (var i = 0; i < data.length; i++) {
            // Grab area name
            var dataArea = data[i].Id2;
            
            // Grab data value, and convert from string to float
            var incomeData = parseFloat(data[i].income);
            var femaleIncomeData = parseFloat(data[i].femaleIncome);     
            var maleIncomeData = parseFloat(data[i].maleIncome);     
            //Find the corresponding area inside the GeoJSON
            //console.log(json.features.length);
            for (var j = 0; j < json.features.length; j++) {
              var jsonArea = json.features[j].properties.geoid;
              var geoID = jsonArea.substring(1, 11);
               if (dataArea == geoID) {
                	json.features[j].properties.income = incomeData;
                	json.features[j].properties.femaleIncome = femaleIncomeData;
                    json.features[j].properties.maleIncome = maleIncomeData;
                	break;
        		}
    		}           
   		}   
   	        g.append("g")
   		       .selectAll("path")
        	.data(json.features)
            .enter()
            .append("path")
            .attr("d", fSFpath)
            .style("stroke", "white")
            .style("fill", function(d) {
		        //Get data value
		        var value = d.properties.femaleIncome;
            
		        if (value) {
		        	//If value exists…
		            return femaleIncomeColor(value);
		        } else {
		            //If value is undefined…
		            return "#ccc";
		        }
             })
            
            .on("mouseover", function(e){
                tooltip.transition()
                        .duration(20)
                        .style("opacity", .9);
                  tooltip.html("Average Income: " + Math.round(e.properties.income / 1000) + ",000" +"<br>Female Income: $" + Math.round(e.properties.femaleIncome / 1000) + ",000" +"<br>Male Income: $" + Math.round(e.properties.maleIncome / 1000) + ",000" )
                        .style("left", (d3.event.pageX + 5) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");})
            .on("mouseout", function(e){
                tooltip.transition()
                   .duration(20)
                   .style("opacity", 0);});
           		});

});

d3.csv("SFData.csv", function(data) {
    
    minIncome = d3.min(data, function(d) { return d.income; });
    maxIncome = d3.max(data, function(d) { return d.income; });
    
    minMaleIncome = d3.min(data, function(d) { return d.maleIncome; });
    maxMaleIncome = d3.max(data, function(d) { return d.maleIncome; });
    
    minFemaleIncome = d3.min(data, function(d) { return d.femaleIncome; });
    maxFemaleIncome = d3.max(data, function(d) { return d.femaleIncome; });
   
        
        
    d3.json("mIncomeSF.json", function(json) {
        // Loop through once for each pop data value
        for (var i = 0; i < data.length; i++) {
            // Grab area name
            var dataArea = data[i].Id2;
            
            // Grab data value, and convert from string to float
            var incomeData = parseFloat(data[i].income);
            var femaleIncomeData = parseFloat(data[i].femaleIncome); 
            var maleIncomeData = parseFloat(data[i].maleIncome);     
            
            //Find the corresponding area inside the GeoJSON
            //console.log(json.features.length);
            for (var j = 0; j < json.features.length; j++) {
              var jsonArea = json.features[j].properties.geoid;
              var geoID = jsonArea.substring(1, 11);
               if (dataArea == geoID) {
                	json.features[j].properties.income = incomeData;
                    json.features[j].properties.femaleIncome = femaleIncomeData;
                	json.features[j].properties.maleIncome = maleIncomeData;
                	break;
        		}
    		}           
   		}   
   	        g.append("g")
   		       .selectAll("path")
        	.data(json.features)
            .enter()
            .append("path")
            .attr("d", mSFpath)
            .style("stroke", "white")
            .style("fill", function(d) {
		        //Get data value
		        var value = d.properties.maleIncome;
            
		        if (value) {
		        	//If value exists…
		            return maleIncomeColor(value);
		        } else {
		            //If value is undefined…
		            return "#ccc";
		        }
             })
            
            .on("mouseover", function(e){
                tooltip.transition()
                        .duration(20)
                        .style("opacity", .9);
                  tooltip.html("Average Income: " + Math.round(e.properties.income / 1000) + ",000" +"<br>Female Income: $" + Math.round(e.properties.femaleIncome / 1000) + ",000" +"<br>Male Income: $" + Math.round(e.properties.maleIncome / 1000) + ",000" )
                        .style("left", (d3.event.pageX + 5) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");})
            .on("mouseout", function(e){
                tooltip.transition()
                   .duration(20)
                   .style("opacity", 0);});
           		});

});

function Income() {
	
   //overrides previous legend with income legend
   legend.append("rect")
        .attr("x", function(d,i){ return 250+(200 * i);})
        .attr("y", h-60)
        .attr("width", 200)
        .attr("height", 30)
        .attr("fill", function(d, i){ return incomeArray[i];})
        .style("stroke", "white")
        .style("stroke-width", "1px");   
    
    //overrides previous legend text with income text
    legend.append("text")
            .attr("x", function(d,i){ return 260 + (200 * i);})
            .attr("y", h-40)
            .attr("width", 200)
            .attr("height", 30)
            .style("fill", "black")
            .text(function(d, i) { return incomeLegend[i];});
    
	d3.selectAll("path")
            .style("stroke", "white")
            .transition().duration(1000)
            .style("fill", function(d) {
		        //Get data value
		        var value = d.properties.income;
		        if (value) {
		        	//If value exists…
		            return incomeColor(value);
		        } else {
		            //If value is undefined…
		            return "#ccc";
		        }
             });
}


function maleIncome() {
	
   //overrides previous legend with income legend
   legend.append("rect")
        .attr("x", function(d,i){ return 250+(200 * i);})
        .attr("y", h-60)
        .attr("width", 200)
        .attr("height", 30)
        .attr("fill", function(d, i){ return maleIncomeArray[i];})
        .style("stroke", "white")
        .style("stroke-width", "1px");   
    
    //overrides previous legend text with income text
    legend.append("text")
            .attr("x", function(d,i){ return 260 + (200 * i);})
            .attr("y", h-40)
            .attr("width", 200)
            .attr("height", 30)
            .style("fill", "black")
            .text(function(d, i) { return maleIncomeLegend[i];});
    
	d3.selectAll("path")
            .style("stroke", "white")
            .transition().duration(1000)
            .style("fill", function(d) {
		        //Get data value
		        var value = d.properties.maleIncome;
		        if (value) {
		        	//If value exists…
		            return maleIncomeColor(value);
		        } else {
		            //If value is undefined…
		            return "#ccc";
		        }
             });
}

function femaleIncome() {
	
   //overrides previous legend with income legend
   legend.append("rect")
        .attr("x", function(d,i){ return 250+(200 * i);})
        .attr("y", h-60)
        .attr("width", 200)
        .attr("height", 30)
        .attr("fill", function(d, i){ return femaleIncomeArray[i];})
        .style("stroke", "white")
        .style("stroke-width", "1px");   
    
    //overrides previous legend text with income text
    legend.append("text")
            .attr("x", function(d,i){ return 260 + (200 * i);})
            .attr("y", h-40)
            .attr("width", 200)
            .attr("height", 30)
            .style("fill", "white")
            .text(function(d, i) { return femaleIncomeLegend[i];});
    
	d3.selectAll("path")
            .style("stroke", "white")
            .transition().duration(1000)
            .style("fill", function(d) {
		        //Get data value
		        var value = d.properties.femaleIncome;
		        if (value) {
		        	//If value exists…
		            return femaleIncomeColor(value);
		        } else {
		            //If value is undefined…
		            return "#ccc";
		        }
             });
}

