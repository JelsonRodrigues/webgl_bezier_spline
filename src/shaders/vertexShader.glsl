#version 300 es

layout( location = 0) in vec4 position;
layout( location = 1) in vec4 color;

uniform float pointSize;
uniform mat4x4 u_projection;

out vec4 vColor; 

void main() {
  gl_PointSize = pointSize;
  gl_Position = u_projection * position;
  vColor = color;
}