# D3 Sunburst
This is a data visualization project I made during my internship at PFP Cybersecurity. 
The team wanted to explore better ways to visualize complex data, and someone recommended D3.js.
It is my first time working with D3, so I learn as I go and some of the code may seem sloppy.

The result is layers of concentric circles. 
Different colors and sizes make up each circle, which imply the security level of each data entry.
When users hover over one part of the circle, the respective data it represents will show up in the middle of the circle.
When clicked, the circles will turn smaller, displaying the make-up of the respective data entry in detail.
Users can go back to the top level of all data by clicking in the center of the circles.

**Please note that the bulk of the project is built upon existing code online (https://bl.ocks.org/vasturiano/12da9071095fbd4df434e60d52d2d58d),
and I had to customize the experience that allows users to explore data in detail, switching between the high level and granular view by displaying info when hovered or clicked.**

Also note that it might not show up on your browser, since it's only visible on FireFox.

![](sunburst.gif)
