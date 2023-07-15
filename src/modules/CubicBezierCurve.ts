import {Vec} from "./Vec.js"
import {Curve} from "./Curve.js"

export class CubicBezierCurve extends Curve {
  private control_points : Array<Vec>;
  private coeff_vector : [Vec, Vec, Vec, Vec];
  private control_points_color : Array<Vec>;
  private coeff_vector_color : [Vec, Vec, Vec, Vec];

  constructor (P0 : Vec, P1: Vec, P2: Vec, P3: Vec, P0_c : Vec, P1_c : Vec, P2_c : Vec, P3_c : Vec) {
    super();
    this.control_points = new Array(P0, P1, P2, P3);
    this.control_points_color = new Array(P0_c, P1_c, P2_c, P3_c);
    this.coeff_vector = [new Vec(), new Vec(), new Vec(), new Vec()];
    this.calcCoeffVector(P0, P1, P2, P3);
    this.coeff_vector_color = [new Vec(), new Vec(), new Vec(), new Vec()];
    this.calcCoeffVectorColors(P0_c, P1_c, P2_c, P3_c);
  }

  private calcCoeffVector(P0 : Vec, P1: Vec, P2: Vec, P3: Vec){
    this.coeff_vector[0] = P0.mul(1.0).add(P1.mul(0.0)).add(P2.mul(0.0)).add(P3.mul(0.0));
    this.coeff_vector[1] = P0.mul(-3.0).add(P1.mul(3.0)).add(P2.mul(0.0)).add(P3.mul(0.0));
    this.coeff_vector[2] = P0.mul(3.0).add(P1.mul(-6.0)).add(P2.mul(3.0)).add(P3.mul(0.0));
    this.coeff_vector[3] = P0.mul(-1.0).add(P1.mul(3.0)).add(P2.mul(-3.0)).add(P3.mul(1.0));
  }

  private calcCoeffVectorColors(P0 : Vec, P1: Vec, P2: Vec, P3: Vec){
    this.coeff_vector_color[0] = P0.mul(1.0).add(P1.mul(0.0)).add(P2.mul(0.0)).add(P3.mul(0.0));
    this.coeff_vector_color[1] = P0.mul(-3.0).add(P1.mul(3.0)).add(P2.mul(0.0)).add(P3.mul(0.0));
    this.coeff_vector_color[2] = P0.mul(3.0).add(P1.mul(-6.0)).add(P2.mul(3.0)).add(P3.mul(0.0));
    this.coeff_vector_color[3] = P0.mul(-1.0).add(P1.mul(3.0)).add(P2.mul(-3.0)).add(P3.mul(1.0));
  }

  public getPoint(t:number) : Vec {
    const t_0 = Math.pow(t, 0);
    const t_1 = Math.pow(t, 1);
    const t_2 = Math.pow(t, 2);
    const t_3 = Math.pow(t, 3);

    const res = this.coeff_vector[0].mul(t_0)
      .add(this.coeff_vector[1].mul(t_1))
      .add(this.coeff_vector[2].mul(t_2))
      .add(this.coeff_vector[3].mul(t_3));

    return res;
  }

  public getColorInPoint(t:number) : Vec {
    const t_0 = Math.pow(t, 0);
    const t_1 = Math.pow(t, 1);
    const t_2 = Math.pow(t, 2);
    const t_3 = Math.pow(t, 3);

    const res = this.coeff_vector_color[0].mul(t_0)
      .add(this.coeff_vector_color[1].mul(t_1))
      .add(this.coeff_vector_color[2].mul(t_2))
      .add(this.coeff_vector_color[3].mul(t_3));

    return res;
  }

  public getPointTangent(t: number): Vec {
    const t_0 = 0;
    const t_1 = 1 * Math.pow(t, 0);
    const t_2 = 2 * Math.pow(t, 1);
    const t_3 = 3 * Math.pow(t, 2);

    const res = this.coeff_vector[0].mul(t_0)
    .add(this.coeff_vector[1].mul(t_1))
    .add(this.coeff_vector[2].mul(t_2))
    .add(this.coeff_vector[3].mul(t_3));

    return res;
  }

  public changeControlPoint(index:number, new_point: Vec) {
    if (index < 0 || index >= this.control_points.length) { return; }

    this.control_points[index] = new_point;

    this.calcCoeffVector(this.control_points[0], this.control_points[1], this.control_points[2], this.control_points[3]);
  }

  public getControlPointByIndex(index : number) : Vec | null {
    if (index < 0 || index >= this.control_points.length) {
      return null;
    }
    return this.control_points[index];
  }

  public get getControlPoints() : Array<Vec> {
    return this.control_points;
  }
}