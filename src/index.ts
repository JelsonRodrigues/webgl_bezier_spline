import {WebGLUtils} from "./modules/WebGLUtils.js"
import {Vec} from "./modules/Vec.js"
import {Spline} from "./modules/Spline.js"
import {CubicBezierCurve} from "./modules/CubicBezierCurve.js"


class HTMLElements {
  public canvas : HTMLCanvasElement;
  public value_t : HTMLParagraphElement;
  public speed_t2 : HTMLInputElement;

  constructor () {
    this.canvas = document.getElementById("WebGLCanva") as HTMLCanvasElement;
    this.value_t = document.getElementById("tValue") as HTMLParagraphElement;
    this.speed_t2 = document.getElementById("speed_multiplier") as HTMLInputElement;
  }
}

class GL {
  // Context
  public context : WebGL2RenderingContext;
  
  // Program
  public program : WebGLProgram;
  public a_position : number;
  public a_color : number;
  public u_pointSize : WebGLUniformLocation;
  
  // Buffers
  public buffer_points_in_spline : WebGLBuffer;
  public buffer_control_points : WebGLBuffer;
  public buffer_moving_points : WebGLBuffer;
  
  // Vertices ammount
  public num_vertices_points_in_spline : number = 0;
  public num_vertices_control_points : number = 0;
  public num_vertices_moving_points : number = 0;
  
  // Drawing Primitives
  public drawing_points_in_spline : number = WebGL2RenderingContext.LINE_STRIP;
  
  constructor (context : WebGL2RenderingContext, vertexShaderSource:string, fragmentShaderSource:string) {
    this.context = context;
    context.clearColor(0.0, 0.0, 0.0, 1.0);
    context.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);

    //  Create and compile each shader
    const vertexShader = WebGLUtils.createShader(this.context, WebGL2RenderingContext.VERTEX_SHADER, vertexShaderSource) as WebGLShader;
    const fragmentShader = WebGLUtils.createShader(this.context, WebGL2RenderingContext.FRAGMENT_SHADER, fragmentShaderSource) as WebGLShader;

    // Use the compiled shaders to create a WebGL program
    this.program = WebGLUtils.createProgram(this.context, vertexShader, fragmentShader) as WebGLProgram;

    // Get information about the location of variables in the program
    this.context.useProgram(this.program);
    this.a_position = this.context.getAttribLocation(this.program, "position");
    this.a_color = this.context.getAttribLocation(this.program, "color");
    this.u_pointSize = this.context.getUniformLocation(this.program, "pointSize") as WebGLUniformLocation;

    // Setup the buffers
    this.buffer_points_in_spline = this.context.createBuffer() as WebGLBuffer;
    this.buffer_control_points = this.context.createBuffer() as WebGLBuffer;
    this.buffer_moving_points = this.context.createBuffer() as WebGLBuffer;
  }

  public drawSpline() {
    this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_points_in_spline);

    this.context.enableVertexAttribArray(this.a_position);
    this.context.enableVertexAttribArray(this.a_color);
    this.context.uniform1f(this.u_pointSize, 8.0);

    this.context.vertexAttribPointer(
      this.a_position, 
      2, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      5 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.vertexAttribPointer(
      this.a_color, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      5 * Float32Array.BYTES_PER_ELEMENT, 
      2 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.drawArrays(this.drawing_points_in_spline, 0, this.num_vertices_points_in_spline);
  }

  public drawControlPoints() {
    this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_control_points);

    this.context.enableVertexAttribArray(this.a_position);
    this.context.enableVertexAttribArray(this.a_color);
    this.context.uniform1f(this.u_pointSize, 10.0);

    this.context.vertexAttribPointer(
      this.a_position, 
      2, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      5 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.vertexAttribPointer(
      this.a_color, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      5 * Float32Array.BYTES_PER_ELEMENT, 
      2 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.drawArrays(WebGL2RenderingContext.POINTS, 0, this.num_vertices_control_points);
  }

  public drawMovingPoint() {
    this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_moving_points);

    this.context.enableVertexAttribArray(this.a_position);
    this.context.enableVertexAttribArray(this.a_color);
    this.context.uniform1f(this.u_pointSize, 12.0);

    this.context.vertexAttribPointer(
      this.a_position, 
      2, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      10 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.vertexAttribPointer(
      this.a_color, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      10 * Float32Array.BYTES_PER_ELEMENT, 
      2 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.drawArrays(WebGL2RenderingContext.POINTS, 0, this.num_vertices_moving_points);

    this.context.vertexAttribPointer(
      this.a_position, 
      2, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      5 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.vertexAttribPointer(
      this.a_color, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      5 * Float32Array.BYTES_PER_ELEMENT, 
      2 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.drawArrays(WebGL2RenderingContext.LINES, 0, this.num_vertices_moving_points * 2.0);
  }
}

class SplineControl {
  public spline: Spline;
  public index_altering : number = 0;

  constructor (spline: Spline = new Spline(128)) {
    this.spline = spline;
  }
}

var vHTMLElements: HTMLElements;
var vGL: GL;
var vSplineControl : SplineControl;
var animate_point = true;

var control_points = new Array(
  {"point" : new Vec(0.0, 0.6),   "color" : new Vec(1.0, 0.0, 0.0)},
  {"point" : new Vec(0.4, 0.4),   "color" : new Vec(1.0, 0.0, 0.0)},
  {"point" : new Vec(0.4, 0.0),   "color" : new Vec(1.0, 0.0, 0.0)},
  {"point" : new Vec(0.2, -0.2),  "color" : new Vec(1.0, 0.0, 0.0)},

  {"point" : new Vec(0.2, -0.2),  "color" : new Vec(0.0, 0.0, 1.0)},
  {"point" : new Vec(0.0, -0.4),  "color" : new Vec(0.0, 0.0, 1.0)},
  {"point" : new Vec(-0.4, -0.4), "color" : new Vec(0.0, 0.0, 1.0)},
  {"point" : new Vec(-0.6, 0.0),  "color" : new Vec(0.0, 0.0, 1.0)},

  {"point" : new Vec(-0.6, 0.0),  "color" : new Vec(0.0, 1.0, 0.0)},
  {"point" : new Vec(-0.6, 0.4),  "color" : new Vec(0.0, 1.0, 0.0)},
  {"point" : new Vec(-0.9, 0.4),  "color" : new Vec(0.0, 1.0, 0.0)},
  {"point" : new Vec(-0.7, 0.7),  "color" : new Vec(0.0, 1.0, 0.0)},
  
  {"point" : new Vec(-0.7, 0.7),  "color" : new Vec(0.5, 0.0, 0.5)},
  {"point" : new Vec(-0.4, 0.9),  "color" : new Vec(0.5, 0.0, 0.5)},
  {"point" : new Vec(-0.4, 0.6),  "color" : new Vec(0.5, 0.0, 0.5)},
  {"point" : new Vec(-0.0, 0.6),  "color" : new Vec(0.5, 0.0, 0.5)},
);

async function main() {
  const vsSource = await WebGLUtils.readFile("./shaders/vertexShader.glsl");
  const fsSource = await WebGLUtils.readFile("./shaders/fragmentShader.glsl");
  
  vHTMLElements = new HTMLElements();
  vGL = new GL(vHTMLElements.canvas.getContext("webgl2") as WebGL2RenderingContext, vsSource, fsSource);
  vSplineControl = new SplineControl();

  setupEventHandlers();
  resizeHandler();
  vGL.context.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);

  for (let i = 0; i < control_points.length / 4; ++i) {
    if (i + 3 >= control_points.length) { break; } 
    vSplineControl.spline.addCurve(
      new CubicBezierCurve(
        control_points[i * 4 + 0].point,
        control_points[i * 4 + 1].point,
        control_points[i * 4 + 2].point,
        control_points[i * 4 + 3].point,

        control_points[i * 4 + 0].color,
        control_points[i * 4 + 1].color,
        control_points[i * 4 + 2].color,
        control_points[i * 4 + 3].color,
      )
    );
  }

  // Fill the GPU Buffers
  vSplineControl.spline.sampleSpline();

  let bufferDataSplinePoints = new Float32Array(vSplineControl.spline.array_points.length * 5.0);

  for (let i = 0; i < vSplineControl.spline.array_points.length; ++i) {
    bufferDataSplinePoints[i * 5 + 0] = vSplineControl.spline.array_points[i].x;
    bufferDataSplinePoints[i * 5 + 1] = vSplineControl.spline.array_points[i].y;

    bufferDataSplinePoints[i * 5 + 2] = vSplineControl.spline.array_colors[i].x;
    bufferDataSplinePoints[i * 5 + 3] = vSplineControl.spline.array_colors[i].y;
    bufferDataSplinePoints[i * 5 + 4] = vSplineControl.spline.array_colors[i].z;
  }

  vGL.num_vertices_points_in_spline = vSplineControl.spline.array_points.length;
  vGL.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vGL.buffer_points_in_spline);
  vGL.context.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, bufferDataSplinePoints, WebGL2RenderingContext.STATIC_DRAW);

  // Fill control points
  let bufferDataControlPoints = new Float32Array(control_points.length * 5.0);
  for (let i = 0; i < control_points.length; ++i) {
    bufferDataControlPoints[i * 5 + 0] = control_points[i].point.x;
    bufferDataControlPoints[i * 5 + 1] = control_points[i].point.y;

    bufferDataControlPoints[i * 5 + 2] = control_points[i].color.x;
    bufferDataControlPoints[i * 5 + 3] = control_points[i].color.y;
    bufferDataControlPoints[i * 5 + 4] = control_points[i].color.z;
  }
  vGL.num_vertices_control_points = control_points.length;
  vGL.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vGL.buffer_control_points);
  vGL.context.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, bufferDataControlPoints, WebGL2RenderingContext.STATIC_DRAW);

  // Draw
  vGL.drawSpline();
  vGL.drawControlPoints();
  
  animate();
}

async function setupEventHandlers() {
  vHTMLElements.speed_t2.addEventListener("input", (event) => {
    console.log(event);
    const element = event.target as HTMLInputElement;
    if (element.labels){
      element.labels[0].innerText = `${parseFloat(element.value).toFixed(2)} speed multiplier`;
    }
  });
}

function resizeHandler() {
  let new_width_canvas = window.innerWidth - window.innerWidth * 0.05;
  let new_height_canvas = window.innerHeight - window.innerHeight * 0.05;
  canvasResize(new_width_canvas, new_height_canvas);
  vGL.context.viewport(0, 0, new_width_canvas, new_height_canvas);
}

function canvasResize(width:number, height:number){
  vHTMLElements.canvas.width = width;
  vHTMLElements.canvas.height = height;
  vHTMLElements.canvas.style.width = `${width}px`;
  vHTMLElements.canvas.style.height = `${height}px`;
}

async function animate() {
  let begin = new Date();
  const time_to_full_lap = 10 * 1000.0; // 10s
  let t = 0.0;
  let t2 = 0.0;
  while (animate_point) {
    const now = new Date();
    const t2_speed = parseFloat(vHTMLElements.speed_t2.value);
    t = ((now.getTime() - begin.getTime()) / time_to_full_lap) % 1.0;
    t2 = ((now.getTime() - begin.getTime()) * t2_speed / time_to_full_lap) % 1.0;
    
    vHTMLElements.value_t.innerText = `t = ${t.toFixed(2)} t' = ${t2.toFixed(2)}`;

    // Clear background
    vGL.context.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);

    // Draw spline and control points
    vGL.drawSpline();
    vGL.drawControlPoints();

    // Draw the point
    const point0 = vSplineControl.spline.getPoint(t);
    const tangent0 = vSplineControl.spline.getPointTangent(t);
    const tangent0_normalized = point0.add(tangent0.div(tangent0.mag()*5.0));
    const point1 = vSplineControl.spline.getPoint((t2) % 1.0);
    const tangent1 = vSplineControl.spline.getPointTangent((t2) % 1.0);
    const tangent1_normalized = point1.add(tangent1.div(tangent1.mag()*5.0));
    
    // Draw the tangent vector
    const data = new Float32Array(
      [point0.x, point0.y, 1.0, 1.0, 1.0, tangent0_normalized.x, tangent0_normalized.y, 1.0, 1.0, 1.0,
       point1.x, point1.y, 0.0, 1.0, 1.0, tangent1_normalized.x, tangent1_normalized.y, 0.0, 1.0, 1.0]);
    vGL.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vGL.buffer_moving_points);
    vGL.context.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, data, WebGL2RenderingContext.DYNAMIC_DRAW);
    vGL.num_vertices_moving_points = 2;

    vGL.drawMovingPoint();
    await WebGLUtils.sleep(0.0);
  }
}

function keyboardHandler(event:KeyboardEvent) {
  switch (event.key) {
  case "s":
    animate_point = !animate_point;
    if (animate_point) {
      animate();
    }
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
}

// Call the main function after the full load of the html page
window.onload = main;
// Resize canvas and change resolution
window.onresize = resizeHandler;
// Handle the keyboard input
window.onkeydown = keyboardHandler;
