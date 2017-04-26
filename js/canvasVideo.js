/**
 * Created by chso2 on 2017. 4. 14..
 */
videoSketch = function(construct){
    this.canvas = null;
    this.ctx = null;
    this.vid = null;
    this.styleText = "";
    this.position = construct.position;
    this.url = construct.url;
    this.videoCanvas = true;
    this.playCheck = false;
    this.init();
};

videoSketch.prototype = {
    init: function(){
        this.vid = document.createElement('video');
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.vid.src = this.url;
        // this.vid.playsinline;
        document.getElementById(this.position).appendChild(this.vid);
        document.getElementById(this.position).appendChild(this.canvas);
        //this.vid.setAttribute("style", this.styleText);
        //requestAnimationFrame(this.updateCanvas);
        this.vid.style.display = "none";
        this.vid.setAttribute('playsinline', '');
    },
    updateCanvas: function (){
        var that = this;
        this.canvas.width = this.vid.videoWidth;
        this.canvas.height = this.vid.videoHeight;
        this.ctx.drawImage(this.vid, 0, 0, this.vid.videoWidth, this.vid.videoHeight);

        window.document.getElementById("seeker").style.transform = "scale(" + this.vid.currentTime / this.vid.duration + ", 1)";

        if(!this.vid.paused){
            requestAnimationFrame(function(){that.updateCanvas();});
        }
    },

    videoPlay: function(){
        if(this.vid.paused){
            this.vid.play();
            return 1;
        }else{
            this.vid.pause();
            return 0;
        }
    },
    videoSpeed: function(){
        if(this.vid.playbackRate < 0.25){
            this.vid.playbackRate = 1;
            return 1;
        }else{
            this.vid.playbackRate /= 2;
            return 0;
        }
    },
    videoSkip: function(seconds){
        this.vid.currentTime += seconds;
    }
}