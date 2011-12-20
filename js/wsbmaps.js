Wsbdata.maps = {

    map: undefined,

    layers: {
        mapTiles: undefined,
        mainTrack: undefined,
        hysplit: undefined,
        points: undefined
    },

    trackPoints: undefined,

    styles: {
        mainTrackStyle: {
            strokeColor: "#FFFF00",
            strokeWidth: 4,
            strokeDashstyle: "solid"
        },
        dotStyle: {
            "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                externalGraphic: "img/marker-green.png",
                graphicOpacity: 1,
                pointRadius: 10
            },
            OpenLayers.Feature.Vector.style["default"])),
                "select": new OpenLayers.Style({
                externalGraphic: "img/marker-blue.png"
            })
        },
        hysplitStyle: {}
    },

    controls: {
        pointSelect: undefined
    },

    init: function(){
        Wsbdata.maps.map = new OpenLayers.Map('map', Wsbdata.mapOptions());
        Wsbdata.maps.layers.mapTiles = new OpenLayers.Layer.OSM("Simple OSM Map");
        Wsbdata.maps.map.addLayer(Wsbdata.maps.layers.mapTiles);

        Wsbdata.maps.map.setCenter(
            new OpenLayers.LonLat(-84.715576171875, 38.042907714842).transform(
                new OpenLayers.Projection("EPSG:4326"),  Wsbdata.maps.map.getProjectionObject()), 8);

        OpenLayers.Request.GET({
          url: Wsbdata.settings.initialData,
          success: Wsbdata.loadInitialData
        });

        Wsbdata.maps.layers.points = new OpenLayers.Layer.Vector("Points", {
          'sphericalMercator': true,
          numZoomLevels: 16,
          minResolution: 0,
          maxResolution: 2000,
          styleMap: new OpenLayers.StyleMap(Wsbdata.maps.styles.dotStyle)
        });

        Wsbdata.maps.layers.mainTrack = new OpenLayers.Layer.Vector("GPX", {
                'sphericalMercator': true,
                style: Wsbdata.maps.styles.mainTrackStyle
            });

        Wsbdata.maps.map.addLayer(Wsbdata.maps.layers.mainTrack);
        Wsbdata.maps.map.addLayer(Wsbdata.maps.layers.points);

    }
};