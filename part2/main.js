/*
*   CSE 113 Assignment 4 Part 2
*   Web Worker (Multithreaded)
*/

function main() {
    // Number of particles
    const NUMPARTICLES = 8192;

    // Number of workers
    const NUMWORKERS = 8;
    
    // Get canvas and context 
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext("2d");

    // Draw canvas background
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Create buffers for allowing shared memory
    var particlesComputeBuffer = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * (NUMPARTICLES * 2));
    var particlesRenderBuffer = new SharedArrayBuffer(Float32Array.BYTES_PER_ELEMENT * (NUMPARTICLES * 2));

    // Create arrays to store each particles' position value
    var particlesComputeData = new Float32Array(particlesComputeBuffer); // Use for computation to avoid data race
    var particlesRenderData = new Float32Array(particlesRenderBuffer); // Use for writing new particles' location for rendering

    // Go through all particles then declare their initial position in canvas
    for (let i = 0; i < NUMPARTICLES; i++) {
        // Get random position of each particle
        var xPos = Math.random() * canvas.width;
        var yPos = Math.random() * canvas.height

        particlesComputeData[2 * i] = xPos; // X position
        particlesComputeData[2 * i + 1] = yPos; // Y position

        particlesRenderData[2 * i] = xPos; // X position
        particlesRenderData[2 * i + 1] = yPos; // Y position

        // Draw a particle into canvas
        context.fillStyle = "white";
        context.fillRect(particlesRenderData[2 * i], particlesRenderData[2 * i + 1], 3, 3);
    }

    // Variables for performance measurement (fps)
    var updatePerformance = true;
    var currentTime, previousTime;
    currentTime = previousTime = performance.now();
    var totalFramePerSecond = 0;
    var frameCounter = 0;

    // Initialize a worker
    // var worker = new Worker('./webWorker.js');
    var workers = [];
    

    for (let i = 0; i < NUMWORKERS; i++) {
        workers[i] = new Worker('./webWorker.js');
    }
    // Update Particles
    function frame() {
        var particle = NUMPARTICLES / NUMWORKERS;
        for (let i = 0; i < NUMWORKERS; i++) {
            var start = i * particle;
            var end = start + particle;

            // Gather all data together that will get send over to worker
            var transferData = {
                start: start,
                end: end,
                NUMPARTICLES: NUMPARTICLES,
                particlesComputeBuffer: particlesComputeBuffer,
                particlesRenderBuffer: particlesRenderBuffer
            };

            // Send work to web worker
            workers[i].postMessage(transferData);
        }
            // Receive work done by web worker
        var complete_workers = 0;
        for (let j = 0; j < NUMWORKERS; j++){
            workers[j].onmessage = function() {
                complete_workers++;
                if (complete_workers == NUMWORKERS){
                        // Erase all particles
                    context.clearRect(0, 0, canvas.width, canvas.height);

                        // Draw canvas background
                        context.fillStyle = "black";
                        context.fillRect(0, 0, canvas.width, canvas.height);

                        // Draw particles with new data into canvas and
                        // update particlesComputeData with particlesRenderData
                        for (let i = 0; i < NUMPARTICLES; i++) {
                            context.fillStyle = "white";
                            context.fillRect(particlesRenderData[2 * i], particlesRenderData[2 * i + 1], 3, 3);
                            particlesComputeData[2*i] = particlesRenderData[2*i];
                            particlesComputeData[2*i+1] = particlesRenderData[2*i+1];
                        }

                        // Measure performance
                        currentTime = performance.now();
                        var elapsedTime = currentTime - previousTime;
                        previousTime = currentTime;
                        var framePerSecond = Math.round(1 / (elapsedTime / 1000));
                        totalFramePerSecond += framePerSecond;
                        frameCounter++;

                        if(updatePerformance) {
                            updatePerformance = false;

                            let averageFramePerSecond = Math.round(totalFramePerSecond / frameCounter);
                            
                            frameCounter = 0;
                            totalFramePerSecond = 0;

                            document.getElementById("fps").innerHTML = `FPS:  ${averageFramePerSecond}`;

                            // Update FPS every 100ms
                            setTimeout(() => {
                                updatePerformance = true;
                            }, 100);
                        }
                        requestAnimationFrame(frame);
                        // if (complete_workers == NUMWORKERS){
                        //     complete_workers = 0;
                        //     requestAnimationFrame(frame);
                        // }
                    }
                }
            }
    }
    requestAnimationFrame(frame);
}
main();
