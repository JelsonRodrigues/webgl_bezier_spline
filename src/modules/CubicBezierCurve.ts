import {Vec} from "./Vec.js"
import {Curve} from "./Curve.js"

export class CubicBezierCurve extends Curve {
  private control_points : Array<Vec>;
  private coeff_vector : [Vec, Vec, Vec, Vec];

  constructor (P0 : Vec, P1: Vec, P2: Vec, P3: Vec) {
    super();
    this.control_points = new Array(P0, P1, P2, P3);
    this.coeff_vector = [new Vec(), new Vec(), new Vec(), new Vec()];
    this.calcCoeffVector(P0, P1, P2, P3);
  }

  private calcCoeffVector(P0 : Vec, P1: Vec, P2: Vec, P3: Vec){
    this.coeff_vector[0] = P0.mul(1.0).add(P1.mul(0.0)).add(P2.mul(0.0)).add(P3.mul(0.0));
    this.coeff_vector[1] = P0.mul(-3.0).add(P1.mul(3.0)).add(P2.mul(0.0)).add(P3.mul(0.0));
    this.coeff_vector[2] = P0.mul(3.0).add(P1.mul(-6.0)).add(P2.mul(3.0)).add(P3.mul(0.0));
    this.coeff_vector[3] = P0.mul(-1.0).add(P1.mul(3.0)).add(P2.mul(-3.0)).add(P3.mul(1.0));
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

  public get getControlPoints() : Array<Vec> {
    return this.control_points;
  }
}