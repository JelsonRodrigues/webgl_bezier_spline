import {WebGLUtils} from "./modules/WebGLUtils.js"
import {Vec} from "./modules/Vec.js"
import {Spline} from "./modules/Spline.js"
import {CubicBezierCurve} from "./modules/CubicBezierCurve.js"

var gl:WebGL2RenderingContext;
var canvas:HTMLCanvasElement;
var gl_drawing_primitive = WebGL2RenderingContext.LINE_STRIP;
var program_current:WebGLProgram|null = null;
var spline_poits_gl_buffer:WebGLBuffer;
var spline_vertices = 0;
var control_points_gl_buffer:WebGLBuffer;
var control_points_vertices = 0;
var animate_point:boolean = true;
var index_changing = 0;
var pointSize = 10.0;

var control_points = new Array(
  {"point" : new Vec(0.0, 0.6), "color" : new Vec(1.0, 0.0, 0.0)},
  {"point" : new Vec(0.4, 0.4), "color" : new Vec(1.0, 0.0, 0.0)},
  {"point" : new Vec(0.4, 0.0), "color" : new Vec(1.0, 0.0, 0.0)},
  {"point" : new Vec(0.2, -0.2), "color" : new Vec(1.0, 0.0, 0.0)},
  {"point" : new Vec(0.0, -0.4), "color" : new Vec(0.0, 0.0, 1.0)},
  {"point" : new Vec(-0.4, -0.4), "color" : new Vec(0.0, 0.0, 1.0)},
  {"point" : new Vec(-0.6, 0.0), "color" : new Vec(0.0, 0.0, 1.0)},
  {"point" : new Vec(-0.6, 0.4), "color" : new Vec(0.0, 1.0, 0.0)},
  {"point" : new Vec(-0.9, 0.4), "color" : new Vec(0.0, 1.0, 0.0)},
  {"point" : new Vec(-0.7, 0.7), "color" : new Vec(0.0, 1.0, 0.0)},
  {"point" : new Vec(-0.4, 0.9), "color" : new Vec(0.5, 0.0, 0.5)},
  {"point" : new Vec(-0.4, 0.6), "color" : new Vec(0.5, 0.0, 0.5)},
  {"point" : new Vec(-0.0, 0.6), "color" : new Vec(0.5, 0.0, 0.5)},
);

async function main() {
  let canva:HTMLCanvasElement|null  = document.getElementById("WebGLCanva") as HTMLCanvasElement;
  if (!canva) {
    throw new Error("Unable to find the canvas");
  }
  canvas = canva;
  let context = canva.getContext("webgl2");
  if (!context) {
    throw new Error ("Unable to get the WebGL context for the canvas");
  }
  gl = context;

  resizeHandler();

  await setupShaders();
  // Create the buffers in GPU
  const spline_buf = gl.createBuffer();
  if (spline_buf){
    spline_poits_gl_buffer = spline_buf;
  }
  const ctrlpts_buf = gl.createBuffer();
  if (ctrlpts_buf){
    control_points_gl_buffer = ctrlpts_buf;
  }

  const spline = createSpline();
  drawSpline(spline, spline_poits_gl_buffer);
  drawControlPoints(control_points_gl_buffer);
  animate(spline);
}

function resizeHandler() {
  let new_width_canvas = window.innerWidth - window.innerWidth * 0.05;
  let new_height_canvas = window.innerHeight - window.innerHeight * 0.05;
  canvasResize(new_width_canvas, new_height_canvas);
  gl.viewport(0, 0, new_width_canvas, new_height_canvas);
}

function canvasResize(width:number, height:number){
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
}

async function setupShaders() {  
  // Read the source code from the shaders
  const vsSource = await WebGLUtils.readFile("./shaders/vertexShader.glsl");
  const fsSource = await WebGLUtils.readFile("./shaders/fragmentShader.glsl");

  // Create and compile each shader
  const vertexShader = WebGLUtils.createShader(gl, WebGL2RenderingContext.VERTEX_SHADER, vsSource);
  const fragmentShader = WebGLUtils.createShader(gl, WebGL2RenderingContext.FRAGMENT_SHADER, fsSource);

  if (!vertexShader || !fragmentShader) {
    throw new Error("Error creating the Shaders!!!");
  }

  // Use the compiled shaders to create a WebGL program
  const program = WebGLUtils.createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);
  if (!program) return;
  program_current = program;
  
  // Set the size of a point
  const uniform_location = gl.getUniformLocation(program, "pointSize");
  gl.uniform1f(uniform_location, pointSize);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
}

function createSpline(sample_points_per_curve:number = 128){
  let spline = new Spline(sample_points_per_curve);

  for (let index = 0; index < control_points.length; index += 3){
    if (index + 3 >= control_points.length) { break; }
    let bezier = new CubicBezierCurve(
      control_points[index + 0].point, 
      control_points[index + 1].point, 
      control_points[index + 2].point, 
      control_points[index + 3].point
    );

    spline.addCurve(bezier);
  }

  spline.sampleSpline();

  return spline;
}

function drawSpline(spline:Spline, buffer:WebGLBuffer) {
  const points = spline.getPointsInSpline;
  if (!points) {
    throw new Error("Error getting the points in the spline!!!");
  }
  const vertices = points.length;
  spline_vertices = vertices;
  const vertexData = new Float32Array(points.length * 2);
  
  points.forEach((vec, index) => {
    vertexData[index*2 ] = vec.x;
    vertexData[index*2 + 1] = vec.y;
  });
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

  // Get the position location from the program
  if (program_current){
    let position = gl.getAttribLocation(program_current, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  }

  gl.drawArrays(gl_drawing_primitive, 0, vertices);
}

function drawControlPoints(buffer : WebGLBuffer) {
  const points = control_points;
  if (!points) {
    throw new Error("Error getting the control points!!!");
  }
  const vertices = points.length;
  control_points_vertices = vertices;
  const vertexData = new Float32Array(points.length * 5);
  
  points.forEach((value, index) => {
    vertexData[index*5 + 0] = value.point.x;
    vertexData[index*5 + 1] = value.point.y;
    vertexData[index*5 + 2] = value.color.x;
    vertexData[index*5 + 3] = value.color.y;
    vertexData[index*5 + 4] = value.color.z;
  });
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

  // Get the position location from the program
  if (program_current){
    let position = gl.getAttribLocation(program_current, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);

    let color = gl.getAttribLocation(program_current, "color");
    gl.enableVertexAttribArray(color);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
  }

  gl.drawArrays(WebGL2RenderingContext.POINTS, 0, vertices);
}

async function animate(spline:Spline) {
  if (!program_current) {return;}
  
  let position = gl.getAttribLocation(program_current, "position");
  let color = gl.getAttribLocation(program_current, "color");
  let pointZise_loc =   gl.getUniformLocation(program_current, "pointSize");

  const pointBuffer = gl.createBuffer();

  let begin = new Date();
  const time_to_full_lap = 10 * 1000.0; // 10s
  let t = 0.0;
  let t2 = 0.0;
  while (animate_point) {
    const now = new Date();
    t = (now.getTime() - begin.getTime()) / time_to_full_lap;
    t2 = (now.getTime() - begin.getTime()) * Math.sqrt(2.0) / time_to_full_lap;
    
    // Clear background
    gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);

    // Draw spline
    gl.bindBuffer(gl.ARRAY_BUFFER, spline_poits_gl_buffer);
    gl.enableVertexAttribArray(position);
    gl.disableVertexAttribArray(color);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(gl_drawing_primitive, 0, spline_vertices);
  
    // Draw control Points
    gl.uniform1f(pointZise_loc, pointSize);
    gl.bindBuffer(gl.ARRAY_BUFFER, control_points_gl_buffer);
    gl.enableVertexAttribArray(position);
    gl.enableVertexAttribArray(color);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.drawArrays(WebGL2RenderingContext.POINTS, 0, control_points_vertices);

    // Draw the point
    const point0 = spline.getPoint(t);
    const tangent0 = spline.getPointTangent(t);
    const tangent0_normalized = point0.add(tangent0.div(tangent0.mag()*5.0));
    const point1 = spline.getPoint((t2) % 1.0);
    const tangent1 = spline.getPointTangent((t2) % 1.0);
    const tangent1_normalized = point1.add(tangent1.div(tangent1.mag()*5.0));
    
    // Draw the tangent vector
    const data = new Float32Array(
      [point0.x, point0.y, 1.0, 1.0, 1.0, tangent0_normalized.x, tangent0_normalized.y, 1.0, 1.0, 1.0, 
       point1.x, point1.y, 0.0, 1.0, 1.0, tangent1_normalized.x, tangent1_normalized.y, 0.0, 1.0, 1.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.enableVertexAttribArray(color);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 10 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 10 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    gl.uniform1f(pointZise_loc, pointSize + 5.0);
    gl.drawArrays(WebGL2RenderingContext.POINTS, 0, 2);

    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0 * Float32Array.BYTES_PER_ELEMENT);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);
    
    gl.drawArrays(WebGL2RenderingContext.LINES, 0, 4);

    await WebGLUtils.sleep(0.0);
  }
  gl.deleteBuffer(pointBuffer);
}

function keyboardHandler(event:KeyboardEvent) {
  switch (event.key) {
  case "s":
    animate_point = false;
    break;
  case "ArrowLeft":
    break;
  case "ArrowRight":
    break;
  case "ArrowUp":
    break;
  case "ArrowDown":
    break;
  case "Tab":
    break;
  default:
    break;
  }
  console.log(event);
}

// Call the main function after the full load of the html page
window.onload = main;
// Resize canvas and change resolution
window.onresize = resizeHandler;
// Handle the keyboard input
window.onkeydown = keyboardHandler;