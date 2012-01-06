/*jslint sloppy: true, browser: true */
/*global $: true, WSBOUT: true, Highcharts: true */
WSBOUT.sensors = (function (my) {

    var sensorList = {}, addSensor, addData, sensor;

    sensor = function (spec) {
        var that, addData, getGraph, sensor, myGraph, myGraphSettings;

        that = {};

        that.type = spec.type;
        that.name = spec.name;
        that.onPopup = spec.onPopup || true;
        that.units = spec.units || "";
        that.niceName = spec.niceName || spec.name;
        that.graphDiv = spec.graphDiv || "";

        if (spec.gaugeDiv) {
            $('#' + spec.gaugeDiv).gauge('init', spec.gaugeOptions || {});
        }

        for (sensor in my.sensorList) {
            if (my.sensorList.hasOwnProperty(sensor)) {
                if (sensor.graphDiv === that.graphDiv) {
                    myGraph = sensor.getGraph();
                }
            }
        }
        if (myGraph === undefined && that.graphDiv !== "") {
            myGraphSettings = $.extend({}, WSBOUT.defaultGraph);
            myGraphSettings.chart.renderTo = that.graphDiv;
            myGraphSettings.title.text = that.niceName;
            myGraph = new Highcharts.StockChart(myGraphSettings);
            //create new graph
        }
        //create new trace

        //search for other sensors with same graph div
            //if no other sensors
                //create graph
            //else
                //find graph
            //create trace

        addData = function (data) {
            var i;
        };
        that.addData = addData;

        getGraph = function () {
            return myGraph;
        };
        that.getGraph = getGraph;

        return that;
    };
    my.sensor = sensor;

    addSensor = function (sensor) {
        $.extend(sensorList, sensor);
        //
    };
    my.addSensor = addSensor;

    /* data in this form:
        {
            type: {
                name: {
                    data: [[time, value],
                            [time, value]];

                }
            }
        }
    */
    addData = function (data) {
        var type, name, i, that, currentSensor, currentData;
        that = this;
        for (type in data) {
            if (data.hasOwnProperty(type) && sensorList.hasOwnProperty(type)) {
                for (name in type) {
                    if (type.hasOwnProperty(name) && sensorList[type].hasOwnProperty(name)) {
                        currentSensor = sensorList[type][name];
                        currentData = data[type][name].data;
                        currentSensor.graph.add_data(data);
                        currentSensor.gauge.set_value(data[data.length - 1]);
                    }
                }
            }
        }
    };
    my.addData = addData;

    return my;

}({}));
