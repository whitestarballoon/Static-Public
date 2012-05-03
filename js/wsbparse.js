/*jslint sloppy: true, browser: true */
/*global $: true */
var WSBOUT = (function (my) {
    var parseForDisplay;

    parseForDisplay = function (GPXDom) {
        var sensors, xmlElems, i, j, time, ele, sensorXml, sensorData;
        sensors = {};
        if ( GPXDom.getElementsByTagNameNS !== undefined ) {
            xmlElems = GPXDom.getElementsByTagNameNS("*", "data");
        } else {
            xmlElems = GPXDom.getElementsByTagName("wsbml:data");
        }

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
            if ( xmlElems[i].getElementsByTagNameNS !== undefined ) {
                sensorXml = xmlElems[i].getElementsByTagNameNS("*", "sensor");
            } else {
                sensorXml = xmlElems[i].getElementsByTagName("wsbml:sensor");
            }
            for (j = 0; j < sensorXml.length; j += 1) {
                sensorXml[j].getAttribute('name');
                if (typeof sensors[sensorXml[j].getAttribute('type')] === "undefined") {
                    sensors[sensorXml[j].getAttribute('type')] = {};
                }
                if (typeof sensors[sensorXml[j].getAttribute('type')][sensorXml[j].getAttribute('name')] === "undefined") {
                    sensors[sensorXml[j].getAttribute('type')][sensorXml[j].getAttribute('name')] = [];
                }
                if(sensorXml[j].textContent !== undefined) {
                    sensorData = sensorXml[j].textContent;
                } else {
                    sensorData = sensorXml[j].text;
                }
                sensors[sensorXml[j].getAttribute('type')][sensorXml[j].getAttribute('name')].push([ time, parseFloat(sensorData) ]);
            }
        }

        return sensors;
    };
    my.parseForDisplay = parseForDisplay;

    return my;

}(WSBOUT));