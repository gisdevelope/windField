'use strict';

var Vector = function Vector(c, d) {
    this.x = c, this.y = d;
};
// 返回 c 的垂直和水平长度
Vector.polar = function(c, d) {
    return new Vector(c * Math.cos(d), c * Math.sin(d));
// 返回两个参数的距离
}, Vector.prototype.length = function() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
// 复制构造函数
}, Vector.prototype.copy = function() {
    return new Vector(this.x, this.y);

}, Vector.prototype.setLength = function(c) {
    var d = this.length();
    if (d) {
        var e = c / d;
        this.x *= e, this.y *= e;
    }
    return this;
}, Vector.prototype.setAngle = function(c) {
    var d = length();
    return this.x = d * Math.cos(c), this.y = d * Math.sin(c), this;
}, Vector.prototype.getAngle = function() {
    return Math.atan2(this.y, this.x);
}, Vector.prototype.d = function(c) {
    var d = c.x - this.x,
        e = c.y - this.y;
    return Math.sqrt(d * d + e * e);
};
var VectorField = function VectorField(c, d, e, f, k) {
    this.x0 = d, this.x1 = f, this.y0 = e, this.y1 = k, this.field = c, this.w = c.length, this.h = c[0].length, this.maxLength = 0;
    for (var l = 0, o = 0, q = 0; q < this.w; q++) {
        for (var s = 0; s < this.h; s++) {
            c[q][s].length() > this.maxLength && (l = q, o = s), this.maxLength = Math.max(this.maxLength, c[q][s].length());
        }
    }
    l = l / this.w * (f - d) + d, o = o / this.h * (k - e) + e;
};
VectorField.read = function(c, d) {
    for (var e = [], f = c.gridWidth, k = c.gridHeight, o = 0, q = 0, s = 0, t = 0; t < f; t++) {
        e[t] = [];
        for (var u = 0; u < k; u++) {
            var z = c.field[o++],
                A = c.field[o++],
                B = new Vector(z, A);
            if (d) {
                var C = t / (f - 1),
                    D = u / (k - 1),
                    E = c.x0 * (1 - C) + c.x1 * C,
                    F = c.y0 * (1 - D) + c.y1 * D,
                    G = Math.PI * F / 180,
                    H = B.length();
                H && (q += H * G, s += G), B.x /= Math.cos(G), B.setLength(H);
            }
            e[t][u] = B;
        }
    }
    var I = new VectorField(e, c.x0, c.y0, c.x1, c.y1);
    return q && s && (I.averageLength = q / s), I;
}, VectorField.prototype.inBounds = function(c, d) {
    return c >= this.x0 && c < this.x1 && d >= this.y0 && d < this.y1;
}, VectorField.prototype.bilinear = function(c, d, e) {
    var f = Math.floor(d),
        k = Math.floor(e),
        l = Math.ceil(d),
        o = Math.ceil(e),
        q = d - f,
        s = e - k;
    return this.field[f][k][c] * (1 - q) * (1 - s) + this.field[l][k][c] * q * (1 - s) + this.field[f][o][c] * (1 - q) * s + this.field[l][o][c] * q * s;
}, VectorField.prototype.getValue = function(c, d, e) {
    var f = (this.w - 1 - 1e-6) * (c - this.x0) / (this.x1 - this.x0),
        k = (this.h - 1 - 1e-6) * (d - this.y0) / (this.y1 - this.y0),
        l = this.bilinear('x', f, k),
        o = this.bilinear('y', f, k);
    return e ? (e.x = l, e.y = o, e) : new Vector(l, o);
}, VectorField.prototype.vectValue = function(c) {
    return this.getValue(c.x, c.y);
}, VectorField.constant = function(c, d, e, f, k, l) {
    var o = new VectorField([
        []
    ], e, f, k, l);
    return o.maxLength = Math.sqrt(c * c + d * d), o.getValue = function() {
        return new Vector(c, d);
    }, o;
};
var Animator = function Animator() {
    this.listeners = [], this.dx = 0, this.dy = 0, this.scale = 1, this.stop = !1;
};
Animator.prototype.add = function(c) {
    this.listeners.push(c);
}, Animator.prototype.notify = function(c) {
    if (!this.stop)
        for (var e, d = 0; d < this.listeners.length; d++) {
            e = this.listeners[d], e[c] && e[c].call(e, this);
        }
}, Animator.prototype.start = function(c) {
    function d() {
        var k = new Date();
        f.notify('animate');
        var l = new Date() - k;
        setTimeout(d, Math.max(10, (c || 20) - l));
    }
    var f = this;
    d();
};
var Particle = function Particle(c, d, e) {
        this.x = c, this.y = d, this.oldX = -1, this.oldY = -1, this.age = e, this.rnd = Math.random();
    },
    MotionDisplay = function MotionDisplay(c, d, e) {
        this.canvas = c, this.projection = function(f, k, l) {
            var o = l || new Vector(),
                q = e.latLngToContainerPoint([k, f]);
            if (0 > q.x || q.x > c.width) {
                var s = e.latLngToContainerPoint([0, 180]),
                    t = e.latLngToContainerPoint([0, -180]),
                    u = -t.x / 10;
                if (s.x < c.width + u) {
                    var z = c.width - s.x;
                    q.x < t.x + z + u && (q.x = s.x + (q.x - t.x));
                }
                var A = (s.x - c.width) / 10;
                t.x > 0 - A && q.x > s.x - t.x - A && (q.x = t.x - (s.x - q.x));
            }
            return o.x = q.x, o.y = q.y, o;
        }, this.field = d, this.first = !0, this.maxLength = d.maxLength, this.x0 = this.field.x0, this.x1 = this.field.x1, this.y0 = this.field.y0, this.y1 = this.field.y1, this.lineWidth = 1, this.backgroundAlpha = 'rgba(0, 0, 0, 0.92)', this.color = 'rgba(255, 255, 255, 1)', this.speedScale = 1, this.numParticles = 4e3, this.makeNewParticles(null, !0);
    };
MotionDisplay.prototype.makeNewParticles = function(c) {
    this.particles = [];
    for (var d = 0; d < this.numParticles; d++) {
        this.particles.push(this.makeParticle(c));
    }
}, MotionDisplay.prototype.makeParticle = function(c) {
    for (var d = c ? c.dx : 0, e = c ? c.dy : 0, f = c ? c.scale : 1, k = 0;;) {
        var l = Math.random(),
            o = Math.random(),
            q = l * this.x0 + (1 - l) * this.x1,
            s = o * this.y0 + (1 - o) * this.y1,
            t = this.field.getValue(q, s);
        if (0 == this.field.maxLength) return new Particle(q, s, 1 + 40 * Math.random());
        var u = t.length() / this.field.maxLength;
        if ((t.x || t.y) && (10 < ++k || Math.random() > .9 * u)) {
            var z = this.projection(q, s),
                A = z.x * f + d,
                B = z.y * f + e;
            if (10 < ++k || !(0 > A || 0 > B || A > this.canvas.width || B > this.canvas.height)) return new Particle(q, s, 1 + 40 * Math.random());
        }
    }
}, MotionDisplay.prototype.animate = function(c) {
    this.moveThings(c), this.draw(c);
}, MotionDisplay.prototype.moveThings = function(c) {
    for (var f, d = .01 * this.speedScale / c.scale, e = 0; e < this.particles.length; e++) {
        if (f = this.particles[e], 0 < f.age && this.field.inBounds(f.x, f.y)) {
            var k = this.field.getValue(f.x, f.y);
            f.x += d * k.x, f.y += d * k.y, f.x < this.x0 && (f.x = this.x1 - (this.x0 - f.x)), f.x > this.x1 && (f.x = this.x0 + (f.x - this.x1)), f.age--;
        } else this.particles[e] = this.makeParticle(c);
    }
}, MotionDisplay.prototype.draw = function(c) {
    var d = this.canvas.getContext('2d'),
        e = this.canvas.width,
        f = this.canvas.height,
        k = c.dx,
        l = c.dy,
        o = c.scale,
        q = d.globalCompositeOperation;
    d.globalCompositeOperation = 'destination-in', d.fillStyle = this.backgroundAlpha, d.fillRect(k, l, e * o, f * o), d.globalCompositeOperation = q;
    var s = new Vector(0, 0);
    d.lineWidth = this.lineWidth, d.strokeStyle = this.color;
    for (var u, t = 0; t < this.particles.length; t++) {
        if (u = this.particles[t], !this.field.inBounds(u.x, u.y)) {
            u.age = -2;
            continue;
        }
        this.projection(u.x, u.y, s), s.x = s.x * o + k, s.y = s.y * o + l, (0 > s.x || 0 > s.y || s.x > e || s.y > f) && (u.age = -2), -1 != u.oldX && (d.beginPath(), d.moveTo(s.x, s.y), d.lineTo(u.oldX, u.oldY), d.stroke()), u.oldX = s.x, u.oldY = s.y;
    }
};
