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

![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/CreateDatasource.PNG)

1.	Choose the ua-event-view visualization
2.	In the Query, choose the appropriate datasource
3.	Choose Events from the datasource
4.	Browse the Information Model (IM) for the area you want to show events for.
5.	Browse the EventTypes and choose the event type you want to see data for. You can add columns from multiple EventTypes
6.	Order the columns in your preferred order and rename the headers if you want (Alias)

By pressing the Apply button and assuming there are events in the chosen period, you will get something like this:

![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/EventTableSimple.PNG)  
You can of course add more panels to the dashboard, like trends and gauges.  


<b>Improving the look of and Alarm and Conditions panel</b>  

Generally, Alarm and Conditions dashboards usually utilize icons and colors to improve the usability. This section will explain how to setup the ua-event-view panel with icons and colors that are dependent of the event state.
Go back to Edit-mode and look at the properties for ua-event-view.
Open the Fields tab:

![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/FieldTab.PNG) 

Here we can see the properties that can be applied to columns and cells in the table. The properties in the Field tab will affect all the columns and cells in the table. This can be useful, but we want to affect each column differently. First, we will look at the Severity column.  


<b>The Severity column</b>  

The Severity column usually contains numbers from 0 to 1000. These numbers represent the severity of the event. A high number means high severity. We want to represent different severities with different icons and colors.
In the properties panel, we have a tab called Overrides. In this tab we can override the default properties in the Field for a specific column.
The Override tab is initially empty:

![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/SeverityOverride1.PNG)   

We now press the ‘Add an override for’ button and select the Severity column:  

![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/SeverityOverride2.PNG)     
Chose ‘Fields with name’, then select Severity. The ‘Override 1’ section will now contain overrides for the Severity column. Later we will add overrides for the Active and Acked columns also.
The events in my example opc server comes from level alarms, HI, HIHI, LOW, LOWLOW. HIHI and LOWLOW gives a severity of 835 and HI and LOW gives a severity of 780. 
In the following we will setup a mapping of number to text and an icon and a color for these severities.
Lets start with Alarm Image Thresholds. These are thresholds for what to show for different ranges of numbers. If a value comes in between two thresholds, the lover threshold is chosen.
Now we press the ‘Add override property’ and choose ‘Alarm Image Thresholds’:

![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/SeverityOverride3.PNG)  
We will need two new thresholds to represent the two alarm states. Press the ‘Add threshold’ button twice:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/SeverityOverride4.PNG)  
Now we enter the values for the thresholds by typing them directly in the two upper rows:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/SeverityOverride5.PNG)  
Now we click on the images to change icon and color:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/SeverityOverride6.PNG)  
Press the circle after Color: to change the color. Select one of the icons to change the icon. 
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/SeverityOverride7.PNG)  
Result:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/SeverityOverride8.PNG)  
The default cell type of the table will not respect the Alarm Image Thresholds. We need to override the cell type for the Severity column.
Press ‘Add override property’ and select ‘Cell display mode’. Then choose ‘AlarmImage’:
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/SeverityOverride9.PNG)  
The table will now look something like this:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/SeverityOverride10.PNG)  
The icons and colors are now in place. But the values are not very informative, and we shall now replace them with an appropriate text. Press ‘Add override property’ and choose ‘Value mappings’:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ValueMappings1.PNG)  
Press ‘Add value mapping’ and setup value range and override text.
The table now look like this:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ValueMappings2.PNG)  
The values are now replaced with the texts.
The Severity column now has the right icon, color and text, but does look a bit messy. We can align the cell content left to make it look better. We add another override for the Severity column.
Press ‘Add override property’ and choose ‘Column alignement’:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ValueMappings3.PNG)  
Select ‘left’. The table, with the final version of the Severity column, now looks like this:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ValueMappings4.PNG)  

<b>The Active column</b>  

Now, let’s tackle the Active and Acked columns. We use the Active column as an example.
The values of these columns are booleans and this require a slightly different approach than the numbers of the Severity column.
We now press the ‘Add an override for’ button and select the Active column:
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ActiveColumn1.PNG)  
Now we press the ‘Add override property’ and choose ‘Alarm Image Thresholds’:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ActiveColumn2.PNG)  
Setup two thresholds as before. <b>Note! A threshold value of 1 represents the boolean True, all other values represents False.</b>    

Press ‘Add override property’ and select ‘Cell display mode’. Then choose ‘AlarmBooleanImage’:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ActiveColumn3.PNG)  
The table now looks like this:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ActiveColumn4.PNG)  
Now, lets change the values to something more informative than True/False.
Press ‘Add override property’ and choose ‘Value mappings’ then ‘Add value mapping’:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ActiveColumn5.PNG)  
The table now looks like this:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/ActiveColumn6.PNG)  
  
  
# Reuse of an Alarm and Conditions panel plugin
How to reuse an Alarm and Conditions panel plugin in many dashboards

In the previous session we developed a dashboard to show alarms and conditions for a specific asset. It would be nice if we could reuse that dashboard for other assets, and we can!
This will only work with template dashboards, that is dashboards built based on UA types, not instances. The intension is that one builds a main dashboard consisting of a browser and a viewer where the content of the viewer is decided by what is selected in the browser (grafana-ua-panel and ua-dashboard).
Until Grafana adds support for reuse of panel, we need to wrap our event dashboard in a wrapper of our own, ua-dashboard. So in the setup described above, we need a few layer to get this to work.
Layer from outside to inside:
1.	Main dashboard consisting if a browser (grafana-ua-panel) and a viewer (ua-dashboard)
2.	The viewer will display dashboards based on what is selected in the browser
3.	The dashboards displayed in the viewer will also contain an embedded viewer
4.	This embedded viewer will be configured to show the template event dashboard

The first two layers are assumed in place. Next, we will setup the two inner layers from inside out.
Converting an Alarm and Conditions dashboard to a template
It is always a good idea to start with an Alarm and Conditions dashboard created for an instance when making a template. The reason for this is that to be able to manipulate the look, you need actual event data. You will never see any event data, design time, in a templated dashboard (because data are on instances, not types)
To make the dashboard we made for an asset/instance to a templated dashboard, we need to do two changes:
First, change the UA Node Selection to Type:  

![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/Reuse1.PNG)  
Second add a variable named ObjectId to the dashboard:
Click on the Settings symbol:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/Reuse2.PNG)  
Add the variable:  
![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/Reuse3.PNG)  
The dashboard is now a template.  

<b>Embed a templated Alarm and Events dashboard</b>

We will now add a templated Alarm and Events dashboard to a templated dashboard for a type.
You may have several panels in the dashboard already. We will add a panel of the type ua-dashboard (named PumpLoop Event in the example below).  

![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/Embed1.PNG)  
Now, change the Display property to ‘Named Dashboard’. Then enter the name of the template Alarm and Events dashboard in the ‘Named Dashboard’ property.
Browsing the information model in the main dashboard, will now produce something like this:  

![full dashboard](https://raw.githubusercontent.com/PrediktorAS/grafana/main/ua-event-view/images/Embed2.PNG)  
This image is showing a dashboard for a PumpLoop with the alarm and events dashboard embedded.  

