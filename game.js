/*
    Little JS Hello World Demo
    - Just prints "Hello World!"
    - A good starting point for new projects
*/

'use strict';
const levelSize = vec2(38, 20); // size of play area
const powerup_chance = 0.05;
let ball; // keep track of ball object
let score = 0; // save the players score
let lives = 3; // keep track of the players lives
let paddle;
let powerup_active = false;
let game_is_active = false;

///////////////////////////////////////////////////////////////////////////////
function gameInit() {
    // create bricks
    for (let x = 2; x <= levelSize.x - 2; x += 2)
        for (let y = 12; y <= levelSize.y - 2; y += 1) {
            const brick = new Brick(vec2(x, y), vec2(2, 1)); // create a brick
            brick.color = randColor(); // give brick a random color
        }
    setCameraPos(levelSize.scale(.5)); // center camera in level
    setCanvasFixedSize(vec2(1280, 720)); // use a 720p fixed size canvas

    drawRect(cameraPos, vec2(100), new Color(.5, .5, .5)); // draw background
    drawRect(cameraPos, levelSize, new Color(.1, .1, .1)); // draw level boundary

    paddle = new Paddle; // create player's paddle
    // create walls
    new Wall(vec2(-.5, levelSize.y / 2), vec2(1, 100)) // left
    new Wall(vec2(levelSize.x + .5, levelSize.y / 2), vec2(1, 100)) // right
    new Wall(vec2(levelSize.x / 2, levelSize.y + .5), vec2(100, 1)) // top
    score = 0;
    lives = 3;
    game_is_active = false;

    //new Powerup(vec2(10, 10), vec2(2, 2));
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate() {
    if (ball && ball.pos.y < -1) // if ball is below level
    {
        // destroy old ball
        ball.destroy();
        game_is_active = false;
        lives--;
        ball = 0;
    }
    if (!ball && mouseWasPressed(0) && lives > 0) // if there is no ball and left mouse is pressed and the players has enough lives
    {
        powerup_active = false;
        ball = new Ball(cameraPos); // create the ball
        game_is_active = true;
    }

    //Spawn powerup if chance is right
    if (game_is_active && rand(0, 100) < powerup_chance) {
        new Powerup(vec2(randInt(2, levelSize.x), randInt(2, levelSize.y)), vec2(2, 2));
    }
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost() {
    // called after physics and objects are updated
    // setup camera and prepare for render
}

///////////////////////////////////////////////////////////////////////////////
function gameRender() {
    // called before objects are rendered
    // draw any background effects that appear behind objects
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost() {
    // draw score
    drawTextScreen("Score " + score, vec2(mainCanvasSize.x / 2, 70), 50); // show score
    // draw lives
    drawTextScreen("Lives " + lives, vec2(100, 70), 50);
}

class Paddle extends EngineObject {
    constructor() {
        super(vec2(0, 1), vec2(6, .5)); // set object position and size
        this.setCollision(); // make object collide
        this.mass = 0; // make object have static physics
    }

    update() {
        this.pos.x = mousePos.x; // move paddle to mouse
    }
}

class Ball extends EngineObject {
    constructor(pos) {
        super(pos, vec2(.5)); // set object position and size

        this.velocity = vec2(-.1, -.1); // give ball some movement
        this.setCollision(); // make object collide
        this.elasticity = 1;
    }

    collideWithObject(o) {
        // prevent colliding with paddle if moving upwards
        if (o == paddle && this.velocity.y > 0)
            return false;


        if (o == paddle) {
            // control bounce angle when ball collides with paddle
            const deltaX = this.pos.x - o.pos.x;
            this.velocity = this.velocity.rotate(.3 * deltaX);

            // make sure ball is moving upwards with a minimum speed
            this.velocity.y = max(-this.velocity.y, .2);

            // speed up the ball
            const speed = min(1.04 * this.velocity.length(), .5);
            this.velocity = this.velocity.normalize(speed);

            // prevent default collision code
            return false;
        }

        return true; // allow object to collide
    }
}

class Wall extends EngineObject {
    constructor(pos, size) {
        super(pos, size); // set object position and size

        this.setCollision(); // make object collide
        this.mass = 0; // make object have static physics
        this.color = new Color(0, 0, 0, 0); // make object invisible
    }
}

class Powerup extends EngineObject {
    constructor(pos, size) {
        super(pos, size);

        this.setCollision();
        this.mass = 0;
    }

    collideWithObject(o) {
        powerup_active = true;
        this.destroy();

        return false;
    }
}

class Brick extends EngineObject {
    constructor(pos, size) {
        super(pos, size);

        this.setCollision(); // make object collide
        this.mass = 0; // make object have static physics
    }

    collideWithObject(o) {
        score++;
        // create explosion effect
        // create explosion effect
        const color = this.color;
        new ParticleEmitter(
            this.pos, 0,            // pos, angle
            this.size, .1, 200, PI, // emitSize, emitTime, emitRate, emiteCone
            undefined,              // tileInfo
            color, color,           // colorStartA, colorStartB
            color.scale(1, 0), color.scale(1, 0), // colorEndA, colorEndB
            .2, .5, 1, .1, .1,  // time, sizeStart, sizeEnd, speed, angleSpeed
            .99, .95, .4, PI,   // damping, angleDamping, gravityScale, cone
            .1, .5, false, true // fadeRate, randomness, collide, additive
        ); this.destroy();
        if (powerup_active == false) {
            return true;
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, ['tiles.png']);