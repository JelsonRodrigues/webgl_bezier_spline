import {WebGLUtils} from "./modules/WebGLUtils.js"
import {Vec} from "./modules/Vec.js"
import {Spline} from "./modules/Spline.js"
import {CubicBezierCurve} from "./modules/CubicBezierCurve.js"

var gl:WebGL2RenderingContext;
var canvas:HTMLCanvasElement;
var gl_drawing_primitive = WebGL2RenderingContext.LINE_STRIP;
var vertices:number = 0;
var program_current:WebGLProgram|null = null;

export async function main() {
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
  createSpline();
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
  program_current = program;
  
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
}

function createSpline(){
  const P0 = new Vec(0.0, 0.6);
  const P1 = new Vec(0.4, 0.4);
  const P2 = new Vec(0.4, 0.0);
  const P3 = new Vec(0.2, -0.2);
  const P4 = new Vec(0.0, -0.4);
  const P5 = new Vec(-0.4, -0.4);
  const P6 = new Vec(-0.6, 0.0);
  const P7 = new Vec(-0.6, 0.4);
  const P8 = new Vec(-0.9, 0.4);
  const P9 = new Vec(-0.7, 0.7);
  const P10 = new Vec(-0.4, 0.9);
  const P11 = new Vec(-0.4, 0.6);

  let spline = new Spline(128);
  let bezier = new CubicBezierCurve(P0, P1, P2, P3);
  let bezier_2 = new CubicBezierCurve(P3, P4, P5, P6);
  let bezier_3 = new CubicBezierCurve(P6, P7, P8, P9);
  let bezier_4 = new CubicBezierCurve(P9, P10, P11, P0);

  spline.addCurve(bezier);
  spline.addCurve(bezier_2);
  spline.addCurve(bezier_3);
  spline.addCurve(bezier_4);

  spline.sampleSpline();

  const points = spline.getPointsInSpline;
  if (!points) {
    throw new Error("Error getting the points in the spline!!!");
  }
  vertices = points.length;

  const vertexData = new Float32Array(points.length * 2);
  
  points.forEach((vec, index) => {
    vertexData[index*2 ] = vec.x;
    vertexData[index*2 + 1] = vec.y;
  });
  
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

  // Get the position location from the program
  if (program_current){
    let position = gl.getAttribLocation(program_current, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  }

  gl.drawArrays(gl_drawing_primitive, 0, vertices);
}

// async function animate() {
//   let last = new Date();
//   while (rotate) {
//     const now = new Date();
//     rotated_ammount += (now-last) * (Math.PI * 2.0) / time_to_full_rotation;

//     gl.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
//     gl.uniform1f(u_rotation_angle, rotated_ammount);
//     gl.drawArrays(gl_drawing_primitive, 0, vertices);

//     last = now;
//     await sleep(0.0);
//   }
// }

// Call the main function after the full load of the html page
window.onload = main;
window.onresize = resizeHandler;