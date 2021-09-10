"use strict";

let canvasForeground = document.getElementById("canvasForeground");
let c = canvasForeground.getContext("2d");
let Width = window.innerWidth - 300;
let Height = window.innerHeight - 50;
let canvasWidth = Width * window.devicePixelRatio;
let canvasHeight = Height * window.devicePixelRatio;
canvasForeground.width = canvasWidth;
canvasForeground.height = canvasHeight;
let canvasBackground = document.getElementById("canvasBackground");
let cb = canvasBackground.getContext("2d");
canvasBackground.width = canvasWidth;
canvasBackground.height = canvasHeight;

let zoom = 1;
let cameraPos = [0, 0];
let lastCameraPos = [0, 0];
let gridSize = 10;
let mousePos = [0, 0];
let gridedMousePos = [0, 0];
let startClickPos = [0, 0];
let endClickPos = [0, 0];
let mousePressed = false;
let validPosition = true;

let moduleImages = [];
let modulesLoaded = 0;
let moduleSelected = 0;
let moduleType = "home";
let toolSelected = null;
let actualRotation = 0;
let moduleSize = [600,250];

let modulesInstantiated = [];

canvasForeground.addEventListener("mousemove", function(event){
  mousePos = toWorldSpace([event.pageX - 300, event.pageY - 50]);
  gridedMousePos = toGrid(mousePos);
  endClickPos = [...mousePos];
});

canvasForeground.addEventListener("mousedown", function(event){
  let clickPos = toWorldSpace([event.pageX - 300, event.pageY - 50]);
  let gridedClickPos = toGrid(clickPos);
  startClickPos = mousePos;
  if(toolSelected == "add"){
    if(validPosition){
      if(moduleType == "patch"){
        modulesInstantiated.push(new Module(clickPos, moduleSelected, actualRotation, moduleSize, moduleType));
      }else{
        modulesInstantiated.push(new Module(gridedClickPos, moduleSelected, actualRotation, moduleSize, moduleType));
      }
      toolSelected = null;
    }
  }else if(toolSelected == "move"){

  }else if(toolSelected == "remove"){
    let index = checkCollisionMouseToModule();
    if(index != -1){
      modulesInstantiated.splice(index, 1);
    }
  }
  mousePressed = true;
});

canvasForeground.addEventListener("mouseup", function(event){
  mousePressed = false;
  if(toolSelected == "move"){
    cameraPos[0] += (startClickPos[0] - endClickPos[0]);
    cameraPos[1] += (startClickPos[1] - endClickPos[1]);
  }
});

canvasForeground.addEventListener("wheel", function(event){
  if(zoom >= 0.75 && zoom <= 3 && event.deltaY < 0)
    zoom += event.deltaY/2400;
  if(zoom >= 0.5 && zoom <= 2.75 && event.deltaY > 0)
    zoom += event.deltaY/2400;
});

document.addEventListener("keydown", function(event){
  if(event.key == "a" || event.key == "ArrowLeft"){
    cameraPos[0] -= 50;
  }else if(event.key == "d" || event.key == "ArrowRight"){
    cameraPos[0] += 50;
  }else if(event.key == "w" || event.key == "ArrowUp"){
    cameraPos[1] -= 50;
  }else if(event.key == "s" || event.key == "ArrowDown"){
    cameraPos[1] += 50;
  }
});

Init();
function Init(){
  
  //Load module images.
  loadModules();

  //Get module html DOM elements and add event listeners.
  var modules = document.getElementsByClassName("type-home");
  for(let i = 0; i < modules.length; i++){
    let imageContainer = modules[i].querySelector(".module-model");
    imageContainer.style = "background-image: url('./assets/modulo" + (i+1) + ".jpg');";
    modules[i].onclick = function(){
      const moduleNumber = i;
      moduleSelected = moduleNumber;
      moduleSize = [600, 250];
      moduleType = "home";
      toolSelected = "add";

      let toolsSelected = document.getElementsByClassName("tool-selection");
      for(let i = 0; i < toolsSelected.length; i++){
        toolsSelected[i].classList.remove("tool-selected");
      }
    }
  }

  //Get module html DOM elements and add event listeners.
  var modules = document.getElementsByClassName("type-porch");
  for(let i = 0; i < modules.length; i++){
    let imageContainer = modules[i].querySelector(".module-model");
    imageContainer.style = "background-image: url('./assets/porche" + (i+1) + ".png');";
    modules[i].onclick = function(){
      const moduleNumber = i + 14;
      moduleSelected = moduleNumber;
      if(i != 2) moduleSize = [600, 250];
      else moduleSize = [300, 250];
      moduleType = "porch";
      toolSelected = "add";

      let toolsSelected = document.getElementsByClassName("tool-selection");
      for(let i = 0; i < toolsSelected.length; i++){
        toolsSelected[i].classList.remove("tool-selected");
      }
    }
  }

  //Get module html DOM elements and add event listeners.
  var modules = document.getElementsByClassName("type-pergola");
  for(let i = 0; i < modules.length; i++){
    let imageContainer = modules[i].querySelector(".module-model");
    imageContainer.style = "background-image: url('./assets/pergola" + (i+1) + ".png');";
    modules[i].onclick = function(){
      const moduleNumber = i + 17;
      moduleSelected = moduleNumber;
      if(i != 1) moduleSize = [600, 250];
      else moduleSize = [300, 250];
      moduleType = "pergola";
      toolSelected = "add";

      let toolsSelected = document.getElementsByClassName("tool-selection");
      for(let i = 0; i < toolsSelected.length; i++){
        toolsSelected[i].classList.remove("tool-selected");
      }
    }
  }

  //Get module html DOM elements and add event listeners.
  var modules = document.getElementsByClassName("type-patch");
  for(let i = 0; i < modules.length; i++){
    let imageContainer = modules[i].querySelector(".patch-model");
    imageContainer.style = "background-image: url('./assets/parche" + (i+1) + ".jpg');";
    modules[i].onclick = function(){
      const moduleNumber = i + 19;
      moduleSelected = moduleNumber;
      moduleSize = [(3-i%3)*100, 38];
      moduleType = "patch";
      toolSelected = "add";

      let toolsSelected = document.getElementsByClassName("tool-selection");
      for(let i = 0; i < toolsSelected.length; i++){
        toolsSelected[i].classList.remove("tool-selected");
      }
    }
  }

  //Get rotate90-clockwise DOM element and add event listeners.
  document.getElementById("rotate90-clockwise").onclick = function(){
    actualRotation -= Math.PI/2;
  }

  //Get rotate90-counterclockwise DOM element and add event listeners.
  document.getElementById("rotate90-counterclockwise").onclick = function(){
    actualRotation += Math.PI/2;
  }

  //Get rotate180 DOM element and add event listeners.
  document.getElementById("rotate180").onclick = function(){
    actualRotation += Math.PI;
  }

  //Get zoomIn DOM element and add event listeners.
  document.getElementById("zoomIn").onclick = function(){
    if(zoom >= 1.25 && zoom <= 3)
      zoom -= 0.25;
  }

  //Get zoomOut DOM element and add event listeners.
  document.getElementById("zoomOut").onclick = function(){
    if(zoom >= 1 && zoom <= 2.75)
      zoom += 0.25;
  }

  document.getElementById("close-popup").onclick = function(){
    document.getElementById("help-popup").style = "display: none;";
  }

  document.getElementById("open-popup").onclick = function(){
    document.getElementById("help-popup").style = "";
  }

  document.getElementById("save-blueprint").onclick = function(event){
    var link = document.createElement('a');
    link.download = 'Plano.png';
    link.href = canvasForeground.toDataURL()
    link.click();
  }

  document.getElementById("move-tool").onclick = function(){
    toolSelected = "move";
    let toolsSelected = document.getElementsByClassName("tool-selection");
    for(let i = 0; i < toolsSelected.length; i++){
      toolsSelected[i].classList.remove("tool-selected");
    }
    document.getElementById("move-tool").classList.add("tool-selected");
  }

  document.getElementById("remove-tool").onclick = function(){
    toolSelected = "remove";
    let toolsSelected = document.getElementsByClassName("tool-selection");
    for(let i = 0; i < toolsSelected.length; i++){
      toolsSelected[i].classList.remove("tool-selected");
    }
    document.getElementById("remove-tool").classList.add("tool-selected");
  }

  document.getElementById("modules-menu-option").onclick = function(){
    let menus = document.getElementsByClassName("menu");
    for(let i = 0; i < menus.length; i++){
      menus[i].style = "display: none;";
    }

    let menusOptions = document.getElementsByClassName("tool");
    for(let i = 0; i < menusOptions.length; i++){
      menusOptions[i].classList.remove("selected");
    }

    document.getElementById("modules-menu-option").classList.add("selected");
    document.getElementById("modules-menu").style = "";
    
  }

  document.getElementById("patches-menu-option").onclick = function(){
    let menus = document.getElementsByClassName("menu");
    for(let i = 0; i < menus.length; i++){
      menus[i].style = "display: none;";
    }

    let menusOptions = document.getElementsByClassName("tool");
    for(let i = 0; i < menusOptions.length; i++){
      menusOptions[i].classList.remove("selected");
    }

    document.getElementById("patches-menu-option").classList.add("selected");
    document.getElementById("patches-menu").style = "";
    
  }
}

// Loop();
function Loop(){
requestAnimationFrame(Loop);

  //Clear canvases.
  c.clearRect(0, 0, canvasWidth, canvasHeight);
  cb.clearRect(0, 0, canvasWidth, canvasHeight);
  
  //Draw grid.
  drawGrid();

  //Draw modules.
  for(let i = 0; i < modulesInstantiated.length; i++){
    modulesInstantiated[i].draw();
  }

  let newModule;
  //Execute actions for add tool.
  if(toolSelected == "add"){
    if(moduleType == "patch"){
      newModule = new Module(mousePos, moduleSelected, actualRotation, moduleSize, moduleType);
    }else{
      newModule = new Module(gridedMousePos, moduleSelected, actualRotation, moduleSize, moduleType);
    }
    newModule.draw();
    drawStatus();
  //Execute actions for move tool.
  }else if(toolSelected == "move"){
    if(mousePressed){
      let initVector = toCameraSpace(startClickPos);
      let endvector = toCameraSpace(endClickPos);
      c.strokeStyle = "#181818";
      c.lineWidth = 1;
      c.beginPath()
      c.moveTo(initVector[0], initVector[1]);
      c.lineTo(endvector[0], endvector[1]);
      c.stroke();
    }
  //Execute actions for remove tool.
  }else if(toolSelected == "remove"){
    checkCollisionMouseToModule();
  }
}

//Given a position round to nearest grid point.
function toGrid(pos){
  return [Math.round(pos[0]/(gridSize))*(gridSize),
   Math.round(pos[1]/(gridSize))*(gridSize)];
}

//Given camera positions return world positions.
function toWorldSpace(pos){
  return [(pos[0] - Width/2)*window.devicePixelRatio*zoom + cameraPos[0], 
          (pos[1] - Height/2)*window.devicePixelRatio*zoom + cameraPos[1]];
}

//Given world positions return camera positions.
function toCameraSpace(pos){
  return [(pos[0] - cameraPos[0])/zoom + canvasWidth/2,
          (pos[1] - cameraPos[1])/zoom + canvasHeight/2];
}

//Given position and angle, rotate the position.
function rotateVector(pos, angle, origin){
  if(origin == undefined){
    return [pos[0]*Math.cos(-angle) - pos[1]*Math.sin(-angle),
            pos[0]*Math.sin(-angle) + pos[1]*Math.cos(-angle)]
  }else{
    let modifiedPos = [pos[0] - origin[0], pos[1] - origin[1]];
    let finalPos = [modifiedPos[0]*Math.cos(-angle) + modifiedPos[1]*Math.sin(-angle),
                    modifiedPos[0]*Math.sin(-angle) - modifiedPos[1]*Math.cos(-angle)];
    return [Math.round(finalPos[0] + origin[0]), Math.round(-finalPos[1] + origin[1])];
  }
}

//Load modules
function loadModules(){
  let modulesToLoad = ["modulo1.jpg", "modulo2.jpg", "modulo3.jpg", "modulo4.jpg",
                        "modulo5.jpg", "modulo6.jpg", "modulo7.jpg", "modulo8.jpg",
                        "modulo9.jpg", "modulo10.jpg", "modulo11.jpg", "modulo12.jpg",
                        "modulo13.jpg", "modulo14.jpg", "porche1.png", "porche2.png",
                        "porche3.png", "pergola1.png", "pergola2.png", "parche1.jpg",
                        "parche2.jpg", "parche3.jpg", "parche4.jpg", "parche5.jpg",
                        "parche6.jpg"];
  for(let i = 0; i < modulesToLoad.length; i++){
    let image = new Image();
    image.src = "./assets/" + modulesToLoad[i];
    image.onload = function(){
      modulesLoaded++;
      if(modulesLoaded == modulesToLoad.length){
        Loop();
      }
    }
    moduleImages.push(image);
  }
}

//Draw the background grid.
function drawGrid(){
  cb.fillStyle = "#18181818";
  let multiplicity = 5;
  let leftBottomCorner = toCameraSpace(toGrid(toWorldSpace([0,0])));
  for(let i = 0; i < (zoom*canvasWidth)/gridSize; i++){
    cb.fillRect(leftBottomCorner[0] + i*gridSize/zoom, 0, 1, canvasHeight);
  }

  for(let i = 0; i < (zoom*canvasHeight)/gridSize; i++){
    cb.fillRect(0, leftBottomCorner[1] + i*gridSize/zoom, canvasWidth, 1);
  }

  //Draw origin of the canvas.
  cb.strokeStyle = "rgba(24, 24, 24, 0.5)";
  cb.lineWidth = 1;
  let origin = toCameraSpace([0,0]);
  cb.beginPath();
  cb.moveTo(origin[0], 0);
  cb.lineTo(origin[0], canvasHeight);
  cb.stroke();
  cb.beginPath();
  cb.moveTo(0, origin[1]);
  cb.lineTo(canvasWidth, origin[1]);
  cb.stroke();
}

//Draw overlay depending on if placeable.
function drawStatus(){
  c.rotate(actualRotation);
  let toCameraPosition;
  if(moduleType == "patch"){
    toCameraPosition = toCameraSpace(mousePos);
  }else{
    toCameraPosition = toCameraSpace(gridedMousePos);
  } 
  let rotatedPos = rotateVector(toCameraPosition, actualRotation);
  if(!checkCollisionToModules()){
    validPosition = true;
    c.fillStyle = "rgba(66, 255, 107, 0.5)"
    c.fillRect(rotatedPos[0],
               rotatedPos[1],
               moduleSize[0]/zoom, moduleSize[1]/zoom);
  }else{
    validPosition = false;
    c.fillStyle = "rgb(255, 78, 65, 0.5)"
    c.fillRect(rotatedPos[0],
               rotatedPos[1],
               moduleSize[0]/zoom, moduleSize[1]/zoom);
  }
  c.rotate(-actualRotation);
}

function naturalOrder(a,b){
  if(a<b)return -1;
  else if(a>b)return 1;
  else return 0;
}

function cornersToSides(corners){
  let left = corners.map((x) => x[0]).sort(naturalOrder)[0];
  let right = corners.map((x) => x[0]).sort(naturalOrder)[3];
  let top = corners.map((x) => x[1]).sort(naturalOrder)[0];
  let bottom = corners.map((x) => x[1]).sort(naturalOrder)[3];
  return [left, right, top, bottom];
}

function checkRectangleIntersection(rect1, rect2){
  let adjustedRect1 = cornersToSides(rect1);
  let adjustedRect2 = cornersToSides(rect2);

  if (adjustedRect1[0] >= adjustedRect2[1] || adjustedRect1[2] >= adjustedRect2[3] || 
    adjustedRect1[1] <= adjustedRect2[0] || adjustedRect1[3] <= adjustedRect2[2]){
	  return false;
  }else{
    return true;
  }
}

function checkCollisionMouseToModule(){
  for(let i = modulesInstantiated.length - 1; i >= 0; i--){
    let currentModuleCorners = [[modulesInstantiated[i].pos[0], modulesInstantiated[i].pos[1]], [modulesInstantiated[i].pos[0]+modulesInstantiated[i].size[0], modulesInstantiated[i].pos[1]],
                                [modulesInstantiated[i].pos[0]+modulesInstantiated[i].size[0], modulesInstantiated[i].pos[1]+modulesInstantiated[i].size[1]], [modulesInstantiated[i].pos[0], modulesInstantiated[i].pos[1]+modulesInstantiated[i].size[1]]];
    currentModuleCorners = currentModuleCorners.map((corner) => rotateVector(corner, modulesInstantiated[i].rotation, modulesInstantiated[i].pos));
    let adjustedRect = cornersToSides(currentModuleCorners);
    if(mousePos[0] > adjustedRect[0] && mousePos[0] < adjustedRect[1] &&
      mousePos[1] > adjustedRect[2] && mousePos[1] < adjustedRect[3]){
        modulesInstantiated[i].draw(true);
        return i;
      }
  }
  return -1;
}

function checkCollisionToModules(){
  let corners = [[gridedMousePos[0], gridedMousePos[1]], [gridedMousePos[0]+moduleSize[0], gridedMousePos[1]],
                 [gridedMousePos[0]+moduleSize[0], gridedMousePos[1]+moduleSize[1]], [gridedMousePos[0], gridedMousePos[1]+moduleSize[1]]];
  corners = corners.map((corner) => rotateVector(corner, actualRotation, gridedMousePos));
  for(let i = 0; i < modulesInstantiated.length; i++){
    let currentModuleCorners = [[modulesInstantiated[i].pos[0], modulesInstantiated[i].pos[1]], [modulesInstantiated[i].pos[0]+modulesInstantiated[i].size[0], modulesInstantiated[i].pos[1]],
                                [modulesInstantiated[i].pos[0]+modulesInstantiated[i].size[0], modulesInstantiated[i].pos[1]+modulesInstantiated[i].size[1]], [modulesInstantiated[i].pos[0], modulesInstantiated[i].pos[1]+modulesInstantiated[i].size[1]]];
    currentModuleCorners = currentModuleCorners.map((corner) => rotateVector(corner, modulesInstantiated[i].rotation, modulesInstantiated[i].pos));
    if(moduleType != "patch" && (moduleType != "pergola" || modulesInstantiated[i].type != "porch") && checkRectangleIntersection(corners, currentModuleCorners)){return true;}
  }
  return false;
}

function Module(pos, moduleNumber, rotation, size, type){
  this.pos = pos;
  this.moduleNumber = moduleNumber;
  this.rotation = rotation;
  this.size = size;
  this.type = type;
  
  this.draw = function(asOverlay){
    c.rotate(this.rotation);
    let toCameraPosition = toCameraSpace(this.pos);
    let rotatedPos = rotateVector(toCameraPosition, this.rotation);
    if(asOverlay){
      c.fillStyle = "rgb(255, 78, 65, 0.5)"
      c.fillRect(rotatedPos[0],
                 rotatedPos[1],
                 this.size[0]/zoom, this.size[1]/zoom)
    }else{
      c.drawImage(moduleImages[this.moduleNumber],
                  rotatedPos[0],
                  rotatedPos[1],
                  this.size[0]/zoom, this.size[1]/zoom);
    }
    c.rotate(-this.rotation);
  }
}