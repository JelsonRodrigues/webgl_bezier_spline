export module WebGLUtils {

export const sleep = (ms : number = 0.0) => new Promise(r => setTimeout(r, ms));

export function createShader(gl: WebGL2RenderingContext, type : number, source:string) : WebGLShader | null{
  const shader = gl.createShader(type);
  if (shader){
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }
  return null;
}

export function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) : WebGLProgram | null {
  const program = gl.createProgram();
  if (program){
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
  
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }
  return null;
}

export async function readFile(filePath : string) : Promise<string> {
  const response = await fetch(filePath);
  const text = await response.text();
  return text;
}

/** @todo Read file in small chunks, preferable using something like 64 or 256 lines at time */
export async function readObj(filePath:string) : Promise<[Array<number>, Array<number>]> {
  const obj_content = await readFile(filePath);
  const vertexArray = new Array();
  const colorArray = new Array();
  obj_content.split("\n").map((line) => {
    let elements = line.split(" ");
    if (elements[0] == 'v') {
      for (let index = 1; index < elements.length; ++index) {
        const number = parseFloat(elements[index]);
        vertexArray.push(number);
      }
    }
    else if (elements[0] == 'c') {
      for (let index = 1; index < elements.length; ++index) {
        const number = parseFloat(elements[index]);
        colorArray.push(number);
      }
    }
  });

  return [vertexArray, colorArray];
}
}

export default WebGLUtils;