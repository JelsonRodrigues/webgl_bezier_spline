#version 300 es

precision highp float;

in vec4 vColor; 
out vec4 outColor;


void main() {
  // outColor = vColor;
  outColor = vec4(0.9f, 0.04f, 0.04f, 0.58f);
}