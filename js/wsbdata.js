/*global alert: true, popup: true, selectedFeature: true, $: true, DOMParser: true, clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false, OpenLayers: true */
/*jslint sloppy: true, plusplus: true */
Array.prototype.is_array = function (value) {
    return Object.prototype.toString.apply(value) === '[object Array]';
};

var WSBOUT = (function (my) {

    var graph, gauge, panTo, init;

    panTo = true;

    init = function () {
        $.getJSON("js/settings.json", function (data) {
            var GPXUrl;
            GPXUrl = data.initialData;
            $.get(GPXUrl, function (data) {
                var displayData, testGraph;
                displayData = my.parseForDisplay(data);
                my.sensors.addSensor();
                my.sensors.addData(displayData);
                my.defaultGraphSettings = data.defaultGraph;
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
            var localData, i;
            if (!Array.is_array(data[0])) {
                localData = [data];
            } else {
                localData = data;
            }
            for (i = 0; i < localData.length; i += 1) {
                //Add data to graph.
            }
            //Refresh graph
        };
    };
    my.graph = graph;

    return my;
}({}));

var WSBOUT = (function (my) {
    var parseForDisplay, parseForBubbles;

    parseForDisplay = function (GPXDom) {
        var sensors, xmlElems, i, j, time, ele, sensorXml;
        sensors = {};
        xmlElems = GPXDom.getElementsByTagNameNS("*", "data");

        for (i = 0; i < xmlElems.length; i += 1) {
            time = new Date($(xmlElems[i]).parent().find('time').text()).getTime();
            ele = $(xmlElems[i]).parent().find('ele').text();

            if (typeof sensors.altitude === "undefined") {
                sensors.altitude = {};
            }
            if (typeof sensors.altitude.altitude === "undefined") {
                sensors.altitude.altitude = [];
            }
            sensors.altitude.altitude.push([ time, parseFloat(ele) ]);
            sensorXml = xmlElems[i].getElementsByTagNameNS("*", "sensor");
            for (j = 0; j < sensorXml.length; j += 1) {
                sensorXml[j].getAttribute('name');
                if (typeof sensors[sensorXml[j].getAttribute('type')] === "undefined") {
                    sensors[sensorXml[j].getAttribute('type')] = {};
                }
                if (typeof sensors[sensorXml[j].getAttribute('type')][sensorXml[j].getAttribute('name')] === "undefined") {
                    sensors[sensorXml[j].getAttribute('type')][sensorXml[j].getAttribute('name')] = [];
                }
                sensors[sensorXml[j].getAttribute('type')][sensorXml[j].getAttribute('name')].push([ time, parseFloat(sensorXml[j].textContent) ]);
            }
        }

        return sensors;
    };
    my.parseForDisplay = parseForDisplay;

    parseForBubbles = function (GPXDom) {

    };
    my.parseForBubbles = parseForBubbles;

    return my;

}(WSBOUT));

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
                },
                error: function () { $.l('failed ajax'); }

            });
            break;
        case "test":
            $.l(data);
            break;
        }
    };
    my.commandHandler = commandHandler;

    return my;
}(WSBOUT));

WSBOUT.sensors = (function (my) {

    var sensorList = {}, addSensor, addData, sensor;

    sensor = function (spec) {
        var addData, getGraph, sensor, myGraph,
        ;

        that = {};

        that.type = spec.type;
        that.name = spec.name;
        that.onPopup = spec.onPopup || true;
        that.units = spec.units || "";
        that.niceName = spec.niceName || spec.name;
        that.graphDiv = spec.graphDiv || "";

        if(spec.gaugeDiv) {
            $('#' + spec.gaugeDiv).gauge('init', spec.gaugeOptions || {});
        }

        for (sensor in my.sensorList) {
            if (sensor.graphDiv === that.graphDiv) {
                myGraph = sensor.getGraph();
            }
        }
        if (myGraph === undefined && that.graphDiv !== "") {
            var myGraphSettings = $.extend({}, WSBOUT.defaultGraph);
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

        addData = function(data) {
            
        };
        that.addData = addData;

        getGraph = function() {
            return myGraph;
        };
        that.getGraph = getGraph;

        return that;
    };

    addSensor = function(sensor) {
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
    addData = function(data) {
        var type, name, i, that, currentSensor, currentData;
        that = this;
        for (type in data) {
            if(data.hasOwnProperty(type) && sensorList.hasOwnProperty(type)) {
                for (name in type) {
                    if(type.hasOwnProperty(name) && sensorList[type].hasOwnProperty(name)) {
                        currentSensor = sensorList[type][name];
                        currentData = data[type][name].data;
                        currentSensor.graph.add_data(data);
                        currentSensor.gauge.set_value(data[data.length-1]);
                    }
                }
            }
        }
    };
    my.addData = addData;

    return my;

}({}));

var Wsbdata = {

    xml: undefined,

    format: new OpenLayers.Format.GPX(),


	loadInitialData: function (request) {
        var i, features, elems, time, parser;

        //Get the XML
        try {
            parser = new DOMParser();
            if (request.responseXML === null) {
                Wsbdata.xml = parser.parseFromString(request.responseText, "text/xml");
            } else {
                if (!request.responseXML.documentElement) {
                    Wsbdata.xml = Wsbdata.format.read(request.responseText);
                } else {
                    Wsbdata.xml = request.responseXML;
                }
            }
        } catch (err) {
            $.l(err);
        }

        Wsbdata.Wsbparse.parseGPXString(Wsbdata.xml);

        Wsbdata.maps.controls.pointSelect = new OpenLayers.Control.SelectFeature(Wsbdata.maps.layers.points,
                {onSelect: Wsbdata.PopupHandlers.onFeatureSelect, onUnselect: Wsbdata.PopupHandlers.onFeatureUnselect});

        Wsbdata.maps.map.addControl(new OpenLayers.Control.LayerSwitcher());
        Wsbdata.maps.map.addControl(Wsbdata.maps.controls.pointSelect);

        Wsbdata.maps.controls.pointSelect.activate();

	},

    PopupPanToToggle: function () {
        var data = "";
        if (Wsbdata.userSettings.panTo === true) {
            Wsbdata.userSettings.panTo = false;
        } else {
            Wsbdata.userSettings.panTo = true;
        }
        data += '<p id=panToOption><a href="#" onClick="Wsbdata.PopupPanToToggle();">Pan To</a>:';
        if (Wsbdata.userSettings.panTo === true) {
            data += ' On';
        } else {
            data += ' Off';
        }
        data += '</p>';
        $('p#panToOption').html(data);
    },

    PopupHandlers: {
        onPopupClose: function (evt) {
            Wsbdata.maps.controls.pointSelect.unselect(selectedFeature);
        },

        onFeatureSelect: function (feature) {
            var currentName, currentUnits, attribute, data, i, j;
            selectedFeature = feature;
            attribute = feature.geometry.array;
            data = "<div style='font-size:.8em'>";
            if (feature.data.hasOwnProperty('last')) {
                if (feature.data.last === true) {
                    data += '<p id=panToOption><a href="#" onClick="Wsbdata.PopupPanToToggle();">Pan To</a>:';
                    if (Wsbdata.userSettings.panTo === true) {
                        data += ' On';
                    } else {
                        data += ' Off';
                    }
                    data += '</p>';

                }
            }
            for (i = 0; i < attribute.length; i++) {
                //This is a dirty messy hack
                for (j = 0; j < Wsbdata.popupData.length; j++) {
                    if (Wsbdata.popupData[j].type === attribute[i].type && Wsbdata.popupData[j].trace === attribute[i].name) {
                        currentName = Wsbdata.popupData[j].name;
                        currentUnits = Wsbdata.popupData[j].units;
                        if (attribute[i].type !== "time") {
                            data += "<p>" + currentName + " " + Math.round(attribute[i].value * 100) / 100 + " " + currentUnits + "</p>";
                        } else {
                            data += "<p>" + attribute[i].value + '</p>';
                        }
                    }
                }

            }
            data += "</div>";
            popup = new OpenLayers.Popup.FramedCloud("chicken",
                                     feature.geometry.getBounds().getCenterLonLat(),
                                     null,
                                     data,
                                     null, true, Wsbdata.PopupHandlers.onPopupClose);
            feature.popup = popup;
            Wsbdata.maps.map.addPopup(popup);
        },

        onFeatureUnselect: function (feature) {
            Wsbdata.maps.map.removePopup(feature.popup);
            feature.popup.destroy();
            feature.popup = null;
        }
    },

};
