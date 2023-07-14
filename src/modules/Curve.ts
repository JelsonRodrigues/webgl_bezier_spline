import {Vec} from "./Vec.js"

export abstract class Curve {
  public abstract getPoint(t:number) : Vec;
}