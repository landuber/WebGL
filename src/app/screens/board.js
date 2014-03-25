define(['lodash', 'q', 'common/viewUtil', 'facades/boardFacade'],
    function(_, Q, viewUtil, boardFacade) {

        var g_points = [],
            g_colors = [];
        // Vertext Shader Program
        var VSHADER_SOURCE =
            'attribute vec4 a_Position;\n' +
            'uniform float u_CosB, u_SinB;' +
            'void main() {\n' +
            '   gl_Position.x = a_Position.x * u_CosB - a_Position.y * u_SinB;\n' +
            '   gl_Position.y = a_Position.x * u_SinB + a_Position.y * u_CosB;\n' +
            '   gl_Position.z = a_Position.z;\n' +
            '   gl_Position.w = 1.0;\n' +
            '}\n';

        // Fragment shader program
        var FSHADER_SOURCE =
            'precision mediump float;\n' +
            'uniform vec4 u_FragColor;\n' +
            'void main() {\n' +
            '   gl_FragColor = u_FragColor;\n' + // Set the color
        '}\n';

        // Public Methods
        function load() {
            return boardFacade.getData().then(function() {
                var canvas = document.getElementById('webgl');

                var gl = getWebGLContext(canvas);

                if (!gl) {
                    console.log('Failed to get the rendering context for WebGL');
                    return;
                }


                //Initialize shaders
                if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
                    console.log('Failed to initialize shaders');
                    return;
                }

                var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
                if (!u_FragColor) {
                    console.log('Failed to get u_FragColor variable');
                    return;
                }

                gl.clearColor(0.0, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);

                initVertexBuffers(gl, u_FragColor);


                canvas.onmousedown = function(ev) {
                    click(ev, gl, canvas, u_FragColor);
                };


                viewUtil.showScreen('home-screen');
            });
        }

        function click(ev, gl, canvas, u_FragColor) {

            // Get the storage location of attribute variable
            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

            if (a_Position < 0) {
                console.log('Failed to get the storage location of a_Position');
                return;
            }

            var x = ev.clientX;
            var y = ev.clientY;

            var rect = ev.target.getBoundingClientRect();

            x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

            g_points.push([x, y]);

            if (x >= 0.0 && y >= 0.0) {
                g_colors.push([1.0, 0.0, 0.0, 1.0]);
            } else if (x < 0.0 && y < 0.0) {
                g_colors.push([0.0, 1.0, 0.0, 1.0]);
            } else {
                g_colors.push([1.0, 1.0, 1.0, 1.0]);
            }


            gl.clear(gl.COLOR_BUFFER_BIT);

            var len = g_points.length;
            for (var i = 0; i < len; i++) {
                var xy = g_points[i];
                var rgba = g_colors[i];

                gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);


                gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
                // Draw a point 
                gl.drawArrays(gl.POINTS, 0, 1);
            }
        }

        function initVertexBuffers(gl, u_FragColor) {

            gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);
            var vertices = new Float32Array([-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, -0.5]);

            var vertexBuffer = gl.createBuffer();
            if (!vertexBuffer) {
                console.log("Failed to create a vertex buffer.");
                return -1;
            }

            //bind the buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            var a_Position = gl.getAttribLocation(gl.program, 'a_Position');

            gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a_Position);

            ininRotationParams(gl);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }

        function ininRotationParams(gl) {
            var ANGLE = 90; // degrees
            var radian = Math.PI * ANGLE / 180;

            var u_SinB = gl.getUniformLocation(gl.program, 'u_SinB');
            var u_CosB = gl.getUniformLocation(gl.program, 'u_CosB');

            gl.uniform1f(u_SinB, Math.sin(radian));
            gl.uniform1f(u_CosB, Math.cos(radian));
        }

        return {
            load: load
        };

    });