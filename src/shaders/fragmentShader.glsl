#version 300 es

precision highp float;

in vec4 vColor; 
out vec4 outColor;


void main() {
  if (vColor.r == 0.0 && vColor.g == 0.0 && vColor.b == 0.0) {
    outColor = vec4(0.9f, 0.04f, 0.04f, 0.58f);
  }
  else {
    outColor = vColor;
  }
}