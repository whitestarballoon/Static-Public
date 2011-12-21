var Wsbdata = {

    xml: undefined,

    format: undefined,

    settings: {
        initialData: "init.gpx",
        hysplitData: ""
    },

    //These are changed by user inputs somewhere...
    userSettings: {
        panTo: true
    },

    mapOptions: function() {
        return {
            numZoomLevels: 16
        };
    },

    initCharts: function () {
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
            new Wsbdata.Chart('vspeed', 'Vertical Speed', [new Wsbdata.ChartTrace('vspeed', 'Vertical Speed')], 'vspeedChart'),
        ];

        for (var i = 0; i < Wsbdata.charts.length; i++) {
            Wsbdata.Wsbgraphs.createChart(Wsbdata.charts[i]);
        }
    },

    findChartSetData: function(type, name, data) {
        for(var i = 0; i < Wsbdata.charts.length; i++) {
            if(Wsbdata.charts[i].type == type && Wsbdata.charts[i].hasTrace(name)) {
                var series = Wsbdata.charts[i].chartItem.get(name);
                series.setData(data);
                series.chart.redraw();
            }
        }
    },

	loadInitialData: function (request) {
        "use strict";
        var i, features, elems, time;
		Wsbdata.format = new OpenLayers.Format.GPX();

        //Get the XML
		if (!request.responseXML.documentElement) {
			Wsbdata.xml = Wsbdata.format.read(request.responseText);
		} else {
            Wsbdata.xml = request.responseXML;
        }

        var features = Wsbdata.Wsbparse.getPointArray(Wsbdata.xml);
        Wsbdata.maps.trackPoints = Wsbdata.Wsbparse.generateFeatures(features, Wsbdata.xml);

        var line = new OpenLayers.Geometry.LineString(Wsbdata.maps.trackPoints);
        line = new OpenLayers.Feature.Vector(line);
        line.id = "Main Track";

	    Wsbdata.maps.layers.mainTrack.addFeatures(line);

        //have to use for loop so that each feature is clickable
        var featArray = [];
        for(var i = 0; Wsbdata.maps.trackPoints.length > i; i++) {
            featArray.push(new OpenLayers.Feature.Vector(Wsbdata.maps.trackPoints[i]));
        }
        
        Wsbdata.maps.layers.points.addFeatures(featArray);

        Wsbdata.maps.controls.pointSelect = new OpenLayers.Control.SelectFeature(Wsbdata.maps.layers.points,
                {onSelect: Wsbdata.PopupHandlers.onFeatureSelect, onUnselect: Wsbdata.PopupHandlers.onFeatureUnselect});
        
        Wsbdata.maps.map.addControl(new OpenLayers.Control.LayerSwitcher());
        Wsbdata.maps.map.addControl(Wsbdata.maps.controls.pointSelect);

        Wsbdata.maps.controls.pointSelect.activate();

        var sensors = Wsbdata.Wsbparse.generateSensorObject(Wsbdata.xml);

        for (var chart in sensors) {
            for (var trace in sensors[chart]) {
                Wsbdata.findChartSetData(chart, trace, sensors[chart][trace]);
                Wsbdata.Wsbgauges.findGaugeSetValue(chart, trace, sensors[chart][trace][sensors[chart][trace].length-1][1]);
            }
        }

        Wsbdata.Wsbparse.parseGPXString(Wsbdata.testNext);

	},

    PopupHandlers: {
        onPopupClose: function (evt) {
            Wsbdata.maps.controls.pointSelect.unselect(selectedFeature);
        },

        onFeatureSelect: function (feature) {
            selectedFeature = feature;
            var attribute = feature.geometry.array;
            var data = "<div style='font-size:.8em'>";
            for (var i = 0; i < attribute.length; i++) {
                data += "<p>" + attribute[i].type + " " + attribute[i].name + " " + attribute[i].value + "</p>";
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

    temperatureTraces: undefined,

    charts: undefined,

    testNext: "\x3Cgpx xmlns:wsbml=\"http:\x2F\x2Fwww.whitestarballoon.com\" xmlns=\"http:\x2F\x2Fwww.topografix.com\x2FGPX\x2F1\x2F1\"\x3E\n  \x3Ctrk\x3E\n    \x3Cname\x3EWhite Star Balloon Data\x3C\x2Fname\x3E\n    \x3Cdesc\x3EOur Transatlantic Attempt\x3C\x2Fdesc\x3E\n    \x3Ctrkseg\x3E\n      \x3Ctrkpt lon=\"7\" lat=\"24\"\x3E\n        \x3Cele\x3E9067.7\x3C\x2Fele\x3E\n        \x3Ctime\x3E2011-03-25T00:10:00Z\x3C\x2Ftime\x3E\n        \x3Csat\x3E7\x3C\x2Fsat\x3E\n        \x3Chdop\x3E2.72496895356\x3C\x2Fhdop\x3E\n        \x3Cvdop\x3E2.79202023301\x3C\x2Fvdop\x3E\n        \x3Cwsbml:data\x3E\n          \x3Cwsbml:sensor type=\"vspeed\" name=\"vspeed\"\x3E16.3902733222\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"temperature\" name=\"internal\"\x3E-24.8167843913\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"temperature\" name=\"external\"\x3E-2.14858241069\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"temperature\" name=\"battery\"\x3E-42.1959465853\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"temperature\" name=\"helium\"\x3E-9.102534212\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"humidity\" name=\"humidity\"\x3E54.6363218718\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"pressure\" name=\"pressure\"\x3E188.598979768\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"speed\" name=\"speed\"\x3E85.3485585481\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"cloud\" name=\"cloud\"\x3E0.45262224291\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:status name=\"gps\"\x3E0\x3C\x2Fwsbml:status\x3E\n          \x3Cwsbml:status name=\"error\"\x3E0\x3C\x2Fwsbml:status\x3E\n        \x3C\x2Fwsbml:data\x3E\n      \x3C\x2Ftrkpt\x3E\n      \x3Ctrkpt lon=\"7.5\" lat=\"24.2\"\x3E\n        \x3Cele\x3E9067.7\x3C\x2Fele\x3E\n        \x3Ctime\x3E2011-03-25T00:20:00Z\x3C\x2Ftime\x3E\n        \x3Csat\x3E9\x3C\x2Fsat\x3E\n        \x3Chdop\x3E2.72496895356\x3C\x2Fhdop\x3E\n        \x3Cvdop\x3E2.79202023301\x3C\x2Fvdop\x3E\n        \x3Cwsbml:data\x3E\n          \x3Cwsbml:sensor type=\"vspeed\" name=\"vspeed\"\x3E16.3902733222\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"temperature\" name=\"internal\"\x3E-24.8167843913\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"temperature\" name=\"external\"\x3E-2.14858241069\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"temperature\" name=\"battery\"\x3E-42.1959465853\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"temperature\" name=\"helium\"\x3E-9.102534212\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"humidity\" name=\"humidity\"\x3E54.6363218718\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"pressure\" name=\"pressure\"\x3E188.598979768\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"speed\" name=\"speed\"\x3E85.3485585481\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:sensor type=\"cloud\" name=\"cloud\"\x3E0.45262224291\x3C\x2Fwsbml:sensor\x3E\n          \x3Cwsbml:status name=\"gps\"\x3E0\x3C\x2Fwsbml:status\x3E\n          \x3Cwsbml:status name=\"error\"\x3E0\x3C\x2Fwsbml:status\x3E\n        \x3C\x2Fwsbml:data\x3E\n      \x3C\x2Ftrkpt\x3E\n    \x3C\x2Ftrkseg\x3E\n  \x3C\x2Ftrk\x3E\n\x3C\x2Fgpx\x3E"

};

Wsbdata.Chart.prototype.hasTrace = function (name) {
    for(var i = 0; i < this.traces.length; i++) {
        if(this.traces[i].id == name) {
            return true;
        }
    }
    return false;    
}

Wsbdata.Chart.prototype.addPoint = function (sensorName, x, y) {
    var series = this.chartItem.get(sensorName);
    series.addPoint([x, y], true, false);    
    //series.chart.redraw();
}


