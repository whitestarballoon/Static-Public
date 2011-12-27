/*global Wsbdata: true, alert: true, popup: true, selectedFeature: true, $: true, DOMParser: true, clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false, OpenLayers: true */
/*jslint sloppy: true, plusplus: true */
Wsbdata.Wsbparse = {

    getPointArray: function (xmlDom) {
        var features, pointFeatures, i;
        features = Wsbdata.format.read(xmlDom);
        pointFeatures = features[0].geometry.getVertices();
        for (i = 0; i < pointFeatures.length; i++) {
            //TODO: Fix this.
            pointFeatures[i].transform(new OpenLayers.Projection("EPSG:4326"), Wsbdata.maps.map.getProjectionObject());
        }
        return pointFeatures;

    },

    generateSensorObject: function (xmlDom) {
        var sensors, xmlElems, i, j, time, ele, sensorXml;
        sensors = {};
        xmlElems = xmlDom.getElementsByTagNameNS("*", "data");

        for (i = 0; i < xmlElems.length; i++) {
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
            for (j = 0; j < sensorXml.length; j++) {
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
    },

    generateFeatures: function (points, xmlDom) {
        var feat, xmlElems, i, j, time, ele, sensor, sensors;
        feat = [];
        xmlElems = xmlDom.getElementsByTagNameNS("*", "data");

        if (xmlElems.length === points.length) {
            for (i = 0; i < xmlElems.length; i++) {
                time = new Date($(xmlElems[i]).parent().find('time').text()).getTime();
                ele = $(xmlElems[i]).parent().find('ele').text();
                sensor = [];
                sensors = xmlElems[i].getElementsByTagNameNS("*", "sensor");
                sensor.push({ type: 'time', name: 'time', value: new Date(time).toString()});
                sensor.push({ type: 'altitude', name: 'altitude', value: ele});
                for (j = 0; j < sensors.length; j++) {
                    sensor.push({ type: sensors[j].getAttribute('type'), name: sensors[j].getAttribute('name'), value: sensors[j].textContent });
                }
                points[i].array = sensor;
            }
        }

        return points;
    },

    transformFeatures: function (xmlDom) {
        var features, pointFeatures, i;
        //Transform into spherical mercator
        features = Wsbdata.format.read(xmlDom);
        pointFeatures = features[0].geometry.getVertices();
        for (i = 0; i < pointFeatures.length; i++) {
            //TODO: Fix this.
            pointFeatures[i].transform(new OpenLayers.Projection("EPSG:4326"), Wsbdata.maps.map.getProjectionObject());
        }
        return features;
    },

    parseGPXString: function (GPX) {
        var parser, newData, GPXFeatures, oldFeatures, newFeatures,
            newTrack, endPt, justNew, sensorData, lastPt, line,
            i, prevLastPt, chart, trace, featArray;
        parser = new DOMParser();
        if (typeof GPX === "string") {
            newData = parser.parseFromString(GPX, "text/xml");
        } else {
            newData = GPX;
        }

        GPXFeatures = Wsbdata.Wsbparse.getPointArray(newData);

        GPXFeatures = Wsbdata.Wsbparse.generateFeatures(GPXFeatures, newData);

        Wsbdata.maps.trackPoints = Wsbdata.maps.trackPoints.concat(GPXFeatures);
        endPt = Wsbdata.maps.trackPoints[Wsbdata.maps.trackPoints.length - 1];
        endPt = [endPt.x, endPt.y];

        line = new OpenLayers.Geometry.LineString(Wsbdata.maps.trackPoints);
        line = new OpenLayers.Feature.Vector(line);
        line.id = "Main Track";

        oldFeatures = Wsbdata.maps.layers.mainTrack.getFeatureById("Main Track");
        Wsbdata.maps.layers.mainTrack.addFeatures(line);
        if (oldFeatures !== null) {
            Wsbdata.maps.layers.mainTrack.removeFeatures([oldFeatures]);
        }

        //have to use for loop so that each feature is clickable
        featArray = [];
        for (i = 0; GPXFeatures.length > i; i++) {
            featArray.push(new OpenLayers.Feature.Vector(GPXFeatures[i]));
        }

        Wsbdata.maps.layers.points.addFeatures(featArray);

        if (Wsbdata.maps.layers.points.features.length > 1) {
            prevLastPt = Wsbdata.maps.layers.points.features[Wsbdata.maps.layers.points.features.length - 2];
            prevLastPt.style = null;
            prevLastPt.data.last = false;
        }

        lastPt = Wsbdata.maps.layers.points.features[Wsbdata.maps.layers.points.features.length - 1];

        lastPt.style = Wsbdata.maps.styles.firstDotStyle;

        lastPt.data.last = true;

        Wsbdata.maps.layers.points.redraw();

        if (Wsbdata.userSettings.panTo) {
            Wsbdata.maps.map.panTo(new OpenLayers.LonLat.fromArray(endPt));
        }

        sensorData = Wsbdata.Wsbparse.generateSensorObject(newData);

        for (chart in sensorData) {
            if (sensorData.hasOwnProperty(chart)) {
                for (trace in sensorData[chart]) {
                    if (sensorData[chart].hasOwnProperty(trace)) {
                        Wsbdata.findChartAddData(chart, trace, sensorData[chart][trace]);
                        Wsbdata.Wsbgauges.findGaugeSetValue(chart, trace, sensorData[chart][trace][sensorData[chart][trace].length - 1][1]);
                    }
                }
            }
        }


    }

};