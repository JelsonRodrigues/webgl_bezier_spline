#version 300 es

layout( location = 0) in vec4 position;
layout( location = 1) in vec4 color;

uniform float pointSize;

out vec4 vColor; 

void main() {
  gl_PointSize = pointSize;
  gl_Position = vec4(position.xy, 0.0, 1.0);
  vColor = color;
}