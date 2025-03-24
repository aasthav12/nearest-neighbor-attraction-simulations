const updateSpriteWGSL = `
    struct Particle {
        pos : vec2<f32>
    };

    struct Particles {
        particles : array<Particle>
    };

    @binding(0) @group(0) var<storage, read_write> particlesA : Particles;
    @binding(1) @group(0) var<storage, read_write> particlesB : Particles;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
        var index : u32 = GlobalInvocationID.x;

        // Get position of current particle
        var vPos = particlesA.particles[index].pos;

        // get the neighbor and the direction/distance locations
        var neighbor_distance: f32 = 1e20;
        var track_neighbor: u32 = index;

        // ADD YOUR COMPUTATION HERE 
            
        // Example Computation (DELETE THIS)
        for (var j : u32 = 0u; j < arrayLength(&particlesA.particles); j = j + 1u){
            if (j == index) {
                continue;
            }
            var x: f32 = particlesA.particles[j].pos.x - vPos.x;
            var y: f32 = particlesA.particles[j].pos.y - vPos.y;
            var distance: f32 = sqrt((x*x) + (y*y));

            // Update nearest neighbor
            if (distance > 0.003 && distance < neighbor_distance) {
                neighbor_distance = distance;
                track_neighbor = j;
            }
        }
        if (track_neighbor != index) {
            var x: f32 = particlesA.particles[track_neighbor].pos.x - vPos.x;
            var y: f32 = particlesA.particles[track_neighbor].pos.y - vPos.y;
            if (x > 0){
                x = 0.001;
            }
            else {
                x = -0.001;
            }
            if (y > 0){
                y = 0.001;
            }
            else {
                y = -0.001;
            }
            vPos.x += x;
            vPos.y += y;
        }

        // Write updated position to particlesB
        particlesB.particles[index].pos = vPos;
    }
`;

export default updateSpriteWGSL;