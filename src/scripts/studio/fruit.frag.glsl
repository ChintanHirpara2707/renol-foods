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
float tp(vec3 p,vec3 a,vec3 b,float r1,float r2){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h)-mix(r1,r2,h);}
float fl(vec3 p,vec3 a,vec3 b,float r1,float r2,float z){p.z*=z;a.z*=z;b.z*=z;return tp(p,a,b,r1,r2)/z;}
vec3 sector(vec3 p,float n){float a=atan(p.z,p.x),w=6.2831853/n;a=mod(a+.5*w,w)-.5*w;float r=length(p.xz);return vec3(r*cos(a),p.y,r*sin(a));}
float cl(vec3 x){vec3 i=floor(x),f=fract(x);float md=9.;
for(int a=-1;a<=1;a++)for(int b=-1;b<=1;b++)for(int c=-1;c<=1;c++){vec3 g=vec3(float(a),float(b),float(c));
vec3 o=vec3(hs(i+g),hs(i+g+vec3(7.1,3.3,1.7)),hs(i+g+vec3(2.9,9.4,5.1)));md=min(md,length(g+o-f));}
return md;}
float pit(vec3 x){return smoothstep(.34,.16,cl(x));}
vec2 bb(vec3 p,vec3 c,float ay,float ax,float r){vec3 q=p-c;q.xz=rt(ay)*q.xz;q.yz=rt(ax)*q.yz;
float d=length(q*vec3(1.,1.12,1.))-r;float a=atan(q.z,q.x),rr=length(q.xz);
float rs=.2*r*(.55+.45*abs(cos(a*2.5)));float u=rr/(rs*2.2);
d+=.07*exp(-u*u)*smoothstep(0.,.5*r,q.y);
float w=(rr-rs*2.2)/.05;d-=.02*exp(-w*w)*smoothstep(0.,.3*r,q.y);
return vec2(d,(rr<rs*2.3&&q.y>.55*r)?1.:0.);}
vec3 ob(vec3 p){p.xz=rt(A)*p.xz;p.yz=rt(.28)*p.yz;return p;}
float SC(){return K<.5?1.12:K<1.5?1.08:K<2.5?1.05:K<3.5?1.22:K<4.5?1.12:K<5.5?1.:1.;}
vec2 mp(vec3 p){
if(K<.5){float a=atan(p.z,p.x);vec3 q=p;q.y-=.05;
float d=length(q*vec3(1.,1.04,1.))-.72;d-=.02*cos(a*3.+q.y*2.);d-=.0045*sin(p.y*64.+3.*sin(a*3.+p.y*4.));
float t=tp(p,vec3(0.,-.4,0.),vec3(.04,-1.04,.03),.27,.035);d=sm(d*.8,t*.8,.22);
float s1=tp(p,vec3(-.1,.6,0.),vec3(-.2,.98,.04),.055,.04),s2=tp(p,vec3(.12,.6,.02),vec3(.26,.94,-.05),.05,.038);
float l1=fl(p,vec3(-.2,.98,.04),vec3(-.34,1.12,.04),.07,.03,3.5),l2=fl(p,vec3(.26,.94,-.05),vec3(.4,1.04,-.04),.065,.03,3.5);
float st=min(s1,s2),lv=min(l1,l2),sd=min(st,lv);
return sd<d?vec2(sd,lv<st?2.:1.):vec2(d,0.);}
if(K<1.5){float a=atan(p.z,p.x),r=length(p.xz);vec3 q=p;q.xz*=1.-.09*q.y;
float d=(length(q*vec3(1.,1.1,1.))-.9-.04*cos(a*5.)*(1.-smoothstep(-.6,.15,p.y)))*.75;
d+=.26*exp(-5.*r*r)*smoothstep(0.,.55,p.y);
d+=.12*exp(-9.*r*r)*smoothstep(0.,.55,-p.y);
vec3 s=p;float u=max(p.y-.45,0.);s.x-=.4*u*u;
float c=cap(s,vec3(0,.42,0),vec3(0,1.02,0),.04);
return c<d?vec2(c,1.):vec2(d,0.);}
if(K<2.5){float r=length(p.xz);vec3 q=p*vec3(1.,1.04,1.);vec3 n=normalize(q+1e-4);
float fct=max(max(abs(n.x),abs(n.y)),abs(n.z));
float d=(length(q)-.84+.07*(fct-.75))*.75;
d+=.14*exp(-9.*r*r)*smoothstep(.3,.8,p.y);
float collar=cap(p,vec3(0,.74,0),vec3(0,.86,0),.15);
vec3 s=sector(p,6.);float sp=fl(s,vec3(.13,.84,0.),vec3(.3,1.12,0.),.07,.008,2.2);
float cr=min(collar,sp);return cr<d?vec2(cr,1.):vec2(d,0.);}
if(K<3.5){vec2 b1=bb(p,vec3(-.4,-.3,.06),.5,.7,.5),b2=bb(p,vec3(.42,-.22,-.1),-.6,.5,.47),b3=bb(p,vec3(.02,.42,.1),.2,.6,.45);
float d=sm(sm(b1.x,b2.x,.04),b3.x,.04);
float m=b1.x<b2.x?(b1.x<b3.x?b1.y:b3.y):(b2.x<b3.x?b2.y:b3.y);
return vec2(d*.8,m);}
if(K<4.5){float r=length(p.xz);vec3 q=p;q.xz*=clamp(1.+.8*(.2-p.y),.55,2.2);
float d=(length(q*vec3(1.,.95,1.))-.76)*.65;d+=.1*exp(-7.*r*r)*smoothstep(.2,.6,p.y);
vec3 s=sector(p,7.);float lf1=fl(s,vec3(.04,.76,0.),vec3(.55,.7,0.),.075,.03,3.2);
float st=cap(p,vec3(0,.7,0),vec3(.04,1.0,.04),.04);
float cy=min(lf1,st);return cy<d?vec2(cy,1.):vec2(d,0.);}
if(K<5.5){float r=length(p.xz);float d=(length(p*vec3(1.,1.03,1.))-.84)*.8;
d+=.1*exp(-16.*r*r)*smoothstep(.2,.7,p.y);d+=.05*exp(-34.*r*r)*smoothstep(.2,.7,-p.y);
d=min(d,(length(p-vec3(0.,-.8,0.))-.05)*.9);
float btn=cap(p,vec3(0,.74,0),vec3(0,.84,0),.065);return btn<d?vec2(btn,1.):vec2(d,0.);}
float r=length(p.xz);vec3 q=p;q.xz*=1.+.08*q.y;float d=(length(q*vec3(1.,.9,1.))-.84)*.78;
d+=.09*exp(-16.*r*r)*smoothstep(.2,.7,-p.y);
vec3 s=sector(p,4.);float sp=fl(s,vec3(.03,-.84,0.),vec3(.2,-.78,0.),.035,.01,2.2);
float ring=cap(p,vec3(0,-.86,0),vec3(0,-.8,0),.06);float cr=min(sp,ring);
return cr<d?vec2(cr,1.):vec2(d,0.);}
vec2 M(vec3 p){float k=SC();vec2 r=mp(ob(p)*k);return vec2(r.x/k,r.y);}
vec3 nrm(vec3 p){vec2 e=vec2(.002,0);return normalize(vec3(M(p+e.xyy).x-M(p-e.xyy).x,M(p+e.yxy).x-M(p-e.yxy).x,M(p+e.yyx).x-M(p-e.yyx).x));}
vec3 col(vec3 q,float id,out float pw,out float ks){
float f=fb(q*3.),f2=fb(q*14.);vec3 s=q*SC();
if(K<.5){
if(id>1.5){pw=22.;ks=.2;return mix(vec3(.18,.36,.09),vec3(.42,.14,.2),f);}
if(id>.5){pw=26.;ks=.3;return mix(vec3(.5,.07,.2),vec3(.78,.15,.3),f);}
pw=34.;ks=.4;vec3 c=mix(vec3(.13,.008,.065),vec3(.38,.035,.19),clamp(f*1.5,0.,1.));
c*=1.-.14*smoothstep(.2,.9,sin(s.y*64.+3.*sin(atan(s.z,s.x)*3.+s.y*4.)));
c=mix(c,vec3(.34,.12,.13),smoothstep(-.35,-.8,s.y)*.6);
c=mix(c,vec3(.42,.07,.22),smoothstep(.3,.7,s.y)*.4);return c*(.88+.24*f2);}
if(K<1.5){if(id>.5){pw=8.;ks=.05;return mix(vec3(.24,.15,.06),vec3(.36,.26,.1),f);}
pw=70.;ks=1.1;float a=atan(q.z,q.x);
float g=clamp(.5+.6*q.x+.25*q.y+(f-.5)*.8,0.,1.);
vec3 c=mix(vec3(.66,.7,.16),vec3(.78,.07,.08),smoothstep(.2,.62,g));
float st=pow(abs(sin(a*13.+f*7.)),4.)*(.4+.6*f2);
c=mix(c,vec3(.42,.02,.05),st*.4*smoothstep(.25,.7,g));
c=mix(c,vec3(.7,.72,.2),smoothstep(.45,.85,abs(q.y))*.5);
c=mix(c,vec3(.95,.85,.55),step(.88,ns(q*60.))*.4);
return c*(.92+.16*f2);}
if(K<2.5){if(id>.5){pw=10.;ks=.1;return mix(vec3(.3,.07,.04),vec3(.52,.16,.07),f);}
pw=22.;ks=.32;float g=clamp(.5+.55*s.x+.35*s.y+(f-.5)*.9,0.,1.);
vec3 c=mix(vec3(.5,.035,.04),vec3(.86,.19,.06),smoothstep(.15,.85,g));
c=mix(c,vec3(.4,.02,.06),smoothstep(.45,.0,g)*.5);
c*=.85+.3*f2;return mix(c,vec3(1.,.55,.3),step(.88,ns(s*45.))*.12);}
if(K<3.5){if(id>.5){pw=8.;ks=.08;return mix(vec3(.08,.05,.12),vec3(.22,.15,.24),f);}
pw=16.;ks=.5;vec3 c=mix(vec3(.03,.045,.2),vec3(.08,.12,.38),f);
c=mix(c,vec3(.5,.58,.74),clamp(.12+.4*f2*(.4+.6*f),0.,.4));return c;}
if(K<4.5){if(id>.5){pw=14.;ks=.2;return mix(vec3(.07,.3,.05),vec3(.26,.52,.1),f);}
pw=100.;ks=1.;vec3 c=mix(vec3(.5,.02,.04),vec3(.93,.1,.08),clamp(f*1.3+.2+.2*s.y,0.,1.));
float pt=pit(s*13.);c=mix(c,vec3(.95,.8,.3),pt*.95);c*=1.-.3*smoothstep(.4,.22,cl(s*13.))*(1.-pt);
return c*(.92+.16*f2);}
if(K<5.5){if(id>.5){pw=8.;ks=.05;return mix(vec3(.3,.4,.1),vec3(.45,.35,.12),f);}
pw=30.;ks=.5;vec3 c=mix(vec3(.88,.28,.02),vec3(.98,.5,.07),clamp(.5+.5*s.x+.3*s.y+(f-.5)*.6,0.,1.));
c=mix(c,c*.72,smoothstep(.6,.8,ns(s*75.)));c=mix(c,vec3(1.,.8,.3),step(.9,ns(s*40.))*.2);
return c*(.92+.16*f2);}
if(id>.5){pw=10.;ks=.06;return mix(vec3(.25,.22,.08),vec3(.42,.36,.14),f);}
pw=24.;ks=.35;vec3 c=mix(vec3(.5,.68,.22),vec3(.76,.8,.33),clamp(f*1.4,0.,1.));
c=mix(c,vec3(.9,.46,.36),smoothstep(.1,.85,.5*s.x+.4*f+.1)*.5);c=mix(c,vec3(.36,.4,.12),smoothstep(.55,.8,ns(s*9.))*.35);
c*=.88+.22*f2;return c;}
void main(){
vec2 uv=(gl_FragCoord.xy-.5*R)/R.y*2.;vec3 ro=vec3(0,0,4.2),rd=normalize(vec3(uv*.31,-1.));
float t=2.,md=9.;vec3 pm=ro;bool hit=false;
for(int i=0;i<80;i++){vec3 p=ro+rd*t;float d=M(p).x;if(d<md){md=d;pm=p;}if(d<.0012){hit=true;pm=p;break;}t+=d;if(t>7.)break;}
if(!hit&&md>.006){gl_FragColor=vec4(0.);return;}
float al=hit?1.:1.-smoothstep(0.,.006,md);
vec3 N=nrm(pm);float BS=K<.5?.8:K<1.5?.4:K<2.5?1.:K<3.5?.3:K<4.5?.5:K<5.5?1.8:1.2,F=K<.5?34.:K<1.5?36.:K<2.5?40.:K<3.5?30.:K<4.5?32.:K<5.5?70.:24.;
float b0=fb(ob(pm)*F);
vec3 g=vec3(fb(ob(pm+vec3(.02,0,0))*F),fb(ob(pm+vec3(0,.02,0))*F),fb(ob(pm+vec3(0,0,.02))*F))-b0;
N=normalize(N-g*BS);
if(K>3.5&&K<4.5){float sc=SC();float p0=pit(ob(pm)*sc*13.);
vec3 gp=vec3(pit(ob(pm+vec3(.02,0,0))*sc*13.),pit(ob(pm+vec3(0,.02,0))*sc*13.),pit(ob(pm+vec3(0,0,.02))*sc*13.))-p0;N=normalize(N-gp*.8);}
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
if(K>2.5&&K<3.5)o+=vec3(.5,.62,.85)*fr*.34;
o=pow(o*1.05/(1.+.18*o),vec3(.4545));
gl_FragColor=vec4(o*al,al);}
