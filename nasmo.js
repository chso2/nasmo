PolySketch = function(construct){
    this.sketch = {
        canvas : null,
        ctx : null,
        canvasWidth : construct.width,
        canvasHeight : construct.height,
        styleText : construct.styleText,
        position : construct.position
    };
    this.point = {
        _screen : null,
        _offsetX : null,
        _offsetY : null,
        _mouseX : null,
        _mouseY : null,
        _isDown : false,
        _isDownEnter : false,
        _startX : 0,
        _startY : 0,
        _point : 0
    };
    this.temp = {
        cir : []
    };

    this.polyArray = [];
    this.nearest = {ind:0};
    this.undoArray = [];

    this.nCheck = false;
    this._createSign = false;
    this.thumbnailCheck = true;

    this.init();
};

PolySketch.prototype = {

    init: function(){
        var that = this;
        // var info = this.info;
        // var self = this;
        // var _ = this;
        var sketch = this.sketch;
        var point = this.point;
        sketch.canvas = document.createElement('canvas');
        sketch.ctx = sketch.canvas.getContext('2d');
        sketch.canvas.width = sketch.canvasWidth;
        sketch.canvas.height = sketch.canvasHeight;
        document.getElementById(sketch.position).appendChild(sketch.canvas);
        sketch.canvas.setAttribute("style", sketch.styleText);

        point._screen = sketch.canvas.getBoundingClientRect();
        point._offsetX = point._screen.left;
        point._offsetY = point._screen.top;
        this.eventBind('mousemove', function(that){ return function(e){e.preventDefault(); that.mouseMove(e,that);};}(that), true);
        this.eventBind('mousedown', function(that){ return function(e){e.preventDefault(); that.mouseDown(e,that);};}(that), true);
        this.eventBind('mouseup', function(that){ return function(e){e.preventDefault(); that.mouseUpOut(e,that);};}(that), true);
        this.eventBind('mouseout', function(that){ return function(e){e.preventDefault(); that.mouseUpOut(e,that);};}(that), true);

        window.addEventListener('locationchanged', function(){
            //
        })
    },
    eventBind: function(type, callback, bool){
        this.sketch.canvas.addEventListener(type, callback, bool);
    },
    eventUnbind:  function(type, callback) {
        this.sketch.canvas.removeEventListener(type, callback, false);
    },
    mouseEvent:function(e, that){
        this.x = e.clientX - that.point._offsetX;
        this.y = e.clientY - that.point._offsetY;
        this.target = e.target;
    },
    mouseDown: function(e, that, callback){
        var sketch = this.sketch;
        var point = this.point;
        var temp = this.temp;
        this.engine = that;

        e = new this.engine.mouseEvent(e, this.engine);
        point._mouseX = e.x;
        point._startX = e.x;
        point._mouseY = e.y;
        point._startY = e.y;
        point._isDown = true;

        if(point._mouseY > sketch.canvas.height - 20){
            window.document.getElementById("seeker").style.transform = "scale(" + point._mouseX / sketch.canvasWidth + ", 1)";
            window.video.vid.currentTime = (point._mouseX / sketch.canvasWidth) * window.video.vid.duration;
            /*  재생시간 / 비디오의 전체시간 만큼 translate -> width의 비율로 */
        }

        if(this.thumbnailCheck == false){
            for(var j = 1; j < 5; j++){
                sketch.ctx.beginPath();
                sketch.ctx.rect(20 + (70 * (j - 1)), sketch.canvas.height - 70, 50, 40);
                if(sketch.ctx.isPointInPath(point._mouseX, point._mouseY) == true){
                    window.video.vid.currentTime =  (j / 4) * window.video.vid.duration;
                }
            }
        }


        if(temp.cir.length > 0){
            for(var i in temp.cir){
                if(i > 0){
                    sketch.ctx.beginPath();
                    sketch.ctx.rect(temp.cir[i].x - temp.cir[i].radius, temp.cir[i].y - temp.cir[i].radius,
                        temp.cir[i].radius * 2, temp.cir[i].radius * 2);
                    if(sketch.ctx.isPointInPath(point._mouseX, point._mouseY) == true){
                        alert("gg");
                        point._point = i;
                    }
                }
            }
        }
        (function callback(){ }());
    },
    mouseMove: function(e, that, callback){
        var point = this.point;
        this.engine = that;
        e = new this.engine.mouseEvent(e, this.engine);
        point._mouseX = e.x;
        point._mouseY = e.y;

        var list = document.getElementsByClassName("thumbnail");

        /* fade in */
        if(point._mouseY > this.sketch.canvas.height - 20 && this.thumbnailCheck == true){
            this.thumbnailCheck = false;
            var k = 0;
            var a = setInterval(function(){
                for(var i = 0; i < list.length; i++){
                    list[i].style.opacity = k;
                }
                k = k + 0.05;
                if(k > 0.5){
                    clearInterval(a);
                }
            }, 50);
        }
        /* fade out */
        if(point._mouseY < this.sketch.canvas.height - 80 && this.thumbnailCheck == false){
            this.thumbnailCheck = true;
            var k = 0.5;
            var a = setInterval(function(){
                for(var i = 0; i < list.length; i++){
                    list[i].style.opacity = k;
                }
                k = k - 0.05;
                if(k < 0){
                    clearInterval(a);
                }
            }, 50);
        }



        if(!point._isDown){
            this.engine.near(this);
        }else{
            if(this.nCheck == true){
                if(point._isDownEnter == false){
                    var temp = this.getPoly();
                    this.undoArray.push({ind:this.nearest.ind, x0:temp.x0, x1:temp.x1, y0:temp.y0, y1:temp.y1, radius:temp.radius});
                    point._isDownEnter = true;
                    this._createSign = false;
                }
                if(point._point === 0){
                    var dx = point._mouseX - point._startX;
                    var dy = point._mouseY - point._startY;
                    point._startX = point._mouseX;
                    point._startY = point._mouseY;
                    this.getPoly().move(dx, dy, this);
                }else{
                    this.getPoly().reSize(this, point._point);
                }
            }
        }
        (function callback(){ }());
    },
    mouseUpOut:function (e, that, callback) {
        this.nearest.ind = 0;
        this.point._isDown = false;
        this.point._isDownEnter = false;
        this.point._point = 0;
    },
    clearCanvas:function(){
        this.sketch.ctx.clearRect(0, 0, this.sketch.canvas.width, this.sketch.canvas.height);
        this.polyArray = [];
    },
    near: function(that){
        var ctx = this.sketch.ctx;
        var point = this.point;
        var polyArray = this.polyArray;

        this.reDraw();
        this.nearest = {ind:0};
        this.nCheck = false;
        for(var i in this.polyArray){
            ctx.beginPath();
            var w_rate = 10;
            var h_rate = 10;
            var dx = polyArray[i].x1 - polyArray[i].x0;
            var dy = polyArray[i].y1 - polyArray[i].y0;
            switch (polyArray[i].type){
                case "line":
                    // var slope = - Math.atan2(dx, dy);                               //기울기
                    var rotation = Math.sqrt(dx * dx + dy * dy);
                    //
                    // ctx.translate(line[i].x0 - (w_rate / 2), line[i].y0 - (h_rate / 2));
                    // ctx.rotate(slope);
                    ctx.rect(polyArray[i].x0, polyArray[i].y0, w_rate, rotation);
                    // this.ctx.restore();
                    if(ctx.isPointInPath(point._mouseX, point._mouseY) == true){
                        if(this.nearest.ind <= i){
                            this.nCheck = true;
                            this.nearest.ind = i;
                        }
                    }
                    break;
                case "rect":
                    if(!(point._mouseX < polyArray[i].x0 ||
                        point._mouseX > polyArray[i].x0 + polyArray[i].x1 ||
                        point._mouseY < polyArray[i].y0 ||
                        point._mouseY > polyArray[i].y0 + polyArray[i].y1)
                    ){
                        if(this.nearest.ind <= i){
                            this.nCheck = true;
                            this.nearest.ind = i;
                        }
                    }
                    break;
                case "cir" :
                    ctx.rect(polyArray[i].x0 - polyArray[i].radius,
                        polyArray[i].y0 - polyArray[i].radius,
                        polyArray[i].radius * 2, polyArray[i].radius * 2);
                    if(ctx.isPointInPath(point._mouseX, point._mouseY) == true){
                        if(this.nearest.ind <= i){
                            this.nCheck = true;
                            this.nearest.ind = i;
                        }
                    }
                    break;
            }
        }
        if(this.nCheck == true){
            this.drawTemp();
        }
    },
    createPoly: function(construct){
        var that = this;
        var poly = new Poly(construct, that);

        this.addObject(poly);
        this._createSign = true;
        this.undoArray.push({crCheck:this._createSign});
        return poly;
    },
    getPoly:function(){
        return this.polyArray[this.nearest.ind];
    },
    addObject: function(obj) {
        var len = this.polyArray.length;
        this.polyArray.push(obj);
        return this.polyArray[len];
    },
    undo: function(){
        var polyArray = this.polyArray;
        if(this.undoArray.length == 0){return ;}
        var last = this.undoArray[this.undoArray.length - 1];
        if(last.crCheck == true){
            this.polyArray.pop();
        }else{
            polyArray[last.ind].x0 = last.x0;
            polyArray[last.ind].x1 = last.x1;
            polyArray[last.ind].y0 = last.y0;
            polyArray[last.ind].y1 = last.y1;
            polyArray[last.ind].radius = last.radius;
        }
        this.undoArray.pop();
        this.reDraw();
    },
    reDraw:function(){
        this.sketch.ctx.clearRect(0, 0, this.sketch.canvas.width, this.sketch.canvas.height);
        for(var i in this.polyArray){
            this.polyArray[i].draw();
        }
    },
    drawTemp: function(){
        //if(this.nearest.ind == 0){return ;}
        var temp = this.temp;
        var polyArray = this.polyArray;
        temp.cir = [];
        var k = this.nearest.ind;
        var x, y;
        var x1, x2, x3, x4;
        var y1, y2, y3, y4;
        switch (polyArray[k].type) {
            case "line":
                x = polyArray[k].x0;
                y = polyArray[k].y0;
                x1 = polyArray[k].x0;
                y1 = polyArray[k].y0;
                x2 = polyArray[k].x1;
                y2 = polyArray[k].y1;
                break;
            case "rect":
                x = polyArray[k].x0 + (polyArray[k].x1 / 2);
                y = polyArray[k].y0 + (polyArray[k].y1 / 2);
                x1 = polyArray[k].x0;
                y1 = polyArray[k].y0;
                x2 = polyArray[k].x0 + polyArray[k].x1;
                y2 = polyArray[k].y0;
                x3 = polyArray[k].x0;
                y3 = polyArray[k].y0 + polyArray[k].y1;
                x4 = polyArray[k].x0 + polyArray[k].x1;
                y4 = polyArray[k].y0 + polyArray[k].y1;
                break;
            case "cir":
                x = polyArray[k].x0;
                y = polyArray[k].y0;
                x1 = polyArray[k].x0 - polyArray[k].radius;
                y1 = polyArray[k].y0 - polyArray[k].radius;
                x2 = polyArray[k].x0 + polyArray[k].radius;
                y2 = polyArray[k].y0 - polyArray[k].radius;
                x3 = polyArray[k].x0 - polyArray[k].radius;
                y3 = polyArray[k].y0 + polyArray[k].radius;
                x4 = polyArray[k].x0 + polyArray[k].radius;
                y4 = polyArray[k].y0 + polyArray[k].radius;

                this.sketch.ctx.strokeStyle = polyArray[k].color;
                this.sketch.ctx.beginPath();
                this.sketch.ctx.setLineDash([4,2]);
                this.sketch.ctx.rect(x1, y1, polyArray[k].radius * 2, polyArray[k].radius * 2);
                this.sketch.ctx.stroke();
                this.sketch.ctx.setLineDash([0,0]);
                break;
        }
        temp.cir.push({x:x, y:y, radius:4});
        temp.cir.push({x:x1, y:y1, radius:4});
        temp.cir.push({x:x2, y:y2, radius:4});
        temp.cir.push({x:x3, y:y3, radius:4});
        temp.cir.push({x:x4, y:y4, radius:4});
        for(var i in temp.cir){
            this.sketch.ctx.beginPath();
            this.sketch.ctx.arc(temp.cir[i].x, temp.cir[i].y, temp.cir[i].radius, 0, 2 * Math.PI);
            this.sketch.ctx.fillStyle = "#dddddd";
            this.sketch.ctx.fill();
        }
    }
};

Poly = function(construct, that){
    this.engine = that;
    this.type = null;
    this.x0;
    this.y0;
    this.x1;
    this.y1;
    this.color = "black";
    this.weight = 1;

    for(var i in construct){
        this[i] = construct[i];
    }
};
Poly.prototype = {
    reSize:function(that, point){

        var self = that;
        that = that.point;
        var dx = that._mouseX - that._startX;
        var dy = that._mouseY - that._startY;
        that._startX = that._mouseX;
        that._startY = that._mouseY;

        switch (this.type){
            case "line":
                    if(point == 1){
                        this.x0 = that._mouseX;
                        this.y0 = that._mouseY;
                    }else if(point == 2){
                        this.x1 = that._mouseX;
                        this.y1 = that._mouseY;
                    }
                break;
            case "rect":
                    if(point == 1){
                        this.x0 = that._mouseX;
                        this.y0 = that._mouseY;
                        this.x1 -= dx;
                        this.y1 -= dy;
                    }else if(point == 2){
                        this.y0 = that._mouseY;
                        this.x1 += dx;
                        this.y1 -= dy;
                    }else if(point == 3){
                        this.x0 = that._mouseX;
                        this.x1 -= dx;
                        this.y1 += dy;
                    }else if(point == 4){
                        this.x1 += dx;
                        this.y1 += dy;
                    }
                break;
            case "cir":
                        if((point == 1 && dx < 0 && dy < 0) ||
                            (point == 2 && dx > 0 && dy < 0) ||
                            (point == 3 && dx < 0 && dy > 0) ||
                            (point == 4 && dx > 0 && dy > 0)){
                            this.x0 += dx;
                            this.y0 += dy;
                            this.radius += Math.sqrt(dx * dx + dy * dy);
                        }else if((point == 1 && dx > 0 && dy > 0) ||
                            (point == 2 && dx < 0 && dy > 0) ||
                            (point == 3 && dx > 0 && dy < 0) ||
                            (point == 4 && dx < 0 && dy < 0)){
                            this.x0 += dx;
                            this.y0 += dy;
                            this.radius -= Math.sqrt(dx * dx + dy * dy);
                        }
                break;
        }
        self.reDraw();
    },
    move:function(dx, dy, that){
        this.x0 += dx;
        this.y0 += dy;
        if(this.type === "line"){
            this.x1 += dx;
            this.y1 += dy;
        }
        that.reDraw();
    },
    draw:function(){;
        var ctx = this.engine.sketch.ctx;
        ctx.beginPath();
        ctx.lineWidth = this.weight;
        ctx.strokeStyle = this.color;
        switch (this.type){
            case "line":
                ctx.moveTo(this.x0, this.y0);
                ctx.lineTo(this.x1, this.y1);
                ctx.stroke();
                break;
            case "rect":
                ctx.strokeRect(this.x0, this.y0, this.x1, this.y1);
                break;
            case "cir" :
                ctx.arc(this.x0, this.y0, this.radius, 0, 2 * Math.PI);
                ctx.stroke();
                break;
        }
    }

}

