var pongModule = (function(){
	var $ball;
  var lastCollisionSurface;
  
  //BOARD CONSTRUCTOR
  function Board(){
		var boardConfig = {
    	container: $("#pong-container"),
    }
		$.extend(this, $("<div>", {
    		class: "board"
      }));
    boardConfig.container.append(this);
    this.bounds = this[0].getBoundingClientRect();
  }
  
  // PADDLE CONSTRUCTOR
  function Paddle(container, type, controls, css){
  	this.type = type;
  	$.extend(this, $("<div>", {
    		class: "paddle",
        css: css
      }));
    container.append(this);
    this.movementRange = {
    		yMax: container.bounds.top,
        yMin: container.bounds.bottom
      }
    this.bounds = this[0].getBoundingClientRect();
    this.checkKeydown = function(){
      for(var direction in this.directions){
        switch(direction){
          case controls.up:
          	if(this.bounds.top > this.movementRange.yMax){
            	this.movePaddle('up');
	            this.updateBounds();
            }
            break;
          case controls.down:
          	if(this.bounds.bottom < this.movementRange.yMin){
            	this.movePaddle('down');
            	this.updateBounds();
            }
            break;
        }
      }
    };
  }
  Paddle.prototype.directions = {};
  Paddle.prototype.movePaddle = function(direction){
    if(direction == 'up'){
      this.animate({top : '-=10px'}, 0);
    } else {
      this.animate({top : '+=10px'}, 0);
    }
  }
  Paddle.prototype.updateBounds = function(){
  	this.bounds = this[0].getBoundingClientRect();
  }
  $(document).keydown(function(e){
  	e.preventDefault();
    Paddle.prototype.directions[e.keyCode] = true;
  });
  $(document).keyup(function(e){
  	e.preventDefault();
    delete Paddle.prototype.directions[e.keyCode];
  });
  
 	// BALL CONSTRUCTOR 
  function Ball(speed, direction, angle){
  	$.extend(this, $("<div>", {class: "ball"}));
    this.speed = speed;
    this.direction = direction;
    this.angle = angle;
  }
  Ball.prototype.updateTrajectory = function(direction){
    switch(direction){
      case 'top':
        this.angle = this.angle * -1;
        break;
      case 'right':
        this.direction = 'left';
        break;
      case 'bottom':
        this.angle = this.angle * -1;
        break;
      case 'left':
        this.direction = 'right';
        break;
    }
  }
  
  function checkPaddleHitBall(paddle, ball){
  	var ballBoundary = ball[0].getBoundingClientRect();
  	xDistance = Math.abs(ballBoundary[ball.direction] - paddle.bounds[ball.direction]);
    if(xDistance < 5){
    	var bottomTouching = ((ballBoundary['bottom'] < paddle.bounds['bottom']) && (ballBoundary['bottom'] > paddle.bounds['top']));
      var topTouching = (ballBoundary['top'] > paddle.bounds['top'] && ballBoundary['top'] < paddle.bounds['bottom']);
      console.log(bottomTouching);
    	if(bottomTouching || topTouching){
      	return true;
      }
    } else {
    	return false;
    }
  }
  
  return {
  	$board: undefined,
    players: [],
    $intervalId: undefined,
  
  	init: function(){
    	var self = this;
    	this.createBoard();
      this.createBall(["left", "right"][Math.round(Math.random()*1)]);
      window.setInterval(function(){
      	self.movePaddles();
      }, 15);
      
      self.startRound()
    },

    startRound: function(){
      var self = this;
      lastCollisionSurface = undefined;
      this.moveBall($ball.getTrajectory());
      self.$intervalId = window.setInterval(function(){
        self.checkCollision();
        self.checkScoredPoint();
      }, 15);
    },
    
    createBoard: function(){
    	this.$board = new Board();
      $.extend(this.$board, {
      	player_1: this.createPaddle('left'),
        player_2: this.createPaddle('right'),
        score: [0, 0]
      });
    },
    
    createBall: function(direction){
    	var self = this;
      $ball = new Ball(500, direction, 40);
      
      $ball[0].setAttribute('style', "left: "+(direction == "left" ? (self.$board.bounds['width'] - 15 - 120) : 120)+"px")

      $.extend($ball, {
      	getTrajectory: function(){
        	var bounds = this[0].getBoundingClientRect();
          var direction = this.direction;
          var adjacent = Math.abs(self.$board.bounds[direction] - bounds[direction]) + 8000;
          var opposite = (Math.tan(Math.abs(this.angle) * Math.PI / 180) * adjacent);
          var x = (this.direction === 'right') ? (bounds.right + adjacent) : (bounds.left - adjacent);
          var y = (this.angle >= 0) ? (bounds.top + opposite) : (bounds.bottom - opposite);
          var distance = Math.sqrt(Math.pow(adjacent, 2) + Math.pow(opposite, 2));
          return {
            distance: distance,
            position: {
              x: x,
              y: y
            }
          }
        },
      });
      this.$board.append($ball);
    },
    
    createPaddle: function(which){
      var controls;
      var css = {top: "0px"};
      if(which === 'left'){
      	controls = {up: '87', down: '83'};
        $.extend(css, {left: "0px"});
      } else {
      	controls = {up: '38', down: '40'};
        $.extend(css, {right: "0px"});
      }
      
      var $paddle = new Paddle(this.$board, which, controls, css);
      
      this.players.push($paddle);

      return $paddle;
    },
    
    moveBall: function(trajectory){
    	var pos_x = trajectory.position.x + "px";
      var pos_y = trajectory.position.y + "px";
      var time = ((trajectory.distance * 1000.0) / $ball.speed);
    	$ball.animate({left: pos_x, top: pos_y}, parseInt(time), 'linear');
    },
    
    movePaddles: function(){
    	this.players.forEach(function(paddle){
      	paddle.checkKeydown();
      });
    },
    
    checkCollision: function(){
    	var self = this;
    	var ballBoundary = $ball[0].getBoundingClientRect();
     	var directions = ['top', 'bottom'];
      var index = directions.indexOf(lastCollisionSurface);
      if(index > -1){
      	directions.splice(index, 1);
      }
      directions.forEach(function(direction){
      	if(Math.abs(ballBoundary[direction] - self.$board.bounds[direction]) < 10){
        	lastCollisionSurface = direction;
        	$ball.stop();
          $ball.updateTrajectory(direction);
          self.moveBall($ball.getTrajectory());
        }
      });
      this.players.forEach(function(paddle){
      	if($ball.direction === paddle.type){
        	if(checkPaddleHitBall(paddle, $ball)){
          	console.log('touched');
          	lastCollisionSurface = $ball.direction;
            $ball.stop();
            $ball.updateTrajectory($ball.direction);
            self.moveBall($ball.getTrajectory());
          }
        }
      });
    },

    checkScoredPoint: function(){
      var self = this;
      var ballBoundary = $ball[0].getBoundingClientRect();
      var ballDirection = $ball.direction

      if(ballDirection == 'left' &&
        ballBoundary[ballDirection] + ballBoundary['width'] < self.$board.bounds[ballDirection]
      ){
        console.log('player 2 scored')
        clearInterval(self.$intervalId)

        $ball.stop();
        self.$board.score[1]++
        
        self.$board[0].getElementsByClassName('ball')[0].remove()
        self.createBall("right")
        self.startRound()
      } else if(ballDirection == 'right' &&
        ballBoundary[ballDirection] - ballBoundary['width'] > self.$board.bounds[ballDirection]
      ) {
        console.log('player 1 scored')
        clearInterval(self.$intervalId)

        $ball.stop();
        self.$board.score[0]++
        
        self.$board[0].getElementsByClassName('ball')[0].remove()
        self.createBall("left")
        self.startRound()
      }
    }
  }
})();
pongModule.init();