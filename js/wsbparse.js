Wsbdata.Wsbparse = {
    
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

    generateFeatures: function(features, xmlDom) {
        var feat = [];
        var pointFeatures = features[0].geometry.getVertices();

        if ( $('data', xmlDom).length != pointFeatures.length ) {
            for (var i = 0; i < pointFeatures.length; i++) {
                feat.push(new OpenLayers.Feature.Vector(pointFeatures[i]));
            }
        } else {
            $('data', xmlDom).each(function (i) {
                var time = new Date($(this).parent().find('time').text()).getTime();
                var ele = $(this).parent().find('ele').text();
                var sensor = [];
                $('sensor', this).each(function(i) {
                    sensor.push( { type: $(this).attr('type'), name: $(this).attr('name'), value: $(this).text()} );
                });
                feat.push(new OpenLayers.Feature.Vector(pointFeatures[i], { array: sensor }));
            });
        }
        
        return feat;
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
        GPXFeatures = Wsbdata.Wsbparse.transformFeatures(newData);

        oldFeatures = Wsbdata.maps.layers.mainTrack.getFeatureById("Main Track");
        newFeatures = oldFeatures.geometry.getVertices();
        newFeatures = newFeatures.concat(GPXFeatures[0].geometry.getVertices());
        endPt = newFeatures[newFeatures.length-1];
        endPt = [endPt.x, endPt.y];

        //Holy Mother of god, that was easy.
        Wsbdata.maps.layers.points.addFeatures(Wsbdata.Wsbparse.generateFeatures(GPXFeatures,newData));

        newTrack = new OpenLayers.Geometry.LineString(newFeatures);
        newTrack = new OpenLayers.Feature.Vector(newTrack);
        newTrack.id = "Main Track";
        Wsbdata.maps.layers.mainTrack.addFeatures([newTrack]);
        Wsbdata.maps.layers.mainTrack.removeFeatures([oldFeatures]);

        if(Wsbdata.userSettings.panTo) {
            Wsbdata.maps.map.panTo(new OpenLayers.LonLat.fromArray(endPt));
        }


    }

};