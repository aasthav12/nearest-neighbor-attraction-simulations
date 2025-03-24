// Perform computation when receive data from main.js
self.onmessage = function(event) {
    
    // Unpack data received from main.js
    var start = event.data.start;
    var end = event.data.end;
    var NUMPARTICLES = event.data.NUMPARTICLES;
    var particlesComputeData = new Float32Array(event.data.particlesComputeBuffer);
    var particlesRenderData = new Float32Array(event.data.particlesRenderBuffer);

    for (let i = start; i < end; i++) {
        
        /* ADD YOUR COMPUTATION HERE*/
        var neighbor_distance = Infinity;
        var coor = -1;

        for (let j = 0; j < NUMPARTICLES; j++){
            if (i === j){
                continue;
            }
            else {
                var x = particlesComputeData[2*j] - particlesComputeData[2*i];
                var y = particlesComputeData[2*j+1] - particlesComputeData[2*i+1];
                var distance = Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
                if (distance < neighbor_distance && distance > 3) {
                    neighbor_distance = distance;
                    coor = j;
                }
            }
        }
        // update the positions
        if (coor != -1){
            var x = 1;
            var y = 1;
            if(particlesComputeData[2 * i] > particlesComputeData[2 * coor]){
                x = -1;
            }
            if(particlesComputeData[2 * i + 1] > particlesComputeData[2 * coor + 1]){
                y = -1;
            }
            particlesRenderData[2 * i] = particlesComputeData[2 * i] + x;
            particlesRenderData[2 * i + 1] = particlesComputeData[2 * i + 1] + y;
        }
    }
    
    // Send back new data back to main.js
    postMessage(null);
}
