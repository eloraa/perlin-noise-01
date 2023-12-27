import { Clock, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderer } from 'three';
export class Effect {
  fragmentShader: string;
  vertexShader: string;
  DOM: HTMLElement;
  renderer: WebGLRenderer;
  scene: Scene;
  camera: OrthographicCamera;
  uniforms: any;
  clock: Clock;
  constructor({ element }: { element: HTMLElement }) {
    this.vertexShader = `
    void main() {
        gl_Position = vec4( position, 1.0 );
    }`;

    this.fragmentShader = `
    uniform vec2 u_resolution;
    uniform float u_time;

    float random(float x) {
 
        return fract(sin(x) * 10000.);
              
    }
    
    float noise(vec2 p) {
    
        return random(p.x + p.y * 10000.);
                
    }
    
    vec2 sw(vec2 p) { return vec2(floor(p.x), floor(p.y)); }
    vec2 se(vec2 p) { return vec2(ceil(p.x), floor(p.y)); }
    vec2 nw(vec2 p) { return vec2(floor(p.x), ceil(p.y)); }
    vec2 ne(vec2 p) { return vec2(ceil(p.x), ceil(p.y)); }
    
    float smoothNoise(vec2 p) {
    
        vec2 interp = smoothstep(0., 1., fract(p));
        float s = mix(noise(sw(p)), noise(se(p)), interp.x);
        float n = mix(noise(nw(p)), noise(ne(p)), interp.x);
        return mix(s, n, interp.y);
            
    }
    
    float fractalNoise(vec2 p) {
    
        float x = 0.;
        x += smoothNoise(p      );
        x += smoothNoise(p * 2. ) / 2.;
        x += smoothNoise(p * 4. ) / 4.;
        x += smoothNoise(p * 8. ) / 8.;
        x += smoothNoise(p * 16.) / 16.;
        x /= 1. + 1./2. + 1./4. + 1./8. + 1./16.;
        return x;
                
    }
    
    float movingNoise(vec2 p) {
     
        float x = fractalNoise(p + u_time * .05);
        float y = fractalNoise(p - u_time * .05);
        return fractalNoise(p + vec2(x, y));   
        
    }
    
    float nestedNoise(vec2 p) {
        
        float x = movingNoise(p);
        float y = movingNoise(p + 100.);
        return movingNoise(p + vec2(x, y));
        
    }
    void main()
    {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float n = nestedNoise(uv * .8);
        
        gl_FragColor = vec4(mix(vec3(.9, .9, .9), vec3(1., .0, .0), n), 1.);
    }`;

    this.DOM = element;

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });

    this.renderer.setSize(this.DOM.clientWidth, this.DOM.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.DOM.appendChild(this.renderer.domElement);

    this.camera = new OrthographicCamera(0, 0, 0, 0, 0, 0);

    this.scene = new Scene();
    this.clock = new Clock();

    const geometry = new PlaneGeometry(2, 2);

    this.uniforms = {
      u_time: { type: 'f', value: 1.0 },
      u_resolution: { type: 'v2', value: new Vector2() },
      u_mouse: { type: 'v2', value: new Vector2() },
    };

    const material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    });

    const mesh = new Mesh(geometry, material);
    this.scene.add(mesh);

    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize.bind(this));

    this.animate();

    this.DOM.addEventListener('mousemove', e => {
      this.uniforms.u_mouse.value.x = e.clientX;
      this.uniforms.u_mouse.value.y = e.clientY;
    });
  }

  onWindowResize() {
    this.renderer.setSize(this.DOM.clientWidth, this.DOM.clientHeight);
    this.uniforms.u_resolution.value.x = this.DOM.clientWidth;
    this.uniforms.u_resolution.value.y = this.DOM.clientHeight;
  }

  animate() {
    this.uniforms.u_time.value += this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }
}
