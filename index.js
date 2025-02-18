var gameStarted = false;
var score = 0;

const width = 48, height = 48;
const bulletWidth = 16, bulletHeight = 16;
const alienWidth = 32, alienHeight = 32;
var speed = 350;

var moveUp = false, moveLeft = false, moveDown = false, moveRight = false;

var x = $(window).width()/2;
var y = $(window).height()/2;
$("#spaceship > img").css("top", (y - height/2) + "px");
$("#spaceship > img").css("left", (x - width/2) + "px");

var mouseX, mouseY;

var bullets = [], aliens = [];

var soundtrack = new Audio("./assets/soundtrack.mp3");
soundtrack.loop = true;
soundtrack.play();

var spaceshipExploded = false;

var lastTime = 0, lastAlienSpawn = 0, alienSpawnRate = 3000;

function gameLoop(currentTime){
    if(gameStarted){
        var delta = ((currentTime - lastTime) / 1000);
        lastTime = currentTime;

        update(delta);
        render();
    
        requestAnimationFrame(gameLoop);
    }
}

function update(delta){
    for(var i = bullets.length-1; i >= 0; i--){
        var bullet = bullets[i];
        bullet.bulletY += bullet.speedY * delta;
        bullet.bulletX += bullet.speedX * delta;

        if(bullet.bulletX < - bulletWidth/2 || bullet.bulletX > $(window).width() + bulletWidth/2 ||
           bullet.bulletY < - bulletHeight/2 || bullet.bulletY > $(window).height() + bulletHeight/2){
            bullets.splice(i, 1);
            bullet.$element.remove();
        }
    }

    for(var i = aliens.length-1; i >= 0; i--){
        var alien = aliens[i];

        var angle = Math.atan2((alien.alienY-y),(alien.alienX-x));
        alien.speedX = 0.5 * speed * Math.cos(angle);
        alien.speedY = 0.5 * speed * Math.sin(angle);

        alien.alienY -= alien.speedY * delta;
        alien.alienX -= alien.speedX * delta;

        for(var j = bullets.length-1; j >= 0; j--){
            var bullet = bullets[j];
            if((bullet.bulletX + bulletWidth/2 > alien.alienX - alienWidth/2) &&
               (bullet.bulletX - bulletWidth/2 < alien.alienX + alienWidth/2) &&
               (bullet.bulletY + bulletHeight/2 > alien.alienY - alienHeight/2) &&
               (bullet.bulletY - bulletHeight/2 < alien.alienY + alienHeight/2)){
                    bullets.splice(j, 1);
                    aliens.splice(i, 1);
                    score++;
                    bullet.$element.remove();
                    alien.$element.attr("src", "./assets/explosion.png");
                    (new Audio("./assets/explosion" + Math.floor(Math.random()*3) + ".mp3")).play();
                    setTimeout(function(){
                        alien.$element.remove();
                    }, 500);
                    break;
            }
        }

        if((x + width/2 > alien.alienX - alienWidth/2) && (x - width/2 <alien.alienX + alienWidth/2) &&
           (y + height/2 > alien.alienY - alienHeight/2) && (y - height/2 <alien.alienY + alienHeight/2)){
            gameStarted = false;
            (new Audio("./assets/wrong.mp3")).play();
        }

    }

    if(performance.now() - lastAlienSpawn > alienSpawnRate){
        aliens.push(new Alien());
        lastAlienSpawn = performance.now();
    }

    if(moveUp){
        y -= speed * delta;
    }
    if(moveLeft){
        x -= speed * delta;
    }
    if(moveDown){
        y += speed * delta;
    }
    if(moveRight){
        x += speed * delta;
    }

    var angle = (Math.atan2((mouseY-y), (mouseX-x)) * 180/Math.PI);

    $("#spaceship > img").css("transform", "rotate(" + angle + "deg)");

    alienSpawnRate -= 0.1;

}

function render(){
    $("#spaceship > img").css("top", (y - height/2) + "px");
    $("#spaceship > img").css("left", (x - width/2) + "px");

    for(var i = 0; i < bullets.length; i++){
        var bullet = bullets[i];
        bullet.$element.css("top", (bullet.bulletY - bulletHeight/2) + "px");
        bullet.$element.css("left", (bullet.bulletX -bulletWidth/2) + "px");
    }

    for(var i = 0; i < aliens.length; i++){
        var alien = aliens[i];
        alien.$element.css("top", (alien.alienY - alienHeight/2) + "px");
        alien.$element.css("left", (alien.alienX - alienWidth/2) + "px");
    }

    $("h1").text("Score: " + score);

    if(!gameStarted){
        $("#spaceship > img").attr("src", "./assets/explosion.png");
        spaceshipExploded = true;
        $("h1").html("Score: " + score + "<br><br>You Lost!<br><br>Press Enter To Play Again");
    }
}

function startGame(){
    if(!gameStarted){
        $("#bullets").html("");
        $("#aliens").html("");
        alienSpawnRate = 3000;
        score = 0;
        aliens = [];
        bullets = [];
        $("#spaceship > img").attr("src", "./assets/spaceship.png");
        spaceshipExploded = false;
        $("#spaceship > img").css({
            "user-select": "none",
            "width": "48px",
            "position": "absolute",
            "transform": "rotate(0deg)",
        });
        x = $(window).width()/2;
        y = $(window).height()/2;
        if(soundtrack.paused){
            soundtrack.play();
        }
        $("h1").text("Score: " + score);
        gameStarted = true;
        lastTime = performance.now();
        lastAlienSpawn = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function Bullet(x, y, mouseX, mouseY){
    this.bulletX = x;
    this.bulletY = y;
    var angle = Math.atan2((mouseY-this.bulletY),(mouseX-this.bulletX));

    this.speedX = 2 * speed * Math.cos(angle);
    this.speedY = 2 * speed * Math.sin(angle);
    angle *= 180 / Math.PI;

    this.$element = $("<img class='bullet' src='./assets/bullet.png'>").css({
        "position": "absolute",
        "top": this.bulletY - bulletHeight/2 + "px",
        "left": this.bulletX - bulletWidth/2 + "px",
        "transform": "rotate(" + angle + "deg)",
    });

    $("#bullets").append(this.$element);

    return this;
}

function Alien(){
    var alienType = Math.floor(Math.random() * 4) + 1;
    var rndPosition = Math.floor(Math.random() * 4);

    var img = "./assets/alien" + alienType + ".png";

    switch(rndPosition){
        case 0:
            this.alienX = Math.random() * $(window).width();
            this.alienY = - alienHeight/2;
            break;
        case 1:
            this.alienX = - alienWidth/2;
            this.alienY = Math.random() * $(window).height();
            break;
        case 2:
            this.alienX = Math.random() * $(window).width();
            this.alienY = $(window).height() + alienHeight/2;
            break;
        case 3:
            this.alienX = $(window).width() + alienWidth/2;
            this.alienY = Math.random() * $(window).height();
            break;
        default:
            alert("error");
    }

    var angle = Math.atan2((y-this.alienY),(x-this.alienX));

    this.speedX = 0.5 * speed * Math.cos(angle);
    this.speedY = 0.5 * speed * Math.sin(angle);

    this.$element = $("<img class='alien' src='" + img + "'>").css({
        "position": "absolute",
        "top": this.alienY - alienHeight/2 + "px",
        "left": this.alienX - alienWidth/2 + "px",
    });

    $("#aliens").append(this.$element);

    return this;
}

$(window).on("resize", function(){
    if(!gameStarted && !spaceshipExploded){
        x = $(window).width()/2;
        y = $(window).height()/2;
        $("#spaceship > img").css("top", (y - height/2) + "px");
        $("#spaceship > img").css("left", (x - width/2) + "px");
    }
})

$(document).on("keydown", function(event){
    if(event.key === "Enter"){

        startGame();
    }
});

$(document).on("mousemove", function(mouse){
    mouseX = mouse.pageX;
    mouseY = mouse.pageY;
    if(soundtrack.paused){
        soundtrack.play();
    }
})

$(document).on("click", function(mouse){
    if(gameStarted){
        var bullet = new Bullet(x, y, mouse.pageX, mouse.pageY);
        bullets.push(bullet);
        (new Audio("./assets/laser" + Math.floor(Math.random() * 2) + ".mp3")).play();
    }
})

$(document).on("keydown", function(event){
    if(event.key === "w" || event.key === "W" || event.key === "ArrowUp"){
        moveUp = true;
    }
    if(event.key === "a" || event.key === "A" || event.key === "ArrowLeft"){
        moveLeft = true;
    }
    if(event.key === "s" || event.key === "S" || event.key === "ArrowDown"){
        moveDown = true;
    }
    if(event.key === "d" || event.key === "D" || event.key === "ArrowRight"){
        moveRight = true;
    }
})

$(document).on("keyup", function(event){
    if(event.key === "w" || event.key === "W" || event.key === "ArrowUp"){
        moveUp = false;
    }
    if(event.key === "a" || event.key === "A" || event.key === "ArrowLeft"){
        moveLeft = false;
    }
    if(event.key === "s" || event.key === "S" || event.key === "ArrowDown"){
        moveDown = false;
    }
    if(event.key === "d" || event.key === "D" || event.key === "ArrowRight"){
        moveRight = false;
    }
})

