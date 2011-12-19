var Wsbdata = {

    xml: undefined,

    format: undefined,

    settings: {
        initialData: "init.gpx",
        hysplitData: ""
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

        var features = Wsbdata.Wsbparse.transformFeatures(Wsbdata.xml);
        
	    Wsbdata.maps.layers.mainTrack.addFeatures(features);
        
        Wsbdata.maps.layers.points.addFeatures(Wsbdata.Wsbparse.generateFeatures(features, Wsbdata.xml));

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

	},

    PopupHandlers: {
        onPopupClose: function (evt) {
            selectControl.unselect(selectedFeature);
        },

        onFeatureSelect: function (feature) {
            selectedFeature = feature;
            var attribute = feature.attributes.array;
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

    charts: undefined

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


