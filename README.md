# Browser Computer Vision
Tool for assisting with developing browser-based computer vision applications.

Leveraging OperCV.js: https://docs.opencv.org/3.4/d5/d10/tutorial_js_root.html

## Overview
BrowserCV allows users to develop intuition with image processing methods and generate code which performs those operations, allowing them to create projects that use CV without significant coding experience.

## Developers

### Setup
1) ```git clone``` this repository into a directory on your machine
2) Install and setup [MAMP](https://www.mamp.info) so you can host index.html locally

### Site Contents
#### Pages
##### **```index.html```**
Where users are first sent. Contains links to other pages.
##### **```Generate Code Tool/tool.html```**
Houses the main application. Uses ```Generate Code Tool/processingv2.js``` as its main JavaScript driver.
##### **```Help/help.html```**
Contains user setup and tutorial information
##### **```Prototypes```**
Holds previously developed versions of the page

#### Scripts
##### **```Generate Code Tool/processingv2.js```**
The main JavaScript driver for the application. It imports other JavaScript modules, loads page data, adds buttons to the page depending on which processing functions exist, handles video capture, processing, and playback, and also contains developer to-do list.
##### **```jsmodules/*.js```**
Contains JavaScript modules representing each image processing function the tool can do. Each module exports certain pieces of information and functions including their name, how to render their interface on the page, and a class which stores relevant information to each instance of the module's function, as well as members which apply the function to an image and generate the code for that function in multiple languages. In order to be considered valid, each of these exports much exist, and they are checked in ```processingv2.js```. These modules also load their interfaces from html files in the ```Function Interfaces``` folder.
##### **```jsmodules/functionQueue.js```**
A JavaScript module containing a class, functionQueue, which is used by the tool to keep track of which functions the user has selected and in what order. The functionQueue is used heavily by ```processingv2.js```
##### **```jsmodules/generateCode/generateCode.js```**
A JavaScript module which contains relevant functions for generating code corresponding to the options selected by the user in the box at the bottom of the tool page. It asks each function the user has selected to generate its own code. It also contains code for common helper functions between the image processing functions. It puts all of these pieces together in the correct language.
##### **```jsmodules/moduleSetup/moduleHelper.js```**
A JavaScript module which contains a few miscellaneous common helper functions used by many different modules such as loadCode which is used to load interfaces for image processing functions, codeLine, which indents code, and a few others.
##### **```jsmodules/onImageActions/actions.js```**
A JavaScript module which contains the JavaScript versions of several common helper functions used by a few of the image processing functions, such as thresholding and circling objects.

### Adding Changes
1) ```git add *``` adds all your changes to the group of changes to go on the next commit
2) ```git commit -m "YOURMESSAGEHERE"``` commits your added changes with a message
3) ```git push``` will push changes to the repository