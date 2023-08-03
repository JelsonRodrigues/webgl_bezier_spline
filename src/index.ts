import {WebGLUtils} from "./modules/WebGLUtils.js"
import {Vec} from "./modules/Vec.js"
import {Spline} from "./modules/Spline.js"
import {CubicBezierCurve} from "./modules/CubicBezierCurve.js"


class HTMLElements {
  public canvas : HTMLCanvasElement;
  public value_t : HTMLInputElement;
  public speed_t2 : HTMLInputElement;
  public add_curve : HTMLButtonElement;
  public curve_color : HTMLInputElement;
  public draw_control_points : HTMLInputElement;
  public draw_control_lines : HTMLInputElement;
  public turn_c0 : HTMLButtonElement;
  public turn_c1 : HTMLButtonElement;
  public turn_c2 : HTMLButtonElement;
  public turn_g0 : HTMLButtonElement;
  public turn_g1 : HTMLButtonElement;
  public turn_g2 : HTMLButtonElement;
  public animate_checkbox : HTMLButtonElement;
  public options_animation_div : HTMLDivElement;
  public time_for_animation : HTMLInputElement;
  public saveOBJ: HTMLButtonElement;
  public openOBJ: HTMLButtonElement;
  public OBJfile: HTMLInputElement;

  constructor () {
    this.canvas = document.getElementById("WebGLCanva") as HTMLCanvasElement;
    this.value_t = document.getElementById("tValue") as HTMLInputElement;
    this.speed_t2 = document.getElementById("speed_multiplier") as HTMLInputElement;
    this.add_curve = document.getElementById("buttonAddCurve") as HTMLButtonElement;
    this.curve_color = document.getElementById("curvePointsColor") as HTMLInputElement;
    this.draw_control_points = document.getElementById("drawControlPoints") as HTMLInputElement;
    this.draw_control_lines = document.getElementById("drawControlLines") as HTMLInputElement;
    this.turn_c0 = document.getElementById("turnC0Continuous") as HTMLButtonElement;
    this.turn_c1 = document.getElementById("turnC1Continuous") as HTMLButtonElement;
    this.turn_c2 = document.getElementById("turnC2Continuous") as HTMLButtonElement;
    this.turn_g0 = document.getElementById("turnG0Continuous") as HTMLButtonElement;
    this.turn_g1 = document.getElementById("turnG1Continuous") as HTMLButtonElement;
    this.turn_g2 = document.getElementById("turnG2Continuous") as HTMLButtonElement;
    this.animate_checkbox = document.getElementById("animateCheckbox") as HTMLButtonElement;
    this.options_animation_div = document.getElementById("optionsAnimation") as HTMLDivElement;
    this.time_for_animation = document.getElementById("timeForAnimation") as HTMLInputElement;
    this.saveOBJ = document.getElementById("saveOBJ") as HTMLButtonElement;
    this.openOBJ = document.getElementById("openOBJ") as HTMLButtonElement;
    this.OBJfile = document.getElementById("objFile") as HTMLInputElement;
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
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      6 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.vertexAttribPointer(
      this.a_color, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      6 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    const c0_cont = vSplineControl.spline.isC0Continuous();
    if (c0_cont){
      this.context.drawArrays(this.drawing_points_in_spline, 0, this.num_vertices_points_in_spline);
    }
    else {
      // Draw each curve separately
      const points_per_curve = this.num_vertices_points_in_spline * 4.0 / this.num_vertices_control_points;
      for (let i = 0; i < this.num_vertices_points_in_spline / points_per_curve; ++i) {
        this.context.drawArrays(this.drawing_points_in_spline, i * points_per_curve , points_per_curve);
      }
    }
  }

  public drawControlPoints() {
    this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_control_points);

    this.context.enableVertexAttribArray(this.a_position);
    this.context.enableVertexAttribArray(this.a_color);
    this.context.uniform1f(this.u_pointSize, 10.0);

    this.context.vertexAttribPointer(
      this.a_position, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      6 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.vertexAttribPointer(
      this.a_color, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      6 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
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
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      12 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.vertexAttribPointer(
      this.a_color, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      12 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.drawArrays(WebGL2RenderingContext.POINTS, 0, this.num_vertices_moving_points);

    this.context.vertexAttribPointer(
      this.a_position, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      6 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.vertexAttribPointer(
      this.a_color, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      6 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.drawArrays(WebGL2RenderingContext.LINES, 0, this.num_vertices_moving_points * 2.0);
  }

  public drawControlPointsLines() {
    this.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.buffer_control_points);

    this.context.enableVertexAttribArray(this.a_position);
    this.context.enableVertexAttribArray(this.a_color);
    this.context.uniform1f(this.u_pointSize, 10.0);

    this.context.vertexAttribPointer(
      this.a_position, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      6 * Float32Array.BYTES_PER_ELEMENT, 
      0 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.vertexAttribPointer(
      this.a_color, 
      3, 
      WebGL2RenderingContext.FLOAT, 
      false, 
      6 * Float32Array.BYTES_PER_ELEMENT, 
      3 * Float32Array.BYTES_PER_ELEMENT
    );

    this.context.drawArrays(WebGL2RenderingContext.LINES, 0, this.num_vertices_control_points);
  }
}

class SplineControl {
  public spline: Spline;
  public index_altering : number = 0;

  constructor (spline: Spline = new Spline(256)) {
    this.spline = spline;
  }
}

var vHTMLElements: HTMLElements;
var vGL: GL;
var vSplineControl : SplineControl;
var animate_point = false;
var animating = false;
var curve_color = new Vec(1.0, 0.0, 0.0);
var draw_control_points = true;
var draw_control_lines = true;
var t = 0.0;
var t2 = 0.0;
var time_to_full_lap = 10; // 10s

async function main() {
  const vsSource = await WebGLUtils.readFile("./shaders/vertexShader.glsl");
  const fsSource = await WebGLUtils.readFile("./shaders/fragmentShader.glsl");
  
  vHTMLElements = new HTMLElements();
  vGL = new GL(vHTMLElements.canvas.getContext("webgl2") as WebGL2RenderingContext, vsSource, fsSource);
  vSplineControl = new SplineControl();

  // const perspective = [
  //   0.5602530837059021, 0, 0, 0, 
  //   0, 2.4142136573791504, 0, 0, 
  //   0, 0, -1.0000200271606445, -1,
  //   0, 0, -0.02000020071864128, 0
  // ];

  const perspective = [
    1, 0, 0, 0,
    0, 1, 0, 0, 
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

  const location = vGL.context.getUniformLocation(vGL.program, "u_projection");
  vGL.context.uniformMatrix4fv(location, false, perspective, 0, perspective.length);

  setupEventHandlers();
  resizeHandler();

  drawFrame();
}

function addToGPUPointsInSpline() {
  let bufferDataSplinePoints = new Float32Array(vSplineControl.spline.array_points.length * 6.0);

  for (let i = 0; i < vSplineControl.spline.array_points.length; ++i) {
    bufferDataSplinePoints[i * 6 + 0] = vSplineControl.spline.array_points[i].x;
    bufferDataSplinePoints[i * 6 + 1] = vSplineControl.spline.array_points[i].y;
    bufferDataSplinePoints[i * 6 + 2] = vSplineControl.spline.array_points[i].z;

    bufferDataSplinePoints[i * 6 + 3] = vSplineControl.spline.array_colors[i].x;
    bufferDataSplinePoints[i * 6 + 4] = vSplineControl.spline.array_colors[i].y;
    bufferDataSplinePoints[i * 6 + 5] = vSplineControl.spline.array_colors[i].z;
  }

  vGL.num_vertices_points_in_spline = vSplineControl.spline.array_points.length;
  vGL.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vGL.buffer_points_in_spline);
  vGL.context.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, bufferDataSplinePoints, WebGL2RenderingContext.STATIC_DRAW);

  // Fill control points
  let bufferDataControlPoints = new Float32Array(vSplineControl.spline.getNumCurvesInSpline * 4.0 * 6.0);
  for (let i = 0; i < vSplineControl.spline.getNumCurvesInSpline; ++i) {
    const curve = vSplineControl.spline.getCurveByIndex(i) as CubicBezierCurve;
    const control_points = curve.getControlPoints as Array<Vec>;
    const colors_points = curve.getControlPointsColor as Array<Vec>;

    for (let c = 0; c < 4; ++c) {
      bufferDataControlPoints[i * 24 + c * 6 + 0] = control_points[c].x;
      bufferDataControlPoints[i * 24 + c * 6 + 1] = control_points[c].y;
      bufferDataControlPoints[i * 24 + c * 6 + 2] = control_points[c].z;

      bufferDataControlPoints[i * 24 + c * 6 + 3] = colors_points[c].x;
      bufferDataControlPoints[i * 24 + c * 6 + 4] = colors_points[c].y;
      bufferDataControlPoints[i * 24 + c * 6 + 5] = colors_points[c].z;
    }
  }
  vGL.num_vertices_control_points = vSplineControl.spline.getNumCurvesInSpline * 4.0;
  vGL.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vGL.buffer_control_points);
  vGL.context.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, bufferDataControlPoints, WebGL2RenderingContext.STATIC_DRAW);
}

async function setupEventHandlers() {
  vHTMLElements.speed_t2.addEventListener("input", (event) => {
    const element = event.target as HTMLInputElement;
    if (element.labels){
      element.labels[0].innerText = `${parseFloat(element.value).toFixed(2)} speed multiplier`;
    }
  });

  vHTMLElements.add_curve.addEventListener("click", (event) => {
    const P0 = new Vec(-0.75, 0.9, -0.5);
    const P1 = new Vec(-0.25, 0.9, 0.0);
    const P2 = new Vec(0.25, 0.5, 0.0);
    const P3 = new Vec(0.75, 0.9, 0.5);

    // const P0 = new Vec(Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, 0.0);
    // const P1 = new Vec(Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, 0.0);
    // const P2 = new Vec(Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, 0.0);
    // const P3 = new Vec(Math.random() * 2.0 - 1.0, Math.random() * 2.0 - 1.0, 0.0);

    const new_curve = new CubicBezierCurve(
      P0, P1, P2, P3,
      curve_color, curve_color, curve_color, curve_color,
    );

    vSplineControl.spline.addCurve(new_curve);
    vSplineControl.spline.sampleSpline();

    addToGPUPointsInSpline();
    drawFrame();
  });

  vHTMLElements.curve_color.addEventListener("input", (event) => {
    const element = event.target as HTMLInputElement;
    const value = element.value;
    
    // Converting from hex collor to RGB
    const r = parseInt(value.slice(1, 3), 16);
    const g = parseInt(value.slice(3, 5), 16);
    const b = parseInt(value.slice(5, 7), 16);

    curve_color = new Vec(r / 255.0, g / 255.0, b / 255.0);
  });

  vHTMLElements.draw_control_points.addEventListener("change", (event) => {
    const element = event.target as HTMLInputElement;
    draw_control_points = element.checked;
    drawFrame();
  });

  vHTMLElements.draw_control_lines.addEventListener("change", (event) => {
    const element = event.target as HTMLInputElement;
    draw_control_lines = element.checked;
    drawFrame();
  });

  vHTMLElements.turn_c0.addEventListener("click", (event) => {
    const total_curves = vSplineControl.spline.getNumCurvesInSpline;
    if (total_curves <= 1) return;

    const spline = vSplineControl.spline;
    for (let i = 0; i < total_curves-1; ++i) {
      const curve_0 = spline.getCurveByIndex(i) as CubicBezierCurve;
      const curve_1 = spline.getCurveByIndex(i+1) as CubicBezierCurve;
      
      curve_1.changeControlPoint(0, curve_0.getPoint(1.0));
      spline.updateCurve(i+1, curve_1);
    }

    addToGPUPointsInSpline();
    drawFrame();
  });

  vHTMLElements.turn_c1.addEventListener("click", (event) => {
    const total_curves = vSplineControl.spline.getNumCurvesInSpline;
    if (total_curves <= 1) return;

    const spline = vSplineControl.spline;

    for (let i = 0; i < total_curves-1; ++i) {
      // This turn C0
      const curve_0 = spline.getCurveByIndex(i) as CubicBezierCurve;
      const curve_1 = spline.getCurveByIndex(i+1) as CubicBezierCurve;
      curve_1.changeControlPoint(0, curve_0.getPoint(1.0));
      
      // This turn C1
      curve_1.changeControlPoint(1, curve_0.getControlPoints[3].sub(curve_0.getControlPoints[2]).add(curve_1.getControlPoints[0]));
      spline.updateCurve(i+1, curve_1);
    }

    addToGPUPointsInSpline();
    drawFrame();
  });

  vHTMLElements.turn_c2.addEventListener("click", (event) => {
    const total_curves = vSplineControl.spline.getNumCurvesInSpline;
    if (total_curves <= 1) return;

    const spline = vSplineControl.spline;

    for (let i = 0; i < total_curves-1; ++i) {
      // This turn C0
      const curve_0 = spline.getCurveByIndex(i) as CubicBezierCurve;
      const curve_1 = spline.getCurveByIndex(i+1) as CubicBezierCurve;
      curve_1.changeControlPoint(0, curve_0.getPoint(1.0));
      
      // This turn C1
      const p3_sub_p2 = curve_0.getControlPoints[3].sub(curve_0.getControlPoints[2])
      curve_1.changeControlPoint(1, p3_sub_p2.add(curve_1.getControlPoints[0]));

      // This turn C2
      curve_1.changeControlPoint(2, curve_0.getControlPoints[1].add(p3_sub_p2.mul(4)));

      spline.updateCurve(i+1, curve_1);
    }

    addToGPUPointsInSpline();
    drawFrame();
  });

  vHTMLElements.turn_g0.addEventListener("click", (event) => {
    vHTMLElements.turn_c0.click();
  });

  vHTMLElements.turn_g1.addEventListener("click", (event) => {
    const total_curves = vSplineControl.spline.getNumCurvesInSpline;
    if (total_curves <= 1) return;

    const spline = vSplineControl.spline;

    for (let i = 0; i < total_curves-1; ++i) {
      // This turn G0
      const curve_0 = spline.getCurveByIndex(i) as CubicBezierCurve;
      const curve_1 = spline.getCurveByIndex(i+1) as CubicBezierCurve;
      curve_1.changeControlPoint(0, curve_0.getPoint(1.0));

      // This turn G1
      const v = curve_0.getControlPoints[3].sub(curve_0.getControlPoints[2]);
      const norm_v = v.div(v.mag());
      const lengt_original = curve_1.getControlPoints[1].sub(curve_1.getControlPoints[0]).mag();

      curve_1.changeControlPoint(1, curve_1.getControlPoints[0].add(norm_v.mul(lengt_original)));
      spline.updateCurve(i+1, curve_1);
    }

    addToGPUPointsInSpline();
    drawFrame();
  });

  vHTMLElements.animate_checkbox.addEventListener("change", (event) => {
    animate_checked();
  });

  vHTMLElements.value_t.addEventListener("input", (event) => {
    const element = event.target as HTMLInputElement;
    t = parseFloat(element.value);

    if (element.labels){
      element.labels[0].textContent = `t = ${t.toFixed(2)}`;
    }

    // Recalculate position of the points
    updateMovingPoints();
    drawFrame();
  });

  vHTMLElements.time_for_animation.addEventListener("input", (event) => {
    const element = event.target as HTMLInputElement;
    time_to_full_lap = parseFloat(element.value);
    if (element.labels){
      element.labels[0].textContent = `Time for animation ${time_to_full_lap}s`
    }
  });

  const func = (event : MouseEvent) => {
    const x = (event.offsetX * 2 - vHTMLElements.canvas.width) / vHTMLElements.canvas.width;
    const y = ((event.offsetY * 2 - vHTMLElements.canvas.height) / vHTMLElements.canvas.height) * -1;
    
    const point = new Vec(x, y);

    vSplineControl.spline.updatePoint(vSplineControl.index_altering, point);

    addToGPUPointsInSpline();
    drawFrame();
  };

  vHTMLElements.canvas.addEventListener("mousedown", (event) => {
    // Identify the index point
    const x = (event.offsetX * 2 - vHTMLElements.canvas.width) / vHTMLElements.canvas.width;
    const y = ((event.offsetY * 2 - vHTMLElements.canvas.height) / vHTMLElements.canvas.height) * -1;
    
    const point = new Vec(x, y);

    vSplineControl.index_altering = vSplineControl.spline.indexControlPoint(0.015, point);

    if (vSplineControl.index_altering >= 0){
      vHTMLElements.canvas.addEventListener("mousemove", func);
    }
  });
  vHTMLElements.canvas.addEventListener("mouseup", (event) => {
    vHTMLElements.canvas.removeEventListener("mousemove", func);
    vSplineControl.index_altering = -1;
  });

  vHTMLElements.canvas.addEventListener("mouseleave", (event) => {
    vHTMLElements.canvas.removeEventListener("mousemove", func);
    vSplineControl.index_altering = -1;
  });

  vHTMLElements.saveOBJ.addEventListener("click", (event) => {
    const res = vSplineControl.spline.toOBJ();
    const blob = new Blob([res], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "spline.obj";
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  vHTMLElements.openOBJ.addEventListener("click", (event) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = function() {
      if (input.files){
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function() {
          vSplineControl.spline = Spline.fromOBJ(reader.result as string);
          vSplineControl.spline.sampleSpline();
          addToGPUPointsInSpline();
          drawFrame();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  });

}

function updateTvalue(value:number) {
  vHTMLElements.value_t.value = value.toFixed(2);
  if (vHTMLElements.value_t.labels){
    vHTMLElements.value_t.labels[0].textContent = `t = ${t.toFixed(2)}`;
  }
}

function drawFrame() {
  vGL.context.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT);
  if (vSplineControl.spline.getNumCurvesInSpline <= 0) return;
  vGL.drawSpline();
  if (draw_control_points) vGL.drawControlPoints();
  if (draw_control_lines) vGL.drawControlPointsLines();
  if (animate_point) vGL.drawMovingPoint(); 
}

function resizeHandler() {
  let side_size = Math.min(window.innerWidth * 0.66,  window.innerHeight) * 0.95;
  let new_width_canvas =  side_size;
  let new_height_canvas = side_size;
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
  if (vSplineControl.spline.getNumCurvesInSpline <= 0) {
    animating = false;
    return;
  }
  animating = true;
  let last = new Date();
  while (animate_point) {
    const now = new Date();
    const t2_speed = parseFloat(vHTMLElements.speed_t2.value);
    t = (t + ((now.getTime() - last.getTime()) / (time_to_full_lap * 1000.0))) % 1.0;
    t2 = (t2 + ((now.getTime() - last.getTime()) * t2_speed / (time_to_full_lap * 1000.0))) % 1.0;
    
    updateTvalue(t);

    updateMovingPoints();

    drawFrame();
    await WebGLUtils.sleep(0.0);
    last = now;
  }
  animating = false;
  drawFrame();
}

function updateMovingPoints() {
  // Update the point
  const point0 = vSplineControl.spline.getPoint(t);
  const point0_color = vSplineControl.spline.getColorInPoint(t);
  const tangent0 = vSplineControl.spline.getPointTangent(t);
  const tangent0_normalized = point0.add(tangent0.div(tangent0.mag()*5.0));
  const point1 = vSplineControl.spline.getPoint((t2) % 1.0);
  const point1_color = vSplineControl.spline.getColorInPoint(t2);
  const tangent1 = vSplineControl.spline.getPointTangent((t2) % 1.0);
  const tangent1_normalized = point1.add(tangent1.div(tangent1.mag()*5.0));
  
  // Draw the tangent vector
  const data = new Float32Array(
    [point0.x, point0.y, point0.z, point0_color.x, point0_color.y, point0_color.z, tangent0_normalized.x, tangent0_normalized.y, tangent0_normalized.z, 1.0, 1.0, 1.0,
      point1.x, point1.y, point1.z, point1_color.x, point1_color.y, point1_color.z, tangent1_normalized.x, tangent1_normalized.y, tangent1_normalized.z, 1.0, 1.0, 1.0]);
  vGL.context.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vGL.buffer_moving_points);
  vGL.context.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, data, WebGL2RenderingContext.DYNAMIC_DRAW);
  vGL.num_vertices_moving_points = 2;
}

function animate_checked() {
  animate_point = !animate_point;
  if (animate_point){
    vHTMLElements.animate_checkbox.setAttribute("checked", "");
  }
  else {
    vHTMLElements.animate_checkbox.removeAttribute("checked");
  }
  if (animate_point && !animating) {
    animate();
  }
}

function keyboardHandler(event:KeyboardEvent) {
  switch (event.key) {
  case "s":
    animate_checked();
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
