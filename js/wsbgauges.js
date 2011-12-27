/*global Wsbdata: true, alert: true, popup: true, selectedFeature: true, $: true, DOMParser: true, clearInterval: false, clearTimeout: false, document: false, event: false, frames: false, history: false, Image: false, location: false, name: false, navigator: false, Option: false, parent: false, screen: false, setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false, OpenLayers: true */
/*jslint sloppy: true, plusplus: true */
Wsbdata.Wsbgauges = {

    gauge: function (div, options, type, trace) {
        this.trace = trace;
        this.type = type;
        this.div = div;
        $('#' + div).gauge('init', options);
    },

    findGaugeSetValue: function (type, trace, value) {
        var gauges, i;
        gauges = Wsbdata.Wsbgauges.gauges;
        for (i = 0; i < gauges.length; i++) {
            if (gauges[i].type === type && gauges[i].trace === trace) {
                gauges[i].gauge.setValue(value);
            }
        }
    },

    gauges:
        [ {
            div: 'altitudeGauge',
            options: {
                min: 0,
                max: 40000,
                label: 'Feet',
                bands: [ { color: "#ff0000", from: 0, to: 12000},
                        {color: "#00ff00", from: 25000, to: 35000} ]
            },
            type: "altitude",
            trace: "altitude",
            gauge: undefined
        },
            {
                div: 'externalTempGauge',
                options: {
                    min: -60,
                    max: 100,
                    label: "Degrees C",
                    bands: [ { color: "#ff0000", from: -60, to: -40},
                            { color: "#ff0000", from: 60, to: 100} ]
                },
                type: "temperature",
                trace: "external",
                gauge: undefined
            },
            {
                div: 'groundSpeedGauge',
                options: {
                    min: 0,
                    max: 200,
                    label: "Groundspeed (Knots)",
                    bands: [ {color: "#ffff00", from: 0, to: 75} ]
                },
                type: "speed",
                trace: "speed",
                gauge: undefined
            } ],

    initGauges: function () {
        var i, thisGauge;
        for (i = 0; i < Wsbdata.Wsbgauges.gauges.length; i++) {
            thisGauge = Wsbdata.Wsbgauges.gauges[i];
            thisGauge.gauge = new Wsbdata.Wsbgauges.gauge(thisGauge.div, thisGauge.options, thisGauge.type, thisGauge.trace);
        }
    }

};

Wsbdata.Wsbgauges.gauge.prototype.setValue = function (value) {
    $('#' + this.div).gauge('setValue', value);
};
