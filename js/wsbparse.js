Wsbdata.Wsbparse = {

    getPointArray: function(xmlDom) {
        var features;
        features = Wsbdata.format.read(xmlDom);
        var pointFeatures = features[0].geometry.getVertices();
        for(i = 0; i < pointFeatures.length; i++) {
            //TODO: Fix this.
            pointFeatures[i].transform(new OpenLayers.Projection("EPSG:4326"), Wsbdata.maps.map.getProjectionObject());
        }
        return pointFeatures;

    },
    
    generateSensorObject: function(xmlDom) {
        var sensors = {};
        var xmlElems = xmlDom.getElementsByTagNameNS("*", "data");

        for (var i = 0; i < xmlElems.length; i++) {
            var time = new Date($(xmlElems[i]).parent().find('time').text()).getTime();
            var ele = $(xmlElems[i]).parent().find('ele').text();

            if(typeof sensors['altitude'] == "undefined")
            {
                sensors['altitude'] = {};
            }
            if(typeof sensors['altitude']['altitude'] == "undefined")
            {
                sensors['altitude']['altitude'] = [];
            }
            sensors['altitude']['altitude'].push([ time, parseFloat(ele) ]);
            var sensorXml = xmlElems[i].getElementsByTagNameNS("*", "sensor");
            for (var j = 0; j < sensorXml.length; j++) {
                sensorXml[j].getAttribute('name');
                if(typeof sensors[sensorXml[j].getAttribute('type')] == "undefined")
                {
                    sensors[sensorXml[j].getAttribute('type')] = {};
                }
                if(typeof sensors[sensorXml[j].getAttribute('type')][sensorXml[j].getAttribute('name')] == "undefined")
                {
                    sensors[sensorXml[j].getAttribute('type')][sensorXml[j].getAttribute('name')] = [];
                }
                sensors[sensorXml[j].getAttribute('type')][sensorXml[j].getAttribute('name')].push([ time, parseFloat(sensorXml[j].textContent) ]);
            }
        }

        return sensors;
    },

    generateFeatures: function(points, xmlDom) {
        var feat = [];
        var xmlElems = xmlDom.getElementsByTagNameNS("*", "data");

        if ( xmlElems.length == points.length ) {
            for (var i = 0; i < xmlElems.length; i++) {
                var time = new Date($(xmlElems[i]).parent().find('time').text()).getTime();
                var ele = $(xmlElems[i]).parent().find('ele').text()
                var sensor = [];
                var sensors = xmlElems[i].getElementsByTagNameNS("*", "sensor");
                for(var j = 0; j < sensors.length; j++) {
                    sensor.push( { type: sensors[j].getAttribute('type'), name: sensors[j].getAttribute('name'), value: sensors[j].textContent } );
                }
                points[i].array = sensor;
            }
        }
        
        return points;
    },

    transformFeatures: function(xmlDom) {
        //Transform into spherical mercator
        var features = Wsbdata.format.read(xmlDom);
        var pointFeatures = features[0].geometry.getVertices();
        for(i = 0; i < pointFeatures.length; i++) {
            //TODO: Fix this.
            pointFeatures[i].transform(new OpenLayers.Projection("EPSG:4326"), Wsbdata.maps.map.getProjectionObject());
        }
        return features;
    },

    getPopoverDiv: function(attribute) {
        var rv = "<div style='font-size:.8em'>";
        for (var i = 0; i < attribute.length; i++) {
            
        }
        rv += "</div>";
        return rv;
    },

    parseGPXString: function(GPX) {
        var parse, newData, GPXFeatures, oldFeatures, newFeatures, newTrack, endPt, justNew, sensorData;
        parser = new DOMParser();
        if( typeof GPX == "string") {
            newData = parser.parseFromString(GPX, "text/xml");
        } else {
            newData = GPX;        
        }
        
        GPXFeatures = Wsbdata.Wsbparse.getPointArray(newData);

        GPXFeatures = Wsbdata.Wsbparse.generateFeatures(GPXFeatures, newData);

        Wsbdata.maps.trackPoints = Wsbdata.maps.trackPoints.concat(GPXFeatures);
        endPt = Wsbdata.maps.trackPoints[Wsbdata.maps.trackPoints.length-1];
        endPt = [endPt.x, endPt.y];

        var line = new OpenLayers.Geometry.LineString(Wsbdata.maps.trackPoints);
        line = new OpenLayers.Feature.Vector(line);
        line.id = "Main Track";

        oldFeatures = Wsbdata.maps.layers.mainTrack.getFeatureById("Main Track");
        Wsbdata.maps.layers.mainTrack.addFeatures(line);
        if(oldFeatures != null) {
            Wsbdata.maps.layers.mainTrack.removeFeatures([oldFeatures]);
        }

        GPXFeatures[GPXFeatures.length - 1];

        //have to use for loop so that each feature is clickable
        var featArray = [];
        for(var i = 0; GPXFeatures.length > i; i++) {
            featArray.push(new OpenLayers.Feature.Vector(GPXFeatures[i]));
        }
        
        Wsbdata.maps.layers.points.addFeatures(featArray);

        if(Wsbdata.userSettings.panTo) {
            Wsbdata.maps.map.panTo(new OpenLayers.LonLat.fromArray(endPt));
        }

        sensorData = Wsbdata.Wsbparse.generateSensorObject(newData);

        for (var chart in sensorData) {
            for (var trace in sensorData[chart]) {
                Wsbdata.findChartSetData(chart, trace, sensorData[chart][trace]);
                Wsbdata.Wsbgauges.findGaugeSetValue(chart, trace, sensorData[chart][trace][sensorData[chart][trace].length-1][1]);
            }
        }


    }

};