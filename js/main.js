var premChart;
var sexChart;
var monthChart;
var dayChart;
var activityChart;

d3.json("data/part-poli.json", function(err, data) {
    if (err) throw err;

    data.forEach(function (d) {
        var ms = Date.parse(d["policy_start_date"]);
        var date = new Date(ms);
        d["policy_start_date"] = date;
    });

    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];


    var ndx = crossfilter(data);
    var all = ndx.groupAll(data);

    var premDim = ndx.dimension(function(d) { return d["insurance_premium"] });
    var sexDim = ndx.dimension(function(d) { return d["sex"] });
    var monthDim = ndx.dimension(function(d) { return months[d["policy_start_date"].getMonth()] });
    var dayDim = ndx.dimension(function(d) { return days[d["policy_start_date"].getDay()] }); 
    var dateDim = ndx.dimension(function(d) { return d["policy_start_date"]}); 

    var premGroup = premDim.group();
    var sexGroup = sexDim.group();
    var monthGroup = monthDim.group();
    var dayGroup = dayDim.group();
    var dateGroup = dateDim.group();


    premChart = dc.barChart("#insurancePremium");
    sexChart = dc.pieChart("#sex");
    monthChart = dc.barChart("#month")
    dayChart = dc.barChart("#day")
    activityChart = dc.barChart("#activityChart")
    
    premChart
        .width (1000)
        .x(d3.scale.linear().domain([0,20]))
        .dimension(premDim)
        .group(premGroup)

    sexChart
        .height (300)
        .dimension(sexDim)
        .group(sexGroup)
        .legend(dc.legend().legendText(function(d) { 
           if(d.name == 'M'){
                return "Male"; 
           }else if(d.name == 'F'){
                return "Female"; 
           }
            
        }))
        .label(function(d) {
            if(all.value()){
                return Math.round(d.value / all.value() * 100) + '%';
            }
            
        })
        .colors(d3.scale.ordinal().range(["#ADD8E6", "#FFC0CB"]));
    
    monthChart
        .colorAccessor(function (d){return d.value.absGain;})
        .width (800)
        .height(300)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .barPadding(0)
        .outerPadding(0.05)        
        //.ordering(function(d) { return d["policy_start_date"].getMonth(); })
        .dimension(dateDim)
        .group(monthGroup)
        .xAxisLabel('Month')
        .yAxisLabel('Policies Sold')
        .elasticY(true);
    
    
    
    dayChart
        .width (800)
        .height(300)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .dimension(dayDim)
        .group(dayGroup)
        .barPadding(0)
        .outerPadding(0.05)
        .label(function(d) {
            
            return days[d.key];
        })
        .xAxisLabel('Day of the Week')
        .yAxisLabel('Policies Sold')
        .elasticY(true);
    

    var minDate = new Date(2015, 0, 1);
    var maxDate = new Date(2015, 10, 31);
    
    var colors = ["#a60000","#ff0000", "#ff4040","#ff7373","#67e667","#39e639","#00cc00"];

    activityChart
        .width (800)
        .height (500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .dimension(dateDim)
        .group(dateGroup)
        .xAxisLabel('Day')
        .yAxisLabel('Policies Sold')
        .elasticY(true)
        /*
        .colors(d3.scale.quantize().range(["#a60000","#ff0000", "#ff4040","#ff7373","#67e667","#39e639","#00cc00"]))
        .renderlet(function(chart){
            chart.selectAll("rect.bar").attr("fill", function(d){
                return colors[d.data.key.getDay()];
            });
        })
        */

    //console.log(all.value());

    var provDim = ndx.dimension(function(d) { return d["state"] });
    var provGroup = provDim.group();

    d3.json("data/canada.json", function(err, mapData) {
        if (err) throw err;
        
        var ndx = crossfilter(mapData);
        var all = ndx.groupAll(mapData);
    
        var width = 1000;
        var height = 1000;
        var projection = d3.geo.albers();
        projection.translate([500, 800]);
        var path = d3.geo.path();
        //projection.scale(1).center([300,300]);
        path = path.projection(projection);
        //console.log(mapData.features[0].properties.NAME);
        
        var choroChart = dc.geoChoroplethChart("#choroChart");
    
        choroChart
            .width (width)
            .height (height)
            .dimension (provDim)
            .group(provGroup)
            .projection(projection)
            .overlayGeoJson(mapData.features, "choroChart",
                function(d) {
                //console.log(JSON.stringify(mapData.features));
                return d.properties.NAME;
            })
            
            .valueAccessor(function (d) {
                console.log(d.value)
                return d.value;
            })
            
            .colors(d3.scale.quantize().range(["#e4ffe2", "#b0ffaa", "#88ff7f", "#54ff47", "#30ff21", "#11ff00", "#0baf00", "#088400", "#055900", "#022600"]))
            .colorDomain([0, 200])
            //.colorAccessor(function(d, i){ return d.key })
            .title(function(d) {
                //console.log(d.key, d.value)
                return d.key + " : " + d.value;
            });
        //console.log(JSON.stringify(mapData));
        dc.renderAll();
    });
});


