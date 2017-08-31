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
    readFile('shader.vs', (res)=>{vs = res; if (typeof fs !== 'undefined') onShaderLoad();})
    readFile('shader.fs', (res)=>{fs = res; if (typeof vs !== 'undefined') onShaderLoad();})

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
        canvas.style.opacity = 1
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
            },
            uniformLocations: {
              projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
              modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', main)