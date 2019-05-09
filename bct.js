
// Size/state related variables
var width = 560,
    height = 500,
    outer_radius = (Math.min(width, height) / 2) - 10,
    arc_transition; // save current arc transition

// Create scales
var x = d3.scale.linear()
    .range([0, 2 * Math.PI]),

    y = d3.scale.sqrt()
    .range([0, outer_radius]),

    //    color = d3.scale.category20c();
    color = d3.scale.quantize()
    .domain([0, 100])
    .range(['#f2a713', '#f6c768', '#c3cce3', '#b0bbda', '#9caad1', '#8899c8', '#7488bf', '#6177b6', '#4d66ad', '#3955a4']);

// Partition layout
var partition = d3.layout.partition()
    .value(function (d) {
        return d.credicality;
    });

// Arc generator
var arc = d3.svg.arc()
    .startAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
    })
    .endAngle(function (d) {
        return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
    })
    .innerRadius(function (d) {
        return Math.max(0, y(d.y));
    })
    .outerRadius(function (d) {
        return Math.max(0, y(d.y + d.dy));
    });

// Append a centered group for the burst to be added to
var svg = d3.select('.chart')
    .append('svg')
    .attr({
        width: width,
        height: height
    })
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');


d3.json("data.json", function (error, root) {

    var root_count = 0;
    if (error) throw error;
    //    svg.call(tool_tip);
    svg = svg.selectAll("path.ark")
        .data(partition.nodes(root))
        .enter().append("path")
        .attr({
            d: arc,
            class: function (d) {
                return 'ark -depth-' + d.depth;
            }
        })
        .style("fill", function (d) {
            sum = 0;
            count = 0;
            d.score = getScore(d).toPrecision(3);
            return d == root ? "white" : (color(d.score));
        })
        .on("click", function (d) {
            root_count += 1;
            d == root ? click(d, true) : click(d, false);
        })
        .on('mouseover', function (d) {
            mouseover(d, root_count);
        })
        .on('mouseout', function () {
            fade(svg, 1);
            console.log("mouse out");
        })
});

var sum = 0;
var count = 0;

function getScore(d) {
    if (d.children) {
        d.children.forEach(function (dd) {
            getScore(dd);
        })
    } else {
        sum += d.score;
        count += 1;
    }
    var score = sum / count;
    return score;
}

function mouseover(d, count) {
    console.log(count);

    if (count == 0) {
        d3.select("#explanation")
            .style("visibility", "visible");
        d3.select("#side-explanation")
            .style("visibility", "hidden");
    }
    if (d.depth > 0) {
        var names = getNameArray(d);
        fade(svg, 0.1, names, 'name');
        update_crumbs(d);
    } else {
        update_crumbs(d);
    }

}

// Updates breadcrumbs
function update_crumbs(d) {

    d3.select("#percentage")
        .text(d.score + "\n")
        .style("font-size", "45px")
        .style("font-weight", "100");

    d3.select("#side-percentage")
        .text("Score: " + d.score + "\n");

    // Append new crumbs
    getNameArray(d).forEach(function (name) {
        d3.select('#percentage')
            .append('div')
            .text(name)
            .style("font-size", "30px")
            .style("font-weight", "none");;
        d3.select('#side-percentage')
            .append('div')
            .text(name);
    });
}

// Handle Clicks
function click(d, is_root) {
    //    console.log("name: " + d.name);
    arc_transition = svg.transition('arc_tween')
        .duration(750)
        .attrTween("d", arcTween(d));

    if (is_root) {
        d3.select("#explanation")
            .style("visibility", "visible");
        d3.select("#side-explanation")
            .style("visibility", "hidden");
    } else {
        d3.select("#explanation")
            .style("visibility", "hidden");
        d3.select("#side-explanation")
            .style("visibility", "visible");
    }
}

// Retrieve arc name and parent names
function getNameArray(d, array) {
    array = array || [];

    // Push the current objects name to the array
    array.push(d.name);

    // Recurse to retrieve parent names
    if (d.parent) getNameArray(d.parent, array);

    return array;
}

// Interpolate the scales!
function arcTween(d) {
    var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
        yd = d3.interpolate(y.domain(), [d.y, 1]),
        yr = d3.interpolate(y.range(), [d.y ? 20 : 0, outer_radius]);

    return function (d, i) {
        return i ?
            function (t) {
                return arc(d);
            } :
            function (t) {
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
                return arc(d);
            };
    };
}

// Fade a selection filtering out the comparator(s)
function fade(selection, opacity, comparators, comparatee) {
    var type = typeof comparators,
        key = comparatee ? comparatee : 'score';

    selection.filter(function (d) {
            // Remove elements based on a string or number
            if (type === "string" || type === "number") {
                return d[key] !== comparators;

                // Remove elements based on an array
            } else if (type === 'object' && typeof comparators.slice === 'function') {
                return comparators.indexOf(d[key]) === -1;

                // If there is no comparator keep everything 
            } else return true;
        })
        .transition('fade')
        .duration(250)
        .style('opacity', opacity);
}
