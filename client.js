/**
 * @param {string} fileName
 * @param {function} callback(res)
*/
function readFile(fileName, callback) {
    let req = new XMLHttpRequest()
    req.open('GET', fileName, true)
    req.onreadystatechange = () => {
        if (req.readyState === XMLHttpRequest.DONE) {
            callback((req.status === 200) ? req.responseText : null)
        }
    }
    req.send()
}

function main() {
    let status = document.querySelector('#status')
    status.textContent = 'Initializing WebGL';
    const canvas = document.querySelector('#glCanvas')
    const gl = canvas.getContext('webgl')

    if (!gl) {
        alert('Unable to initialize WebGL.'
        + ' Your browser or machine may not support it.')
        return
    }

    var vsSrc, fsSrc
    readFile('shader.vs', (res)=>{vsSrc = res; if (typeof fsSrc !== 'undefined') onShaderLoad();})
    readFile('shader.fs', (res)=>{fsSrc = res; if (typeof vsSrc !== 'undefined') onShaderLoad();})

    function loadShader(type, source) {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
            gl.deleteShader(shader)
            return null
        }
        return shader
    }

    function onShaderLoad() {
        // canvas.style.opacity = 1
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        const vs = loadShader(gl.VERTEX_SHADER, vsSrc)
        const fs = loadShader(gl.FRAGMENT_SHADER, fsSrc)
        const shaderProgram = gl.createProgram()
        gl.attachShader(shaderProgram, vs)
        gl.attachShader(shaderProgram, fs)
        gl.linkProgram(shaderProgram)

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize WebGL shader program: ' + gl.getProgramInfoLog(shaderProgram))
            return
        }
        
        const programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor')
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')
            }
        }

        const buffers = initBuffers(gl)
        drawScene(gl, programInfo, buffers)
    }
}

function initBuffers(gl) {
    const positions = [
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0
    ]
    const colors = [
        1.0,  1.0,  1.0,  1.0,    // white
        1.0,  0.0,  0.0,  1.0,    // red
        0.0,  1.0,  0.0,  1.0,    // green
        0.0,  0.0,  1.0,  1.0,    // blue
    ]

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)

    return { position: positionBuffer, color: colorBuffer }
}

function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const fov = 45 * Math.PI / 180
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.1
    const zFar = 100.0
    const projectionMatrix = mat4.create()

    mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar)

    const modelViewMatrix = mat4.create()

    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0])
        
    {
        const numComponents = 2
        const type = gl.FLOAT
        const normalize = false
        const stride = 0
        const offset = 0
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position)
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexPosition,
            numComponents,
            type,
            normalize,
            stride,
            offset)
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexPosition)
    }
    
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
        gl.vertexAttribPointer(
            programInfo.attribLocations.vertexColor,
            numComponents,
            type,
            normalize,
            stride,
            offset);
        gl.enableVertexAttribArray(
            programInfo.attribLocations.vertexColor);
    }

    gl.useProgram(programInfo.program)

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix)
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix)

    {
        const offset = 0
        const vertexCount = 4
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount)
    }
}

document.addEventListener('DOMContentLoaded', main)
