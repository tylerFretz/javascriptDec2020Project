
//Game settings
const GAME_HEIGHT = 600,
GAME_WIDTH = 800,
FRAME_PERIOD = 60, // 1 frame / x frames/sec
LEVEL_TIMEOUT = 2000, // How long to wait after clearing a level.

// Player settings
ROTATE_SPEED = Math.PI/10, // How fast do players turn?  (radians)
MAX_SPEED = 15, // Maximum player speed
THRUST_ACCEL = 1,
DEATH_TIMEOUT = 2000, // milliseconds

// Asteroid settings
ASTEROID_COUNT = 2, // This + current level = number of asteroids.
ASTEROID_GENERATIONS = 3, // How many times to they split before dying?
ASTEROID_CHILDREN = 2, // How many does each death create?
ASTEROID_SPEED = 3,
ASTEROID_SCORE = 10, // How many points is each one worth?

//Key codes (WASD)
LEFT = 65,
UP = 87,
RIGHT = 68,
DOWN = 83;

let player;
let myObstacles = [];
let myScore;
let ctx;

function startGame(home) {
    home.innerHtml = "";
    player = new component(30, "blue", [GAME_WIDTH / 2, GAME_HEIGHT / 2], [[10, 0], [-5, 5], [-5, -5], [10, 0]]);
    gameArea.start();
}

let gameArea = {
    canvas: document.createElement("canvas"),
    start: function() {
        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;
        this.context = this.canvas.getContext("2d");
        document.getElementById("asteroids").appendChild(this.canvas);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, FRAME_PERIOD);
    },
    clear: function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}


class component {
    constructor(radius, color, position, path, type) {
        this.type = type;
        this.radius = radius;
        this.velocity = [0, 0];
        this.position = position;
        this.direction = -Math.PI / 2;
        this.path = path;
        this.dead = false;
        this.score = 0;

        this.update = () => {
            ctx = gameArea.context;
            ctx.fillStyle = color;
            ctx.ellipse(this.position[0], this.position[1], this.radius, this.radius, Math.PI, 0, MATH.PI * 2);
        };

        this.move = () => {
            this.position[0] += this.velocity[0];
            if (this.position[0] < 0) {
                this.position[0] = GAME_WIDTH + this.position[0];
            }
            else if (this.position[0] > GAME_WIDTH) {
                this.position[0] -= GAME_WIDTH;
            }

            this.position[1] += this.velocity[1];
            if (this.position[1] < 0) {
                this.position[1] = GAME_HEIGHT + this.position[1];
            }
            else if (this.position[1] > GAME_HEIGHT) {
                this.position[1] -= GAME_HEIGHT;
            }
        };

        this.thrust = (force) => {
            if (!this.dead) {
                this.velocity[0] += force * Math.cos(this.direction);
                this.velocity[1] += force * Math.sin(this.direction);
            }
        };

        this.collision = (otherObj) => {
            let aPos = this.position;
            let bPos = otherObj.position;

            let distance = Math.sqrt(Math.pow(aPos[0] - bPos[0], 2) +
                Math.pow(aPos[1] - bPos[1], 2));

            if (distance <= this.radius + otherObj.radius) {
                return true;
            }
            return false;
        };

        this.rotate = (rad) => {
            if (!this.dead) {
                this.direction += rad;
            }
        };

        this.die = () => {
            if (!this.dead) {
                this.dead = true;
                this.position = [GAME_WIDTH / 2, GAME_HEIGHT / 2];
                this.velocity = [0, 0];
                this.direction = -Math.PI / 2;
            }
        };

        this.draw = () => {
            ctx = gameArea.context;
            ctx.fillStyle = color;
            ctx.setTransform(1, 0, 0, 1, this.position[0], this.position[1]);
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
            ctx.stroke();
            ctx.closePath();
        };

        this.drawPlayer = () => {
            ctx = gameArea.context;
            ctx.fillStyle = color;
            ctx.setTransform(Math.cos(this.direction), Math.sin(this.direction),
                -Math.sin(this.direction), Math.cos(this.direction),
                this.position[0], this.position[1]);
            ctx.beginPath();
            ctx.moveTo(this.path[0][0], this.path[0][1]);
            for (let i = 1; i < this.path.length; i++) {
                ctx.lineTo(this.path[i][0], this.path[0][1]);
            }
            ctx.stroke();
            ctx.closePath();
        };
    }
}


const updateGameArea = () => {
    gameArea.clear();
    gameArea.frameNo += 1;
    
    if (keyState().getState(UP)) {
        player.thrust(THRUST_ACCEL);
    }

    if (keyState().getState(LEFT)) {
        player.rotate(-ROTATE_SPEED);
    }

    if (keyState().getState(RIGHT)) {
        player.rotate(ROTATE_SPEED);
    }

    player.move();
    player.drawPlayer();
}

const keyState = () => {
    let state = [];
    state[LEFT] = false;
    state[UP] = false;
    state[RIGHT] = false;
    state[DOWN] = false;

    return {
        on: function(key) {
            state[key] = true;
        },
        off: function(key) {
            state[key] = false;
        },
        getState: function(key) {
            if (typeof state[key] != 'undefined') {
                return state[key];
            }
            return false;
        }
    }
}

const listen = () => {
    window.addEventListener('keydown', e => {
        switch (e) {
            case UP:
            case DOWN:
            case LEFT:
            case RIGHT:
                e.preventDefault();
                keyState().on(e);
                return false;
        }
        return true;
    }, true);

    window.addEventListener('keyup', e => {
        switch (e) {
            case UP:
            case DOWN:
            case LEFT:
            case RIGHT:
                e.preventDefault();
                keyState().off(e);
                return false;
        }
        return true;
    }, true);
}

// Game.drawPath = (ctx, position, direction, scale, path) => {
//     ctx.setTransform(Math.cos(direction) * scale, Math.sin(direction) * scale,
//                         -Math.sin(direction) * scale, Math.cos(direction) * scale,
//                         position[0], position[1]);
//     ctx.beginPath();
//     ctx.moveTo(path[0][0], path[0][1]);
//     for (let i = 1; i < path.length; i++) {
//         ctx.lineTo(path[i][0], path[0][1]);
//     }
//     ctx.stroke();
//     ctx.closePath();
// }

// Game.move = (position, velocity) => {
//        position[0] += velocity[0];
//        if (position[0] < 0) {
//            position[0] =GAME_WIDTH + position[0];
//        }
//        else if (position[0] > GAME_WIDTH) {
//            position[0] -= GAME_WIDTH;
//        }

//        position[1] += velocity[1];
//        if (position[1] < 0) {
//            position[1] = GAME_HEIGHT + position[1];
//        }
//        else if (position[1] > GAME_HEIGHT) {
//            position[1] -= GAME_HEIGHT;
//        }
//    }

// Game.collision = (a, b) => {
//     let aPos = a.position();
//     let bPos = b.position();

//     let distance = Math.sqrt(Math.pow(aPos[0] - bPos[0], 2) +
//                                 Math.pow(aPos[1] - bPos[1], 2));

//     if (distance <= a.radius() + b.radius()) {
//         return true;
//     }
//     return false;
// }

// Game.overlays = (game) => {
//     let overlays = [];

//     return {
//         draw: function(ctx) {
//             for (let i = 0; i < overlays.length; i++) {
//                 overlays[i].draw(ctx);
//             }
//         },
//         add: function(obj) {
//             if (-1 === overlays.indexOf(obj) &&
//                 typeof obj.draw != "undefined") {
//                     overlays.push(obj);
//                     return true;
//                 }
//                 return false;
//         },
//         remove: function(obj) {
//             let i = overlays.indexOf(obj);
//             if (-1 !== i) {
//                 overlays.splice(i, 1);
//                 return true;
//             }
//             return false;
//         }
//     }
// }

// Game.stars = () => {
//     let stars = [];
//     for (var i=0; i<50; i++) {
//         stars.push([Math.random() * GAME_WIDTH, Math.random() * GAME_HEIGHT]);
//     }

//     return {
//         draw: function(ctx) {
//             var ii = stars.length;
//             for(var i=0; i<ii; i++) {
//                 ctx.fillRect(stars[i][0], stars[i][1], 1, 1);
//             }
//         }
//     }
// }

// Game.start = (game) => {
    
//     let ctx = game.canvas.getContext("2d");
//     ctx.fillStyle = "white";
//     ctx.strokeStyle = "white";

//     game.overlays.add(Game.stars());

//     game.frames = setInterval(function() {
//         ctx.save();
//         ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

//         if (game.keyState.getState(UP)) {
//             game.player.thrust(THRUST_ACCEL)
//             console.log(UP);
//             console.log("asdf");
//         }

//         if (game.keyState.getState(LEFT)) {
//             game.player.rotate(-ROTATE_SPEED)
//         }

//         if (game.keyState.getState(RIGHT)) {
//             game.player.rotate(ROTATE_SPEED)
//         }

//         if (!game.player.isDead()) {
//             player.move();
//             player.draw(ctx);
//         }

//         ctx.restore();

//     game.overlays.draw(ctx);
//     }, FRAME_PERIOD);
// }

// window.onload = Game(document.getElementById("asteroids"));


// Game.drawPath = (ctx, position, direction, scale, path) => {
//     ctx.setTransform(Math.cos(direction) * scale, Math.sin(direction) * scale,
//                         -Math.sin(direction) * scale, Math.cos(direction) * scale,
//                         position[0], position[1]);
//     ctx.beginPath();
//     ctx.moveTo(path[0][0], path[0][1]);
//     for (let i = 1; i < path.length; i++) {
//         ctx.lineTo(path[i][0], path[0][1]);
//     }
//     ctx.stroke();
//     ctx.closePath();
// }

// Game.collision = (a, b) => {
//     let aPos = a.position();
//     let bPos = b.position();

//     let distance = Math.sqrt(Math.pow(aPos[0] - bPos[0], 2) +
//                                 Math.pow(aPos[1] - bPos[1], 2));

//     if (distance <= a.radius() + b.radius()) {
//         return true;
//     }
//     return false;
// // }

// Game.move = (position, velocity) => {
//        position[0] += velocity[0];
//        if (position[0] < 0) {
//            position[0] =GAME_WIDTH + position[0];
//        }
//        else if (position[0] > GAME_WIDTH) {
//            position[0] -= GAME_WIDTH;
//        }

//        position[1] += velocity[1];
//        if (position[1] < 0) {
//            position[1] = GAME_HEIGHT + position[1];
//        }
//        else if (position[1] > GAME_HEIGHT) {
//            position[1] -= GAME_HEIGHT;
//        }
//    }

// Game.player = () => {
//     let position = [GAME_WIDTH / 2, GAME_HEIGHT / 2],
//     velocity = [0, 0],
//     direction = -Math.PI / 2,
//     dead = false,
//     radius = 3,
//     path = [
//         [10, 0],
//         [-5, 5],
//         [-5, -5],
//         [10, 0],
//     ];

//     return {
//         getPosition: function() {
//             return position;
//         },
//         getVelocity: function() {
//             return velocity;
//         },
//         getSpeed: function() {
//             return Math.sqrt(Math.pow(velocity[0], 2) + Math.pow(velocity[1], 2)); 
//         },
//         getDirection: function() {
//             return direction;
//         },
//         getRadius: function() {
//             return radius;
//         },
//         rotate: function(rad) {
//             if (!dead) {
//                 direction += rad;
//             }
//         },
//         thrust: function(force) {
//             if (!dead) {
//                 velocity[0] += force * Math.cos(direction);
//                 velocity[1] += force * Math.sin(direction);

//                 if (this.getSpeed() > MAX_SPEED) {
//                     velocity[0] = MAX_SPEED * Math.cos(direction);
//                     velocity[1] = MAX_SPEED * Math.sin(direction);
//                 }
//             }
//         },
//         move: function() {
//             Game.move(position, velocity);
//         },
//         draw: function(ctx) {
//             Game.drawPath(ctx, position, direction, 1, path);
//         },
//         isDead: function() {
//             return dead;
//         },
//         die: function(game) {
//             if (!dead) {
//                 dead = true;
//                 position = [GAME_WIDTH / 2, GAME_HEIGHT / 2];
//                 velocity = [0, 0];
//                 direction = -Math.PI / 2;
//                 if (lives > 0) {
//                     setTimeout(function (player, _game) {
//                         return function() {
//                             player.ressurrect(_game);
//                         }
//                     }(this, game), DEATH_TIMEOUT);
//                 }
//                 else {
//                     game.gameOver();
//                 }
//             }
//         },
//         ressurrect: function() {
//             if (dead) {
//                 dead = false;
//                 setTimeout(function () {
//                     invincible = false;
//                 }, INVINCIBLE_TIMEOUT);
//             }
//         },
//     }
// }

// Game.createCanvas = (game, parentEl) => {
//     let canvas = document.createElement("canvas");
//     canvas.width = GAME_WIDTH;
//     canvas.height = GAME_HEIGHT;
//     parentEl.appendChild(canvas);
//     return canvas;
// }

// let Game = (parentEl) => {
//     parentEl.innerHtml = "";
//     this.info = Game.infoPane(this, parentEl);
//     this.canvas = Game.createCanvas(this, parentEl);
//     this.player = Game.player(this);
//     this.keyState = Game.keyState(this);
//     this.listen = Game.listen(this);
//     this.overlays = Game.overlays(this);
    
//     Game.start(this);
//     return this;
// }