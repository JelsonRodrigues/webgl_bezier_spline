export class Vec {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  public constructor (x = 0.0, y = 0.0, z = 0.0, w = 1.0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  public add(other:Vec) : Vec {
    const x = this.x + other.x;
    const y = this.y + other.y;
    const z = this.z + other.z;
    
    return new Vec(x, y, z);
  }

  public sub(other:Vec) : Vec {
    const x = this.x - other.x;
    const y = this.y - other.y;
    const z = this.z - other.z;
    
    return new Vec(x, y, z);
  }

  public mul(value:number) : Vec {
    const x = this.x * value;
    const y = this.y * value;
    const z = this.z * value;
    
    return new Vec(x, y, z);
  }

  public div(value:number) : Vec {
    return this.mul(1.0/value);
  }

  public mag() : number {
    return Math.sqrt(
      this.x * this.x + 
      this.y * this.y + 
      this.z * this.z
    );
  }
  
  public dot(other:Vec) : number {
    return (
      this.x * other.x +
      this.y * other.y +
      this.z * other.z +
      this.w * other.w
    );
  }

  public cross(other:Vec) : Vec {
    const x = this.y * other.z - this.z * other.y;
    const y = this.x * other.z - this.z * other.x;
    const z = this.x * other.y - this.y * other.x;

    return new Vec(x, y, z, 0.0);
  }

  public cosineBetween(other:Vec) : number {
    return this.div(this.mag()).dot(other.div(other.mag()));
  }

  public sineBetween(other:Vec) : number {
    return Math.sqrt(Math.pow(this.cosineBetween(other), 2) - 1);
  }

  public angleBetweenInRad(other:Vec) : number {
    return Math.acos(this.cosineBetween(other));
  }
  
  public angleBetweenInDeg(other:Vec) : number {
    return this.angleBetweenInDeg(other) * 180.0 / Math.PI;
  }

  public equals(ohter:Vec) : boolean {
    return this.x == ohter.x &&
      this.y == ohter.y && 
      this.z == ohter.z && 
      this.w == ohter.w;
  }
}