const canvas = document.getElementById('shader-canvas');
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.Camera();

const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1) },
    iChannel0: { value: new THREE.Texture() } // can leave empty if no audio texture
};

const material = new THREE.ShaderMaterial({
    uniforms,
    fragmentShader: `
        // From https://www.shadertoy.com/view/XdtfRB 
        // 
        // Credits to sangwhan 
        // 
        // Modified by @y4my4my4m
        uniform float iTime;
        uniform vec3 iResolution;
        uniform sampler2D iChannel0;

        vec3 C = vec3(0.12, 0.11, 0.37);
        float GWM = 1.15;
        float TM = 0.25;

        vec3 restrictHue(vec3 c) {
            return vec3(c.r * 0.50, c.g * 0.25, c.b);
        }

        float getAmp(float frequency) {
            return texture(iChannel0, vec2(frequency / 512.0, 0.0)).x;
        }

        float getWeight(float f) {
            return (getAmp(f - 2.0) + getAmp(f - 1.0) + getAmp(f + 2.0) + getAmp(f + 13.0) + getAmp(f)) / 5.0;
        }

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec3 backdrop;
        vec2 uvTrue = fragCoord.xy / iResolution.xy;
        vec2 uv = 2.5 * uvTrue - 1.33;

        float li, gw, ts, tsr, tsg, tsb;
        vec3 color = vec3(0.0);

        for(float i = 0.0; i < 5.0; i++) {
            uv.y += (0.2 * sin(uv.x + i / 7.0 - iTime * 0.4));
            float Y = uv.y + getWeight(pow(i, 2.0) * 20.0) * (texture(iChannel0, vec2(uvTrue.x, 1.0)).x - 0.5);
            li = 0.4 + pow(1.2 * abs(mod(uvTrue.x + i / 1.1 + iTime, 2.0) - 1.0), 2.0);
            gw = abs(li / (150.0 * Y));

            ts  = gw * (GWM + sin(iTime * TM));
            tsr = gw * (GWM + sin(iTime * TM * 1.10));
            tsg = gw * (GWM + sin(iTime * TM * 1.20));
            tsb = gw * (GWM + sin(iTime * TM * 1.50));
            color += vec3(tsr, tsg, tsb);

            backdrop = mix(C * normalize(color), C * normalize(color), C * normalize(color));
        }

        fragColor = vec4(restrictHue(color + backdrop), 1.0);
        }

        void main() {
            mainImage(gl_FragColor, gl_FragCoord.xy);
        }
    `
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(mesh);

function animate(time) {
    uniforms.iTime.value = time * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();