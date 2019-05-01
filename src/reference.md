# document game flow

type Origin = Center

type GameState = Init | Running | AnimatingGameOver | GameOver

gs = GameState.Init

- Paddle

  - position = (0,0)
  - size = (100,10)
  - origin = Origin.Center
  - viewportBottomOffset = 10

- Ball

  - position = (0,0)
  - radius = 10
  - origin = Origin.Center
  - velocity = Velocity(with Speed 100pps and Direction South)

- Viewport
  - width = 400

# Main

- gs == GameState.Init

  - paddle = Paddle()
  - place **paddle** at **Viewport** center
  - align **paddle** bottom with **Viewport** bottom
  - move **paddle** up by **Paddle.viewportBottomOffset**
  - ball = Ball()
  - place ball at **Viewport** center
  - gs = Running

- gs == GameState.Running

  - check if moving ball by its velocity
    - collides with paddle:
      - bounce ball of colliding edge
    - collides with Viewport left, top, or right edges
      - bounce ball of colliding edge
    - collides with Viewport bottom edge
      - move ball to point of collision
      - gs = AnimatingGameOver

- gs == GameState.AnimatingGameOver
  - when 3 seconds have elapsed

    - gs = GameOver

* gs == GameState.GameOver

# Events

## Keyboard

- gs == GameState.Running

  - left

    - move paddle left by **paddleUserDisplacement**
    - constrain paddle within **Viewport**

  - right
    - move paddle right by **paddleUserDisplacement**
    - constrain paddle within **Viewport**

- gs = GameState.AnimatingGameOver
  - any
    - gs = GameState.Init
