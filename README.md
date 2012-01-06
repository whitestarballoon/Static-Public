White Star Static Tracking Page.
===============================

This is the White Star Balloon Static Tracking Page.  This page uses Javascript to receive command messages, download data from Amazon S3, and display the data to the user.

Giants
------

We stand on the shoulders of giants with this project.  We use the following libraries:

*   Jquery (http://jquery.com/)
*   HighCharts (http://www.highcharts.com/)
*   JSGauge (http://code.google.com/p/jsgauge/)
*   OpenLayers (https://github.com/openlayers/openlayers)
*   PubNub (http://www.pubnub.com/)

Overview
--------

This tracker operates by parsing data from GPX files with proprietary extensions.  GPX data contains tracks, elevations, and GPS data from the balloon.  Inside each GPX point, there is a WSBML data section containing sensor and status values.  WSBML looks like this: 

```xml
<wsbml:data>
  <wsbml:sensor type="vspeed" name="vspeed">-2.87783159594</wsbml:sensor>
  <wsbml:sensor type="temperature" name="internal">-27.6427162671</wsbml:sensor>
  <wsbml:sensor type="temperature" name="external">-33.8784654118</wsbml:sensor>
  <wsbml:sensor type="temperature" name="battery">-2.30392671783</wsbml:sensor>
  <wsbml:sensor type="temperature" name="helium">-29.9931765217</wsbml:sensor>
  <wsbml:sensor type="humidity" name="humidity">60.7123865001</wsbml:sensor>
  <wsbml:sensor type="pressure" name="pressure">198.002937666</wsbml:sensor>
  <wsbml:sensor type="speed" name="speed">42.1712299325</wsbml:sensor>
  <wsbml:sensor type="cloud" name="cloud">0.430903196869</wsbml:sensor>
  <wsbml:status name="gps">0</wsbml:status>
  <wsbml:status name="error">0</wsbml:status>
</wsbml:data>
```

Right now, there are a bunch of values inside the javascript which must match types and names inside the XML exactly in order to be parsed.  For display purposes, many floating point values are truncated to 2 digits.

On initial page load, the tracker requests the init.xml file specified in js/wsbdata.js, parsing all of the points into a master list of OpenLayers Geometry Points, and adding sensor data properties to these points.  Sensor data is also pushed to each chart, at which point the HighCharts API provides data caching.

The page listens for an incoming message on a PubNub channel, directing the client to retreive an additional GPX file, and parse it in the same way.

Files
-----

*   js/wsbdata.js

    This is the main javascript file, initiating the Wsbdata "namespace" using the Object-Literal pattern.
    This file contains definitions for initialization objects and functions.
    Charts are defined in here.  Trace ids must match exactly a sensor name in the XML, while chart types must match exactly a type in the XML.
    
*   js/wsbgauges.js

    This file defines our wsbdata gauge objects, as well as a list of gauges for initialization.  Type must match exactly a type in the XML, and trace must match exactly a name in the XML.
    
*   js/wsbgraphs.js

    This file contains the code for rendering a graph.  All the graphs are rendered the same, with floating Y axes and identical styling.  Please references the HighCharts Stock API for detail on how to style these objects.
    
*   js/wsbmaps.js

    OpenLayers definitions and initialization, this is mostly for namespace cleanup.

*   js/wsbparse.js

    Functions for parsing in new data.  Generate sensor object generates an object suitable for pushing into graphs.  Generate features parses XML into an array of OpenLayers Points.  ParseGPXString accepts a GPX DOM object or String Literal, extracts sensor values, updates the map, and pushes values into graphs and gauges.
    
    