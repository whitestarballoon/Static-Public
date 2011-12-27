/*global alert: true, popup: true, selectedFeature: true, $: true, DOMParser: true, clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false, OpenLayers: true */
/*jslint sloppy: true, plusplus: true */
var Wsbdata = {

    xml: undefined,

    format: new OpenLayers.Format.GPX(),

    settings: {
        initialData: "http://test3.whitestarballoon.com/data/init.gpx",
        hysplitData: ""
    },

    //These are changed by user inputs somewhere...
    userSettings: {
        panTo: true
    },

    mapOptions: function () {
        return {
            numZoomLevels: 16
        };
    },

    initCharts: function () {
        var i;
        Wsbdata.temperatureTraces = [
            new Wsbdata.ChartTrace('internal', 'Internal Temperature'),
            new Wsbdata.ChartTrace('external', 'External Temperature'),
            new Wsbdata.ChartTrace('helium', 'Helium Temperature'),
            new Wsbdata.ChartTrace('battery', 'Battery Temperature')
        ];

        Wsbdata.charts = [
            new Wsbdata.Chart('temperature', 'Temperatures', Wsbdata.temperatureTraces, 'tempChart'),
            new Wsbdata.Chart('altitude', 'Altitude', [new Wsbdata.ChartTrace('altitude', 'Altitude')], 'altitudeChart'),
            new Wsbdata.Chart('pressure', 'Pressure', [new Wsbdata.ChartTrace('pressure', 'Pressure')], 'pressureChart'),
            new Wsbdata.Chart('humidity', 'Humidity', [new Wsbdata.ChartTrace('humidity', 'Humidity')], 'humidityChart'),
            new Wsbdata.Chart('cloud', 'Cloud', [new Wsbdata.ChartTrace('cloud', 'Cloud')], 'cloudChart'),
            new Wsbdata.Chart('speed', 'Speed', [new Wsbdata.ChartTrace('speed', 'Speed')], 'speedChart'),
            new Wsbdata.Chart('vspeed', 'Vertical Speed', [new Wsbdata.ChartTrace('vspeed', 'Vertical Speed')], 'vspeedChart')
        ];

        for (i = 0; i < Wsbdata.charts.length; i++) {
            Wsbdata.Wsbgraphs.createChart(Wsbdata.charts[i]);
        }

        Wsbdata.popupData = Wsbdata.popupData();
    },

    popupData: function () {
        return [
            new Wsbdata.MapPopup('time', 'time', '', ''),
            new Wsbdata.MapPopup('temperature', 'internal', 'Internal Temperature', 'Deg C'),
            new Wsbdata.MapPopup('temperature', 'external', 'External Temperature', 'Deg C'),
            new Wsbdata.MapPopup('temperature', 'helium', 'External Temperature', 'Deg C'),
            new Wsbdata.MapPopup('temperature', 'battery', 'External Temperature', 'Deg C'),
            new Wsbdata.MapPopup('altitude', 'altitude', 'Altitude', 'M'),
            new Wsbdata.MapPopup('pressure', 'pressure', 'Barometric Pressure', 'HPa'),
            new Wsbdata.MapPopup('humidity', 'humidity', 'Relative Humidity', '%'),
            new Wsbdata.MapPopup('speed', 'speed', 'Groundspeed', 'kph'),
            new Wsbdata.MapPopup('vspeed', 'vspeed', 'Vertical Speed', 'Meters/min')
        ];
    },

    findChartAddData: function (type, name, data) {
        var i, j, series;
        for (i = 0; i < Wsbdata.charts.length; i++) {
            if (Wsbdata.charts[i].type === type && Wsbdata.charts[i].hasTrace(name)) {
                series = Wsbdata.charts[i].chartItem.get(name);
                for (j = 0; j < data.length; j++) {
                    series.addPoint(data[j], false);
                }
                series.chart.redraw();
            }
        }
    },

    findChartSetData: function (type, name, data) {
        var i, series;
        for (i = 0; i < Wsbdata.charts.length; i++) {
            if (Wsbdata.charts[i].type === type && Wsbdata.charts[i].hasTrace(name)) {
                series = Wsbdata.charts[i].chartItem.get(name);
                series.setData(data);
                series.chart.redraw();
            }
        }
    },

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

    Chart: function (type, title, traces, div) {
        this.type = type;
        this.title = title;
        this.traces = traces;
        this.div = div;
        this.chartItem = undefined;
        this.isRendered = false;
    },

    ChartTrace: function (id, title) {
        this.id = id;
        this.title = title;
        this.initData = undefined;
    },

    MapPopup: function (type, trace, name, units) {
        this.type = type;
        this.trace = trace;
        this.name = name;
        this.units = units;
    },

    CommandHandler: function (data) {
        switch (data.command) {
        case "new_data":
            $.ajax({
                type: "GET",
                url: data.url,
                dataType: "xml",
                mimeType: "application/xml",
                success: function (data, code) {
                    Wsbdata.Wsbparse.parseGPXString(data);
                },
                error: function () { alert('failed ajax'); }

            });
            break;
        case "test":
            $.l(data);
            break;
        }
    },

    temperatureTraces: undefined,

    charts: undefined

};

Wsbdata.Chart.prototype.hasTrace = function (name) {
    var i;
    for (i = 0; i < this.traces.length; i++) {
        if (this.traces[i].id === name) {
            return true;
        }
    }
    return false;
};

Wsbdata.Chart.prototype.addPoint = function (sensorName, x, y) {
    var series = this.chartItem.get(sensorName);
    series.addPoint([x, y], true, false);
    //series.chart.redraw();
};
