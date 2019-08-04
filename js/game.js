const KEYS = {
	SPACE: 32,
	LEFT: 37,
	RIGHT: 39
};

const game = {
	running: true,
	ctx: null,
	platform: null,
	ball: null,
	score: 0,
	blocks: [],
	rows: 6,
	cols: 8,
	width: 640,
	height: 360,
	sprites : {
		background: null,
		ball: null,
		platform: null,
		block: null
	},
	sounds: {
		bump: null,
		toLose: null,
		win: null,
	},
	
	init () {
		this.ctx = document.getElementById('myCanvas').getContext('2d');
		this.setTextFonts();
		this.setEvents();
	},

	setTextFonts () {
		this.ctx.font = '20px Arial';
		this.ctx.fillStyle = '#ffffff';
	},

	setEvents () {
		window.addEventListener('keydown', event => {
			if (event.keyCode === KEYS.SPACE) {
				this.platform.fire();
			} else if (event.keyCode === KEYS.LEFT || event.keyCode === KEYS.RIGHT) {
				this.platform.start(event.keyCode);
			};
		});

		window.addEventListener('keyup', event => {
			this.platform.stop();
		});
	},

	preload (callback) {
		let loaded = 0;
		let required = Object.keys(this.sprites).length;
		required += Object.keys(this.sounds).length;

		const onResourceLoad = () => {
			++loaded;

			if (loaded >= required) {
				callback();
			};				
		};

		this.preloadSprites(onResourceLoad);
		this.preloadAudio(onResourceLoad);
	},

	preloadSprites (onResourceLoad) {
		for (let key in this.sprites) {
			this.sprites[key] = new Image();
			this.sprites[key].src = 'img/' + key + '.png';
			this.sprites[key].addEventListener('load', onResourceLoad);
		};
	},

	preloadAudio (onResourceLoad) {
		for (let key in this.sounds) {
			this.sounds[key] = new Audio('sounds/' + key + '.mp3');
			this.sounds[key].addEventListener('canplaythrough', onResourceLoad, {once: true});
		};
	},

	create() {
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				this.blocks.push({
					active: true,
					width: 60,
					height: 20,
					x: 64 * col + 65,
					y: 24 * row + 35
				});
			};
		};
	},

	update () {
		this.collideBlocks();
		this.collidePlatform();
		this.ball.collideWorldBounds();
		this.platform.collideWorldBounds();
		this.platform.move();
		this.ball.move();
	},

	addScore () {
		++this.score;

		if (this.score >= this.blocks.length) {
			this.sounds.win.play();
			this.end('You win!');
		};
	},

	collideBlocks () {
		for (let block of this.blocks) {
			if (block.active && this.ball.collide(block)) {
					this.ball.bumbBlock(block);
					this.addScore();
					this.sounds.bump.play();
			};
		};
	},

	collidePlatform () {
		if (this.ball.collide(this.platform)) {
			this.ball.bumbPlatform(this.platform);
			this.sounds.bump.play();
		};
	},

	run () {
		if (this.running) {
			window.requestAnimationFrame(() => {
				this.update();
				this.render();
				this.run();
			});
		};
	},

	render () {
		this.ctx.clearRect(0, 0, this.width, this.height);

		this.ctx.drawImage(this.sprites.background, 0, 0 , this.width, this.height);
		this.ctx.drawImage(this.sprites.ball, this.ball.x, this.ball.y, 20, 20);
		this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y, 150, 20);
		
		this.renderBlocks();
		this.ctx.fillText('Score: ' + this.score, 20, 30);
		
	},

	renderBlocks() {
		for (let block of this.blocks) {
			if (block.active) {
				this.ctx.drawImage(this.sprites.block, block.x, block.y, 60, 20);
			};
		};
	},

	start () {
		this.init();
		this.preload(() => {
			this.create();
			this.run();
		});
	},

	end (message) {
		this.running = false;
		alert(message);
		window.location.reload();
	},

	random (min, max) {
		const result = Math.floor(Math.random() * (max - min + 1) + min);

		return result;
	}
};

game.ball = {
	x: 310,
	y: 280,
	dx: 0,
	dy: 0,
	velosity: 3,
	width: 20,
	height: 20,
	start () {
		this.dx = game.random (-this.velosity, this.velosity);
		this.dy = -this.velosity;
	},
	move () {
		if (this.dx) {
			this.x += this.dx;
		};

		if (this.dy) {
			this.y += this.dy;
		};
	},
	collide (element) {
		const x = this.x + this.dx;
		const y = this.y + this.dy;

		if (x + this.width > element.x &&
		x < element.x + element.width &&
		y + this.height > element.y &&
		y < element.y + element.height) {
			return true;
		};
		return false;
	},
	collideWorldBounds () {
		const x = this.x + this.dx;
		const y = this.y + this.dy;

		const ballLeft = x;
		const ballRight = ballLeft + this.width;
		const ballTop = y;
		const ballBottom = ballTop + this.height;

		const worldLeft = 0;
		const worldRight = game.width;
		const worldTop = 0;
		const worldBottom = game.height;

		if (ballLeft < worldLeft) {
			this.x = 0;
			this.dx = this.velosity;
			game.sounds.bump.play();
		} else if (ballRight > worldRight) {
			this.x = worldRight - this.width;
			this.dx = -this.velosity;
			game.sounds.bump.play();
		} else if (ballTop < worldTop) {
			this.y = 0;
			this.dy = this.velosity;
			game.sounds.bump.play();
		} else if (ballBottom > worldBottom) {
			game.sounds.toLose.play();
			game.end('Loser!');
		};
	},
	bumbBlock (block) {
		block.active = false;
		this.dy *= -1;
	},
	bumbPlatform (platform) {
		if (platform.dx) {
			this.x += platform.dx;
		};

		if (this.dy > 0) {
			const touchX = this.x + this.width / 2;
			this.dx = this.velosity * platform.getTouchOffset(touchX);
			this.dy = -this.velosity;
		};		
	},
};

game.platform = {
	x: 245,
	y: 300,
	velosity: 6,
	dx: 0,
	width: 150,
	height: 20,
	ball: game.ball,
	fire () {
		if (this.ball) {
			this.ball.start();
			this.ball = null;
		};
	},
	start (direction) {
		if (direction === KEYS.LEFT) {
			this.dx = -this.velosity;
		} else if (direction === KEYS.RIGHT) {
			this.dx = this.velosity;
		};
	},
	stop () {
		this.dx = 0;
	},
	move () {
		if (this.dx) {
			this.x += this.dx;
			if (this.ball) {
				this.ball.x += this.dx;
			};
		};
	},
	getTouchOffset (x) {
		const diff = (this.x + this.width) - x;
		const offset = this.width - diff;
		const result = 2 * offset / this.width;

		return result - 1;
	},
	collideWorldBounds () {
	    const x = this.x + this.dx;
	    const platformLeft = x;
	    const platformRight = platformLeft + this.width;
	    const worldLeft = 0;
	    const worldRight = game.width;

	    if (platformLeft < worldLeft || platformRight > worldRight) {
	        this.dx = 0;
	    };
	}
};



window.addEventListener('load', () => {
	game.start()
});