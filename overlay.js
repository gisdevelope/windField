function createOverlay(a) {
    function b(w) {
        var z = e[0] + g * w[0],
            A = f[0] + h * w[1];
        return [A, z]
    }
    console.log(a)
    for (var c = formatDate(a), e = c[0].map(function(w) { return w.x }), 
        f = c.map(function(w) { return w[0].y }), 
        g = e[1] - e[0], h = f[1] - f[0], 
        k = c.map(function(w) { return w.map(function(z) { return z.v }) }), 
        l = [], m = -50; 70 >= m; m += 1.5) l.push(m);
    for (var n = d3.scaleLinear().domain([l[0],-40,-30 -20, -10, 0, 10, 20, 30, 40,50,60, l[l.length - 1]]).range([d3.rgb(145, 115, 203, 0.5),d3.rgb(145, 115, 203, 0.5),d3.rgb(145, 115, 203, 0.5), d3.rgb(145, 115, 203, 0.5), d3.rgb(120, 210, 198, 0.5), , d3.rgb(111, 152, 182, 0.5), d3.rgb(75, 160, 181, 0.5), d3.rgb(59, 124, 66, 0.5), d3.rgb(196, 180, 82, 0.5), d3.rgb(170, 75, 83, 0.5), d3.rgb(101, 66, 90, 0.5), d3.rgb(101, 66, 90, 0.5), d3.rgb(101, 66, 90, 0.5)]), 
        o = [], q = 1; q < l.length; q++) {
        var r = l[q - 1],
            s = l[q],
            t = MarchingSquaresJS.IsoBands(k, r, s - r);
        if (t.length) {
            var u = t.map(function(w) { return w.map(function(z) { return b(z) }) });
            o.push({ coords: u, color: n(q), val: l[q] })
        }
    }
    return {
        isoBands: o,
        draw: function draw(w, z) {
            var A = w.getContext('2d'),
                B = z.latLngToContainerPoint([0, 180]),
                C = z.latLngToContainerPoint([0, -180]),
                D = B.x - C.x,
                E = [];
            B.x < w.width && E.push(D), 0 < C.x && E.push(-D);
            var F = function(G) { return function(H) { var I = z.latLngToContainerPoint(H); return [I.x + G, I.y] } };
            o.forEach(function(G) {
                E.forEach(function(H) {
                    var I = createPath(G.coords, F(H));
                    A.fillStyle = G.color, A.fill(I, 'evenodd')
                })
            })
        }
    }
}

function formatDate(a) {
    var b = a.field,
        c = Math.abs(a.x1 - a.x0) / (a.w - 1),
        e = Math.abs(a.y1 - a.y0) / (a.h - 1),
        f = [];
    return b.forEach(function(g, h) {
        g.forEach(function(k, l) {
            var m = Math.sqrt(Math.pow(k.x, 2) + Math.pow(k.y, 2));
            f[l] || (f[l] = []), f[l][h] = { x: a.x0 + c * h, y: a.y0 + e * l, v: m }
        })
    }), f
}

function createPath(a, b) {
    var c = '';
    return a.forEach(function(e) {
        e.forEach(function(f, g) {
            var h = b(f);
            c += 0 === g ? 'M' : 'L', c += h[0] + ',' + h[1], g === e.length - 1 && (c += 'Z')
        })
    }), new Path2D(c)
}
