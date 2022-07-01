// config, add svg
var w = 100,
    h = 100
    ;

// var color = d3.scale.ordinal()
//     .range(["#1459D9", "#daa520"]);

var color = ["#1459D9", "#daa520"];
var ds1 = [[{ x: 0, y: 12 }], [{ x: 0, y: 45 }]];
var ds2 = [[{ x: 0, y: 72 }], [{ x: 0, y: 28 }]];
var ds3 = [[{ x: 0, y: 82 }], [{ x: 0, y: 18 }]];


var canvas = d3.select("body")
    .append("svg")
    .attr("width", 100)
    .attr("height", 100)
    ;

var appending = canvas.selectAll("body")
    .data(ds2)   ///trying to make this selection dynamic based on menubar selection                         
    .enter()
    .append("g")
    .style("fill", function (d, i) { return color(i); })
    ;

appending.selectAll("shape")
    .data(function (d) { return d; })
    .enter()
    .append("rect")
    .attr("x", 10)
    .attr("y", 10)
    .attr("width", function (d) { return d.y; })
    .attr("height", 19)
    ;


// function that wraps around the d3 pattern (bind, add, update, remove)
function updateLegend(newData) {

    // bind data
    var appending = canvas.selectAll('rect')
        .data(newData);

    // add new elements
    appending.enter().append('rect');

    // update both new and existing elements
    appending.transition()
        .duration(0)
        .attr("width", function (d) { return d.y; });

    // remove old elements
    appending.exit().remove();

}

// generate initial legend
updateLegend(ds1);

// handle on click event
d3.select('#listecommune')
    .on('change', function () {
        var newData = eval(d3.select(this).property('value'));
        updateLegend(newData);
    });