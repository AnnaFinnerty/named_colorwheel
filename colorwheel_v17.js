window.addEventListener("DOMContentLoaded", function (event) {

    //                      WORKLIST
    // * finish intro/rewrite instructions
    // * video
    // * add color change to palette buttons and copy buttons
    // * add media query for palette pop on smaller sizes
    // + blue copy icon is wonky
    // + pallette fuckery (see beige - navajoWhite)
    // + pallette can close w/out copy button closing
    // + alert that colors have been copied to the clipboard
    // + add rgb to color info in window
    // + status clear when click outside of r[0] of colorwheel
    // + close copy window after alert pop-up
    // + remove pallette selection by click on background
    
    window.addEventListener("load", setCanvas)  ;
    window.onmousemove = hoverOn;    
    window.addEventListener("resize", setCanvas);
    window.addEventListener("resize", updateSize);
    
   
    
    // declare page elements
    var selected = false;
    var rotating = false;
    var r = undefined;
    var dialBacks = [];    
    
    // declare canvas elements
    var can = document.getElementById('canvas1');
    can.width = window.innerWidth;
    can.height = window.innerHeight;
    var ctx = can.getContext('2d');
    
    // declare empty arrays
    var getData = [];
    var lastClick = [];
    var spheres = [];
    var sD = 0;    
    
        ////palette definitions
    var swatchSizeBig = window.innerWidth*.08;
    var swatchSizeSmall = window.innerWidth*.05;    
    var swatches = [];
    var swatchNumber = 0;
    var swatchNo = 0;    

    var textSize = window.innerWidth*.04;
    
    // default swatch sprite    
    var swatchSprite = {
        color: "transparent",
        height: swatchSizeSmall,
        width: swatchSizeSmall,
        x: 0,
        y: 0,
        selected: false,
        top: function(){
            return this.y;
        },
        bottom: function(){
            return this.y+this.height;
        },
        left: function(){
            return this.x;
        },
        right: function(){
            return this.x+this.width;
        }
    }; 
    
    var swatchColors = ['transparent','transparent','Black','transparent','Gainsboro','transparent','FireBrick','transparent','rgb(45, 47, 51)','transparent'];  
    
    
    

    resize();
    setSmallSwatchProps();


    
    // wheel properties
    var rArray = [11.1*r,10.9*r,10.5*r,7.3*r,4.5*r,2.5*r,2*r,.5*r];
    
    var seg = 0; 
    var start = 0;
    var cx = window.innerWidth * .5;
    var cy = window.innerHeight * .5;
    //A default sphere object
    var sphere = {
        width: window.innerHeight*.1,
        height: window.innerHeight*.1,
        radius: 40, 
        color: "white",
        x:0,
        y:0,
        rotation: 0
    }
    var compCounter = 0;   

    var col_segments = [
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        []        
    ]       
    
    // get color info from w3color.js
    var hexs = getColorArr("hexs");
    var names = getColorArr("names");
    
    //remove duplicate colors (e.g. 'gray' and 'grey')
    for (i = 0; i < hexs.length; i++) {
        if (hexs.indexOf(hexs[i], i + 1) != -1) {
            var iMatch = hexs.indexOf(hexs[i], i + 1);
            hexs.splice(iMatch, 1);
            names.splice(iMatch, 1);
        }
    }
    
    // create color objects (with RGB values) from hex codes
    var rgb = HexsToColorObject(hexs, []);
    
    // create a reference copy
    var colorsArray = rgb;        
    
    // array to store user click history
    var storedImgData = [];    
    var drawCount = 0;
    
    rgb = rgb_sort(rgb, 'hue', 'sat', 'lightness');
    
    // declare dongles    
    var sortSphere = Object.create(sphere); 
    var underSphere = Object.create(sphere);
    var qSphere = Object.create(sphere);
    var underqSphere = Object.create(sphere);    
    var aboutMessage = document.getElementById("about");
    var aboutClose = document.getElementById("aboutclose");    
      
    var signs = [];  
    
    var signSprite = {
        x:0,
        y:0,
        width: 50,
        height: 50,
        fillstyle: (swatchColors[2] != "transparent" ? swatchColors[2] : "Black"),
        textBaseline: "bottom",
        fontSize: "9em",
        text: "",
        visible: false
    }
        
    var palletesPopped = false;      
    var plistening = false;
    
    var clickCount = 0;    
    
    //wheel rotation counter
    var rotation = 0;    
    
    var leftClose = Object.create(signSprite);
    var rightClose = Object.create(signSprite);
    var leftCopy = Object.create(signSprite);
    var rightCopy = Object.create(signSprite);
            
    // toggle the sphere to for new color sorts  
    var sliderCounter = 0;
    var sliderClicks = 0;
    var newAngle = 0;
    var newColor = "";
    var sortDeg = 0;
    var sorting = false;
    var tempColSegments = [];
    var deltasArray = [];    
    
    var introRunning = false;   //MTC -- remove when pushing    
    
    var introTimer = 0;
    var introState = 0;
    var arrow2rotate = 30;    


    
    segmentize("hue", "red", "green", "blue");
    makeDongles();
   
    
    function resize(){
        // radius constant
        
        
        if (window.innerHeight < window.innerWidth) {
            sD = window.innerHeight;
        } else {
            sD = window.innerWidth;
        }
        
        r = window.innerHeight * .042;
        
        // set number of swatches
        if(window.innerWidth >= 900) {
                swatchNumber = 5;
            } else if (700 < window.innerWidth < 900) {
                swatchNumber = 4;
            } else if (window.innerWidth < 700) {
                swatchNumber = 3;
        } 
        
            
        
    }    
    
    function updateSize () {
        resize();
        can.width = window.innerWidth;
        can.height = window.innerHeight;
        
        rArray = [11.1*r,10.9*r,10.5*r,7.3*r,4.5*r,2.5*r,2*r,.5*r];
        
        swatchSizeBig = window.innerWidth*.08;
        swatchSizeSmall = window.innerWidth*.05;    

        textSize = window.innerWidth*.015;
        
        cx = window.innerWidth * .5;
        cy = window.innerHeight * .5;
        setColObjDefaults(false);
        
        swatches = [];
        setSmallSwatchProps();       
        
        //segmentize("hue", "red", "green", "blue");
        makeDongles();
        setCloseCopyAttr();  
        if (palletesPopped) {popColor()};
        
        //console.log("Calling setCanvas at 164 (updateSize)");
        setCanvas();
        
    };
    
    function setSmallSwatchProps() {
        //console.log("Setting small swatch properties");
        for (i=0;i<swatchNumber*2;i++){

                swatch = Object.create(swatchSprite);
                swatch.id = "swatch" + i + "";
                swatch.color = swatchColors[i];
                swatch.y = (window.innerHeight*(.5-.05*swatchNumber/2)) + (swatchSizeSmall*Math.floor(i/2));      
                if (i%2 ==0){
                    swatch.x = -(swatch.width*.8);
                } else {
                    swatch.x = (can.width - swatchSizeSmall)+(swatch.width*.8);
                }
                //console.log(swatch.color);
                swatches.push(swatch);

            }
        };    
    
    function setCloseCopyAttr() {
        leftCopy.text = "#";
        leftCopy.name = "leftCopy";
        leftCopy.x = swatchSizeBig-signSprite.width;
        leftCopy.y = swatches[0].y + leftCopy.height/2;
        leftCopy.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        leftCopy.visible = false;
        signs.push(leftCopy);

        leftClose.text = "X";
        leftClose.name = "leftClose";
        leftClose.x = swatchSizeBig-10;
        leftClose.y = swatches[0].y + leftCopy.height/2;
        leftClose.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        leftClose.visible = false;
        signs.push(leftClose);
        
        rightCopy.text = "#";
        rightCopy.name = "rightCopy";
        rightCopy.x = can.width - (swatchSizeBig-signSprite.width/2);
        rightCopy.y = swatches[0].y + leftCopy.height/2;
        rightCopy.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        rightCopy.visible = false;
        signs.push(rightCopy);   

        rightClose.text = "X";
        rightClose.name = "rightClose";
        rightClose.x = can.width-swatchSizeBig-10;
        rightClose.y = swatches[0].y + leftCopy.height/2;
        rightClose.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        rightClose.visible = false;
        signs.push(rightClose);            
    }    

    

    //function for performing a multi-factor (up to four) argument sort on an rgb_array
    function rgb_sort(rgb_array, arg1, arg2, arg3, arg4) {
      return rgb_array.sort(function (a, b) {      
        if (a[arg1] === b[arg1]) {
          if (a[arg2] === b[arg2]) {
            if(a[arg3] === b[arg3]) {
              return (a[arg4] - b[arg4])
            } else {
              return (a[arg3] - b[arg3]);            
          }} else {
            return (a[arg2] - b[arg2]);
        }} else {
          if (arg1!=="hue") {
            return (b[arg1] - a[arg1]);
          } else {
            return (a[arg1] - b[arg1]);          
          }}});
    }    
    
    function HexsToColorObject(hexs, rgb) {
        for (i = 0; i < hexs.length; i++) {
            var co = toColorObject(hexs[i]);
            co.x = 0;
            co.y = 0;            
            rgb.push(co);
        }
        return rgb;
    }  
    //  split colorsArray into segments, sort the segments, then recombine
    function segmentize(c1, c2, c3, c4) {

           col_segments = [ [], [], [], [], [], [], [], [] ]

          //7   white
          //6   pastels     
          //5   near white
          //4   light
          //3   mid
          //2   dark
          //1   near black
          //0   black

            //function for checking if a color meets our definition of 'grey'
            function grey_test(colObj) {
                var cutoff = 35;
                return (Math.abs(colObj.red - colObj.green) < cutoff && 
                Math.abs(colObj.green - colObj.blue)< cutoff && 
                Math.abs(colObj.blue -colObj.red) < cutoff &&
                (colObj.lightness <= .53 || colObj.lightness > .97 || colObj.hue === 0)
                )
            }

            //review each color and slide it into a traunch, as appropriate
            for (i=0; i<colorsArray.length; i++) {

                //black
                if (colorsArray[i].name == "Black") {
                        col_segments[0].push(colorsArray[i]);
                    }

                //white
                else if (colorsArray[i].name == "White") {
                        col_segments[7].push(colorsArray[i]);
                    } 

                //grey
                else if (grey_test(colorsArray[i])) {

                        //slot the grey into either the off-white grey (6)
                        //or the off-bloack grey (1) traunch
                        if (colorsArray[i].lightness <= .53) {
                            col_segments[1].push(colorsArray[i]);
                        } else {
                            col_segments[6].push(colorsArray[i]);
                        }

                //pastel, light, medium, dark colors
                } else {

                    //dark color
                    if (colorsArray[i].lightness <= .49) {
                        col_segments[2].push(colorsArray[i]);
                    } 
                    //mid color
                    else if (colorsArray[i].lightness <= .66) {
                        col_segments[3].push(colorsArray[i]);
                    }
                    //pastel color
                    else if (colorsArray[i].lightness >= .94) {
                        col_segments[5].push(colorsArray[i]);
                    }
                    //light color
                    else {
                        col_segments[4].push(colorsArray[i]);
                }

            }}


            //sort each segment (currently each is set to hue + rgb)

            //near black
            for (i=0; i<col_segments.length; i++){
                col_segments[i] = rgb_sort(col_segments[i], c1, c2, c3, c4)
            }

            //reset colorsArray as a specific col_segment
            //colorsArray = col_segments[6];

            //reset colorsArray as the concatenation of all the segment
            setColObjDefaults(true);
        };

    function setColObjDefaults(deselect) {
        
            for (j=0;j<col_segments.length;j++){
                    for (k=0; k<col_segments[j].length;k++){
                        var seg = 360 / (col_segments[j].length);
                        var start = (270 ) + (seg * k);
                        if (j==0 && k==0) {"console.log(setting color properties"};
                //initialize color properties
                    var seglen = col_segments[j].length
                    var col = col_segments[j][k]
                    col.layer = j;
                    col.segnum = k;
                    col.seglen = seglen;
                    col.shadow = true;
                    col.hover = true;
                    if (deselect) {
                        col.compSelect = false;
                        col.splitCompSelect = false;
                        col.triSelect = false;
                        col.quadSelect = false;
                        col.selected = false;
                    };
                    if (!rotating) {col.rotation = 270};
                    col.redd = 0;
                    col.blued = 0;
                    col.greend = 0;  
                // set basic color properties here    
                    col.x = cx + ((rArray[j]-15)*Math.cos(start*Math.PI/180));
                    col.y = cy + ((rArray[j]-15)*Math.sin(start*Math.PI/180));
                // set complement of selected

                    var compPos = Math.floor(k + seglen/2) % seglen;
                    col.complement = compPos;

                    var spComp1 = (col.complement + 2) % seglen;
                    var spComp2 = col.complement - 2
                        if (spComp2 < 0) { spComp2+=seglen; }
                    col.spComp1 = spComp1;
                    col.spComp2 = spComp2;

                // set positions for triadic complement        
                    var triPos1 = Math.floor(k + seglen/3) % seglen;
                    var triPos2 = Math.floor(k + (seglen/3)*2) % seglen;
                    col.triadic1 = triPos1;
                    col.triadic2 = triPos2;
                // set position for quadratic complements
                    // var quadPos1 = Math.floor(k + seglen/4) % seglen;
                    // var quadPos2 = Math.floor(k + (seglen/4)*2) % seglen;
                    // var quadPos3 = Math.floor(k + (seglen/4)*3) % seglen;
                    col.quad1 = Math.floor(k + seglen/4) % seglen;
                    col.quad2 = Math.floor(k + (seglen/4)*2) % seglen;
                    col.quad3 = Math.floor(k + (seglen/4)*3) % seglen;
                    }                    
            }
        
        
    }


   
    
    function makeDongles(){    
     // properties for sphereical buttons   

        if (!sortSphere.color) {sortSphere.color = (swatchColors[4] != "transparent" ? swatchColors[4] : "Silver")};
        sortSphere.shadow = false;
        sortSphere.text = "";
        sortSphere.position = 0;
        sortSphere.angleIncrement = (360/col_segments[1].length);
        if (!sortSphere.angle) {sortSphere.angle = sortSphere.angleIncrement*.25};
        sortSphere.width = rArray[7];
        sortSphere.CenterX = cx + rArray[0] * 
            Math.cos(sortSphere.angle * Math.PI / 180);
        sortSphere.CenterY = cy + rArray[0] * 
            Math.sin(sortSphere.angle * Math.PI / 180);
        sortSphere.radius = rArray[7]*2;


        underSphere.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        underSphere.text = "";
        underSphere.position = 0;
        underSphere.angleIncrement = (360/col_segments[1].length);
        underSphere.angle = sortSphere.angleIncrement*.25;
        underSphere.width = rArray[7];
        underSphere.CenterX = cx + rArray[0] * 
            Math.cos(sortSphere.angle * Math.PI / 180);
        underSphere.CenterY = cy + rArray[0] * 
            Math.sin(sortSphere.angle * Math.PI / 180);
        underSphere.radius = (rArray[7]*2)+5;

        spheres.push(underSphere);
        spheres.push(sortSphere);

        qSphere.color = (swatchColors[4] != "transparent" ? swatchColors[4] : "Silver");
        qSphere.shadow = false;
        qSphere.hover = false;
        qSphere.position = 0;
        qSphere.text = "?";
        qSphere.angleIncrement = (360/col_segments[1].length);
        qSphere.angle = sortSphere.angleIncrement*.25;
        qSphere.width = rArray[7];
        qSphere.CenterX = can.width*.8;
        qSphere.CenterY = can.height*.9;
        qSphere.radius = rArray[7]*2+10;


        underqSphere.color = "rgb(51,51,51)";
        underqSphere.text = "";
        underqSphere.shadow = false;
        underqSphere.hover = false;
        underqSphere.position = 0;
        underqSphere.angleIncrement = (360/col_segments[1].length);
        underqSphere.angle = sortSphere.angleIncrement*.25;
        underqSphere.width = rArray[7];
        underqSphere.CenterX = qSphere.CenterX;
        underqSphere.CenterY = qSphere.CenterY;
        underqSphere.radius = (rArray[7]*2)+15;

        spheres.push(underqSphere);
        spheres.push(qSphere);

        aboutMessage.style.position = "absolute";
        aboutMessage.style.display = "none";
        aboutMessage.style.width = window.innerWidth*.45 + "px";
        aboutMessage.style.height = "auto";
        aboutMessage.style.marginTop = "-50%";
        aboutMessage.style.marginLeft = "50%";
        aboutMessage.style.background = (swatchColors[4] != "transparent" ? swatchColors[4] : "Gainsboro");
        aboutMessage.style.borderWidth = "5px";
        aboutMessage.style.borderColor = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        aboutMessage.style.padding = "2%";
        aboutMessage.style.paddingTop = "5%";
        aboutMessage.style.fontSize = window.innerHeight*.03 + "px";
        aboutMessage.style.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");

        aboutClose.style.position = "absolute";
        aboutClose.style.display = "block";
        aboutClose.style.fontSize = "200%";
        aboutClose.style.marginTop = "-10%";
        aboutClose.style.marginLeft = "85%";
        aboutClose.addEventListener("click", closeAboutWindow);
        
        var homeLink = document.getElementById("home_link");
        homeLink.style.color = (swatchColors[6] != "transparent" ? swatchColors[6] : "Firebrick");
        
        var aboutText1 = document.getElementById("aboutText1");
        var aboutText2 = document.getElementById("aboutText2");
        aboutText1.style.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        aboutText2.style.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        
    }


    function closeAboutWindow(e){
        e.target.style.color = "red";
        setTimeout(function(){
            document.getElementById('about').style.display = "none";
            e.target.style.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        }, 200)    
    } 


    function hoverOn(event){
            var ex = event.clientX;
            var ey = event.clientY;

            // pop the palettes when first hovered on
            if(palletesPopped == false){
                if (ex<swatches[0].right() || ex>swatches[1].left()){
                    if (ey<swatches[swatches.length-1].bottom() && ey>swatches[0].top() ){
                        
                    //adjust the pallette properties to popped state
                    popColor();
                        
                    //rerender with popped pallettes
                    setCanvas();
                    }
                }
            }


            // colorchange qSphere when hovering on
            if (Math.abs(qSphere.CenterX-ex)<qSphere.radius 
               && Math.abs(qSphere.CenterY-ey)<qSphere.radius){
                qSphere.color = "azure";
                qSphere.shadow = true;
                underqSphere.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
                setCanvas();
            // reset qSphere color when hover ceases
            } else if (qSphere.color === "azure") {
                qSphere.color = "rgb(64,64,64)";
                qSphere.shadow = false;
                underqSphere.color = "rgb(51,51,51)";
                setCanvas();
            }
    }


    function loadHandler(){
            window.addEventListener("click", clickHandler, false);   
        }      


    function clickHandler(event){
        document.getElementById("status").style.visibility = "hidden";
        clickCount = 1;
        var ex = event.clientX;
        var ey = event.clientY;

        //console.log(ex,ey);
        // clickhandling for close and copy icons
        for (i=0;i<signs.length;i++){
            var sign = signs[i];
            if (sign.visible == true){
                //console.log("Sign is visible");
                if (ex>sign.x
                    && ey<sign.y
                    && ex<(sign.x+sign.width)
                    && ey>(sign.y-sign.height)){
                      if (/Close/.exec(sign.name)){
                        //console.log("closing!")
                        leftClose.color = (swatchColors[6] != "transparent" ? swatchColors[6] : "Red");
                        rightClose.color = (swatchColors[6] != "transparent" ? swatchColors[6] : "Red");
                        leftCopy.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
                        rightCopy.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
                        popClose();  
                        closeCopyWindow();
                      } else if (/Copy/.exec(sign.name)) {
                          //console.log("copying!");
                          leftCopy.color = (swatchColors[4] != "transparent" ? swatchColors[4] : "Silver");
                          rightCopy.color = (swatchColors[4] != "transparent" ? swatchColors[4] : "Silver");
                         
                          if (document.
                              getElementById("textarea").
                              children.length === 0) {
                              copy()
                          };
                      }
                    break;
                }
            }
            
            //cancel the pallete listener and set the swatch to transparent
            //if user's clicked out of the wheel
            if (plistening && (Math.sqrt((ex-cx)*(ex-cx) + (ey-cy)*(ey-cy)) > rArray[0])) {
                    //mtc -- current work area
                    //console.log("Trying to splice in transparent");
                    swatchColors.splice(swatchNo,1,(swatchNo != swatches.length-2 ? "transparent" : 'rgb(45, 47, 51)'));
                    //if it's the background slide, go back to default
                    swatches[swatchNo].color = (swatchNo != swatches.length-2 ? "transparent" : 'rgb(45, 47, 51)');
                    can.style.cursor = "crosshair";
                    plistening = false;
                    compCounter = 0;
                    ImgData(ex, ey);
                      if(swatchNo == swatches.length-2){
                        //console.log(swatches.length-2, swatchColors[swatches.length-2]);
                        document.body.style.background = swatchColors[swatches.length-2];
                      }                
                
            }                    
        }

        // call swatchColor if palette is clicked
        for(i=0;i<swatches.length;i++){
                var swatch = swatches[i];
                if (ey<swatch.bottom()
                   && ey>swatch.top()
                   && ex<swatch.right()
                   && ex>swatch.left()
                    && clickCount == 1    
                   ){
                    //console.log("Calling swatchColor");
                    plistening=true;
                    swatchColor(i);
                } else {
                    // can.style.cursor = "se-resize";
                }
            }        
        

        // display the about message if the qSphere is clicked on
        if (Math.abs(qSphere.CenterX-ex)<qSphere.radius 
             && Math.abs(qSphere.CenterY-ey)<qSphere.radius){
                closeCopyWindow();
                popClose();
                //console.log("qSphere @675");
                aboutMessage.style.display = "flex";
                aboutMessage.style.flexDirection = "column";
                var gif = document.getElementById("gif");
                gif.style.maxWidth = "100%";
                gif.style.height = "auto";
                gif.style.marginLeft = "0%";
                //gif.height = "auto";
                //gif.width = "auto";
         }

        // HSL slider detection
        if (Math.sqrt((ex-cx)*(ex-cx) + (ey-cy)*(ey-cy)) < rArray[0]){
            ImgData(ex,ey);
            sortSphere.color = (swatchColors[4] != "transparent" ? swatchColors[4] : "Silver");
            
            //update the incidental coloring for the spheres
            var c = function(){
                for (j=0;j<col_segments.length;j++){
                    for (k=0;k<col_segments[j].length;k++){
                        var col = col_segments[j][k];
                        if (col.name === (swatchColors[4] != "transparent" ? swatchColors[4] : "Silver")){
                        return "rgba("+col.red+","+col.green+","+col.blue+",0.25)";  
                        }                              
                      }
                  }   
            }            
            
            qSphere.color = c();
            sortSphere.color = c();
        } else {
            //trigger the HSL slider        
            var clickDistanceToSortSphere = ((Math.abs(sortSphere.CenterX-ex))**2+
                  (Math.abs(sortSphere.CenterY-ey))**2)**.5

            if (clickDistanceToSortSphere < sortSphere.radius) {
                sortSlider();
            }

        }
        
        setCanvas();
        
    } 

        // display status message for specific coordinates    
        function ImgData(ex,ey){

                var status = document.getElementById("status");
                getData = ctx.getImageData(ex,ey,1,1);


                //add the click coordinates to the ImageData object
                getData.x = ex;
                getData.y = ey;

                ////using the x and y coordinates, determine the radius and angle relative to the center of the circle

                ////use radius to determine the col_segments section
                getData.cradius = ((cx-ex)**2+(cy-ey)**2)**.5
                getData.clayer = get_clayer(getData.cradius)

                //store the current click information into the lastClick variable
                //for later use
                
                //console.log(getData.clayer);
                if (getData.clayer != -1){

                    ////and then use angle divided by the arc length of each 
                    //segment within that section (see get_cposition() 
                    //function, below)            
                    var cpca = get_cposition_and_cangle(getData);
                    getData.cposition = cpca[0];
                    getData.cangle = cpca[1];

                    //console.log(getData.clayer, getData.cposition, getData.cangle);

                    getData.name = col_segments[getData.clayer][getData.cposition].name;

                    lastClick = getData;                    
                    //console.log(lastClick.name);
                    
                    status.style.visibility = "visible";    

                    //console.log(getData.name);            


                    //store click information in click history
                    manageStoredData(getData);

                    //remove the selected status for all previously
                    //selected segments
                    var col = col_segments[getData.clayer][getData.cposition];
                    //console.log("plistening @767 = ", plistening);
                    if (!plistening) {
                        col_segments.forEach(function(layer){
                            layer.forEach(function(seg) {
                                seg.selected = false;
                            })   
                        })
                    }

                    //display the name of the color that has been clicked
                    findName(getData);
                    
                    //console.log("plistening @778 = ", plistening);
                    if (plistening) {palletteListener()};
                    
                } else {
                    status.style.visibility = "none";
                    //console.log("We're in the right place");
                    //console.log("plistening @786 = ", plistening);                    
                    if (!plistening) {
                        if (lastClick.length != 0) {
                            var col = col_segments[lastClick.clayer][lastClick.cposition];
                            compCounter = 0;            
                            col.selected = false;
                            col.compSelect = false;
                            col.splitCompSelect = false;
                            col.triSelect = false;
                            col.quadSelect = false;
                        }
                    //console.log("Calling setCanvas at 775 click outside wheel");
                    setCanvas()                    
                    };
                }

                function get_clayer(cradius) {
                    for (r in rArray) {
                      if (cradius > rArray[r]) {
                          return r-1;
                      } else if (parseInt(r) === rArray.length-1) {
                          return r;
                      }
                    };
                }

                function get_cposition_and_cangle(getData) {

                        var seg = 360 / (col_segments[getData.clayer].length);
                        var start_angle = (270 - (seg * .5));        

                        var cangle_sin = (cy-ey)/getData.cradius;
                        var cangle_cos = (cx-ex)/getData.cradius;

                        var cangle_asin = Math.asin(cangle_sin);
                        var cangle_acos = Math.acos(cangle_cos);

                        //determine the angle and adjust for rotational offset of start_angle
                        if (cangle_asin < 0) {
                            var cangle = 180 - cangle_acos*180/Math.PI - start_angle;
                        } else {
                            var cangle = 180 + cangle_acos*180/Math.PI - start_angle;
                        }

                        //standardize for 0 < angle < 360
                        if (cangle > 360) {
                            cangle = cangle - 360;
                        } else if (cangle < 0) {
                            cangle = cangle + 360;
                        }

                        return [Math.floor(cangle/seg), cangle];

                }    

            }

        function manageStoredData(newClick){

                //push click information to click history
                var duplicate = false;

                //check each stored click
                for (iData in storedImgData) {

                    //compare the data arrays of the two events
                    //if every element is the same, a duplicate is detected
                    if (newClick.name === storedImgData[iData].name) {
                        duplicate = true;
                        break;
                    }
                }

                //if it's a duplicate then the computer advances
                //console.log("plistening @861 = ", plistening);            
                if(duplicate && !plistening) {
                    compCounter++;
                }

                if (!duplicate) {
                    compCounter = 0;
                    if (storedImgData.length === 10) {
                        storedImgData.splice(0,1);
                    }
                    storedImgData.push(getData)
                };    

                var col = col_segments[newClick.clayer][newClick.cposition];
                if (compCounter == 0){
                        col.selected == true;
                        col.compSelect = false;
                        col.splitCompSelect = false;
                        col.triSelect = false;
                        col.quadSelect = false;
                } else if (compCounter == 1){
                        col.compSelect = true;
                        col.splitCompSelect = false;
                        col.triSelect = false;
                        col.quadSelect = false;
                } else if (compCounter == 2){
                        col.compSelect = false;
                        col.splitCompSelect = true;
                        col.triSelect = false;
                        col.quadSelect = false;
                } else if (compCounter == 3){
                        col.compSelect = false;
                        col.splitCompSelect = false;
                        col.triSelect = true;
                        col.quadSelect = false;
                } else if (compCounter == 4){
                        col.compSelect = false;
                        col.splitCompSelect = false;
                        col.triSelect = false;
                        col.quadSelect = true;
                } else if (compCounter == 5){
                        col.compSelect = false;
                        col.splitCompSelect = false;
                        col.triSelect = false;
                        col.quadSelect = false;
                        compCounter = 0;
                }

                if (rotating == true){
                        compCounter = 0;
                        col.selected = false;
                        col.compSelect = false;
                        col.splitCompSelect = false;
                        col.triSelect = false;
                        col.quadSelect = false;                
                }

                 //rotate if white is clicked
                if (col.name == "White" && rotating == false){
                        rotating = 1;
                        col.selected = true;
                        col.red = 105;
                        col.green = 105;
                        col.blue = 105;
                        window.requestAnimationFrame(update);
                    } else if (col.name == "White" && rotating == true){
                        rotating = 2;
                        col.selected = false;
                        col.red = 255;
                        col.green = 255;
                        col.blue = 255;
                        window.requestAnimationFrame(update);
                    }    
            }    

//determine color name and draw info window    
function findName(RGBdata) {
                //console.log(RGBdata);
                var statusdiv = document.getElementById("status");

                if (introRunning == false){
                    for (var i=0;i<statusdiv.childNodes.length; i++) {
                        statusdiv.removeChild(statusdiv.childNodes[i])
                    }
                }    
                //console.log(statusdiv.childNodes);

                var nx = RGBdata.x;
                var ny = RGBdata.y;

                // create name display on hover

                var status = document.createElement("DIV");
                var new_name = RGBdata.name;        
                //console.log(new_name);
                var selSeg = col_segments[RGBdata.clayer][RGBdata.cposition]

                //set the selected segment as selected = true
                if (new_name == "White" || new_name == "Black"){
                    selSeg.selected = false;
                } else {
                    selSeg.selected = true;
                        //render the colorinfo box

                        //position
                        status.style.position = "absolute";
                        status.style.top = "" + (ny-30) + "px";
                        status.style.left = "" + (nx-30) + "px";
                        status.style.width = "auto";
                        status.style.height = "45px";

                        //font information
                        status.style.lineHeight = "25px";
                        status.style.padding = "6px";
                        status.style.textAlign = "center";
                        status.style.color = "" + new_name + "";

                        //border information
                        status.style.borderRadius = "10px";
                        status.style.borderStyle = "solid"; 
                        status.style.borderWidth = "3px"  ;   
                        status.style.borderColor = "rgba(" + RGBdata.data + ")";        

                        //background
                        //console.log(RGBdata.clayer, selSeg.complement);
                        status.style.background = "" + col_segments[RGBdata.clayer][selSeg.complement].name + "";        

                        //html content
                        status.innerHTML = "" + new_name + "<br>" 
                             + "RGB(" + RGBdata.data[0] + "," + RGBdata.data[1] + "," + RGBdata.data[2] + ")"
                            ;

                        statusdiv.appendChild(status);

                        //console.log("Calling setCanvas at 972 (findName)");
                        setCanvas();
                        }
            }

function swatchColor(swatch){
            can.style.cursor = "url('./eyedropper.png') 0 24, crosshair";            
            swatchNo = swatch;
            //can.addEventListener("click", palletteListener, false);
        }
function palletteListener(){  
                //console.log("Pallette listener running", lastClick)
                if (lastClick.length !== 0 && lastClick.clayer != -1) {
                  var newName = lastClick.name;   
                  //add color to swatchColors array
                  swatchColors.splice(swatchNo,1,newName);
                  swatches[swatchNo].color = swatchColors[swatchNo];
                      if(swatchNo == swatches.length-2){
                        document.body.style.background = swatchColors[swatches.length-2];
                      }
                      if (swatchNo == 2) {
                          //console.log("working");
                          leftClose.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
                          rightClose.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
                          leftCopy.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
                          rightCopy.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
                          underqSphere.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
                          underSphere.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
                      }
                  can.style.cursor = "crosshair";
                  //can.removeEventListener("click", palletteListener, false);
                  plistening=false;
                  setCanvas();
                  return newName;
                }
            }
     

//toggle palettes
function popColor(){
           leftClose.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");;
           rightClose.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");;
           for (i=0;i<swatches.length;i++){
                var swatch = swatches[i];
                swatch.width = swatchSizeBig;
                swatch.height = swatchSizeBig;
                swatch.y = swatchSizeBig*(swatchNumber/3) + (swatchSizeBig*Math.floor(i/2));
                // position left swatches
                if (i%2 ==0){
                swatch.x = 0;
                    } else 
                // position right swatchs
                    {
                        swatch.x = (can.width - swatchSizeBig);
                    }
                }
            setCloseCopyAttr();    
            leftClose.visible = true;
            rightClose.visible = true;
            leftCopy.visible = true;
            rightCopy.visible = true;
            palletesPopped = true;    
        } 

function popClose(){
        setTimeout(function(){


            for (i=0;i<swatches.length;i++){
                var swatch = swatches[i];
                swatch.width = swatchSizeSmall;
                swatch.height = swatchSizeSmall;
                swatch.y = swatchSizeSmall*(swatchNumber/3)+ window.innerHeight/2 - (swatchSizeSmall*Math.floor(i/2));
                // position left swatches
                if (i%2 ==0){
                swatch.x = -(swatch.width*.8);
                    } else 
                // position right swatchs
                    {
                        swatch.x = (can.width - swatchSizeSmall)+(swatch.width*.8);
                    }
                }
            swatches = [];
            setSmallSwatchProps();               
            setCloseCopyAttr();
            leftClose.visible = false;
            rightClose.visible = false;
            leftCopy.visible = false;
            rightCopy.visible = false;
            palletesPopped = false;
            //console.log("Calling setCanvas at 1088 (popClose)");        
            closeCopyWindow;
            setCanvas();
        }, 400);
    }    

function copy(){
        plistening=false;
        //console.log("Copy function running");
        var textArea = document.getElementById("textarea");
        //console.log("re-setting textArea visibility")
        textArea.style.display = "flex";
        textArea.style.flexWrap = "wrap";
        textArea.style.justifyContent = "center";
        textArea.style.position = "absolute";
        textArea.style.width = window.innerWidth*.3+"px";
        textArea.style.height = "auto";
        textArea.style.marginTop = -(window.innerWidth*.6) + "px";
        textArea.style.marginLeft = "7%";
        textArea.style.background = "gainsboro";
        textArea.style.border = "5px solid black";
        textArea.style.padding = "1%";

        var textClose = document.createElement("DIV");
        textClose.innerHTML = "X";
        textClose.style.position = "absolute";
        textClose.style.top = "-5%"
        textClose.style.right = "2%"
        textClose.style.fontSize = textSize*1.2 + "px";
        textClose.addEventListener("click",locCloseCopyWindow,false);
        textClose.style.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        textArea.appendChild(textClose);

        function locCloseCopyWindow() {
            textClose.style.color = (swatchColors[6] != "transparent" ? swatchColors[6] : "Red");
            closeCopyWindow();
        }
    
        var textCopy = document.createElement("DIV");
        var hiddencolors = document.createElement("TEXTAREA");    
        textCopy.innerHTML = "#";
        textCopy.style.position = "absolute";
        textCopy.style.bottom = "-5%";
        textCopy.style.right = "1%";
        textCopy.style.fontSize = "200%";
        textCopy.style.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
        textCopy.addEventListener("click",function(){
            //console.log("copying to clipboard!");
            textCopy.style.color = (swatchColors[6] != "transparent" ? swatchColors[6] : "Red");
            hiddencolors.style.display = "visible";
            hiddencolors.style.background = "transparent";
            hiddencolors.style.border = "none";
            hiddencolors.style.outline = "none";
            hiddencolors.style.boxShadow = "none";
            hiddencolors.style.resize = "none";
            hiddencolors.style.height = 0;
            hiddencolors.style.color = "transparent";
            hiddencolors.innerHTML = outputColors;
            textArea.appendChild(hiddencolors)
            //console.log("at 1184");
            hiddencolors.select();
            try {
                var status = document.execCommand('copy');
                if(!status){
                    alert("Cannot copy text.");
                }else{
                    alert("Success! Named colors copied to clipboard: " + outputColors );
                }
            } catch (err) {
                    alert("Cannot copy text.");;
            }
            textArea.removeChild(hiddencolors);
            for(var i=0;i<textArea.childNodes.length; i++){
                if (textArea.childNodes[i].className == "coloroutput"){
                    textArea.childNodes.color = "white";
                }
            }
            closeCopyWindow();
        },false);
        textArea.appendChild(textCopy);
        textArea.style.display = "block";    

        var outputColors = [];
        for (var c=0;c<swatchColors.length;c++){
            var color = swatchColors[c];
            if (color !=="transparent"){
                outputColors.push(color);
            }
        }
        console.log(outputColors);    

        var lineheight = textArea.style.height.split("px")[0]/outputColors.length
        // console.log(lineheight);
        var outputRGBs = [];        
        for (var i=0;i<outputColors.length;i++){
            var color = outputColors[i];
            var colorOutput = document.createElement("TEXTAREA");
            colorOutput.className = "coloroutput";
            colorOutput.style.top = "1%"
            colorOutput.style.margin = "0%"
            colorOutput.style.padding = "0%"
            colorOutput.style.height = lineheight + "px";
            colorOutput.style.background = "transparent";
            colorOutput.style.border = "none";
            colorOutput.style.boxShadow = "none";
            colorOutput.style.outline = "none";
            colorOutput.style.fontFamily = 'Permanent Marker';
            colorOutput.style.color = "" + outputColors[i] + "";
            colorOutput.style.resize = "none";
            // colorOutput.style.lineHeight = textArea.style.height/outputColors.length + "%";
            colorOutput.style.fontSize = "100%";
            colorOutput.style.lineHeight = "100%";


            for (j=0;j<col_segments.length;j++){
                  for (k=0;k<col_segments[j].length;k++){
                    var col = col_segments[j][k];
                    if (outputColors[i] === col.name){
                    outputRGB = "rgb("+col.red+","+col.green+","+col.blue+")";
                    outputRGBs.push(outputRGB);
                    colorOutput.innerHTML = outputColors[i] + '\xa0' + outputRGB;
                    }}}


            textArea.appendChild(colorOutput);

        }
        console.log(outputRGBs);



        /*
        output.innerHTML = "Background: " + swatchColors[0] + "\n" + "Accent Color: " + swatchColors[2];
        */




    }    

    function closeCopyWindow(){
          setTimeout(function() {
            var textArea = document.getElementById("textarea");
            leftCopy.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
            rightCopy.color = (swatchColors[2] != "transparent" ? swatchColors[2] : "Black");
            //console.log(textArea.children[0].className);
            while (textArea.children[0]) {textArea.removeChild(textArea.children[0])};

            textArea.style.display = "none";
            //console.log("closingCopyWindow @1198")
          }, 400);
        }    

    
    
    
    
    //animation method for rotation
    function update(){
        //console.log("Update still running");
        if (rotating === 1){
            rotation++;
            dialBacks = [];
             for (j=0;j<col_segments.length;j++){
                for (k=0; k<col_segments[j].length;k++){
                   var col = col_segments[j][k];
                   col.rotation +=(j/2);
                   if (col.rotation >= 360){
                       col.rotation-=360;
                   }
                }
             }
        } else if (rotating=== 2) {
            rotation-=2;

            if (dialBacks.length === 0) {
               //mod rotation by 360 to prevent multiple spins
               rotation = rotation % 360;

               //measure the distance per rotation step that
               //each layer needs to travel to retrun to 270
               for (j=0; j<col_segments.length; j++){
                   var colRot = col_segments[j][0].rotation-270;
                   if (colRot < 0) {colRot += 360};
                   dialBacks.push(colRot/(rotation/2));
               } 
            }

            //step each layer by its associated dialback amount
            for (j=0;j<col_segments.length;j++){
                for (k=0; k<col_segments[j].length;k++){
                  var col = col_segments[j][k];
                  col.rotation -= dialBacks[j];
                  //when rotation reaches 0, hard set the 
                  //col.rotations to 0
                  //and disable the rotating flag
                  if (rotation <= 0){
                      rotation = 0;
                      col.rotation = 270;
                      rotating = false;
                  }
                }    
            }
        }
        //console.log("Calling setCanvas at 1260 (update)");    
        setCanvas();
        if (rotating) {window.requestAnimationFrame(update)};    
    }

    // perform the sorts and set slider counter on click
    function sortSlider(){
        sliderClicks++;    
        window.requestAnimationFrame(sortAnimate,can);    
        //console.log(sliderClicks);
    }

    // animate the movement of the sortSphere    
    function sortAnimate(){
        if (!sorting) {
          sorting = true;
          tempColSegments.push(...col_segments);
          var quarterSphere = sortSphere.width/2;   
          switch(sliderClicks){
          case 1:
            newAngle = 90-quarterSphere;
            newColor = "crimson";
            segmentize("red", "green", "blue");
            //console.log("red", "green", "blue");
          break;

          case 2:
            newAngle = 162-quarterSphere;
            newColor = "lawngreen";
            segmentize("green", "blue", "red");              
            //console.log("green", "blue", "red");
          break;

          case 3:
            newAngle = 234-quarterSphere;
            newColor = "darkmagenta";
            segmentize("magenta", "cyan", "yellow", "black");
            //console.log("magenta", "cyan", "yellow", "black");
            //segmentize("lightness", "red", "green", "blue");
          break;

          case 4:
            newAngle = 306-quarterSphere;
            newColor = "olive";

            segmentize("yellow", "magenta", "cyan", "black");
            //console.log("yellow", "magenta", "cyan", "black");
          break;

          case 5:
            newAngle = 18-quarterSphere;
            newColor = "dimgray"

            sliderClicks = 0;
            segmentize("hue", "red", "green", "blue");
            //console.log("hue", "red", "green", "blue");
          break;  

          }
          sortSphere.color = newColor;
        }    

        if (sortSphere.angle>=newAngle) {
            sortSphere.angle = newAngle;
        }

        function determineDeltas(newArray) {
            for (j=0; j<col_segments.length-1; j++) {
                for (i=0; i<col_segments[j].length; i++) {
                    col_segments[j][i].redd = sortDeg*(newArray[j][i].red - col_segments[j][i].red)/72
                    col_segments[j][i].blued = sortDeg*(newArray[j][i].blue - col_segments[j][i].blue)/72
                    col_segments[j][i].greend = sortDeg*(newArray[j][i].green - col_segments[j][i].green)/72
                }
            }
        }


        //so we need to have the degree clicker running and if its not at
        //the end point, a dummy version of col_segments is used to run
        //set_canvas, stepping the progression each time
        if (sortDeg === 0) {
            var xtcs = []

            //put new order into tmp and old into col_seg by way of xtcs

            //the old order is set into xtcs
            xtcs.push(...tempColSegments);

            //the new order is set into tempColSegments
            tempColSegments = [];
            tempColSegments.push(...col_segments);

            //the old order is moved back into col_segments
            col_segments = [];
            col_segments.push(...xtcs);

            determineDeltas(tempColSegments);

            newAngle = newAngle-72;
            sortDeg++;

            reposition_sortSpheres();        
            xtcs=[];

            if (!rotating) {
                //console.log("Calling setCanvas at 1365 (sortAnimate - start sort)");
                setCanvas()
            };
            window.requestAnimationFrame(sortAnimate,can);        

        } else if (sortDeg < 72) {

            determineDeltas(tempColSegments);

            if (rotating) {
                newAngle+=2;
                sortDeg+=2;
            } else {
                newAngle+=2;
                sortDeg+=2;
            }

            if (sortDeg == 36) {console.log(col_segments[2][0].name);}

            reposition_sortSpheres()

            if (!rotating) {
                //console.log("Calling setCanvas at 1387 (sortAnimate - sorting)");
                setCanvas()
            };
            window.requestAnimationFrame(sortAnimate,can);

        } else if (sortDeg >= 72) {

            col_segments = [];
            col_segments.push(...tempColSegments);

            newAngle++;
            sortDeg = 0;

            determineDeltas(tempColSegments);        
            reposition_sortSpheres()
            tempColSegments = [];
            sorting = 2;

            if (!rotating) {
                //console.log("Calling setCanvas at 1405 (sorted)");
                setCanvas()
            };      
            sorting = false;

            //infini-sort
            //setTimeout(function(){
            //    sortSlider();
            //}, 666)


        }

        function reposition_sortSpheres() {
            sortSphere.angle= newAngle+sphere.radius/6;
            underSphere.angle = newAngle;

            sortSphere.CenterX = cx + rArray[0] * 
                Math.cos(sortSphere.angle * Math.PI / 180);
            sortSphere.CenterY = cy + rArray[0] * 
                Math.sin(sortSphere.angle * Math.PI / 180);

            underSphere.CenterX = cx + rArray[0] * 
                Math.cos(sortSphere.angle * Math.PI / 180);
            underSphere.CenterY = cy + rArray[0] * 
                Math.sin(sortSphere.angle * Math.PI / 180);        
        }

    }


    // master draw function
    function setCanvas(){

            var oldTime = 0;
            drawCount++
            //console.log(drawCount);

            function clock(stat) {
                if (oldTime === 0) {oldTime = Date.now();}
                var newTime = Date.now();
                if (newTime - oldTime > 3) {console.log(stat + ":\t" + (newTime - oldTime))};
                oldTime = newTime;
            }

            const pi = Math.PI;
            ctx.clearRect(0,0,can.width,can.height);
            drawSpheres();
                //clock("drawSpheres");
            drawSegments();    
                //clock("drawSegments");
            drawComps();
                //clock("drawComps");
            drawSwatches();
                //clock("drawSwatches");
            drawSigns();
                //clock("drawSigns");
            loadHandler();
            // draw spheres
            function drawSpheres(){
            for(var i = 0; i<spheres.length; i++){
                 var sphere = spheres[i];
                 if (sphere.shadow && !rotating && !sorting) {
                     ctx.shadowOffsetX = -3;
                     ctx.shadowOffsetY = 3;
                     ctx.shadowBlur = 6;
                 } else if (!rotating && !sorting) {
                     ctx.shadowOffsetX = 0;
                     ctx.shadowOffsetY = 0;
                     ctx.shadowBlur = 0;
                 }    
                 ctx.beginPath();
                 ctx.moveTo(sphere.CenterX, sphere.CenterY);
                 ctx.arc(sphere.CenterX, sphere.CenterY, sphere.radius, 0, Math.PI * 2, true);
                 ctx.stroke();
                 ctx.strokeStyle="transparent";
                 ctx.lineWidth=2;
                 ctx.closePath();
                 ctx.fillStyle=sphere.color;
                 ctx.fill();
                 ctx.fillStyle = underqSphere.color;
                 ctx.font = "normal bold "+ sphere.radius*1.5 +"px Permanent Marker";
                 ctx.fillText(sphere.text, sphere.CenterX-(sphere.radius*.45), sphere.CenterY+sphere.radius*.45);
            }
        }


            function drawSegments() {
                ctx.save();
                for (j=0; j<col_segments.length; j++) {
                    var zflag = false;
                    var oldTime = 0;
                    for (i = 0; i < col_segments[j].length; i++) {

                      drawSegment(j, i);
                      //var a = clock("Drawing segment " + j + " " + i);
                      //if (a > 10) {console.log(col_segments[j][i].name, a, j, i);}                    

                      function drawSegment(j, i) {

                        var col = col_segments[j][i];
                        var comp = col_segments[j][col.complement];
                        var seg = 360 / (col_segments[j].length);
                        var start = (col.rotation - (seg * .5)) + (seg * i);

                        //set fill style based on color
                        //if (j==2&&i==0) {console.log(col.red, col.green, col.blue);}
                        //clock("Starting off " + col.name);
                        ctx.fillStyle = "rgb(" + 
                            Math.floor(col.red + col.redd) + "," + 
                            Math.floor(col.green + col.greend) + "," + 
                            Math.floor(col.blue + col.blued) + ")";
                        if(col.shadow && !rotating && !sorting){
                          ctx.shadowColor = "rgba(100, 100, 100, 0.5)";
                          ctx.shadowOffsetX = Math.sin(start*pi/180)*3;
                          ctx.shadowOffsetY = Math.cos(start*pi/180)*-3;
                          ctx.shadowBlur = 6;
                        } else if (sorting == 2) {
                          ctx.shadowColor = "rgba(100, 100, 100, 0.5)";
                          ctx.shadowOffsetX = Math.sin(start*pi/180)*1.5;
                          ctx.shadowOffsetY = Math.cos(start*pi/180)*-1.5;
                          ctx.shadowBlur = 3;                        
                        }

                        //clock("Starting path black" + col.name);
                        ctx.beginPath();
                        if (j!==rArray.length-1) {ctx.moveTo(cx, cy)};
                        ctx.arc(cx, cy, rArray[j], toRadians(start), toRadians(start + seg));

                        if (col.selected == true) {
                            if (i===0 && zflag === false) {
                              ctx.strokeStyle = "black";
                              zflag = true;
                            } else {
                              ctx.lineWidth = 5;
                              ctx.strokeStyle = "white";
                              zflag = false;                                
                            }
                        } else {
                            ctx.strokeStyle = "black";
                        }

                        if (j==0&&i==0) {
                            ctx.lineWidth=15;
                        } else {
                            ctx.lineWidth=2;
                        };
                        //clock("Styling " + col.name);

                        ctx.stroke();
                        ctx.closePath();
                        if (j!==0||i!==0) {
                            ctx.fill()
                            if (j==0&&i==0) {console.log("Filling black?")};
                        };
                        //clock("Stroking " + col.name); 

                        }

                    }

                    if (zflag) {
                        //console.log("Zflag is true, boss");
                        drawSegment(j, 0);
                    }

                }
                ctx.restore();

            }        


            // draw lines between complementary colors
            function drawComps(){
                    var selFlag = false;
                    for (j=0; j<rArray.length; j++) {
                        for (i = 0; i < col_segments[j].length; i++) {
                            if (col_segments[j][i].selected === true) {
                            var selFlag = true;
                            var col = col_segments[j][i];
                            var comp = col_segments[j][col.complement];
                            var triad1 = col_segments[j][col.triadic1];
                            var triad2 = col_segments[j][col.triadic2];
                            var quad1 = col_segments[j][col.quad1];
                            var quad2 = col_segments[j][col.quad2];
                            var quad3 = col_segments[j][col.quad3];
                             // select complement    
                             if (col.compSelect == true) {
                                        ctx.beginPath();
                                        ctx.shadowOffsetX = 0;
                                        ctx.shadowOffsetY = 0;
                                        ctx.shadowBlur = 0;
                                        ctx.moveTo(col.x, col.y);
                                        ctx.lineTo(comp.x, comp.y);
                                        ctx.strokeStyle = "black";
                                        ctx.lineWidth = 5;
                                        ctx.stroke();           
                            } 
                             // select split complement    
                             if (col.splitCompSelect == true) {
                                ctx.beginPath();
                                 ctx.shadowOffsetX = 0;
                                        ctx.shadowOffsetY = 0;
                                        ctx.shadowBlur = 0;
                                ctx.moveTo(col.x, col.y);
                                ctx.lineTo(
                                    col_segments[j][col.spComp1].x, col_segments[j][col.spComp1].y
                                );
                                ctx.lineTo(col_segments[j][col.spComp2].x, col_segments[j][col.spComp2].y);
                                ctx.strokeStyle = "black";
                                ctx.lineWidth = 5;
                                ctx.closePath();
                                ctx.stroke();
                            } 
                             // select triadic complement
                             if (col.triSelect == true) {
                                        ctx.beginPath();
                                 ctx.shadowOffsetX = 0;
                                        ctx.shadowOffsetY = 0;
                                        ctx.shadowBlur = 0;
                                        ctx.moveTo(col.x, col.y);
                                        ctx.lineTo(triad1.x, triad1.y);
                                        ctx.lineTo(triad2.x, triad2.y);
                                        ctx.strokeStyle = "black";
                                        ctx.lineWidth = 5;
                                        ctx.closePath();
                                        ctx.stroke();
                            }
                             // select quadratic complement
                             if (col.quadSelect == true) {
                                        ctx.beginPath();
                                 ctx.shadowOffsetX = 0;
                                        ctx.shadowOffsetY = 0;
                                        ctx.shadowBlur = 0;
                                        ctx.moveTo(col.x, col.y);
                                        ctx.lineTo(quad1.x, quad1.y);
                                        ctx.lineTo(quad2.x, quad2.y);
                                        ctx.lineTo(quad3.x, quad3.y);
                                        ctx.strokeStyle = "black";
                                        ctx.lineWidth = 5;
                                        ctx.closePath();
                                        ctx.stroke();
                            } 
                            }
                        }
                    }
                     // if not selected
                     if (selFlag == false) {
                        ctx.beginPath();
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 0;
                        ctx.shadowBlur = 0;
                        ctx.moveTo(0,0);
                        ctx.lineTo(0,0);
                        ctx.strokeStyle = "black";
                        ctx.lineWidth = 0;
                        ctx.stroke();           
                     }             
                }


            function drawSwatches(){
                //console.log("Draw the swatches within setCanvas()");
                for(var i = 0; i<swatches.length; i++){
                 var swatch = swatches[i];
                    ctx.fillStyle = swatch.color;
                    ctx.fillRect(swatch.x,swatch.y, swatch.width,swatch.height);
                    var strk = function(){
                      if(i != swatches.length-2){
                        return (swatchColors[2] != "transparent" ? swatchColors[2] : "Black"); 
                      } else {
                        for (j=0;j<col_segments.length;j++){
                          for (k=0;k<col_segments[j].length;k++){
                            var col = col_segments[j][k];
                            if (col.name === swatchColors[2]){
                            return (swatchColors[2] != "transparent" ? "rgba("+col.red+","+col.green+","+col.blue+",.25)" : "rgba(0,0,0,.25)");  
                            }    
                          }
                        }    
                      }
                    }
                    ctx.strokeStyle = strk();
                    ctx.lineWidth = 3;
                    ctx.strokeRect(swatch.x,swatch.y, swatch.width,swatch.height);
                }
            }

            // draw intro arrows/about us
            function drawSigns(){
                for(var i = 0; i<signs.length; i++){
                  //console.log("drawSigns is ", i);
                  var sign = signs[i];
                    if(sign.visible){
                      //console.log("Sign is visible");
                      ctx.save();
                      ctx.fillStyle = sign.color;
                      ctx.textBaseline = sign.textBaseline;
                      ctx.fillText(sign.text, sign.x, sign.y);
                      ctx.restore();
                    }
                  }
                }




            // in case you like using degrees
            function toRadians(deg) {
                return deg * Math.PI / 180
            }



        }; 


    ////scope declarations for console debugging
    window.hexs = hexs;
    window.rgb = rgb;
    window.names = names;
    window.colorsArray = colorsArray;
    window.col_segments = col_segments;
    window.can = can;
    window.setCanvas = setCanvas;
    window.storedImgData = storedImgData;
    window.swatches = swatches;
});