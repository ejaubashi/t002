import { defineProperties } from "figma:shaders"
export default function SignalField() {}
export function setup(device, frame) {
  frame.state.module = device.createShaderModule({code:`diagnostic(off,derivative_uniformity);
struct U { control:vec4f, pointer:vec4f, blue:vec4f, lime:vec4f };
@group(0) @binding(0) var<uniform> u:U;
struct Out { @builtin(position) position:vec4f, @location(0) uv:vec2f };
@vertex fn vs_main(@builtin(vertex_index) id:u32)->Out {
 let p=array(vec2f(-1.,-1.),vec2f(3.,-1.),vec2f(-1.,3.));
 var o:Out;o.position=vec4f(p[id],0.,1.);o.uv=p[id]*vec2f(.5,-.5)+.5;return o;
}
fn stroke(v:f32,w:f32)->f32{return 1.-smoothstep(0.,w,abs(sin(v)));}
@fragment fn fs_main(@location(0) uv:vec2f)->@location(0) vec4f {
 var p=(uv-.5)*vec2f(u.control.y,1.);
 let mouse=(u.pointer.xy-.5)*vec2f(u.control.y,1.);
 let d=p-mouse;let lens=exp(-dot(d,d)*38.);p+=d*lens*u.pointer.z;
 let t=u.control.x*.4;let r=length(p);let angle=atan2(p.y,p.x);
 let wave=stroke(p.y*90.+sin(p.x*7.+t)*2.8,.17);
 let orbit=stroke(r*95.-t*1.4+sin(angle*3.+t)*.8,.14);
 let interference=stroke(sin(p.x*13.+t)*3.+sin(p.y*14.-t*.7)*3.,.09);
 var ink=wave;
 if(u.control.z>.5){ink=orbit;} if(u.control.z>1.5){ink=interference;}
 let grid=uv*vec2f(90.,60.);let cell=floor(grid);let local=fract(grid)-.5;
 let hash=fract(sin(dot(cell,vec2f(127.1,311.7)))*43758.5453);
 let dotInk=(1.-smoothstep(.02,.11,length(local)))*step(.87,hash)*(.5+.5*sin(t+hash*30.));
 let fade=1.-smoothstep(.05,.7,r);
 let blue=u.blue.rgb*(.55+.45*fade);
 let color=mix(blue,u.lime.rgb,clamp(ink*.22*fade+dotInk*.5+lens*.035,0.,1.));
 return vec4f(color,1.);
}`});
  frame.state.uniforms=device.createBuffer({size:64,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
}
export function render(device,frame) {
 const p=frame.params||{}; const blue=p.blue||{r:.06,g:.09,b:.35}; const lime=p.lime||{r:.79,g:.97,b:.65};
 const w=frame.output.width,h=frame.output.height;
 const mouse=frame.mousePosition||{x:w*.5,y:h*.5};
 device.queue.writeBuffer(frame.state.uniforms,0,new Float32Array([Number(frame.time)*.001*(p.speed??1),w/h,p.mode??1,0,mouse.x/w,mouse.y/h,p.lens??.32,0,blue.r,blue.g,blue.b,1,lime.r,lime.g,lime.b,1]));
 if(frame.state.format!==frame.output.format){
  frame.state.pipeline=device.createRenderPipeline({layout:'auto',vertex:{module:frame.state.module,entryPoint:'vs_main'},fragment:{module:frame.state.module,entryPoint:'fs_main',targets:[{format:frame.output.format}]},primitive:{topology:'triangle-list'}});
  frame.state.format=frame.output.format;
 }
 const encoder=device.createCommandEncoder();const pass=encoder.beginRenderPass({colorAttachments:[{view:frame.output.createView(),loadOp:'clear',storeOp:'store',clearValue:{r:0,g:0,b:0,a:1}}]});
 pass.setPipeline(frame.state.pipeline);pass.setBindGroup(0,device.createBindGroup({layout:frame.state.pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:frame.state.uniforms}}]}));pass.draw(3);pass.end();device.queue.submit([encoder.finish()]);
}
defineProperties(SignalField,{
 mode:{type:'number',label:'Signal mode',control:'select',defaultValue:1,options:[{label:'Wave',value:0},{label:'Orbit',value:1},{label:'Interference',value:2}]},
 speed:{type:'number',label:'Tempo',control:'slider',min:.3,max:2,step:.1,defaultValue:1},
 lens:{type:'number',label:'Pointer lens',control:'slider',min:0,max:.5,step:.01,defaultValue:.32},
 blue:{type:'color',label:'Deep blue',defaultValue:{r:.06,g:.09,b:.35,a:1}},
 lime:{type:'color',label:'Lime',defaultValue:{r:.79,g:.97,b:.65,a:1}}
})
