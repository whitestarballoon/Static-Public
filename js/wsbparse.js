/*jslint sloppy: true, browser: true */
/*global $: true */
var WSBOUT = (function (my) {
    var parseForDisplay, parseForBubbles;

    parseForDisplay = function (GPXDom) {
        var sensors, xmlElems, i, j, time, ele, sensorXml;
        sensors = {};
        xmlElems = GPXDom.getElementsByTagNameNS("*", "data");

        for (i = 0; i < xmlElems.length; i += 1) {
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
            for (j = 0; j < sensorXml.length; j += 1) {
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
    };
    my.parseForDisplay = parseForDisplay;

    parseForBubbles = function (GPXDom) {

    };
    my.parseForBubbles = parseForBubbles;

    return my;

}(WSBOUT));