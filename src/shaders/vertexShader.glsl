#version 300 es

layout( location = 0) in vec4 position;
layout( location = 1) in vec4 color;

out vec4 vColor; 


void main() {
  gl_PointSize = 5.0;
  gl_Position = vec4(position.xy, 0.0, 1.0);
  vColor = color;
}