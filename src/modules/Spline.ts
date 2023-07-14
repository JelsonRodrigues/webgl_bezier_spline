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
    const expand_t = t * this.curves.length;
    let curve_index = 0;
    let new_t = 0.0;

    if (t >= 1.0){
      curve_index = this.curves.length - 1;
      new_t = 1.0;
    }
    else if (t < 0.0) {
      curve_index = 0;
      new_t = 0.0;
    }
    else {
      curve_index = Math.floor(expand_t);
      new_t = expand_t - curve_index;
    }
    
    return this.curves[curve_index].getPoint(new_t);
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
  
  public get getPointsInSpline() : Array<Vec> | null { return this.array_points; }
  public set setNumPoints(value:number) { this.num_points_per_curve = value; }
  
}