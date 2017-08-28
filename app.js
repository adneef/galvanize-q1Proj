document.addEventListener('DOMContentLoaded', function() {

  console.log('hellophaser');


  //initialize the game using the Phaser game engine library

  let game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-demo', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  //global variables

  //variables for background and character sprites
  let player
  let starfield
  let shipTrail

  //enemies
  let greenEnemies
  let blueEnemies
  let enemyBullets

  //variables for key controls
  let cursors
  let wasd
  let fireButton

  //variables for player Physics
  let ACCLERATION = 600;
  let DRAG = 400;
  let MAXSPEED = 400;

  //variables for effects
  let bank
  let bullets
  let bulletTimer = 0
  let explosions

  //variables for player health
  let shields
  let amor
  let playerDeath

  //game state variables
  let greenEnemyLaunchTimer
  let greenEnemySpacing = 1000
  let blueEnemyLaunchTimer
  let blueEnemyLaunched = false
  let gameOver
  let score = 0
  let scoreText

  function preload() {
    game.load.image('starfield', 'assets/starfield.png');
    game.load.image('ship', 'assets/player.png');
    game.load.image('bullet', 'assets/bullet.png')
    game.load.image('enemy-green', 'assets/enemy-green.png')
    game.load.image('blueEnemyBullet', 'assets/enemy-blue-bullet.png')
    game.load.image('enemy-blue', 'assets/enemy-blue.png')
    game.load.spritesheet('explosion', 'assets/explode.png', 128, 128)
    game.load.bitmapFont('spacefont', 'assets/spacefont.png', 'https://rawgit.com/jschomay/phaser-demo-game/master/assets/spacefont/spacefont.xml')
  }

  function create() {

    //Scrolling starfield
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    //Bullet pool
    bullets = game.add.group()
    bullets.enableBody = true
    bullets.physicsBodyType = Phaser.Physics.ARCADE
    bullets.createMultiple(30, 'bullet')
    bullets.setAll('anchor.x', 0.5)
    bullets.setAll('anchor.y', 1)
    bullets.setAll('outOfBoundsKill', true)
    bullets.setAll('checkWorldBounds', true)

    //Player ship
    player = game.add.sprite(400, 500, 'ship');
    player.health = 100
    player.maxHealth = 100
    player.anchor.setTo(0.5, 0.5);

    //Player ship physics
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.maxVelocity.setTo(MAXSPEED, MAXSPEED);
    player.body.drag.setTo(DRAG, DRAG);
    player.weaponLevel = 1
    //turn off shiptrail on player kill
    player.events.onKilled.add(function() {
      shipTrail.kill()
    })
    //turn ship trail on on revive
    player.events.onRevived.add(function() {
      shipTrail.start(false, 5000, 10)
    })

    //enemies
    greenEnemies = game.add.group()
    greenEnemies.enableBody = true
    greenEnemies.physicsBodyType = Phaser.Physics.ARCADE
    greenEnemies.createMultiple(5, 'enemy-green')
    greenEnemies.setAll('anchor.x', 0.5)
    greenEnemies.setAll('anchor.y', 0.5)
    greenEnemies.setAll('scale.x', 0.5)
    greenEnemies.setAll('scale.y', 0.5)
    greenEnemies.setAll('angle', 180)

    //set enemy attributes on render
    greenEnemies.forEach(function(enemy) {
      addEnemyEmitterTrail(enemy)
      enemy.body.setSize(enemy.width * 3 / 4, enemy.height * 3 / 4)
      enemy.damageAmount = 20
      enemy.events.onKilled.add(function() {
        enemy.trail.kill();
      })
    })

    game.time.events.add(1000, launchGreenEnemy)

    //blue enemies fire bullets
    blueEnemyBullets = game.add.group()
    blueEnemyBullets.enableBody = true
    blueEnemyBullets.physicsBodyType = Phaser.Physics.ARCADE
    blueEnemyBullets.createMultiple(30, 'blueEnemyBullet')
    blueEnemyBullets.callAll('crop', null, {x: 90, y: 0, width: 90, height: 70})
    blueEnemyBullets.setAll('alpha', 0.9)
    blueEnemyBullets.setAll('anchor.x', 0.5)
    blueEnemyBullets.setAll('anchor.y', 0.5)
    blueEnemyBullets.setAll('outOfBoundsKill', true)
    blueEnemyBullets.setAll('checkWorldBounds', true)
    blueEnemyBullets.forEach(function(enemy){
      enemy.body.setSize(20, 20)
    })

    //blue enemies
    blueEnemies = game.add.group();
    blueEnemies.enableBody = true;
    blueEnemies.physicsBodyType = Phaser.Physics.ARCADE;
    blueEnemies.createMultiple(30, 'enemy-blue');
    blueEnemies.setAll('anchor.x', 0.5);
    blueEnemies.setAll('anchor.y', 0.5);
    blueEnemies.setAll('scale.x', 0.5);
    blueEnemies.setAll('scale.y', 0.5);
    blueEnemies.setAll('angle', 180);
    blueEnemies.forEach(function(enemy){
        enemy.damageAmount = 40;
    });

    //player controls for arrows and wasd
    cursors = game.input.keyboard.createCursorKeys();

    wasd = game.input.keyboard.addKeys({
      'up': Phaser.KeyCode.W,
      'down': Phaser.KeyCode.S,
      'left': Phaser.KeyCode.A,
      'right': Phaser.KeyCode.D
    });

    //add firebuttons
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

    //add a plasma trail for the ship
    shipTrail = game.add.emitter(player.x, player.y + 10, 400)
    shipTrail.width = 10
    shipTrail.makeParticles('bullet')
    shipTrail.setXSpeed(30, -30)
    shipTrail.setYSpeed(200, 180)
    shipTrail.setRotation(50, -50)
    shipTrail.setAlpha(1, 0.01, 800)
    shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out)
    shipTrail.start(false, 5000, 10)

    //create explosion pool
    explosions = game.add.group()
    explosions.enableBody = true
    explosions.physicsBodyType = Phaser.Physics.ARCADE
    explosions.createMultiple(30, 'explosion')
    explosions.setAll('anchor.x', 0.5)
    explosions.setAll('anchor.y', 0.5)
    explosions.forEach(function(explosion) {
      explosion.animations.add('explosion')
    })

    //big explosion
    playerDeath = game.add.emitter(player.x, player.y)
    playerDeath.width = 50
    playerDeath.height = 50
    playerDeath.makeParticles('explosion', [0, 1, 2, 3, 4, 5, 6, 7], 10)
    playerDeath.setAlpha(0.9, 0, 800)
    playerDeath.setScale(0.1, 0.6, 0.1, 0.6, 1000, Phaser.Easing.Quintic.Out)

    //Shields stat
    armor = game.add.text(game.world.width - 150, 10, 'Armor: ' + player.health, {font: '20px Impact', fill: '#fff'})
    armor.render = function() {
      armor.text = 'Armor: ' + Math.max(player.health, 0)
    }
    armor.render()

    shields = game.add.text(game.world.width - 150, 35, 'Shields' + player.maxHealth + '%', {font: '20px Impact', fill: '#fff'})
    shields.render = function() {
      shields.text = 'Shields: ' + Math.max(player.maxHealth, 0) + '%'
    }
    shields.render()

    //score
    scoreText = game.add.text(10, 10, '', { font: '20px Impact', fill: '#fff'})
    scoreText.render = function() {
      scoreText.text = 'Score: ' + score
    }
    scoreText.render()

    //Game Over text
    // gameOver = game.add.text(game.world.centerX, game.world.centerY, 'Game Over', {font: '84px Arial', fill: '#fff'})
    // gameOver.anchor.setTo(0.5, 0.5)
    gameOver = game.add.bitmapText(game.world.centerX, game.world.centerY, 'spacefont', 'GAME OVER', 110)
    gameOver.x = gameOver.x - gameOver.textWidth / 2
    gameOver.y = gameOver.y - gameOver.textHeight / 3
    gameOver.visible = false
  }

  function update() {

    //scroll the starfield
    starfield.tilePosition.y += 2;

    //reset player physics to still when key controls are released
    player.body.acceleration.x = 0

    //fire bullet
    if (player.alive && (fireButton.isDown || game.input.activePointer.isDown)) {
      fireBullet()
    }

    //bind keys to movement and movement type
    if (cursors.left.isDown || wasd.left.isDown) {
      player.body.acceleration.x = -ACCLERATION;
    } else if (cursors.right.isDown || wasd.right.isDown) {
      player.body.acceleration.x = ACCLERATION;
    }

    //stop player ship at screen edges
    if (player.x > game.width - 50) {
      player.x = game.width - 50,
        player.body.acceleration.x = 0;
    }

    if (player.x < 50) {
      player.x = 50,
        player.body.acceleration.x = 0;
    }

    //add mouse control option
    if (game.input.x < game.width - 20 &&
      game.input.x > 20 &&
      game.input.y > 20 &&
      game.input.y < game.height - 20) {
      let minDist = 200
      let dist = game.input.x - player.x
      player.body.velocity.x = MAXSPEED * game.math.clamp(dist / minDist, -1, 1)
    }

    //squish ship for effect when 'banking'
    bank = player.body.velocity.x / MAXSPEED;
    player.scale.x = 1 - Math.abs(bank) / 2;
    player.angle = bank * 30;

    //keep trail lined up with ship
    shipTrail.x = player.x

    //Check collisions
    game.physics.arcade.overlap(player, greenEnemies, shipCollide, null, this)
    game.physics.arcade.overlap(greenEnemies, bullets, hitEnemy, null, this)

    game.physics.arcade.overlap(player, blueEnemies, shipCollide, null, this);
    game.physics.arcade.overlap(blueEnemies, bullets, hitEnemy, null, this);

    //blue enemy bullet collision
    game.physics.arcade.overlap(blueEnemyBullets, player, enemyHitsPlayer, null, this)

    //Game over?
    if (!player.alive && gameOver.visible === false) {
      gameOver.visible = true
      gameOver.alpha = 0
      let fadeInGameOver = game.add.tween(gameOver)
      fadeInGameOver.to({
        alpha: 1
      }, 1000, Phaser.Easing.Quintic.Out)
      fadeInGameOver.onComplete.add(setResetHandlers)
      fadeInGameOver.start()

      function setResetHandlers() {
        //'click to restart' handler
        tapRestart = game.input.onTap.addOnce(_restart, this)
        spaceRestart = fireButton.onDown.addOnce(_restart, this)

        function _restart() {
          tapRestart.detach()
          spaceRestart.detach()
          restart()
        }
      }
    }
    // if (player.alive && player.health < player.maxHealth) {
    //   player.health += 1
    // }
    // shields.render()
  }

  function render() {

    //for (var i = 0; i <enemies.length; i ++){
    // game.debug.body(greenEnemies.children[i])
    // }
    //game.debug.body(player)

  }

  function fireBullet() {
    //set a firing rate limit

    switch (player.weaponLevel) {
      case 1:

      if (game.time.now > bulletTimer) {

        let BULLET_SPEED = 400
        let BULLET_SPACING = 250

        //grab the first bullet from the pool
        let bullet = bullets.getFirstExists(false)

        if (bullet) {

          //then fire

          //do math to make bullets fire at correct angle from tip of ship
          let bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle))
          bullet.reset(player.x + bulletOffset, player.y)
          bullet.angle = player.angle
          game.physics.arcade.velocityFromAngle(bullet.angle - 90, BULLET_SPEED, bullet.body.velocity)
          bullet.body.velocity.x += player.body.velocity.x

          bulletTimer = game.time.now + BULLET_SPACING
        }
      }
      break;
      case 2:
      //tri-shot
      if (game.time.now > bulletTimer) {
        let BULLET_SPEED = 400
        let BULLET_SPACING = 250

        for (let i = 0; i < 3; i++){
          let bullet = bullets.getFirstExists(false)
          if (bullet){

            let bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle))
            bullet.reset(player.x + bulletOffset, player.y)

            //create 'spread' for first and third bullets
            let spreadAngle
            if (i === 0) spreadAngle = -20
            if (i === 1) spreadAngle = 0
            if (i === 2) spreadAngle = 20

            bullet.angle = player.angle + spreadAngle
            game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, bullet.body.velocity)
            bullet.body.velocity.x += player.body.velocity.x

            bulletTimer = game.time.now + BULLET_SPACING
          }
        }
      }
      break;
      case 3:
      //rapid tri-shot
      if (game.time.now > bulletTimer) {
        let BULLET_SPEED = 400
        let BULLET_SPACING = 100

        for (let i = 0; i < 3; i++){
          let bullet = bullets.getFirstExists(false)
          if (bullet){

            let bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle))
            bullet.reset(player.x + bulletOffset, player.y)

            //create 'spread' for first and third bullets
            let spreadAngle
            if (i === 0) spreadAngle = -20
            if (i === 1) spreadAngle = 0
            if (i === 2) spreadAngle = 20

            bullet.angle = player.angle + spreadAngle
            game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, bullet.body.velocity)
            bullet.body.velocity.x += player.body.velocity.x

            bulletTimer = game.time.now + BULLET_SPACING
          }
        }
      }
    }
  }
  function launchGreenEnemy() {

    let ENEMY_SPEED = 300

    let enemy = greenEnemies.getFirstExists(false)
    if (enemy) {
      enemy.reset(game.rnd.integerInRange(0, game.width), -20)
      enemy.body.velocity.x = game.rnd.integerInRange(-300, 300)
      enemy.body.velocity.y = ENEMY_SPEED
      enemy.body.drag.x = 100

      enemy.trail.start(false, 800, 1)

      //update function to rotate green enemy
      enemy.update = function() {
      enemy.angle = 180 - game.math.radToDeg(Math.atan2(enemy.body.velocity.x, enemy.body.velocity.y))

      enemy.trail.x = enemy.x
      enemy.trail.y = enemy.y - 10

      //destroy enemies once they go off screen
      if (enemy.y > game.height + 200) {
        enemy.kill()
        enemy.y = -20
      }
    }
  }

    //launch another enemy
    greenEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(greenEnemySpacing, greenEnemySpacing + 1000), launchGreenEnemy)
  }

  function launchBlueEnemy() {

    let startingX = game.rnd.integerInRange(100, game.width - 100)
    let verticalSpeed = 180
    let spread = 60
    let frequency = 70
    let verticalSpacing = 70
    let numEnemiesInWave = 5
    let timeBetweenWaves = 2500

    //launch wave
    for (var i = 0; i < numEnemiesInWave; i++) {
      let enemy = blueEnemies.getFirstExists(false)
      if (enemy) {
        enemy.startingX = startingX
        enemy.reset(game.width / 2, -verticalSpacing * i)
        enemy.body.velocity.y = verticalSpeed

        //blue enemy firing
        let bulletSpeed = 400
        let firingDelay = 2000
        enemy.bullets = 1
        enemy.lastShot = 0

        //update function for each enemy
        enemy.update = function() {
          //wave movement
          this.body.x = this.startingX + Math.sin((this.y) / frequency) * spread

          //squish and rotate ship for illusion of banking
          bank = Math.cos((this.y + 60) / frequency)
          this.scale.x = 0.5 - Math.abs(bank) / 8
          this.angle = 180 - bank * 2

          //firing
          enemyBullet = blueEnemyBullets.getFirstExists(false)
          if (enemyBullet && this.alive && this.bullets && this.y > game.width / 8 && game.time.now > firingDelay + this.lastShot){
            this.lastShot = game.time.now
            this.bullets--
            enemyBullet.reset(this.x, this.y + this.height /2)
            enemyBullet.damageAmount = this.damageAmount
            let angle = game.physics.arcade.moveToObject(enemyBullet, player, bulletSpeed)
            enemyBullet.angle = game.math.radToDeg(angle)
          }

          //destroy enemies once off screen
          if (this.y > game.height + 200) {
            this.kill()
            this.y = -20
          }
        }
      }
    }

    //launch next wave of blue enemies
    blueEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(timeBetweenWaves, timeBetweenWaves + 1000), launchBlueEnemy)
  }

  function addEnemyEmitterTrail(enemy) {
    let enemyTrail = game.add.emitter(enemy.x, player.y - 10, 100)
    enemyTrail.width = 10
    enemyTrail.makeParticles('explosion', [1, 2, 3, 4, 5])
    enemyTrail.setXSpeed(20, -20)
    enemyTrail.setRotation(50, -50)
    enemyTrail.setAlpha(0.4, 0, 800)
    enemyTrail.setScale(0.01, 0.1, 0.01, 0.1, 1000, Phaser.Easing.Quintic.Out)
    enemy.trail = enemyTrail
  }

  function shipCollide(player, enemy) {
    enemy.kill()

    player.damage(enemy.damageAmount)
    armor.render()

    if (player.alive) {
      let explosion = explosions.getFirstExists(false)
      explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight)
      explosion.alpha = 0.7
      explosion.play('explosion', 30, false, true)
    } else {
      playerDeath.x = player.x
      playerDeath.y = player.y
      playerDeath.start(false, 1000, 10, 10)
    }
  }

  function hitEnemy(enemy, bullet) {
    let explosion = explosions.getFirstExists(false)
    explosion.reset(bullet.body.x + bullet.body.halfWidth, bullet.body.y + bullet.body.halfHeight)
    explosion.body.velocity.y = enemy.body.velocity.y
    explosion.alpha = 0.7
    explosion.play('explosion', 30, false, true)
    enemy.kill()
    bullet.kill()

    //increase score
    score += enemy.damageAmount * 10
    scoreText.render()

    //pacing
    //enemies come quicker as score increases
    greenEnemySpacing *= 0.9
    //blue enemies come in after score reaches 1000
    if(!blueEnemyLaunched && score > 1000) {
      blueEnemyLaunched = true
      launchBlueEnemy()
      //slow green enemies as blues start to show up
      greenEnemySpacing *=2
    }
    //weapon upgrade on score threshold
    if (score > 2000 && player.weaponLevel < 2){
      player.weaponLevel = 2
    }
    else if(score > 4000 && player.weaponLevel < 3) {
    player.weaponLevel = 3
    }
  }

  function enemyHitsPlayer(player, bullet) {
    bullet.kill()

    player.damage(bullet.damageAmount)
    armor.render()

    if (player.alive) {
      let explosion = explosions.getFirstExists(false)
      explosion.reset(player.body.x + player.body.halfWidth, player.body.y + player.body.halfHeight)
      explosion.alpha = 0.7
      explosion.play('explosion', 30, false, true)
    } else {
      playerDeath.x = player.x
      playerDeath.y = player.y
      playerDeath.start(false, 1000, 10, 10)
    }
  }

  function restart() {
    //reset the enemies
    greenEnemies.callAll('kill')
    game.time.events.remove(greenEnemyLaunchTimer)
    game.time.events.add(1000, launchGreenEnemy)

    blueEnemyBullets.callAll('kill')
    blueEnemies.callAll('kill')
    game.time.events.remove(blueEnemyLaunchTimer)

    //revive the player
    player.weaponLevel = 1
    player.revive()
    player.health = 100
    armor.render()
    score = 0
    scoreText.render()

    //hide 'game over' text
    gameOver.visible = false

    greenEnemySpacing = 1000
    blueEnemyLaunched = false
  }
})
