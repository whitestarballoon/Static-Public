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

        $('data', xmlDom).each(function(i)
        {
            var time = new Date($(this).parent().find('time').text()).getTime();
            var ele = $(this).parent().find('ele').text();

            if(typeof sensors['altitude'] == "undefined")
            {
                sensors['altitude'] = {};
            }
            if(typeof sensors['altitude']['altitude'] == "undefined")
            {
                sensors['altitude']['altitude'] = [];
            }
            sensors['altitude']['altitude'].push([ time, parseFloat(ele) ]);
            $('sensor', this).each(function(i) {
                if(typeof sensors[$(this).attr('type')] == "undefined")
                {
                    sensors[$(this).attr('type')] = {};
                }
                if(typeof sensors[$(this).attr('type')][$(this).attr('name')] == "undefined")
                {
                    sensors[$(this).attr('type')][$(this).attr('name')] = [];
                }
                sensors[$(this).attr('type')][$(this).attr('name')].push([ time, parseFloat($(this).text()) ]);
            });
        });

        return sensors;
    },

    generateFeatures: function(points, xmlDom) {
        var feat = [];
        //var pointFeatures = features[0].geometry.getVertices();

        if ( $('data', xmlDom).length == points.length ) {
            $('data', xmlDom).each(function (i) {
                var time = new Date($(this).parent().find('time').text()).getTime();
                var ele = $(this).parent().find('ele').text();
                var sensor = [];
                $('sensor', this).each(function(i) {
                    sensor.push( { type: $(this).attr('type'), name: $(this).attr('name'), value: $(this).text()} );
                });
                points[i].array = sensor;
            });
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

    parseGPXString: function(GPX, features) {
        var parse, newData, GPXFeatures, oldFeatures, newFeatures, newTrack, endPt, justNew;
        parser = new DOMParser();
        newData = parser.parseFromString(GPX, "text/xml");
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
        Wsbdata.maps.layers.mainTrack.removeFeatures([oldFeatures]);

        //have to use for loop so that each feature is clickable
        var featArray = [];
        for(var i = 0; GPXFeatures.length > i; i++) {
            featArray.push(new OpenLayers.Feature.Vector(GPXFeatures[i]));
        }
        
        Wsbdata.maps.layers.points.addFeatures(featArray);

        if(Wsbdata.userSettings.panTo) {
            Wsbdata.maps.map.panTo(new OpenLayers.LonLat.fromArray(endPt));
        }


    }

};