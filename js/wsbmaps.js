/*jslint sloppy: true, browser: true */
/*global $: true, OpenLayers: true */
var WSBOUT;
WSBOUT.maps = (function (my) {

    var points, layers, initLayers, create_map, map, init, set_center,
        add_from_gpx, parseForMap, redrawTrack, redrawPoints,
        lastPointStyle, pointStyleMap, mapControls, onPointSelect,
        onPointUnselect, onPointBubbleClose, selectedFeature;

    points = [];

    init = function (mapSettings) {
        var pointStyles;

        lastPointStyle = mapSettings.lastPointStyle;
        pointStyles = mapSettings.pointStyleMap;

        pointStyleMap = {
            "default": (function () {
                return new OpenLayers.Style(
                    OpenLayers.Util.applyDefaults(pointStyles['default'],
                        OpenLayers.Feature.Vector.style["default"])
                        //No dot noation because defafult is a reserved word
                );
            }()),
            "selected": (function () {
                return new OpenLayers.Style(pointStyles.selected);
            }())
        };

        create_map(mapSettings.mapOptions);
        initLayers(mapSettings.predictionStyle, mapSettings.trackStyle, pointStyleMap);
        map.addLayer(layers.prediction);
        map.addLayer(layers.track);
        map.addLayer(layers.points);

        mapControls = new OpenLayers.Control.SelectFeature(layers.points,
                {onSelect: onPointSelect, onUnselect: onPointUnselect});
        map.addControl(mapControls);
        mapControls.activate();

        set_center([-85, 34], 8);
    };
    my.init = init;

    onPointSelect = function (feature) {
        var currentName, currentUnits, attribute, data, i, j, popup;
        selectedFeature = feature;
        attribute = feature.geometry.data;
        data = "<div style='font-size:.8em'>";
        for (i = 0; i < attribute.length; i += 1) {
            data += "<p>";
            data += attribute[i].niceName;
            data += ": ";
            if (attribute[i].hasOwnProperty('round')) {
                data += parseFloat(attribute[i].value).toFixed(2);
            } else {
                data += attribute[i].value
            }
            if (attribute[i].units) {
                data += " (";
                data += attribute[i].units;
                data += ")</p>";
            }
        }
        data += "</div>";
        popup = new OpenLayers.Popup.FramedCloud("chicken",
                                 feature.geometry.getBounds().getCenterLonLat(),
                                 null,
                                 data,
                                 null, true, onPointBubbleClose);
        feature.popup = popup;
        map.addPopup(popup);
    };

    onPointUnselect = function (feature) {
        map.removePopup(feature.popup);
        feature.popup.destroy();
        feature.popup = null;
    };

    onPointBubbleClose = function (event) {
        mapControls.unselect(selectedFeature);
    };

    initLayers = function (predictionStyle, trackStyle, pointStyleMap) {
        layers = {
            prediction: (function () {
                return new OpenLayers.Layer.Vector("Prediction", {
                    'sphericalMercator': true,
                    style: predictionStyle
                });
            }()),
            track: (function () {
                return new OpenLayers.Layer.Vector("Track", {
                    'sphericalMercator': true,
                    style: trackStyle
                });
            }()),
            points: (function () {
                return new OpenLayers.Layer.Vector("Points", {
                    'sphericalMercator': true,
                    numZoomLevels: 16,
                    minResolution: 0,
                    maxResolution: 2000,
                    styleMap: new OpenLayers.StyleMap(pointStyleMap)
                });
            }())
        };
    };

    create_map = function (mapOptions) {
        map = new OpenLayers.Map('map', mapOptions);
        map.addLayer(new OpenLayers.Layer.OSM("Simple OSM Map"));
    };

    set_center = function (coords, zoom) {
        map.setCenter(
            new OpenLayers.LonLat(coords).transform(
                new OpenLayers.Projection("EPSG:4326"),
                map.getProjectionObject()
            ),
            zoom
        );
    };
    my.set_center = set_center;

    parseForMap = function (xmlElems) {
        var bubbles, i, j, time, ele, sensorXml, sensor, sensors, wsbsensor;
        bubbles = [];

        // Iterate through XML Elemets.
        // Time and Altitude are special, as they are held in the raw GPX Data
        // as "time" and "ele" tags.
        for (i = 0; i < xmlElems.length; i += 1) {
            time = new Date($(xmlElems[i]).parent().find('time').text()).getTime();
            ele = $(xmlElems[i]).parent().find('ele').text();
            sensor = [];
            sensors = xmlElems[i].getElementsByTagNameNS("*", "sensor");
            sensor.push({ niceName: 'Time', value: new Date(time).toString()});
            sensor.push({ niceName: 'Altitude', value: ele, units: 'M'});
            for (j = 0; j < sensors.length; j += 1) {
                //There is no reason we couldn't associate readible names here.
                wsbsensor = WSBOUT.sensors.getSensor(sensors[j].getAttribute('type'), sensors[j].getAttribute('name'));
                if (wsbsensor) {
                    sensor.push({ niceName: wsbsensor.niceName, value: sensors[j].textContent, units: wsbsensor.units, round: true });
                }
            }
            bubbles[i] = sensor;
        }

        return bubbles;
    };

    add_from_gpx = function (GPXDom) {
        var xmlElems, bubbleData, features, format, i;
        xmlElems = GPXDom.getElementsByTagNameNS("*", "data");
        bubbleData  = parseForMap(xmlElems);
        format = new OpenLayers.Format.GPX();
        features = format.read(GPXDom)[0].geometry.getVertices();

        if (features.length !== bubbleData.length) {
            throw {
                name: 'lengthError',
                message: "Features and Data must have same number of elements!"
            };
        }

        for (i = 0; i < features.length; i += 1) {
            features[i].data = bubbleData[i];
            //At one point, I told myself to fix this, now I can't
            //remember what needs fixing.
            //TODO: Fix this.
            features[i].transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
        }

        points = points.concat(features);
        redrawPoints(features);
        redrawTrack();

    };
    my.add_from_gpx = add_from_gpx;

    redrawPoints = function (newPoints) {
        var prevLastPt, lastPt;
        layers.points.addFeatures((function () {
            var featArray = [], i;
            for (i = 0; i < newPoints.length; i += 1) {
                featArray.push(new OpenLayers.Feature.Vector(newPoints[i]));
            }
            return featArray;
        }()));

        if (layers.points.features.length > 1) {
            prevLastPt = layers.points.features[layers.points.features.length - 2];
            prevLastPt.style = null;
        }

        lastPt = layers.points.features[layers.points.features.length - 1];
        lastPt.style = lastPointStyle;
        layers.points.redraw();

        if (WSBOUT.panTo === true) {
            map.setCenter(new OpenLayers.LonLat(lastPt.geometry.x, lastPt.geometry.y));
        }
    };

    redrawTrack = function () {
        var line, oldLine;
        line = new OpenLayers.Geometry.LineString(points);
        line = new OpenLayers.Feature.Vector(line);
        line.id = "Main Track";

        oldLine = layers.track.getFeatureById("Main Track");
        layers.track.addFeatures(line);
        if (oldLine) {
            layers.track.removeFeatures(oldLine);
        }

    };

    return my;

}({}));