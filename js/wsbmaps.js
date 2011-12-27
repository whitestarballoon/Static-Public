/*global Wsbdata: true, alert: true, popup: true, selectedFeature: true, $: true, DOMParser: true, clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false, OpenLayers: true */
/*jslint sloppy: true, plusplus: true */
Wsbdata.maps = {

    map: undefined,

    layers: {
        mapTiles: undefined,
        mainTrack: undefined,
        hysplit: undefined,
        points: undefined
    },

    trackPoints: [],

    styles: {
        mainTrackStyle: {
            strokeColor: "#FFFF00",
            strokeWidth: 4,
            strokeDashstyle: "solid"
        },
        dotStyle: {
            "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                strokeColor: "#0080FF",
                fillColor: "#0080FF",
                pointRadius: 5
            },
                OpenLayers.Feature.Vector.style["default"])),
            "select": new OpenLayers.Style({
                strokeColor: "#FF0000",
                fillColor: "#FF0000"
            })
        },
        firstDotStyle: {
            externalGraphic: "img/lally.png",
            strokeColor: "#0080FF",
            fillColor: "#0080FF",
            pointRadius: 32
        },
        hysplitStyle: {}
    },

    controls: {
        pointSelect: undefined
    },

    init: function () {
        Wsbdata.maps.map = new OpenLayers.Map('map', Wsbdata.mapOptions());
        Wsbdata.maps.layers.mapTiles = new OpenLayers.Layer.OSM("Simple OSM Map");
        Wsbdata.maps.map.addLayer(Wsbdata.maps.layers.mapTiles);

        Wsbdata.maps.map.setCenter(
            new OpenLayers.LonLat(-84.715576171875, 38.042907714842).transform(
                new OpenLayers.Projection("EPSG:4326"),
                Wsbdata.maps.map.getProjectionObject()
            ),
            8
        );

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