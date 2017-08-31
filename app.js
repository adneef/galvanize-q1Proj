document.addEventListener('DOMContentLoaded', function() {

  console.log('hellophaser');


  //initialize the game using the Phaser game engine library

  let game = new Phaser.Game(800, 620, Phaser.AUTO, 'arcadeBox', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  // let arcadeBox = document.querySelector('#arcadeBox')
  // arcadeBox.appendChild(game)

  //global variables

  //variables for background and character sprites
  let player
  let bluePlanet
  let blueStart = true
  let starfield
  // let starfield2
  let shipTrail

  //enemies
  let greenEnemies
  let blueEnemies
  let enemyBullets

  //variables for key controls
  let cursors
  let wasd
  let fireButton
  let pause
  let pauseText
  let welcomeText
  let instructionsText
  let altMoveText
  let goalText
  let progText
  let progText2
  let toastText

  //variables for player Physics
  let ACCLERATION = 600;
  let DRAG = 400;
  let MAXSPEED = 400;

  //variables for effects
  let greenLasers
  let tealLasers
  let redLasers
  let yellowLasers
  let bank
  let bullets
  let bulletTimer = 0
  let explosions

  //variables for player health
  let shields
  let maxShields = 100
  let armor
  let playerDeath
  let timeoutID
  let intervalID

  //game state variables
  let greenEnemyLaunchTimer
  let greenEnemySpacing = 1000
  let blueEnemyLaunchTimer
  let blueEnemyLaunched = false
  let blueEnemySpacing = 2500
  let numBlueEnemiesInWave = 5
  let waveIncrease = 0
  let gameOver
  let score = 0
  let scoreText

  function preload() {
    game.load.image('bluePlanet', 'newAssets/bluePlanetExtendedClear.png')
    game.load.image('starfield', 'assets/starfield.png');
    // game.load.image('starfield2', 'newAssets/starfieldClear')
    game.load.image('ship', 'newAssets/redPlayer.png');
    game.load.image('bullet', 'assets/bullet.png')
    game.load.image('enemy-green', 'assets/enemy-green.png')
    game.load.image('blueEnemyBullet', 'assets/enemy-blue-bullet.png')
    game.load.image('enemy-blue', 'assets/enemy-blue.png')
    game.load.spritesheet('explosion', 'assets/explode.png', 128, 128)
    game.load.image('green-laser', 'newAssets/green-laser.png')
    game.load.image('teal-laser', 'newAssets/teal-laser.png')
    game.load.image('red-laser', 'newAssets/red-laser.png')
    game.load.image('yellow-laser', 'newAssets/yellow-laser.png')
  }

  function create() {

    //Scrolling starfield
    starfield = game.add.tileSprite(0, 0, 800, 620, 'starfield');

    //faster scrolling starfield
    // starfield2 = game.add.tileSprite(0, 0, 800, 620, 'starfield2')

    // Blue planet background
    bluePlanet = game.add.tileSprite(0, 0, 800, 620, 'bluePlanet')

    //pause game on load so you're not immediately dropped in to the action
    game.paused = true
    welcomeText = game.add.text(800/2, 75, 'Welcome to Space Scroller!', {font: '36px Impact', fill: '#32cd32'})
    welcomeText.text = 'Welcome to Space Scroller!'
    welcomeText.anchor.setTo(0.5, 0.5)

    instructionsText = game.add.text(800/2, 150, 'Use the mouse to move and shoot.', {font: '30px Impact', fill: '#32cd32'})
    instructionsText.text = 'Use the mouse to move and shoot.'
    instructionsText.anchor.setTo(0.5, 0.5)

    altMoveText = game.add.text(800/2, 180, 'Or drag the mouse off the screen and use a/d or arrows left/right and spacebar to shoot.', {font: '30px Impact', fill: '#32cd32'})
    altMoveText.text = 'Or use a/d or arrows left/right and spacebar to shoot.'
    altMoveText.anchor.setTo(0.5, 0.5)

    goalText = game.add.text(800/2, 255, 'The goal is to get the highest score possible.', {font: '30px Impact', fill: '#32cd32'})
    goalText.text = 'The goal is to get the highest score possible.'
    goalText.anchor.setTo(0.5, 0.5)

    progText = game.add.text(800/2, 330, 'As score increases,', {font: '30px Impact', fill: '#32cd32'})
    progText.text = 'As score increases,'
    progText.anchor.setTo(0.5, 0.5)

    progText2 = game.add.text(800/2, 360, 'weapons ugprade and enemies spawn more often.', {font: '30px Impact', fill: '#32cd32'})
    progText2.text = 'weapons ugprade and enemies spawn more often.'
    progText2.anchor.setTo(0.5, 0.5)

    toastText = game.add.text(800/2, 550, 'Good luck, Survivor!', {font: '30px Impact', fill: '#32cd32'})
    toastText.text = 'Good luck, Survivor!'
    toastText.anchor.setTo(0.5, 0.5)

    //Green laser pool - weapon level 1
    greenLasers = game.add.group()
    greenLasers.enableBody = true
    greenLasers.physicsBodyType = Phaser.Physics.ARCADE
    greenLasers.createMultiple(30, 'green-laser')
    greenLasers.setAll('anchor.x', 0.5)
    greenLasers.setAll('anchor.y', 1)
    greenLasers.setAll('outOfBoundsKill', true)
    greenLasers.setAll('checkWorldBounds', true)

    //Green laser pool - weapon level 2
    tealLasers = game.add.group()
    tealLasers.enableBody = true
    tealLasers.physicsBodyType = Phaser.Physics.ARCADE
    tealLasers.createMultiple(30, 'teal-laser')
    tealLasers.setAll('anchor.x', 0.5)
    tealLasers.setAll('anchor.y', 1)
    tealLasers.setAll('outOfBoundsKill', true)
    tealLasers.setAll('checkWorldBounds', true)

    //Green laser pool - weapon level 3
    redLasers = game.add.group()
    redLasers.enableBody = true
    redLasers.physicsBodyType = Phaser.Physics.ARCADE
    redLasers.createMultiple(30, 'red-laser')
    redLasers.setAll('anchor.x', 0.5)
    redLasers.setAll('anchor.y', 1)
    redLasers.setAll('outOfBoundsKill', true)
    redLasers.setAll('checkWorldBounds', true)

    //Yellow laser pool
    yellowLasers = game.add.group()
    yellowLasers.enableBody = true
    yellowLasers.physicsBodyType = Phaser.Physics.ARCADE
    yellowLasers.createMultiple(60, 'yellow-laser')
    yellowLasers.setAll('anchor.x', 0.5)
    yellowLasers.setAll('anchor.y', 1)
    yellowLasers.setAll('outOfBoundsKill', true)
    yellowLasers.setAll('checkWorldBounds', true)

    //Bullet pool - now only for player ship emitter trail
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
    blueEnemyBullets.callAll('crop', null, {
      x: 90,
      y: 0,
      width: 90,
      height: 70
    })
    blueEnemyBullets.setAll('alpha', 0.9)
    blueEnemyBullets.setAll('anchor.x', 0.5)
    blueEnemyBullets.setAll('anchor.y', 0.5)
    blueEnemyBullets.setAll('outOfBoundsKill', true)
    blueEnemyBullets.setAll('checkWorldBounds', true)
    blueEnemyBullets.forEach(function(enemy) {
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
    blueEnemies.forEach(function(enemy) {
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

    //armor stat
    armor = game.add.text(game.world.width - 150, 10, 'Armor: ' + player.health, {
      font: '20px Impact',
      fill: '#fff'
    })
    armor.render = function() {
      armor.text = 'Armor: ' + Math.max(player.health, 0)
    }
    armor.render()

    //Shields stat
    shields = game.add.text(game.world.width - 150, 35, 'Shields: ' + maxShields + '%', {
      font: '20px Impact',
      fill: '#fff'
    })
    shields.render = function() {
      shields.text = 'Shields: ' + Math.max(maxShields, 0) + '%'
    }
    shields.render()

    //score
    scoreText = game.add.text(10, 10, '', {
      font: '20px Impact',
      fill: '#fff'
    })
    scoreText.render = function() {
      scoreText.text = 'Score: ' + score
    }
    scoreText.render()

    //pause screen
    //on screen pause button creation and function
    pause = game.add.text(10, 35, 'Pause', {font: '24px Impact', fill: '#fff'})
    pause.text = 'Pause'
    pause.inputEnabled = true
    pause.events.onInputUp.add(function(){
      game.paused = true

      pauseText = game.add.text(800/2, 620/2, 'Paused', {font: '36px Impact', fill: '#fff'})
      pauseText.text = 'Paused'
      pauseText.anchor.setTo(0.5, 0.5)
    })


    game.input.onDown.add(unpause, self)

    // function gameStart(){
    //   if(game.paused && welcomeText.text === 'Welcome to Space Scroller!')
    // }

    function unpause() {
      if(game.paused && welcomeText.text === 'Welcome to Space Scroller!'){
        welcomeText.destroy()
        instructionsText.destroy()
        altMoveText.destroy()
        goalText.destroy()
        progText.destroy()
        progText2.destroy()
        toastText.destroy()
        game.paused = false
      }
      else if (game.paused){
        pauseText.destroy()
        game.paused = false
      }
    }

    //Game Over text
    gameOver = game.add.text(game.world.centerX, game.world.centerY, 'Game Over', {
      font: '84px Impact',
      fill: '#fff'
    })
    gameOver.anchor.setTo(0.5, 0.5)
    gameOver.visible = false
  }

  function update() {

    // scroll the planet
    if (blueStart === true) {
      bluePlanet.tilePosition.y = 450
      blueStart = false
    } else {
      bluePlanet.tilePosition.y += .1;
    }

    // //scroll clear starfield, layer 2
    // starfield2.tilePosition += 5

    //scroll the starfield
    starfield.tilePosition.y += 2

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
    game.physics.arcade.overlap(greenEnemies, greenLasers, hitEnemy, null, this)
    game.physics.arcade.overlap(greenEnemies, tealLasers, hitEnemy, null, this)
    game.physics.arcade.overlap(greenEnemies, redLasers, hitEnemy, null, this)
    game.physics.arcade.overlap(greenEnemies, yellowLasers, hitEnemy, null, this)

    game.physics.arcade.overlap(player, blueEnemies, shipCollide, null, this);
    game.physics.arcade.overlap(blueEnemies, bullets, hitEnemy, null, this);
    game.physics.arcade.overlap(blueEnemies, greenLasers, hitEnemy, null, this);
    game.physics.arcade.overlap(blueEnemies, tealLasers, hitEnemy, null, this);
    game.physics.arcade.overlap(blueEnemies, redLasers, hitEnemy, null, this);
    game.physics.arcade.overlap(blueEnemies, yellowLasers, hitEnemy, null, this)

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
  }

  function render() {

    //for (var i = 0; i <enemies.length; i ++){
    // game.debug.body(greenEnemies.children[i])
    // }
    //game.debug.body(player)

  }


  /*Weapons and firing*/


  function fireBullet() {
    //set a firing rate limit

    switch (player.weaponLevel) {
      case 1:

        if (game.time.now > bulletTimer) {

          let BULLET_SPEED = 400
          let BULLET_SPACING = 250

          //grab the first bullet from the pool
          let greenLaser = greenLasers.getFirstExists(false)

          if (greenLaser) {

            //then fire

            //do math to make bullets fire at correct angle from tip of ship
            let bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle))
            greenLaser.reset(player.x + bulletOffset, player.y)
            greenLaser.angle = player.angle
            game.physics.arcade.velocityFromAngle(greenLaser.angle - 90, BULLET_SPEED, greenLaser.body.velocity)
            greenLaser.body.velocity.x += player.body.velocity.x

            bulletTimer = game.time.now + BULLET_SPACING
          }
        }
        break;
      case 2:
        //bi-shot
        if (game.time.now > bulletTimer) {
          let BULLET_SPEED = 400
          let BULLET_SPACING = 250

          for (let i = 0; i < 2; i++) {

            let tealLaser = tealLasers.getFirstExists(false)

            if (tealLaser) {

              let bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle))
              tealLaser.reset(player.x + bulletOffset, player.y)

              //create 'spread' for first and third bullets
              let spreadAngle
              if (i === 0) spreadAngle = -2.5
              if (i === 1) spreadAngle = 2.5
              // if (i === 2) spreadAngle = 5

              tealLaser.angle = player.angle + spreadAngle
              game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, tealLaser.body.velocity)
              tealLaser.body.velocity.x += player.body.velocity.x

              bulletTimer = game.time.now + BULLET_SPACING
            }
          }
        }
        break;
      case 3:
        //tri-shot
        if (game.time.now > bulletTimer) {
          let BULLET_SPEED = 400
          let BULLET_SPACING = 200

          for (let i = 0; i < 3; i++) {

            let redLaser = redLasers.getFirstExists(false)

            if (redLaser) {

              let bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle))
              redLaser.reset(player.x + bulletOffset, player.y)

              //create 'spread' for first and third bullets
              let spreadAngle
              if (i === 0) spreadAngle = -5
              if (i === 1) spreadAngle = 0
              if (i === 2) spreadAngle = 5

              redLaser.angle = player.angle + spreadAngle
              game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, redLaser.body.velocity)
              redLaser.body.velocity.x += player.body.velocity.x

              bulletTimer = game.time.now + BULLET_SPACING
            }
          }
        }
        break;
      case 4:
        //penta-shot
        if (game.time.now > bulletTimer) {
          let BULLET_SPEED = 400
          let BULLET_SPACING = 200

          for (let i = 0; i < 5; i++) {

            let yellowLaser = yellowLasers.getFirstExists(false)

            if (yellowLaser) {

              let bulletOffset = 20 * Math.sin(game.math.degToRad(player.angle))
              yellowLaser.reset(player.x + bulletOffset, player.y)

              //create 'spread' for first and third bullets
              let spreadAngle
              if (i === 0) spreadAngle = 15
              if (i === 1) spreadAngle = 7.5
              if (i === 2) spreadAngle = 0
              if (i === 3) spreadAngle = -7.5
              if (i === 4) spreadAngle = -15

              yellowLaser.angle = player.angle + spreadAngle
              game.physics.arcade.velocityFromAngle(spreadAngle - 90, BULLET_SPEED, yellowLaser.body.velocity)
              yellowLaser.body.velocity.x += player.body.velocity.x

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

    //launch wave
    for (var i = 0; i < numBlueEnemiesInWave; i++) {
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
          if (enemyBullet && this.alive && this.bullets && this.y > game.width / 8 && game.time.now > firingDelay + this.lastShot) {
            this.lastShot = game.time.now
            this.bullets--
              enemyBullet.reset(this.x, this.y + this.height / 2)
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
    blueEnemyLaunchTimer = game.time.events.add(game.rnd.integerInRange(blueEnemySpacing, blueEnemySpacing + 1000), launchBlueEnemy)
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

    //reset shieldRegen on ship collide
    clearInterval(intervalID)
    clearTimeout(timeoutID)
    timeoutID = setTimeout(shieldRegen, 2000)

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

    // shields break on ship collide
    if (maxShields > 0) {
      maxShields = 0
      shields.render()
    } else if (maxShields === 0) {
      player.damage(enemy.damageAmount)
      shields.render()
      armor.render()
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
    greenEnemySpacing *= 0.8
    //blue enemies come in after score reaches 1000
    if (!blueEnemyLaunched && score > 1000) {
      blueEnemyLaunched = true
      launchBlueEnemy()
      //slow green enemies as blues start to show up
      greenEnemySpacing *= 1.8
    }
    if (blueEnemyLaunched && score > 49999 && score < 50201) {
      console.log('Wave Increase');
      numBlueEnemiesInWave += 1
    }
    if (blueEnemyLaunched && score > 149999 && score < 150201) {
      console.log('Wave Increase');
      numBlueEnemiesInWave += 1
    }
    if (blueEnemyLaunched && score > 249999 && score < 250201) {
      console.log('Wave Increase');
      numBlueEnemiesInWave += 1
    }

    //weapon upgrade on score threshold
    if (score > 3000 && player.weaponLevel < 2) {
      player.weaponLevel = 2
    } else if (score > 25000 && player.weaponLevel < 3) {
      player.weaponLevel = 3
    } else if (score > 100000 && player.weaponLevel < 4) {
      player.weaponLevel = 4
    }
  }

  function enemyHitsPlayer(player, bullet) {
    bullet.kill()

    //reset shieldRegen on hit
    clearInterval(intervalID)
    clearTimeout(timeoutID)
    timeoutID = setTimeout(shieldRegen, 2000)

    // shields break on player hit with shot
    if (maxShields > 0) {
      maxShields = 0
      shields.render()
    } else if (maxShields === 0) {
      player.damage(bullet.damageAmount)
      shields.render()
      armor.render()
    }

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
    shields.render()
    score = 0
    scoreText.render()
    blueStart = true
    bluePlanet.tilePosition.y = 450

    //hide 'game over' text
    gameOver.visible = false

    // reset pacing
    greenEnemySpacing = 1000
    blueEnemyLaunched = false
    blueEnemySpacing = 2500
    numBlueEnemiesInWave = 5
  }

  //functions for shield regen
  function shieldRegen() {
    clearInterval(intervalID)
    maxShields = 0
    intervalID = setInterval(function() {
      if (maxShields < 100) {
        maxShields += 5
        shields.render()
      } else {
        clearInterval(intervalID)
      }
    }, 100)
  }
})
