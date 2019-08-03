const KEYS = {
	SPACE: 32,
	LEFT: 37,
	RIGHT: 39
};

const game = {
	ctx: null,
	platform: null,
	ball: null,
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
	
	init () {
		this.ctx = document.getElementById('myCanvas').getContext('2d');
		this.setEvents();
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
		const required = Object.keys(this.sprites).length;
		const onImageLoad = () => {
			++loaded;

			if (loaded >= required) {
				callback();
			};				
		};

		for (let key in this.sprites) {
			this.sprites[key] = new Image();
			this.sprites[key].src = 'img/' + key + '.png';
			this.sprites[key].addEventListener('load', onImageLoad);
		};
	},

	create() {
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				this.blocks.push({
					width: 60,
					height: 20,
					x: 64 * col + 65,
					y: 24 * row + 35
				});
			};
		};
	},

	update() {
		this.platform.move();
		this.ball.move();

		for (let block of this.blocks) {
			if (this.ball.collide(block)) {
				this.ball.bumbBlock(block);
			};
		};

		if (this.ball.collide(this.platform)) {
			this.ball.bumbPlatform(this.platform);
		};
	},

	run () {
		window.requestAnimationFrame(() => {
			this.update();
			this.render();
			this.run();
		});
	},

	render () {
		this.ctx.clearRect(0, 0, this.width, this.height);

		this.ctx.drawImage(this.sprites.background, 0, 0 , this.width, this.height);
		this.ctx.drawImage(this.sprites.ball, this.ball.x, this.ball.y, 20, 20);
		this.ctx.drawImage(this.sprites.platform, this.platform.x, this.platform.y, 150, 20);
		
		this.renderBlocks();
		
	},

	renderBlocks() {
		for (let block of this.blocks) {
			this.ctx.drawImage(this.sprites.block, block.x, block.y, 60, 20);
		};
	},

	start: function () {
		this.init();
		this.preload(() => {
			this.create();
			this.run();
		});
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
	bumbBlock (block) {
		this.dy *= -1;
	},
	bumbPlatform (platform) {
		this.dy *= -1;
	},
};

game.platform = {
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
	x: 245,
	y: 300,
};



window.addEventListener('load', () => {
	game.start()
});