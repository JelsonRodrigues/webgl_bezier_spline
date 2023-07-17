import {Vec} from "./Vec.js"
import {CubicBezierCurve} from "./CubicBezierCurve.js"

export class Spline {
  private curves : Array<CubicBezierCurve>;
  private num_points_per_curve : number;
  public array_points : Array<Vec>;
  public array_colors : Array<Vec>;
  
  constructor (numPoints : number = 150) {
    this.num_points_per_curve = numPoints;
    this.curves = new Array();
    this.array_points = new Array(numPoints);
    this.array_colors = new Array(numPoints);
  }

  public addCurve(curve : CubicBezierCurve) {
    this.curves.push(curve);
  }

  public getPoint(t:number) : Vec {
    const sanitized_t = Math.abs(t) % 1.0;
    const expand_t = sanitized_t * this.curves.length;
    const curve_index = Math.floor(expand_t);
    const new_t = expand_t - curve_index;
    
    return this.curves[curve_index].getPoint(new_t);
  }

  public getColorInPoint(t:number) : Vec {
    const sanitized_t = Math.abs(t) % 1.0;
    const expand_t = sanitized_t * this.curves.length;
    const curve_index = Math.floor(expand_t);
    const new_t = expand_t - curve_index;
    
    return this.curves[curve_index].getColorInPoint(new_t);
  }

  public getPointTangent(t:number) : Vec {
    const sanitized_t = Math.abs(t) % 1.0;
    const expand_t = sanitized_t * this.curves.length;
    const curve_index = Math.floor(expand_t);
    const new_t = expand_t - curve_index;
    
    return this.curves[curve_index].getPointTangent(new_t);
  }

  public sampleSpline() {
    const increment = 1.0 / this.num_points_per_curve;
    this.curves.forEach((curve, index) => {
      let t = 0.0;
      for (let i = 0; i < this.num_points_per_curve; ++i){
        this.array_points[i + this.num_points_per_curve * index] = curve.getPoint(t);
        this.array_colors[i + this.num_points_per_curve * index] = curve.getColorInPoint(t);
        t += increment;
      }
      // Ensure last point is t = 1.0
      this.array_points[this.num_points_per_curve - 1 + this.num_points_per_curve * index] = this.curves[index].getPoint(1.0);
    });
  }
  
  public getCurveByIndex(index:number) : CubicBezierCurve | null {
    if (index < 0 || index >= this.curves.length) {
      return null;
    }

    return this.curves[index];
  }

  public updateCurve(index:number, new_curve:CubicBezierCurve) {
    if (index < 0 || index >= this.curves.length) {
      return;
    }

    this.curves[index] = new_curve;

    const increment = 1.0 / this.num_points_per_curve;
    let t = 0.0;
    for (let i = 0; i < this.num_points_per_curve; ++i){
      this.array_points[i + this.num_points_per_curve * index] = this.curves[index].getPoint(t);
      t += increment;
    }
    // Ensure last point is t = 1.0
    this.array_points[this.num_points_per_curve - 1 + this.num_points_per_curve * index] = this.curves[index].getPoint(1.0);
  }

  public updatePoint(index : number, new_point : Vec) : boolean {
    if (index < 0 || index >= this.curves.length * 4) { return false; }

    const index_curve = Math.floor(index / 4);
    const index_point_in_curve = index - index_curve * 4;

    const curve = this.curves[index_curve];
    curve.changeControlPoint(index_point_in_curve, new_point);

    this.updateCurve(index_curve, curve);

    return true;
  }

  public indexControlPoint(radius:number = 0.1, point : Vec) : number {
    for (let i = this.curves.length - 1; i >= 0; --i) {
      for (let c = 0; c < 4; ++c) {
        const dist = point.sub(this.curves[i].getControlPoints[c]).mag();
        if ( dist <= radius ) {
          return i * 4 + c;
        }
      }
    }

    return -1;
  }

  public get getNumCurvesInSpline() : number {
    return this.curves.length;
  }

  public isC0Continuous() : boolean {
    for (let i = 0; i < this.curves.length - 1; ++i) {
      const equals = this.curves[i].getControlPoints[3].equals(this.curves[i+1].getControlPoints[0]);
      if (!equals) return false;
    }
    return true;
  }

  public toOBJ() : string {
    let res = "";
    for (let i=0; i < this.curves.length; ++i) {
      for (let c = 0; c < 4; ++c){
        const control_point = this.curves[i].getControlPoints[c];
        res += `v ${control_point.x} ${control_point.y} ${control_point.z}\n`;
      }
    }
    for (let i=0; i < this.curves.length; ++i) {
      for (let c = 0; c < 4; ++c){
        const colors_points = this.curves[i].getControlPointsColor[c];
        res += `c ${colors_points.x} ${colors_points.y} ${colors_points.z}\n`;
      }
    }
    return res;
  }

  public static fromOBJ(obj : string, sampling_points : number = 128) : Spline {
    let spline = new Spline(sampling_points);

    const arrayVertices = new Array<Vec>();
    const arrayColors = new Array<Vec>();
    
    obj.split("\n").forEach((line) => {
      if (line[0] == "v"){
        const values = line.split(" ");
        if (values.length == 4){
          let new_val = new Vec();
          new_val.x = parseFloat(values[1]);
          new_val.y = parseFloat(values[2]);
          new_val.z = parseFloat(values[3]);
          arrayVertices.push(new_val);
        }
      }
      else if (line[0] == "c") {
        const values = line.split(" ");
        if (values.length == 4){
          let new_val = new Vec();
          new_val.x = parseFloat(values[1]);
          new_val.y = parseFloat(values[2]);
          new_val.z = parseFloat(values[3]);
          arrayColors.push(new_val);
        }
      }
    });

    for (let i = 0; i < arrayVertices.length / 4; ++i){
      if (i + 3 >= arrayVertices.length) break;

      const curve = new CubicBezierCurve(
        arrayVertices[i * 4 + 0],
        arrayVertices[i * 4 + 1],
        arrayVertices[i * 4 + 2],
        arrayVertices[i * 4 + 3],
        arrayColors[i * 4 + 0],
        arrayColors[i * 4 + 1],
        arrayColors[i * 4 + 2],
        arrayColors[i * 4 + 3],
      );
      
      spline.addCurve(curve);
    }

    return spline;
  }

  public get getPointsInSpline() : Array<Vec> | null { return this.array_points; }
  public set setNumPoints(value:number) { this.num_points_per_curve = value; this.sampleSpline(); }
  
}