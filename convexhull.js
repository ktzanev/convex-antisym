var EPSILON = 1e-14;

function sortPtXY(a,b) {
  return a.x-b.x ? a.x - b.x : a.y - b.y;
}

function pente(a,b) {
  var d =  Math.abs(b.x-a.x) < EPSILON ? 0 : b.x-a.x;
  return (b.y-a.y)/d;
}

function removeDuplicates(p) {
  for (i=0; i < p.length-1; i++)
    if (Math.abs(p[i].x - p[i+1].x) < EPSILON && Math.abs(p[i].y - p[i+1].y) < EPSILON ) {
      p.splice(i--,1);
    }
}
function ConvexHullMin(p) {
  p.sort(sortPtXY);
  removeDuplicates(p);
  m = [];
  m0 = p[0]
  m1 = p[1];
  for (i=2; i<p.length; i++) {
    while (pente(m1,p[i]) <= pente(m0,m1)) {
      if (m.length) {
        m1 = m0;
        m0 = m.pop();
      }
      else {
        m1 = p[i];
        break;
      }
    }
    if (m1 != p[i]) {
      m.push(m0);
      m0 = m1;
      m1 = p[i];
    }
  }
  m.push(m0);
  if (m1.x > m0.x)
    m.push(m1);
  return m;
}

function reverseY(pt) {var p = {}; p.x = pt.x; p.y = -pt.y; return p}

function ConvexHullMax(p) {
  return ConvexHullMin(p.map(reverseY)).map(reverseY);
}

function JoinMinMax(pi,pa) {
  pn = [];
  // push minimal
  ni = pi.length;
  for (i=0; i<ni; i++) {
    pn.push(pi[i]);
  }
  // push maximal (without duplicate on junction)
  na = pa.length;
  if (pi[ni-1].y != pa[na-1].y)
    pn.push(pa[na-1]);
  for (i=na-2; i>=0; i--) {
    pn.push(pa[i]);
  }
  // the last point must be the same as the first point
  if (pi[0].y != pa[0].y)
    pn.push(pi[0]);
  return pn;
}

function getX(a) {
    return a.reduce(function(X, p) {
        if (X.indexOf(p.x) < 0) X.push(p.x);
        return X.sort(function(a,b){return a-b});
    }, []);
};

function calcY(x,p1,p2) {
  return p1.y + (p2.y-p1.y)*(x-p1.x)/(p2.x-p1.x);
}
function refinePath(p,x) {
  var add = [];
  var np = p.length;
  var nx = x.length
  var j=0;
  for (var i=0; i<nx; i++) {
    while (j<np && x[i]>p[j].x)
      j++;
    if (j == 0 || j == np || x[i] == p[j].x)
      continue;
    add.push({x:x[i], y:calcY(x[i],p[j-1],p[j])});
  }
  return (p.concat(add)).sort(sortPtXY)
}

function barycentrePath(p) {
  var np = p.length;
  var nx=0;
  var ny=0;
  var d=0;
  var t;
  for (i=1;i<np;i++) {
    t = p[i-1].x*p[i].y-p[i-1].y*p[i].x;
    nx += (p[i-1].x+p[i].x)*t;
    ny += (p[i-1].y+p[i].y)*t;
    d += t;
  }
  t = p[np-1].x*p[0].y-p[np-1].y*p[0].x;
  nx += (p[np-1].x+p[0].x)*t;
  ny += (p[np-1].y+p[0].y)*t;
  d += t;
  d *= 3;
  return {x: nx/d, y: ny/d, s: d/6};
}

function translatePath(a,v) {
    return a.map(function(p) {
        return {x: p.x-v.x, y: p.y-v.y};
    });
}

function rotatePath(a,t) {
    return a.map(function(p) {
        return {x: p.x*Math.cos(Math.PI*t/180)-p.y*Math.sin(Math.PI*t/180), y: p.x*Math.sin(Math.PI*t/180)+p.y*Math.cos(Math.PI*t/180)};
    });
}


function dualPoint(p1,p2) {
  var d = p1.x*p2.y-p1.y*p2.x;
  var x = p2.y-p1.y;
  var y = p1.x-p2.x;
  return {x : x/d, y : y/d, d : d};
}

function dualPath(p) {
  var np = p.length;
  var dp = [];
  var t;
  for (i=0;i<np;i++) {
    t = dualPoint(p[i],p[(i+1)%np]);
    if (t.d) {
      delete t.d;
      dp.push(t);
    }
  }
  return dp;
}

function antisym(p1,p2) {
  var t1 = refinePath(p1,getX(p2));
  var t2 = refinePath(p2,getX(p1));
  var n = t1.length;
  var r = [];
  for (i=n-1; i>=0; i--)
    r.push({x : t1[i].x, y : t2[i].y-t1[i].y });
  if (r[0].y) {
    r.unshift({x : r[0].x, y : 0 });
    n++;
  }
  if (r[n-1].y)
    r.unshift({x : r[n-1].x, y : 0 });

  return r;
}
