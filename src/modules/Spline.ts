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
      for (let i = 0; i <= this.num_points_per_curve; ++i){
        this.array_points[i + this.num_points_per_curve * index] = curve.getPoint(t);
        this.array_colors[i + this.num_points_per_curve * index] = curve.getColorInPoint(t);
        t += increment;
      }
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
    for (let i = 0; i <= this.num_points_per_curve; ++i){
      this.array_points[i + this.num_points_per_curve * index] = this.curves[index].getPoint(t);
      t += increment;
    }
  }

  public get getNumCurvesInSpline() : number {
    return this.curves.length;
  }

  public isC0Continuous() : boolean {
    for (let i = 0; i < this.curves.length - 1; ++i) {
      if (!this.curves[i].getPoint(1.0).equals(this.curves[i+1].getPoint(0.0))) return false;
    }
    return true;
  }

  public get getPointsInSpline() : Array<Vec> | null { return this.array_points; }
  public set setNumPoints(value:number) { this.num_points_per_curve = value; this.sampleSpline(); }
  
}