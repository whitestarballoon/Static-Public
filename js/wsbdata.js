/*jslint sloppy: true, browser: true */
/*global $: true */
Array.prototype.is_array = function (value) {
    return Object.prototype.toString.apply(value) === '[object Array]';
};

var WSBOUT = (function (my) {

    var graph, gauge, panTo, init;

    panTo = true;
    my.panTo = panTo;

    init = function () {
        $.getJSON("js/settings.json", function (data) {
            var GPXUrl;
            GPXUrl = data.initialData;
            my.defaultGraph = data.defaultGraph;
            my.maps.init(data.mapSettings);
            
            $.getJSON("js/sensors.json", function (data) {
                var i, aSensor;
                for (i = 0; i < data.sensors.length; i += 1) {
                    aSensor = my.sensors.sensor(data.sensors[i]);
                    my.sensors.addSensor(aSensor);
                }
                $.get(GPXUrl, function (data) {
                    var displayData, testGraph;
                    displayData = my.parseForDisplay(data);
                    my.sensors.addData(displayData);
                    my.maps.add_from_gpx(data);
                });
                $.getJSON('/data/hysplit.json', function (data) {
                    WSBOUT.maps.update_hysplit(data);
                });
            });
        });

    };
    my.init = init;

    gauge = function (spec) {
        var that;

        that = {};

        $('#' + spec.div).gauge('init', spec.options);

        that.set_value = function (value) {
            $('#' + spec.div).gauge('setValue', value);
        };

        return that;
    };
    my.gauge = gauge;

    graph = function (spec) {
        var that;

        that = {};

        /* data in this form:
            [x y]
            OR
            [[x y], [x y]]
        */
        that.add_data = function (data) {
            var localData, i, junk;
            i = 0;
            if (!Array.is_array(data[0])) {
                localData = [data];
            } else {
                localData = data;
            }
            for (i = 0; i < localData.length; i += 1) {
                junk = localData[i];
                //Add data to graph.
            }
        };

    };
    my.graph = graph;

    return my;
}({}));


var WSBOUT = (function (my) {
    var commandHandler;

    /*
    {
        command: new_data or test
        data: whatever
    }
    */

    commandHandler = function (data) {
        switch (data.command) {
        case "new_data":
            $.ajax({
                type: "GET",
                url: data.url,
                dataType: "xml",
                mimeType: "application/xml",
                success: function (data, code) {
                    var displayData, testGraph;
                    displayData = my.parseForDisplay(data);
                    my.sensors.addData(displayData);
                    my.maps.add_from_gpx(data);
                },
                error: function () { $.l('failed ajax'); }

            });
            break;
        case "test":
            $.l(data);
            break;
        case "hysplit":
            $.getJSON('/data/hysplit.json', function (data) {
                WSBOUT.maps.update_hysplit(data);
            });
            break;
        case "reload":
            window.location.reload(true);
            break;
        }
    };
    my.commandHandler = commandHandler;

    return my;
}(WSBOUT));
