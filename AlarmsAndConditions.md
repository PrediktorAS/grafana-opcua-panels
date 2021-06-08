# Introduction 
<b>Prediktor Alarms and Events Table Panel.</b>  

![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ExampleAC.PNG)

There is an OPC UA datasource plugin to Grafana that is partly developed by Prediktor. This plugin supports OPC A&C (Alarms and Conditions). Prediktor has developed a panel plugin to show alarms and conditions in a table in Grafana dashboards. This plugin allows for showing icons with different colors dependent of the state of an event.  

Prediktor has also developed another panel plugin to host Grafana dashboards. This plugin can be used in conjunction with a OPC UA browser panel, also developed by Prediktor. By setting up the browser and the host panel in the same dashboard, one can show a dashboard in the hosting panel based on what is selected in the browser. 
The hosing panel plugin can also be nested. This ability can be utilized to reuse an alarm and condition dashboard in many other dashboards. 

# Getting Started

<b>Basic setup of a dashboard with and Alarm and Condition panel</b>

It is assumed that there already exists an OPC UA datasource, in this example it is called 'OPC UA Event'.
Create a new Dashboard and do the following:

