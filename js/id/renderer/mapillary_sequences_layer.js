iD.MapillarySequencesLayer = function (context) {
    var projection,
        gj = {},
        enable = false,
        dimension,
        svg_sequences;

    function render(selection) {
        svg_sequences = selection.selectAll('svg')
            .data([render]);

        if (!enable) {
            d3
                .select("#sidebar")
                .selectAll('#mapillary-inspector')
                .remove();
            d3
                .selectAll('.mapillary-sequence-layer')
                .remove();
            return;
        }
        svg_sequences.enter()
            .append('svg');

        svg_sequences.style('display', enable ? 'block' : 'none');

        var paths = svg_sequences
            .selectAll('path')
            .data([gj]);

        paths
            .enter()
            .append('path')
            .attr('class', 'mapillary-sequence');

        var path = d3.geo.path()
            .projection(projection);

        paths
            .attr('d', path);

        /*svg_sequences
            .selectAll('text')
            .remove();

        svg_sequences
            .selectAll('path')
            .data(gj.features)
            .enter()
            .append('text')
            .attr('class', 'mapillary-sequence')
            .text(function (d) {
                return d.properties.key || d.properties.name;
            })
            .attr('x', function (d) {
                var centroid = path.centroid(d);
                return centroid[0] + 5;
            })
            .attr('y', function (d) {
                var centroid = path.centroid(d);
                return centroid[1];
            });
*/
        d3
            .select("#sidebar")
            .selectAll('#mapillary-inspector')
            .remove();
        d3.select("#sidebar")
            .append('div')
            .attr("id", "mapillary-inspector")
            .append('h4')
            .html('mapillary');

        return render.updatePosition();
    }

    render.projection = function (_) {
        if (!arguments.length) return projection;
        projection = _;
        return render;
    };

    render.enable = function (_) {
        if (!arguments.length) return enable;
        enable = _;
        return render;
    };

    render.geojson = function (_) {
        if (!arguments.length) return gj;
        gj = _;
        return render;
    };

    render.dimensions = function (_) {
        if (!arguments.length) return svg_sequences.dimensions();
        dimension = _;
        svg_sequences.dimensions(_);
        return render;
    };

    render.updateImageMarker = function (data) {
        render.dimensions(dimension);
        var paths = svg_sequences
            .selectAll('path')
            .data([gj]);

        paths
            .enter()
            .append('path')
            .attr('class', 'mapillary-sequence');

        var path = d3.geo.path()
            .projection(projection);

        paths
            .attr('d', path);
    };
    render.click = function click() {
        d3.event.stopPropagation();
        d3.event.preventDefault();

        var mapillary_wrapper = d3.select("#sidebar")
            .select('#mapillary-inspector');
        console.log(mapillary_wrapper);

        var coords = context.map().mouseCoordinates();
        d3.json("https://mapillary-read-api.herokuapp.com/v1/im/close?limit=1&lat=" + coords[1] + "&limit=1&lon=" + coords[0], function (error, data) {
            console.log("mapillary_sequence_layer.Got", data);
            if (data) {
                mapillary_wrapper.html('<a target="_blank" href="http://mapillary.com/map/im/' + data[0].key + '"><img src="https://d1cuyjsrcm0gby.cloudfront.net/' + data[0].key + '/thumb-320.jpg"></img></a>');
            } else {
                mapillary_wrapper.html("No picture found, try clicking near the Mapillary sequences");
            }
        });
    }


    render.id = 'layer-mapillary';

    render.updatePosition = function () {
        var extent = context.map().extent();

        d3.json("https://mapillary-read-api.herokuapp.com/v1/s/search?min-lat=" + extent[0][1] + "&max-lat=" + extent[1][1] + "\&min-lon\=" + extent[0][0] + "&max-lon=" + extent[1][0] + "&limit=350", function (error, data) {
            console.log("sequenceLayer.updatePosition, Got", data);
            render.geojson(data);
            render.updateImageMarker(data);
        });
    }

    return render;


};
