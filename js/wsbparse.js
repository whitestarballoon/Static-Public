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
            pointFeatures[i].transform(new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
        }
        return features;
    },

    getPopoverDiv: function(attribute) {
        var return = "<div style='font-size:.8em'>";
        for (var i = 0; i < attribute.length; i++) {

        }
    }

};