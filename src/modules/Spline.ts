import {Vec} from "./Vec.js"
import {Curve} from "./Curve.js"

export class Spline {
  private curves : Array<Curve>;
  private num_points_per_curve : number;
  private array_points : Array<Vec>;
  
  constructor (numPoints : number = 150) {
    this.num_points_per_curve = numPoints;
    this.curves = new Array();
    this.array_points = new Array(numPoints);
  }

  public addCurve(curve : Curve) {
    this.curves.push(curve);
  }

  public getPoint(t:number) : Vec {
    const sanitized_t = Math.abs(t) % 1.0;
    const expand_t = sanitized_t * this.curves.length;
    const curve_index = Math.floor(expand_t);
    const new_t = expand_t - curve_index;
    
    return this.curves[curve_index].getPoint(new_t);
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
        t += increment;
      }
    });
  }
  
  public getCurveByIndex(index:number) : Curve | null {
    if (index < 0 || index >= this.curves.length) {
      return null;
    }

    return this.curves[index];
  }

  public updateCurve(index:number, new_curve:Curve) {
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

  public get getPointsInSpline() : Array<Vec> | null { return this.array_points; }
  public set setNumPoints(value:number) { this.num_points_per_curve = value; this.sampleSpline(); }
  
}