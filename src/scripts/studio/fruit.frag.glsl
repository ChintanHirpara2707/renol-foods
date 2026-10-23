precision highp float;
uniform vec2 R;uniform float K,A;
float hs(vec3 p){p=50.*fract(p*.3183099+vec3(.71,.113,.419));return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float ns(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(hs(i),hs(i+vec3(1,0,0)),f.x),mix(hs(i+vec3(0,1,0)),hs(i+vec3(1,1,0)),f.x),f.y),
mix(mix(hs(i+vec3(0,0,1)),hs(i+vec3(1,0,1)),f.x),mix(hs(i+vec3(0,1,1)),hs(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*ns(p);p=p*2.03+7.1;a*=.5;}return s;}
mat2 rt(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
float sm(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float cap(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-r;}
float lf(vec3 p,float r,vec2 o,float s){p.xy=rt(r)*(p.xy-o);p/=s;float t=clamp((p.y+.9)/1.9,0.,1.);
float w=.55*pow(sin(3.14159*pow(t,.75)),.8)+.002;float cz=.25*p.x*p.x-.1*p.y*p.y+.06*sin(p.y*3.);
float d=max((abs(p.x)-w)*.6,abs(p.z-cz)-.03);d=max(d,abs(p.y-.05)-.95);
d=min(d,cap(p,vec3(0,-1.15,-.1),vec3(0,-.85,-.1),.035));return d*s;}
vec3 ob(vec3 p){float a=(K>1.5&&K<2.5)?.7*sin(A):A;p.xz=rt(a)*p.xz;p.yz=rt(.28)*p.yz;return p;}
float SC(){return K<1.5?1.:K<2.5?1.12:K<3.5?1.3:1.2;}
vec2 mp(vec3 p){
if(K<.5){float a=atan(p.z,p.x),r=length(p.xz);
float d=(length(p*vec3(1.,1.12,1.))-.86-.03*cos(a*5.)*(1.-p.y*p.y))*.8;
d+=.2*exp(-8.*r*r)*smoothstep(.1,.6,p.y);
float c=max(r-.46*(.4+.6*pow(abs(cos(a*2.5)),1.6)),abs(p.y-(.72-.6*r*r))-.022);
c=min(c,cap(p,vec3(0,.7,0),vec3(0,.98,0),.035));return c<d?vec2(c,1.):vec2(d,0.);}
if(K<1.5){p.xy=rt(.4)*p.xy;vec3 q=p;q.x+=.14*q.y*q.y;q*=vec3(1.1,.82,1.45);
float d=(length(q)-.82)*.75;d+=.1*exp(-9.*dot(q.xz,q.xz))*smoothstep(0.,.6,q.y);return vec2(d,0.);}
if(K<2.5){float d=lf(p,0.,vec2(0,-.05),1.);d=sm(d,lf(p,.55,vec2(-.45,-.25),.78),.05);d=sm(d,lf(p,-.6,vec2(.5,-.2),.8),.05);return vec2(d*.7,0.);}
if(K<3.5){p.xy=rt(.45)*p.xy;float d=cap(p,vec3(-.62,-.08,0.),vec3(.45,.06,0.),.27);
d=sm(d,cap(p,vec3(-.05,.05,.02),vec3(.25,.68,.06),.19),.22);
d=sm(d,cap(p,vec3(.32,.02,0.),vec3(.88,-.3,.08),.2),.2);
d=sm(d,cap(p,vec3(-.38,-.05,0.),vec3(-.28,-.62,-.04),.17),.2);
d-=.012*sin(p.x*30.+p.y*6.);return vec2(d*.75,0.);}
vec3 q=p;q.y+=.5*q.x*q.x-.18;q.z*=1.5;float r=.23*(.8+.2*cos(q.x*9.));
return vec2(cap(q,vec3(-.9,0.,0.),vec3(.9,0.,0.),r)*.6,0.);}
vec2 M(vec3 p){float k=SC();vec2 r=mp(ob(p)*k);return vec2(r.x/k,r.y);}
vec3 nrm(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(M(p+e.xyy).x-M(p-e.xyy).x,M(p+e.yxy).x-M(p-e.yxy).x,M(p+e.yyx).x-M(p-e.yyx).x));}
vec3 col(vec3 q,float id,out float pw,out float ks){
float f=fb(q*3.),f2=fb(q*14.);
if(K<.5){if(id>.5){pw=8.;ks=.05;return mix(vec3(.1,.33,.05),vec3(.25,.5,.1),f);}
pw=110.;ks=.9;vec3 c=mix(vec3(.6,.02,.02),vec3(.93,.17,.05),clamp(f*1.3*(.6+q.y*.4),0.,1.));return c*(.9+.2*f2);}
if(K<1.5){pw=36.;ks=.5;float g=clamp(.5+.9*(q.x*.5+q.y*.45)+(f-.5)*.9,0.,1.);
vec3 c=mix(vec3(.82,.72,.1),vec3(.95,.45,.08),g);c=mix(c,vec3(.8,.12,.08),smoothstep(.55,1.,g)*.6);
c*=.92+.16*f2;return mix(c,vec3(1.,.9,.5),step(.86,ns(q*38.))*.35);}
if(K<2.5){pw=26.;ks=.28;float v=pow(abs(sin(q.y*9.+abs(q.x)*9.)),24.)*.5+exp(-abs(q.x)*30.)*.5;
return (mix(vec3(.05,.28,.05),vec3(.2,.5,.1),f)+v*vec3(.1,.18,.04))*(.9+.2*f2);}
if(K<3.5){pw=10.;ks=.12;vec3 c=mix(vec3(.62,.43,.24),vec3(.8,.62,.38),f);
c*=1.-smoothstep(.3,.7,sin(q.x*42.+f*6.))*.18;return c*(.85+.3*f2);}
pw=18.;ks=.2;return mix(vec3(.3,.16,.08),vec3(.5,.3,.17),f)*(.65+.7*f2);}
void main(){
vec2 uv=(gl_FragCoord.xy-.5*R)/R.y*2.;vec3 ro=vec3(0,0,4.2),rd=normalize(vec3(uv*.31,-1.));
float t=2.,md=9.;vec3 pm=ro;bool hit=false;
for(int i=0;i<80;i++){vec3 p=ro+rd*t;float d=M(p).x;if(d<md){md=d;pm=p;}if(d<.0012){hit=true;pm=p;break;}t+=d;if(t>7.)break;}
if(!hit&&md>.006){gl_FragColor=vec4(0.);return;}
float al=hit?1.:1.-smoothstep(0.,.006,md);
vec3 N=nrm(pm);float BS=K<.5?.6:K<1.5?1.4:K<2.5?1.2:K<3.5?3.:3.5,F=K<.5?30.:K<1.5?22.:K<2.5?26.:K<3.5?18.:20.;
float b0=fb(ob(pm)*F);
vec3 g=vec3(fb(ob(pm+vec3(.02,0,0))*F),fb(ob(pm+vec3(0,.02,0))*F),fb(ob(pm+vec3(0,0,.02))*F))-b0;
N=normalize(N-g*BS);
float oc=0.,sc=1.;for(int i=1;i<5;i++){float h=.05*float(i);oc+=(h-M(pm+N*h).x)*sc;sc*=.7;}
float ao=clamp(1.-1.8*oc,.15,1.);
float pw,ks;vec3 c=col(ob(pm),M(pm).y,pw,ks);
vec3 V=-rd,L=normalize(vec3(-.55,.75,.65)),L2=normalize(vec3(.8,.1,.3));
float dif=clamp((dot(N,L)+.3)/1.3,0.,1.),d2=max(dot(N,L2),0.);
float sp=pow(max(dot(N,normalize(L+V)),0.),pw)*ks;
vec3 r=reflect(-V,N);float bx=smoothstep(0.,.25,.28-abs(r.x+.3))*smoothstep(0.,.25,.3-abs(r.y-.55))*step(0.,r.z)*ks;
float fr=pow(1.-max(dot(N,V),0.),3.);
vec3 amb=mix(vec3(.07,.06,.08),vec3(.22,.25,.3),N.y*.5+.5);
vec3 o=c*(amb*ao+vec3(1.,.95,.88)*dif*1.15*ao+vec3(.35,.45,.6)*d2*.35);
o+=vec3(sp+bx*.6)+c*fr*.45+vec3(.8,.9,1.)*fr*ks*.25;
if(K>1.5&&K<2.5)o+=c*pow(max(dot(N,-L),0.),2.)*.35;
o=pow(o*1.05/(1.+.18*o),vec3(.4545));
gl_FragColor=vec4(o*al,al);}
