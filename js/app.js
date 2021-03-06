// 这是我们的玩家要躲避的敌人
var Enemy = function(x, y) {
    // 敌人的图片或者雪碧图，用一个工具函数来加载文件(Resource.load)
    this.sprite = 'images/enemy-bug.png';
    //初始化行为
    this.init(x, y);
};
//同时存在多少个敌人
Enemy.MAX_ENEMIES = 7;
Enemy.GAMEOVER = false;

// 初始化敌人
Enemy.prototype.init = function() {
    // 生成随机位置 x:2-6, y:2-4
    // pos:随机数，ap:转化成实际坐标值
    var pos = this.rndm(),
        ap, en;
    ap = this.adjustPos(pos.x, pos.y);

    //检查随机位置是否有重复
    if (allEnemies) {
        for (var i = 0, len = allEnemies.length; i < len; i++) {
            en = allEnemies[i];
            if (en.x < 0 && en !== this) {
                if (Math.abs(ap.x - en.x) < 100 && ap.y === en.y) {
                    //检测到位置重复，则重新生成
                    console.log('oops...');
                    return this.init()
                }
            }
        }
    }
    //敌人当前X坐标，初始化位置：横向第n个网格,缓存初始位置
    this.x = ap.x;
    //敌人当前Y坐标，初始化位置：纵向第n个网格，向上偏移23像素以对齐网格
    this.y = ap.y;
};

//调整位置
Enemy.prototype.adjustPos = function(x, y) {
    return { x: -x * 101, y: (y - 1) * 83 - 23 }
}

// 生成随机的x,y数值，此处的x,y代表画布上的格子位置而不是真实的xy坐标。
// 比如画面横向共有5个格子，纵向6个格子，则x=1,y=1 代表画面左上第一个格子
Enemy.prototype.rndm = function() {
    // 生成随机值 x:2-5, y:2-4
    var x = parseInt(Math.random() * 5) + 1;
    var y = parseInt(Math.random() * 3) + 2;
    return { x: x, y: y }
};

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function(dt) {
    // 控制游戏
    if (Enemy.GAMEOVER) { return; }
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
    this.move(dt * Math.abs(200 - this.y) * 1.5);

    if (this.x > ctx.canvas.offsetWidth) {
        // 重置敌人状态，分配随机位置
        this.init()
    }
};

// 敌人移动的函数
Enemy.prototype.move = function(x, y) {
    if (x) this.x += x;
    if (y) this.y += y;
};

// 此为游戏必须的函数，用来在屏幕上画出敌人，
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// 玩家类
var Player = function(x, y) {
    this.sprite = 'images/char-boy.png';
    //是否过关
    this.passed = false;
    this.init(x, y);
};

// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
// 更新玩家状态 做碰撞检测，如果发生碰撞则重新开始
Player.prototype.update = function() {
    if (this.collideTest()) {
        this.init()
    }
};

// 碰撞检测
Player.prototype.collideTest = function() {
    for (var i = 0, len = allEnemies.length; i < len; i++) {
        var en = allEnemies[i];
        var w = 100,
            h = 70;
        // 敌人的边界
        // 设定所有碰撞边界均为100*70的矩形区
        // en at left of this
        if ((en.x <= this.x && en.x + w >= this.x) || (en.x > this.x && en.x <= this.x + w)) {
            // en at top of user
            if (en.y <= this.y && en.y + h >= this.y) {
                return true;
            }
            // en beneath
            if (en.y > this.y && en.y <= this.y + h - 20) {
                return true;
            }
        }
    }
    return false;
};

// 玩家移动方法，接收up,right,down,left等参数，并向相应位置移动
Player.prototype.move = function(direction) {
    // 如果参数无效则返回，不执行
    if (!direction) return;
    // 设定上下左右键的行为
    switch (direction) {
        case 'up':
            this.y > 0 && (this.y -= 83);
            // 过关后的成功提示
            if (this.y < 0 && !this.passed) {
                this.success();
            }
            break;
        case 'right':
            this.x < 404 && (this.x += 101);
            break;
        case 'down':
            this.y < 405 && (this.y += 83);
            break;
        case 'left':
            this.x > 0 && (this.x -= 101);
            break;
    }
};

// 玩家初始化方法，重置位置及通关状态
Player.prototype.init = function(x, y) {
    // 初始位置
    x = x || 3;
    y = y || 6;
    this.x = (x - 1) * 101;
    this.y = (y - 1) * 83 - 10;
    this.setState(0);
};
Player.prototype.setState = function(state){
    this.passed = !!state ;
}
// 渲染玩家到canvas画布
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// 玩家过关成功
Player.prototype.success = function() {
    if (this.passed) { return; }
    this.setState(1);
    Enemy.GAMEOVER = true;

    drawStroked('congratulations!', ctx.canvas.offsetWidth / 2, 40)

    // 在屏幕上显示文字
    function drawStroked(text, x, y) {
        text = text.toUpperCase();
        ctx.font = "46px Impact";
        ctx.textAlign = 'center';
        ctx.strokeStyle = 'lightblue';
        ctx.lineWidth = 8;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = 'darkgreen';
        ctx.fillText(text, x, y);
    }
    setTimeout(function() {
        player.init(3,3);
        player.setState(1);
        allEnemies.length=0;
        RunStars()
    },200)
};
// 处理键盘事件，并传递给move方法
Player.prototype.handleInput = function(direction) {
    this.move(direction)
};

//小星星类
var Star = function(index) {
    this.width = 50;
    this.height = 50;

    //半径
    this.r = 100;
    this.index = index;
    //星星之间的角度
    this.angle = (index + 1) * (360 / Star.MAX_NUM);
    //两个星星之间的弧度
    this.radian = this.angle * (Math.PI / 180);
    this.init();
}
// 星星的数量
Star.MAX_NUM = 10;
// 星星图片 缓存在原型上
Star.prototype.simg = null;
//初始化，设定圆心坐标，及x，y坐标
Star.prototype.init = function() {
    //圆心坐标
    this.ox = ctx.canvas.offsetWidth / 2;
    this.oh = ctx.canvas.offsetHeight / 2-50;
    this.x = (this.ox + this.r * Math.cos(this.radian)) - this.width / 2;
    this.y = (this.oh + this.r * Math.sin(this.radian)) - this.height / 2;
}
//渲染到画布
Star.prototype.render = function() {
    ctx.drawImage(this.simg, this.x, this.y, this.width, this.height);
}
// 移动方法 每次递增2度
Star.prototype.move = function() {
    if (this.angle == 360) {
        this.angle = 0;
    }
    this.angle = this.angle + 2;
    this.radian = this.angle * (Math.PI / 180);
    this.x = (this.ox + this.r * Math.cos(this.radian)) - this.width / 2;
    this.y = (this.oh + this.r * Math.sin(this.radian)) - this.height / 2;
    this.render();
}
// 启动星星动画的方法
var RunStars = function() {
    var stars = [];
    RunStars = function() {
        var cw = ctx.canvas.offsetWidth;
        var ch = ctx.canvas.offsetHeight;
        // ctx.clearRect(0, 0, cw, ch);
        // ctx.beginPath();
        // ctx.rect(0, 0, cw, ch);
        // ctx.fillStyle = "blue";
        // ctx.fill();
        // ctx.closePath();
        // ctx.fillStyle = ctx.createPattern(Resources.get('images/grass-block.png'),'repeat');
        // ctx.fill();
        var ox = player.x+50;
        var oh = player.y+82
        for (var i = 0; i < stars.length; i++) {
            stars[i].ox = ox;
            stars[i].oh = oh;
            stars[i].move();
        }
        window.requestAnimationFrame(RunStars)
    };
    // 缓存小图片在原型上，所有实例可以共享
    // 图片加载完成 运行
    Star.prototype.simg = new Image();
    Star.prototype.simg.onload = function() {
        for (var i = 0; i < 12; i++) {
            stars.push(new Star(i))
        }
        RunStars();
    }
    Star.prototype.simg.src = 'images/Star.png';
};

// 把有敌人的对象都放进一个叫 allEnemies 的数组里面
var allEnemies = (function(a) {
    var arr = [];
    for (var i = 0; i < a.MAX_ENEMIES; i++) {
        arr.push(new a)
    }
    return arr;
}(Enemy));

// 把玩家对象放进一个叫 player 的变量里面
var player = new Player();

// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});