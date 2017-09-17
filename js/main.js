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
    var dateDim = ndx.dimension(function(d) { console.log(d["policy_start_date"]); return d["policy_start_date"]}); 
    var provDim = ndx.dimension(function(d) { return d ["state"] });

    var premGroup = premDim.group();
    var sexGroup = sexDim.group();
    var monthGroup = monthDim.group();
    var dayGroup = dayDim.group();
    var dateGroup = dateDim.group();
    var provGroup = provDim.group();

    var premChart = dc.barChart("#insurancePremium");
    var sexChart = dc.pieChart("#sex");
    var monthChart = dc.barChart("#month")
    var dayChart = dc.barChart("#day")
    var activityChart = dc.barChart("#activityChart")
    var bubbleChart = dc.bubbleOverlay("#bubbleChart").svg(d3.select("#ca-chart svg"));
    
    premChart
        .width (1000)
        .x(d3.scale.linear().domain([0,20]))
        .dimension(premDim)
        .group(premGroup)

    sexChart
        .dimension(sexDim)
        .group(sexGroup)
        .legend(dc.legend())
        .label(function(d) {
            return Math.round(d.value / all.value() * 100) + '%';
        })
    
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
    

    var minDate = new Date(2015, 0, 1);
    var maxDate = new Date(2015, 10, 31);
    
    activityChart
        .width (800)
        .height (500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .dimension(dateDim)
        .group(dateGroup)
        .xAxisLabel('Day')
        .yAxisLabel('Policies Sold')
        .elasticX(1);
    
    bubbleChart
        .width (800)
        .height (500)
        .dimension (provDim)
        .group(provGroup)
        .r(d3.scale.linear().domain([0, 200000]))
        .colors(["#ff7373","#ff4040","#ff0000","#bf3030","#a60000"])
        .colorDomain([13, 30])
        .colorAccessor(function(d) {
            return d.value;
        })
        .point("Ontario", 364, 400)
        .point("Quebec", 395.5, 383)
        .point("Northwest Territory", 40.5, 316)
        .point("Nunavut Territory", 417, 370)
        .point("Yukon", 120, 299)
        .point("British Columbia", 163, 322)
        .point("Alberta", 229, 345)
        .point("Saskatchewan", 119, 329)
        .point("Manitoba", 431, 351)
        .point("Nova Scotia", 496, 367)
        .point("Prince Edward Island", 553, 323)
        .point("New Brunswick", 44, 176)
        .point("Newfoundland and Labrador", 125, 195)
    
    dc.renderAll();
    //console.log(all.value());
    
});



