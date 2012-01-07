/*jslint sloppy: true, browser: true */
/*global $: true, Highcharts: true */
var WSBOUT;
WSBOUT.sensors = (function (my) {

    var sensorList = [], addSensor, getSensor, addData, sensor;

    sensor = function (spec) {
        var that, add_data, getGraph, sensor, myGraph, myGraphSettings, i, mySeries;

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

        for (i = 0; i < sensorList.length; i += 1) {
            if (sensorList[i].graphDiv === that.graphDiv) {
                myGraph = sensorList[i].getGraph();
            }
        }
        if (myGraph === undefined && that.graphDiv !== "") {
            myGraphSettings = $.extend({}, WSBOUT.defaultGraph);
            myGraphSettings.chart.renderTo = that.graphDiv;
            myGraphSettings.title = {};
            myGraphSettings.title.text = that.niceName;
            myGraphSettings.series = [{id: "series" + that.name, name: that.name, data: []}];
            myGraph = new Highcharts.StockChart(myGraphSettings);
            mySeries = myGraph.get("series" + that.name);
            //create new graph
        } else {
            mySeries = myGraph.addSeries({id: "series" + that.name, name: that.name, data: []}, false);
        }
        //create new trace

        //Assumption: Data is an array of arrays.
        add_data = function (data) {
            var i;
            if (!data[0] instanceof Array) {
                data = [data];
            }
            if (mySeries) {
                for (i = 0; i < data.length; i += 1) {
                    mySeries.addPoint(data[i], false);
                }
                myGraph.redraw();
            }
            if (spec.gaugeDiv) {
                $('#' + spec.gaugeDiv).gauge('setValue', data[i - 1][1]);
            }
        };
        that.add_data = add_data;

        getGraph = function () {
            return myGraph;
        };
        that.getGraph = getGraph;

        return that;
    };
    my.sensor = sensor;

    getSensor = function (type, name) {
        var i;
        for (i = 0; i < sensorList.length; i += 1) {
            if (sensorList[i].name === name && sensorList[i].type === type) {
                return sensorList[i];
            }
        }
        return false;
    };
    my.getSensor = getSensor;

    addSensor = function (sensor) {
        sensorList.push(sensor);
    };
    my.addSensor = addSensor;

    /* data in this form:
        {
            type: {
                name: [[x y], [x y]]
            }
        }
    */
    addData = function (data) {
        var type, name, i, that, currentSensor, currentData;
        that = this;
        for (type in data) {
            if (data.hasOwnProperty(type)) {
                for (name in data[type]) {
                    if (data[type].hasOwnProperty(name)) {
                        currentSensor = getSensor(type, name);
                        if (currentSensor) {
                            currentData = data[type][name];
                            currentSensor.add_data(currentData);
                            //currentSensor.set_value(currentData[currentData.length - 1]);
                        }
                    }
                }
            }
        }
    };
    my.addData = addData;

    return my;

}({}));
