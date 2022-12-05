let snake;
let apple;
let snakeGame;

window.onload = function () {
    snakeGame = new SnakeGame(900, 600, 30, 500) //canvasWidth, canvasWidth, blockSize, delay
    snake = new Snake([[6, 4], [5, 4], [4, 4]], "right")
    apple = new Apple([10, 10]);

    snakeGame.init(snake, apple);
}

document.onkeydown = function handleKeyDown(e) {
    let key = e.keyCode;
    let newDirection;
    switch (key) {
        case 37:
            newDirection = "left";
            break;
        case 38:
            newDirection = "up";
            break;
        case 39:
            newDirection = "right";
            break;
        case 40:
            newDirection = "down"
            break;
        case 32: //Touche Espace
            snake = new Snake([[6, 4], [5, 4], [4, 4]], "right")
            apple = new Apple([10, 10]);
            snakeGame.init(snake, apple);
            return;
        default:
            return;
    }
    snakeGame.snake.setDirection(newDirection);
}

function SnakeGame(canvasWidth, canvasHeight, blockSize, delay) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.canvas.style.border = "30px solid gray";
    this.canvas.style.margin = "50px auto";
    this.canvas.style.display = "block";
    this.canvas.style.backgroundColor = "#ddd";
    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.blockSize = blockSize;
    this.delay = delay;
    this.snake;
    this.apple;
    this.widthInBlocks = canvasWidth / blockSize;
    this.heightInBlocks = canvasHeight / blockSize;
    this.score;
    let instance = this;
    let timeout;

    this.init = function (snake, apple) {
        this.snake = snake;
        this.apple = apple;
        this.score = 0;
        clearTimeout(timeout);
        refreshCanvas();
    };

    let refreshCanvas = function () {
        instance.snake.advance();

        if (instance.checkCollision()) {
            instance.gameOver();
        } else {
            if (instance.snake.isEatingApple(instance.apple)) {
                instance.score++;
                instance.snake.ateApple = true;
                do {
                    instance.apple.setNewPosition(instance.widthInBlocks, instance.heightInBlocks);
                } while (instance.apple.isOnSnake(instance.snake))
            }
            instance.ctx.clearRect(0, 0, instance.canvas.width, instance.canvas.height);
            instance.drawScore();
            instance.snake.draw(instance.ctx, instance.blockSize);
            instance.apple.draw(instance.ctx, instance.blockSize);
            timeout = setTimeout(refreshCanvas, delay);
        };

    };

    this.checkCollision = function () {
        let wallCollision = false;
        let snakeCollision = false;
        let head = this.snake.body[0];
        let rest = this.snake.body.slice(1);
        let snakeX = head[0];
        let snakeY = head[1];
        let minX = 0;
        let minY = 0;
        let maxX = this.widthInBlocks - 1;
        let maxY = this.heightInBlocks - 1;
        let isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
        let isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

        if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
            wallCollision = true;
        };

        for (let i = 0; i < rest.length; i++) {
            if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
                snakeCollision = true;
            }
        }
        return wallCollision || snakeCollision;
    };

    this.gameOver = function () {
        this.ctx.save();

        this.ctx.font = "bold 70px sans-serif";
        this.ctx.fillStyle = "#000";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.strokeStyle = "#fff";
        this.ctx.lineWidth = 5;
        let centreX = this.canvas.width / 2;
        let centreY = this.canvas.height / 2;
        this.ctx.strokeText("GAME OVER", centreX, centreY - 180);
        this.ctx.fillText("GAME OVER", centreX, centreY - 180);        
        this.ctx.font = "bold 30px sans-serif";
        this.ctx.strokeText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        this.ctx.fillText("Appuyer sur la touche Espace pour rejouer", centreX, centreY - 120);
        this.ctx.restore();
    };


    this.drawScore = function () {
        this.ctx.save();
        this.ctx.font = "bold 200px sans-serif";
        this.ctx.fillStyle = "gray";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        let centreX = this.canvas.width / 2;
        let centreY = this.canvas.height / 2;
        this.ctx.fillText(this.score.toString(), centreX, centreY);
        this.ctx.restore();
    };


};


function Snake(body, direction) {
    this.body = body;
    this.direction = direction;
    this.ateApple = false;
    this.draw = function (ctx, blockSize) {
        ctx.save();
        ctx.fillStyle = '#ff0000';
        for (let i = 0; i < this.body.length; i++) {
            let x = this.body[i][0] * blockSize;
            let y = this.body[i][1] * blockSize;
            ctx.fillRect(x, y, blockSize, blockSize)
        };
        ctx.restore();
    };
    this.advance = function () {
        let nextPosition = this.body[0].slice();
        switch (this.direction) {
            case "left":
                nextPosition[0] -= 1;
                break;
            case "right":
                nextPosition[0] += 1;
                break;
            case "down":
                nextPosition[1] += 1;
                break;
            case "up":
                nextPosition[1] -= 1;
                break;
            default:
                throw ("invalid direction");
        };
        this.body.unshift(nextPosition);
        if (!this.ateApple) {
            this.body.pop();
        } else {
            this.ateApple = false;
        }

    };
    this.setDirection = function (newDirection) {
        let allowedDirections;
        switch (this.direction) {
            case "left":
            case "right":
                allowedDirections = ["up", "down"];
                break;
            case "down":
            case "up":
                allowedDirections = ["left", "right"]
                break;
            default:
                throw ("invalid direction");
        }
        if (allowedDirections.indexOf(newDirection) > -1) {
            this.direction = newDirection
        }
    };

    this.isEatingApple = function (appleToEat) {
        let head = this.body[0];
        if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]) {
            return true;
        } else {
            return false;
        }
    };
};

function Apple(position) {
    this.position = position;
    this.draw = function (ctx, blockSize) {
        ctx.save();
        ctx.fillStyle = "#33cc33";
        ctx.beginPath();
        let radius = blockSize / 2;
        let x = this.position[0] * blockSize + radius;
        let y = this.position[1] * blockSize + radius;
        ctx.arc(x, y, radius, 0, Math.PI * 2, true); //fonction pour dessiner un cercle
        ctx.fill();
        ctx.restore();
    };
    this.setNewPosition = function (widthInBlocks, heightInBlocks) {
        let newX = Math.round(Math.random() * (widthInBlocks - 1));
        let newY = Math.round(Math.random() * (heightInBlocks - 1));
        this.position = [newX, newY];
    };
    this.isOnSnake = function (snakeToCheck) {
        let isOnSnake = false;

        for (let i = 0; i < snakeToCheck.body.length; i++) {
            if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                isOnSnake = true;
            }
        }
        return isOnSnake;
    };
};
