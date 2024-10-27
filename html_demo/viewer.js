// Load cube data
import { dataArray } from './cube.js';

// Function to load the data dynamically based on the selected source
async function loadData(source) {
    try {
        const { dataArray } = await import(`./${source}`);
        // console.log(dataArray); // Verify data is loaded

        // Call any function or logic here that needs to use the loaded dataArray
        updateView(dataArray);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

// Function to update the view with the loaded data
function updateView(dataArray) {
    // Your code to handle displaying or processing the dataArray
    // console.log("View updated with new data:", dataArray);
    updateEverything(dataArray);
}

// Set up event listener for changes to the select element
document.addEventListener("DOMContentLoaded", function() {
    const selectElement = document.getElementById("data-source");

    // Load the initial data source
    loadData(selectElement.value);

    // Add event listener to load data when selection changes
    selectElement.addEventListener("change", (event) => {
        loadData(event.target.value);
    });
});

document.addEventListener("DOMContentLoaded", function(){updateEverything(dataArray)});

function updateEverything(dataArray) {
    // console.log(dataArray); // Verify data is loaded

    // Set up canvas and WebGL context
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    function resizeCanvas() {
        canvas.width = Math.min(window.innerWidth, 640);
        canvas.height = Math.min(window.innerHeight, 640);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Vertex shader program
    const vsSource = `
        attribute vec4 aVertexPosition;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
    `;

    // Fragment shader program
    const fsSource = `
        void main(void) {
            gl_FragColor = vec4(0., 0., 0., 1.0); // Black color
        }
    `;

    // Fragment shader program for edges
    const fsSourceEdges = `
        void main(void) {
            gl_FragColor = vec4(0.0, 0.72, 0.08, 1.0); // Green color
        }
    `;
    // Initialize shaders
    function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }

        return shaderProgram;
    }

    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    const shaderProgramEdges = initShaderProgram(gl, vsSource, fsSourceEdges);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    const programInfoEdges = {
        program: shaderProgramEdges,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgramEdges, 'aVertexPosition'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgramEdges, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgramEdges, 'uModelViewMatrix'),
        },
    };

    // Define cube vertices
    const cubeVertices = [
        // Front face
        -0.02, -0.02,  0.02,
         0.02, -0.02,  0.02,
         0.02,  0.02,  0.02,
        -0.02,  0.02,  0.02,
        // Back face
        -0.02, -0.02, -0.02,
        -0.02,  0.02, -0.02,
         0.02,  0.02, -0.02,
         0.02, -0.02, -0.02,
        // Top face
        -0.02,  0.02, -0.02,
        -0.02,  0.02,  0.02,
         0.02,  0.02,  0.02,
         0.02,  0.02, -0.02,
        // Bottom face
        -0.02, -0.02, -0.02,
         0.02, -0.02, -0.02,
         0.02, -0.02,  0.02,
        -0.02, -0.02,  0.02,
        // Right face
         0.02, -0.02, -0.02,
         0.02,  0.02, -0.02,
         0.02,  0.02,  0.02,
         0.02, -0.02,  0.02,
        // Left face
        -0.02, -0.02, -0.02,
        -0.02, -0.02,  0.02,
        -0.02,  0.02,  0.02,
        -0.02,  0.02, -0.02,
    ];

    const cubeEdgesIndices = [
        0,  1,  1,  2,  2,  3,  3,  0,    // front edges
        4,  5,  5,  6,  6,  7,  7,  4,    // back edges
        0,  4,  1,  7,  2,  6,  3,  5     // connecting edges
    ];

    const cubeIndices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,    12, 14, 15,    // bottom
        16, 17, 18,    16, 18, 19,    // right
        20, 21, 22,    20, 22, 23,    // left
    ];

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    const edgesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, edgesBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeEdgesIndices), gl.STATIC_DRAW);

    // Set up mouse rotation
    let mouseDown = false;
    let lastMouseX = null;
    let lastMouseY = null;

    const centerOfRotation = [0, 0, 0];
    const initialRotationX = 45; // Initial rotation angle around the X axis in degrees
    const initialRotationY = 30; // Initial rotation angle around the Y axis in degrees
    const initialRotationZ = 60; // Initial rotation angle around the Z axis in degrees

    let rotationMatrix = mat4.create();
    let initialRotationMatrix = mat4.create();

    // Apply initial rotation
    mat4.rotate(initialRotationMatrix, initialRotationMatrix, glMatrix.toRadian(initialRotationX), [1, 0, 0]);
    mat4.rotate(initialRotationMatrix, initialRotationMatrix, glMatrix.toRadian(initialRotationY), [0, 1, 0]);
    mat4.rotate(initialRotationMatrix, initialRotationMatrix, glMatrix.toRadian(initialRotationZ), [0, 0, 1]);

    mat4.multiply(rotationMatrix, initialRotationMatrix, rotationMatrix);

    let isRightMouseButton = false;

    canvas.onmousedown = (event) => {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

        // Check if the right mouse button is pressed
        if (event.button === 2) {
            isRightMouseButton = true;
        } else {
            isRightMouseButton = false;
        }
    };

    canvas.onmouseup = () => {
        mouseDown = false;
        isRightMouseButton = false;
    };

    canvas.onmousemove = (event) => {
        if (!mouseDown) return;

        const newX = event.clientX;
        const newY = event.clientY;

        const deltaX = newX - lastMouseX;
        const deltaY = newY - lastMouseY;

        const newRotationMatrix = mat4.create();

        // Translate to center of rotation
        mat4.translate(newRotationMatrix, newRotationMatrix, centerOfRotation);

        if (isRightMouseButton) {
            // Right mouse button for clockwise/counterclockwise rotation
            mat4.rotate(newRotationMatrix, newRotationMatrix, glMatrix.toRadian(deltaX / 5), [0, 0, 1]);
        } else {
            // Left mouse button for normal rotation
            mat4.rotate(newRotationMatrix, newRotationMatrix, glMatrix.toRadian(deltaX / 5), [0, 1, 0]);
            mat4.rotate(newRotationMatrix, newRotationMatrix, glMatrix.toRadian(deltaY / 5), [1, 0, 0]);
        }

        // Translate back
        mat4.translate(newRotationMatrix, newRotationMatrix, [-centerOfRotation[0], -centerOfRotation[1], -centerOfRotation[2]]);

        mat4.multiply(rotationMatrix, newRotationMatrix, rotationMatrix);

        lastMouseX = newX;
        lastMouseY = newY;
    };

    // Prevent the context menu from appearing on right-click
    canvas.oncontextmenu = (event) => {
        event.preventDefault();
    };

    let lastTouchX = null;
    let lastTouchY = null;

    canvas.addEventListener('touchstart', (event) => {
        if (event.touches.length === 1) {
            mouseDown = true;
            lastTouchX = event.touches[0].clientX;
            lastTouchY = event.touches[0].clientY;
        }
    });

    canvas.addEventListener('touchend', () => {
        mouseDown = false;
    });

    canvas.addEventListener('touchmove', (event) => {
        if (!mouseDown || event.touches.length !== 1) return;

        const newTouchX = event.touches[0].clientX;
        const newTouchY = event.touches[0].clientY;

        const deltaX = newTouchX - lastTouchX;
        const deltaY = newTouchY - lastTouchY;

        const newRotationMatrix = mat4.create();

        // Apply rotations similarly as in mousemove event
        if (isRightMouseButton) {
            mat4.rotate(newRotationMatrix, newRotationMatrix, glMatrix.toRadian(deltaX / 5), [0, 0, 1]);
        } else {
            mat4.rotate(newRotationMatrix, newRotationMatrix, glMatrix.toRadian(deltaX / 5), [0, 1, 0]);
            mat4.rotate(newRotationMatrix, newRotationMatrix, glMatrix.toRadian(deltaY / 5), [1, 0, 0]);
        }

        mat4.multiply(rotationMatrix, newRotationMatrix, rotationMatrix);

        lastTouchX = newTouchX;
        lastTouchY = newTouchY;
    });

    const cubePositions = [];

    // Iterate through the dataArray
    dataArray.forEach((layer, z) => {
      layer.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value === 1) {
            // If value is 1, add the position to cubePositions array
            cubePositions.push([x*0.04-0.42, y*0.04-0.42, z*0.04-0.42]);
          }
        });
      });
    });

    function drawScene(gl, programInfo, buffers, drawEdges = false) {
        gl.clearColor(0.94, 1.0, 0.94, 1.0)
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 1000.0;
        const projectionMatrix = mat4.create();

        mat4.ortho(projectionMatrix, -aspect, aspect, -1, 1, zNear, zFar);

        const modelViewMatrix = mat4.create();

        // Translate to the desired viewing position
        mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -1.0]);

        cubePositions.forEach(position => {
            const cubeMatrix = mat4.create();

            // Apply cube position translation
            mat4.translate(cubeMatrix, cubeMatrix, position);

            // Translate to center of rotation
            mat4.translate(cubeMatrix, cubeMatrix, centerOfRotation);
            // Apply rotation
            mat4.multiply(cubeMatrix, rotationMatrix, cubeMatrix);
            // Translate back from center of rotation
            mat4.translate(cubeMatrix, cubeMatrix, [-centerOfRotation[0], -centerOfRotation[1], -centerOfRotation[2]]);

            mat4.multiply(cubeMatrix, modelViewMatrix, cubeMatrix);

            {
                const numComponents = 3;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 0;
                const offset = 0;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexPosition,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
            }

            gl.useProgram(programInfo.program);

            gl.uniformMatrix4fv(
                programInfo.uniformLocations.projectionMatrix,
                false,
                projectionMatrix);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.modelViewMatrix,
                false,
                cubeMatrix);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

            if (drawEdges) {
                gl.useProgram(programInfoEdges.program);
                gl.uniformMatrix4fv(
                    programInfoEdges.uniformLocations.projectionMatrix,
                    false,
                    projectionMatrix);
                gl.uniformMatrix4fv(
                    programInfoEdges.uniformLocations.modelViewMatrix,
                    false,
                    cubeMatrix);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.edges);
                gl.drawElements(gl.LINES, 24, gl.UNSIGNED_SHORT, 0);
            }
        });
    }
    const buffers = {
        position: positionBuffer,
        indices: indexBuffer,
        edges: edgesBuffer,
    };
    function render() {
        drawScene(gl, programInfo, buffers, true);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}