// Sum game
// Author: Grayson Jorgenson

// game constants
const MAX_BOARD_SIZE = 19;
const MIN_BOARD_SIZE = 9;
const BOARD_SIZE_INCREMENT = 2; // only allows for odd board sizes, so draws are impossible
const HOLE_INCREMENT = 2;

// visual constants
const BORDER = 5; // 5 pixel padding around game board
const BOARD_PIXEL_SIZE = 440; // size of the square board in pixels
const BUTTON_BACK_COLOR = "#6fb9d9";
const BUTTON_INACTIVE_COLOR = "#616665";
const BUTTON_TEXT_COLOR = "#000000";
const PLAIN_TEXT_COLOR = "#000000";
const BACKGROUND_COLOR = "#def5ff";
const BOARD_COLOR = "#42a2b3";

// number of holes should be limited accordingly

var room = 0; // two values: 0 for main menu, 1 for in-game room
var play_as = 1; // by default, play as white, 1. -1 is black.
var board_size = 9; // n x n board size
var human_won = 0; // 0 - game still in progress, -1 - human lost, 1 - human won. This is only for the gauntlet
var num_holes = 0; // number of holes in the board, has to be even.
var max_num_holes = board_size*board_size/2; // determined by this formula. Updated every time board size changes
var mouse_x;
var mouse_y;
var about_to_resign = false; // whether the user has clicked the resign button just once

// game variables
var game_board; // game_board currently in use
var player1_id; // the id of the player of white in the game, 0 - human, 1 - 5 the automated opponents
var player2_id; // the id of the player of black in the game
var whose_turn; // boolean which records whether it is player1 or player2 turn

function begin() {
    screen.initialize();
    screen.draw();
}

// GRAPHICS AND USER INTERFACE

var screen = {
  canvas : document.createElement("canvas"),
  initialize : function() {
    this.canvas.width = 650;
    this.canvas.height = BOARD_PIXEL_SIZE + 2*BORDER;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    document.addEventListener("click", mouse_click);
  },
  draw : function() {
    // first clear the screen (also sets the background color)
    this.clear();

    if (room == 0) // main menu
    {
      // human vs human button
      this.hvh_button = new button(200, 50, BUTTON_BACK_COLOR, BUTTON_TEXT_COLOR, "Human vs Human", 30, 100);
      this.hvh_button.draw();

      // human vs human description
      this.context.textAlign = "left";
      this.context.font = "15px Arial";
      this.context.fillStyle = "black";
      this.context.fillText(" > play against another person", 30, 165);
      this.context.fillText("   on the same machine", 30, 180);

      // run the gauntlet button
      this.rtg_button = new button(200, 50, BUTTON_BACK_COLOR, BUTTON_TEXT_COLOR, "Run the gauntlet", 30, 230);
      this.rtg_button.draw();

      // run the gauntlet description
      this.context.textAlign = "left";
      this.context.font = "15px Arial";
      this.context.fillStyle = "black";
      this.context.fillText(" > face off against 5 artificial", 30, 295);
      this.context.fillText("   opponents in order of", 30, 310);
      this.context.fillText("   increasing difficulty", 30, 325);

      // board-size plus button
      if (board_size != MAX_BOARD_SIZE)
      {
        this.bsp_button = new button(30, 30, BUTTON_BACK_COLOR, BUTTON_TEXT_COLOR, "+", 500, 120);
      }
      else
      {
        this.bsp_button = new button(30, 30, BUTTON_INACTIVE_COLOR, PLAIN_TEXT_COLOR, "+", 500, 120);
      }
      this.bsp_button.draw();

      // board-size minus button
      if (board_size != MIN_BOARD_SIZE)
      {
        this.bsm_button = new button(30, 30, BUTTON_BACK_COLOR, BUTTON_TEXT_COLOR, "-", 400, 120);
      }
      else
      {
        this.bsm_button = new button(30, 30, BUTTON_INACTIVE_COLOR, PLAIN_TEXT_COLOR, "-", 400, 120);
      }
      this.bsm_button.draw();

      // holes plus button
      if (num_holes < max_num_holes - 0.5)
      {
        this.hp_button = new button(30, 30, BUTTON_BACK_COLOR, BUTTON_TEXT_COLOR, "+", 500, 200);
      }
      else
      {
        this.hp_button = new button(30, 30, BUTTON_INACTIVE_COLOR, PLAIN_TEXT_COLOR, "+", 500, 200);
      }
      this.hp_button.draw();

      // holes minus button
      if (num_holes > 0)
      {
        this.hm_button = new button(30, 30, BUTTON_BACK_COLOR, BUTTON_TEXT_COLOR, "-", 400, 200);
      }
      else
      {
        this.hm_button = new button(30, 30, BUTTON_INACTIVE_COLOR, PLAIN_TEXT_COLOR, "-", 400, 200);
      }
      this.hm_button.draw();

      // play as white or black
      // first the boundary box
      this.context.fillStyle = BUTTON_BACK_COLOR;
      this.context.fillRect(384, 259, 162, 52);
      if (play_as == 1) // white
      {
        this.pa_button = new button(160, 50, "#ffffff", PLAIN_TEXT_COLOR, "Playing as white", 385, 260);
      }
      else
      {
        this.pa_button = new button(160, 50, PLAIN_TEXT_COLOR, "#ffffff", "Playing as black", 385, 260);
      }
      this.pa_button.draw();

      // accompanying text
      this.context.textAlign = "left";

      // title box
      this.context.fillStyle = BUTTON_BACK_COLOR;
      this.context.fillRect(0, 0, this.canvas.width, 60);

      // title text
      this.context.font = "36px Arial";
      this.context.fillStyle = BUTTON_TEXT_COLOR;
      this.context.fillText("Game of Sum", 10, 5 + 36);

      this.context.textAlign = "center";

      // board size explanation text
      this.context.font = "16px Arial";
      this.context.fillStyle = "black";
      this.context.fillText("Adjust the board dimension", 465, 110);

      // board size text
      this.context.font = "20px Arial";
      this.context.fillStyle = "black";
      this.context.fillText(board_size + " x " + board_size, 465, 142);

      // number of holes explanation text
      this.context.font = "16px Arial";
      this.context.fillStyle = "black";
      this.context.fillText("Adjust the number of holes", 465, 190);

      // number of holes text
      this.context.font = "20px Arial";
      this.context.fillStyle = "black";
      this.context.fillText(num_holes + "", 465, 222);
    }
    else // game room
    {
      // board
      this.board_image = new rectangle(BORDER, BORDER, BOARD_COLOR, BOARD_PIXEL_SIZE, BOARD_PIXEL_SIZE);
      this.board_image.draw();

      // gridlines
      this.context.fillStyle = PLAIN_TEXT_COLOR;
      // vertical
      for (let i = 0; i < board_size + 1; i++)
      {
        this.context.fillRect(BORDER + BOARD_PIXEL_SIZE*i / board_size, BORDER, 1, BOARD_PIXEL_SIZE + 1); // note order in integer division
      }
      // horizontal
      for (let i = 0; i < board_size + 1; i++)
      {
        this.context.fillRect(BORDER, BORDER + BOARD_PIXEL_SIZE*i / board_size, BOARD_PIXEL_SIZE + 1, 1); // note order in integer division
      }

      // stones and holes
      for (let i = 0; i < board_size; i++)
      {
        for (let j = 0; j < board_size; j++)
        {
          if (game_board.board[i][j] == 1) // white stone
          {
            this.context.beginPath();
            this.context.fillStyle = "white";
            let center_x = BORDER + (BOARD_PIXEL_SIZE*j / board_size + BOARD_PIXEL_SIZE*(j+1) / board_size)/2; // note order integer division
            let center_y = BORDER + (BOARD_PIXEL_SIZE*i / board_size + BOARD_PIXEL_SIZE*(i+1) / board_size)/2; // note order integer division
            let radius = (BOARD_PIXEL_SIZE*i / board_size + BOARD_PIXEL_SIZE*(i+1) / board_size)/2 - BOARD_PIXEL_SIZE*i / board_size - 1;
            this.context.arc(center_x, center_y, radius, 0, 2*Math.PI);
            this.context.fill();
          }
          else if (game_board.board[i][j] == -1) // black stone
          {
            this.context.beginPath();
            this.context.fillStyle = "black";
            let center_x = BORDER + (BOARD_PIXEL_SIZE*j / board_size + BOARD_PIXEL_SIZE*(j+1) / board_size)/2; // note order integer division
            let center_y = BORDER + (BOARD_PIXEL_SIZE*i / board_size + BOARD_PIXEL_SIZE*(i+1) / board_size)/2; // note order integer division
            let radius = (BOARD_PIXEL_SIZE*i / board_size + BOARD_PIXEL_SIZE*(i+1) / board_size)/2 - BOARD_PIXEL_SIZE*i / board_size - 1;
            this.context.arc(center_x, center_y, radius, 0, 2*Math.PI);
            this.context.fill();
          }
          if (array_contains(game_board.hole_list, [i,j])) // if it is a hole
          {
            this.context.fillStyle = "gray";
            this.context.fillRect(BORDER + BOARD_PIXEL_SIZE*j / board_size + 1, BORDER + BOARD_PIXEL_SIZE*i / board_size + 1, BOARD_PIXEL_SIZE*(i + 1) / board_size - BOARD_PIXEL_SIZE*i / board_size - 1, BOARD_PIXEL_SIZE*(j + 1) / board_size - BOARD_PIXEL_SIZE*j / board_size - 1);
          }
        }
      }

      // enemy name box
      this.context.fillStyle = PLAIN_TEXT_COLOR;
      this.context.fillRect(2*BORDER + BOARD_PIXEL_SIZE, BORDER, this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE, 100);
      // the enemy name
      let enemy_name;
      switch (player1_id + player2_id)
      {
        case 0:
          enemy_name = "You";
          break;
        case 1:
          enemy_name = "Random";
          break;
        case 2:
          enemy_name = "Physarum";
          break;
        case 3:
          enemy_name = "Tyrandosaurus";
          break;
        case 4:
          enemy_name = "Rotundus";
          break;
        case 5:
          enemy_name = "Phidippus";
          break;
      }
      screen.context.textAlign = "center";
      screen.context.font = "20px Arial";
      screen.context.fillStyle = "white";
      screen.context.fillText(enemy_name, 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE)/2, (110)/2);
      // if it is an artificial opponent, display the opponent id above the name
      if (player1_id + player2_id > 0)
      {
        screen.context.font = "14px Arial";
        screen.context.fillText("Opponent " + (player1_id + player2_id) + "/5", 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE)/2, 25);
      }

      // your name box
      this.context.fillStyle = PLAIN_TEXT_COLOR;
      this.context.fillRect(2*BORDER + BOARD_PIXEL_SIZE, this.canvas.height - BORDER - 100, this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE, 100);
      // text
      screen.context.textAlign = "center";
      screen.context.font = "20px Arial";
      screen.context.fillStyle = "white";
      screen.context.fillText("You", 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE)/2, this.canvas.height - BORDER - 100 + (110)/2);

      // whose turn indicator
      this.context.fillStyle = "#00ff08";
      if (whose_turn == play_as) // your turn
      {
        this.context.fillRect(2*BORDER + BOARD_PIXEL_SIZE + this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE - 20, this.canvas.height - BORDER - 100 + 80, 20, 20);
      }
      else // enemy turn
      {
        this.context.fillRect(2*BORDER + BOARD_PIXEL_SIZE + this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE - 20, BORDER + 100 - 20, 20, 20);
      }

      // who is playing as what color indicator
      this.context.fillStyle = "#ffffff";
      if (play_as == 1) // you are playing as white
      {
        this.context.fillRect(2*BORDER + BOARD_PIXEL_SIZE, this.canvas.height - BORDER - 100 + 80, 20, 20);
      }
      else // playing as black, so enemy playing as white
      {
        this.context.fillRect(2*BORDER + BOARD_PIXEL_SIZE, BORDER + 100 - 20, 20, 20);
      }

      // resign button
      if (!about_to_resign || human_won != 0)
      {
        if (human_won == 0)
        {
          this.r_button = new button(150, 50, "#400000", "#ffc9c9", "Resign", 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE - 150)/2, this.canvas.height - 2*BORDER - 100 - 50);
        }
        else
        {
          this.r_button = new button(150, 50, "#400000", "#ffc9c9", "Return", 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE - 150)/2, this.canvas.height - 2*BORDER - 100 - 50);
        }
        this.r_button.draw();
      }
      else
      {
        // button is divided into two parts to make sure that user really wants to resign
        // resign for real button
        this.rfr_button = new button(75, 50, "#400000", "#ffc9c9", "Yes", 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE - 150)/2, this.canvas.height - 2*BORDER - 100 - 50);
        this.rfr_button.draw();
        // cancel resign button
        this.cr_button = new button(75, 50, "#003301", "#a8e3a9", "No", 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE - 150)/2 + 75, this.canvas.height - 2*BORDER - 100 - 50);
        this.cr_button.draw();
        // accompanying text
        screen.context.textAlign = "center";
        screen.context.font = "16px Arial";
        screen.context.fillStyle = "black";
        screen.context.fillText("Really resign?", 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE)/2, this.canvas.height - 3*BORDER - 100 - 50 - 16);
      }

      // proceed button: for moving to next room in the run the gauntlet mode
      // note, since there are 5 artificial opponents, only makes sense to have a proceed button for the first 4
      if (player1_id + player2_id > 0 && human_won == 1 && player1_id + player2_id < 5)
      {
          this.p_button = new button(150, 50, "#003301", "#a8e3a9", "Proceed", 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE - 150)/2, this.canvas.height - 3*BORDER - 100 - 50 - 50);
          this.p_button.draw();
      }

      // win facts info box
      if (human_won != 0)
      {
        // who won box
        if (game_board.winner() == -1) // black won
        {
          this.context.fillStyle = PLAIN_TEXT_COLOR;
          this.context.fillRect(2*BORDER + BOARD_PIXEL_SIZE, 2*BORDER + 100, this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE, 30);
          // who won name
          screen.context.textAlign = "center";
          screen.context.font = "18px Arial";
          screen.context.fillStyle = "white";
          screen.context.fillText("Black wins!", 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE)/2, 30 + 100);
        }
        else
        {
          this.context.fillStyle = "#ffffff";
          this.context.fillRect(2*BORDER + BOARD_PIXEL_SIZE, 2*BORDER + 100, this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE, 30);
          // who won name
          screen.context.textAlign = "center";
          screen.context.font = "18px Arial";
          screen.context.fillStyle = "black";
          screen.context.fillText("White wins!", 2*BORDER + BOARD_PIXEL_SIZE + (this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE)/2, 30 + 100);
        }
        let eval = game_board.material_evaluation();
        // stone count box
        this.context.fillStyle = "#0f6b8c";
        this.context.fillRect(2*BORDER + BOARD_PIXEL_SIZE, 2*BORDER + 130, this.canvas.width - 3*BORDER - BOARD_PIXEL_SIZE, 80);
        // white stone
        this.context.beginPath();
        this.context.fillStyle = "white";
        let center_x = 2*BORDER + BOARD_PIXEL_SIZE + 20;
        let center_y = 2*BORDER + 130 + 25;
        let radius = 15;
        this.context.arc(center_x, center_y, radius, 0, 2*Math.PI);
        this.context.fill();
        // white stone text
        screen.context.textAlign = "center";
        screen.context.font = "24px Arial";
        screen.context.fillStyle = "black";
        screen.context.fillText(eval[0] + "", 2*BORDER + BOARD_PIXEL_SIZE + 80, 2*BORDER + 100 + 30 + 30 + 3);
        // black stone
        this.context.beginPath();
        this.context.fillStyle = "black";
        center_x = 2*BORDER + BOARD_PIXEL_SIZE + 20;
        center_y = 2*BORDER + 130 + 60;
        radius = 15;
        this.context.arc(center_x, center_y, radius, 0, 2*Math.PI);
        this.context.fill();
        // black stone text
        screen.context.textAlign = "center";
        screen.context.font = "24px Arial";
        screen.context.fillStyle = "black";
        screen.context.fillText(eval[1] + "", 2*BORDER + BOARD_PIXEL_SIZE + 80, 2*BORDER + 100 + 30 + 60 + 8);
      }
    }
  },
  clear : function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = BACKGROUND_COLOR;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function button(width, height, color, text_color, text, x, y) {
  this.width = width;
  this.height = height;
  this.x = x; // x and y of top left corner
  this.y = y;
  this.text_color = text_color;
  this.draw = function() {
    // draw rectangle
    screen.context.fillStyle = color;
    screen.context.fillRect(this.x, this.y, this.width, this.height);
    // draw the text centered vertically and horizontally inside the rectangle
    screen.context.font = "20px Arial";
    screen.context.fillStyle = text_color;
    screen.context.textAlign = "center";
    screen.context.fillText(text, this.x + this.width/2, this.y + this.height/2 + 20/4 + 1); // intentional integer division
  }
}

function rectangle(x, y, color, width, height) {
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.draw = function() {
    screen.context.fillStyle = color;
    screen.context.fillRect(this.x, this.y, this.width, this.height);
  }
}

function mouse_click(event) {
  mx = event.offsetX;
  my = event.offsetY;
  if (mx > event.pageX || my > event.pageY || mx > screen.canvas.width || my > screen.canvas.height)
  {
    mx = -1;
    my = -1;
  }
  if (mx >= 0 && my >= 0)
  {
    if (room == 0) // main menu
    {
      // sequentially check all buttons for presses. Assumes buttons do not overlap, so only one can be
      // pressed at a time

      // human vs human button
      if (in_bounds(screen.hvh_button, mx, my) == true)
      {
        room = 1;
        player1_id = 0;
        player2_id = 0;
        game_start();
        screen.draw()
        return;
      }

      // run the gauntlet button
      if (in_bounds(screen.rtg_button, mx, my) == true)
      {
        room = 1;
        if (play_as == 1) // human playing as white
        {
          player1_id = 0;
          player2_id = 1;
        }
        else
        {
          player1_id = 1;
          player2_id = 0;
        }
        game_start();
        screen.draw();
        return;
      }

      // board-size plus button
      if (in_bounds(screen.bsp_button, mx, my) == true)
      {
        if (board_size < MAX_BOARD_SIZE)
        {
          board_size += BOARD_SIZE_INCREMENT;
          num_holes = 0; // update the number of holes to 0
          max_num_holes = board_size*board_size/2; // update max num holes
          screen.draw();
          return;
        }
      }

      // board-size minus button
      if (in_bounds(screen.bsm_button, mx, my) == true)
      {
        if (board_size > MIN_BOARD_SIZE)
        {
          board_size -= BOARD_SIZE_INCREMENT;
          num_holes = 0; // update the number of holes to 0
          max_num_holes = board_size*board_size/2; // update max num holes
          screen.draw();
          return;
        }
      }

      // hole plus button
      if (in_bounds(screen.hp_button, mx, my) == true)
      {
        if (num_holes <= max_num_holes - HOLE_INCREMENT)
        {
          num_holes += HOLE_INCREMENT;
          screen.draw();
          return;
        }
      }

      // hole minus button
      if (in_bounds(screen.hm_button, mx, my) == true)
      {
        if (num_holes > 0)
        {
          num_holes -= HOLE_INCREMENT;
          screen.draw();
          return;
        }
      }

      // play as button
      if (in_bounds(screen.pa_button, mx, my) == true)
      {
          play_as = play_as*-1; // toggle the value of play_as
          screen.draw();
          return;
      }
    }
    else // game room
    {
      // resign button
      if (about_to_resign && human_won == 0) // look for the two sub-buttons of the original resign button
      {
        // resign for real
        if(in_bounds(screen.rfr_button, mx, my))
        {
          about_to_resign = false;
          room = 0;
          screen.draw();
          return;
        }
        // if don't want to actually resign
        if (in_bounds(screen.cr_button, mx, my))
        {
          about_to_resign = false;
          screen.draw();
          return;
        }
      }
      else
      {
        // the original resign button
        if (in_bounds(screen.r_button, mx, my))
        {
          if (human_won == 0) // if game not over
          {
            about_to_resign = true;
            screen.draw();
            return;
          }
          else // if game over, return to menu
          {
            room = 0;
            screen.draw();
            return;
          }
        }
      }

      // proceed button (after a win in the run the gauntlet, before last opponent)
      if (human_won == 1 && player1_id + player2_id > 0 && player1_id + player2_id < 5)
      {
        if (in_bounds(screen.p_button, mx, my))
        {
          if (player1_id > 0)
          {
            player1_id++;
          }
          else
          {
            player2_id++;
          }
          game_start();
          screen.draw();
        }
      }

      // inside the game board
      if (in_bounds(screen.board_image, mx, my) && ((whose_turn == 1 && player1_id == 0) || (whose_turn == -1 && player2_id == 0)))
      {
        // convert coordinates of click into the coordinates of a move in the game board
        var row;
        var column;
        // horizontal grid lines
        for (let i = 1; i < board_size + 1; i++)
        {
          if (BORDER + BOARD_PIXEL_SIZE*i / board_size >= my)
          {
            row = i - 1;
            break;
          }
        }
        // vertical grid lines
        for (let i = 1; i < board_size + 1; i++)
        {
          if (BORDER + BOARD_PIXEL_SIZE*i / board_size >= mx)
          {
            column = i - 1;
            break;
          }
        }
        var move = [row, column];
        if (game_board.move_legal(move, whose_turn)) // if can actually make the desired move
        {
          game_board.make_move(move, whose_turn);
          if (game_board.possible_moves(-1*whose_turn).length > 0) // only change turn if opponent has legal moves
          {
            whose_turn = -1*whose_turn;
          }
          about_to_resign = false; // reset the resign button if someone was clicking it
          screen.draw();
          setTimeout(function() { // wait until screen is properly drawn
          game_turn();
          }, 500);
        }
      }
    }
  }
}

// helper function for determining if click is within bounds of a rectangular region
function in_bounds(rect_region, pos_x, pos_y)
{
  if (pos_x >= rect_region.x && pos_x <= rect_region.x + rect_region.width && pos_y >= rect_region.y && pos_y <= rect_region.y + rect_region.height)
  {
    return true;
  }
  return false;
}

// GAME FUNCTIONALITY

function randint(a,b) // returns a random number between a, b, inclusive
{
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

// deep clones an array of arrays of primitive data types
// this is the only explicit cloning needed throughout
function clone_array(arr)
{
  var tmp = [];
  for (let i = 0; i < arr.length; i++)
  {
    var tmptmp = [];
    for (let j = 0; j < arr[i].length; j++)
    {
      tmptmp.push(arr[i][j]);
    }
    tmp.push(tmptmp);
  }
  return tmp;
}

// the array.includes method checks equality by comparing references, so in the case of an array of arrays,
// asking whether an array contains a given array will be false, even if the values of the arrays are the same
// the following method checks whether a given array of primitives exists in an array of arrays in the sense of having the same
// elements
function array_contains(arr, elem)
{
  for (let i = 0; i < arr.length; i++)
  {
    let does_contain = true;
    for (let j = 0; j < arr[i].length; j++)
    {
      if (arr[i][j] != elem[j])
      {
        does_contain = false;
      }
    }
    if (does_contain)
    {
      return true;
    }
  }
  return false;
}

// return a shuffled version of given array of arrays of primitives
function shuffle(arr)
{
  var orig = clone_array(arr);
  var tmp = [];
  for (let i = 0; i < arr.length; i++)
  {
    let index = randint(0, orig.length - 1);
    tmp.push(orig[index]);
    orig.splice(index, 1);
  }
  return tmp;
}

// prototype for managing the game board functionality
function GameBoard(N, holes, init_board, init_hole_list) { // note: init_board, init_hole_list may be unused in most applications, and will default to "undefined" then
  this.N = N // linear dimension of the square board, i.e., board will be NxN
  this.holes = holes // number of holes the board should have
  if (typeof(init_board) == "undefined") // if a value has not been passed in for the board
  {
    // initialize the board, and also populate the possible holes list
    this.board = [];
    let possible_holes = [];
    this.last_move;
    for (let i = 0; i < N; i++)
    {
      // board
      let tmp = [];
      for (let j = 0; j < N; j++)
      {
        // holes
        possible_holes.push([i,j]);
        tmp.push(0);
      }
      this.board.push(tmp);
    }
    this.hole_list = [];
    for (let i = 0; i < holes; i++)
    {
      this.hole_list.push(possible_holes.splice(randint(0, possible_holes.length - 1), 1)[0]); // splice returns an array of the elements removed, in this case an array of just one element, the array removed
    }
  }
  else
  {
    this.board = clone_array(init_board);
    this.hole_list = clone_array(init_hole_list);
  }

  // return a list [w,b] of the number of white stones and number of black stones on board
  this.material_evaluation = function()
  {
    var w = 0;
    var b = 0;
    for (let i = 0; i < this.N; i++)
    {
      for (let j = 0; j < this.N; j++)
      {
        if (this.board[i][j] == -1)
        {
          b++;
        }
        if (this.board[i][j] == 1)
        {
          w++;
        }
      }
    }
    return [w,b];
  }

  // sums up the stones around a given position, adding for like colors and subtracting otherwise. Holes are not counted.
  // Assumes the given position is occupied by a like-color stone
  this.sum_stone = function(position, player)
  {
    var i = position[0];
    var j = position[1];
    var positions = [[i,j+1],[i+1,j],[i+1,j+1],[i-1,j],[i,j-1],[i-1,j-1],[i-1,j+1],[i+1,j-1]];
    var sum = 0;
    for (let t = 0; t < positions.length; t++)
    {
      let p = positions[t];
      if (0 <= p[0] && p[0] <= this.N - 1 && 0 <= p[1] && p[1] <= this.N - 1)
      {
        sum = sum + this.board[p[0]][p[1]]; // holes cannot have a nonzero value, so are not counted this way
      }
    }
    // adjust the sign of the sum and add center stone
    sum = sum*player + 1;
    return sum;
  }

  // returns the squares around a given position which are not holes and are in bounds
  this.adjacent_squares = function(position)
  {
    var i = position[0];
    var j = position[1];
    var positions = [[i,j+1],[i+1,j],[i+1,j+1],[i-1,j],[i,j-1],[i-1,j-1],[i-1,j+1],[i+1,j-1]];
    for (let t = positions.length-1; t >= 0; t--)
    {
        if (!(0 <= positions[t][0] && positions[t][0] <= this.N - 1 && 0 <= positions[t][1] && positions[t][1] <= this.N - 1))
        {
            positions.splice(t, 1)[0]; // remove out-of-bounds positions
        }
        else if (array_contains(this.hole_list, positions[t]))
        {
            positions.splice(t, 1)[0]; // remove holes
        }
    }
    return positions;
  }

  // return all squares in bounds and are not holes in a square neighborhood centered at the given position, including center.
  this.square_neighborhood = function(position, radius)
  {
    // the side length of the square is 2*radius + 1
    var i = position[0];
    var j = position[1];
    var positions = [];
    for (let a = -radius; a < radius + 1; a++)
    {
      for (let b = -radius; b < radius + 1; b++)
      {
        positions.push([i + a, j + b]);
      }
    }
    for (let t = positions.length - 1; t >= 0; t--)
    {
      if (!(0 <= positions[t][0] && positions[t][0] <= this.N - 1 && 0 <= positions[t][1] && positions[t][1] <= this.N - 1))
      {
          positions.splice(t, 1)[0]; // remove out-of-bounds positions
      }
      else if (array_contains(this.hole_list, positions[t]))
      {
          positions.splice(t, 1)[0]; // remove holes
      }
    }
    return positions;
  }

  // determines whether a stone may be placed by player at given position
  this.move_legal = function(move, player)
  {
    var i = move[0];
    var j = move[1];

    // position must be free
    if (this.board[i][j] != 0)
    {
      return false;
    }

    // position must not be a hole
    for (let t = 0; t < this.hole_list.length; t++)
    {
      if (this.hole_list[t][0] == i && this.hole_list[t][1] == j)
      {
        return false;
      }
    }

    // check whether the stone is allowed to exist according to sum rule
    if (this.sum_stone([i,j], player) < 0)
    {
      return false;
    }
    return true;
  }

  // check whether the stone at the given position should be removed,
  // and remove it if needed. If so, then check all stones adjacent to this one of same color.
  this.check_existence = function(position, player)
  {
    var i = position[0];
    var j = position[1];

    if (this.board[i][j] == player)
    {
      if (this.sum_stone([i,j], player) < 0) // should not exist on board
      {
        this.board[i][j] = 0; // remove stone
        var positions = this.adjacent_squares(position);
        for (let t = 0; t < positions.length; t++)
        {
          if (this.board[positions[t][0]][positions[t][1]] == player)
          {
            this.check_existence(positions[t], player);
          }
        }
      }
    }
  }

  // makes the given move, assuming it is legal
  this.make_move = function(move, player)
  {
    this.board[move[0]][move[1]] = player;

    // update last move memory
    this.last_move = move;

    // need to update the board with the effects of this move
    // so check all the opponent stones adjacent to move
    var positions = this.adjacent_squares(move);
    for (let t = 0; t < positions.length; t++)
    {
      if (this.board[positions[t][0]][positions[t][1]] == -player)
      {
        this.check_existence(positions[t], -player);
      }
    }
  }

  // returns a list of possible moves for the given player
  this.possible_moves = function(player)
  {
    var moves = [];
    for (let i = 0; i < this.N; i++)
    {
      for (let j = 0; j < this.N; j++)
      {
        if (this.move_legal([i,j], player))
        {
          moves.push([i,j]);
        }
      }
    }
    return moves;
  }

  // determines if a given move could be taken by the opponent once made. Note: assumes move is legal
  // also doesn't account for the chain reaction of removals that occurs if another stone falls
  this.could_be_taken = function(move, player)
  {
    var positions = this.adjacent_squares(move);
    if (this.sum_stone(move, player) == 0)
    {
      for (let t = 0; t < positions.length; t++)
      {
        if (this.sum_stone(positions[t], -player) >= 1 && this.board[positions[t][0]][positions[t][1]] == 0) // >= 1 since assumes makes move
        {
          return true;
        }
      }
    }
    return false;
  }

  // checks assuming player already has made move
  this.could_be_taken_before = function(move, player)
  {
    var positions = this.adjacent_squares(move);
    if (this.sum_stone(move, player) == 0)
    {
      for (let t = 0; t < positions.length; t++)
      {
        if (this.sum_stone(positions[t], -player) >= 0 && this.board[positions[t][0]][positions[t][1]] == 0)
        {
          return true;
        }
      }
    }
    return false;
  }

  // only makes sense to call this when both players have no moves
  this.winner = function()
  {
    eval = this.material_evaluation();
    if (eval[0] > eval[1])
    {
      return 1;
    }
    else
    {
      return -1;
    }
    // currently draws not possible
  }
}


function game_start()
{
  game_board = new GameBoard(board_size, num_holes);
  whose_turn = 1; // white always goes first
  human_won = 0; // no one has won yet

  if (player1_id != 0) // if non-human player goes first, make their move
  {
    move_operator(player1_id, 1);
    screen.draw();
  }
}

function move_operator(id, player)
{
  // call the appropriate move function based on the id
  switch (id)
  {
    case 1:
      make_move_random_opponent(player);
      break;
    case 2:
      make_move_physarum(player);
      break;
    case 3:
      make_move_tyrandosaurus(player);
      break;
    case 4:
      make_move_rotundus(player);
      break;
    case 5:
      make_move_phidippus(player);
      break;
  }
  if (game_board.possible_moves(-1*whose_turn).length > 0) // only change turn if opponent has moves
  {
    whose_turn = -1*whose_turn;
  }
  else // play again
  {
    game_turn();
  }
  screen.draw();
}

function game_turn()
{
  // this is called just after human makes a move
  // check if the opponent has any moves available; if not, make all of the human moves
  if (game_board.possible_moves(1).length == 0)
  {
    // as long as the human has moves, make them
    while (game_board.possible_moves(-1).length > 0)
    {
      make_random_move(-1);
    }
  }
  if (game_board.possible_moves(-1).length == 0)
  {
    // as long as the human has moves, make them
    while (game_board.possible_moves(1).length > 0)
    {
      make_random_move(1);
    }
  }
  // determine whether there is a winner yet
  if (game_board.possible_moves(1).length == 0 && game_board.possible_moves(-1).length == 0) // game is over
  {
    if ((game_board.winner() == 1 && player1_id == 0) || (game_board.winner() == -1 && player2_id == 0))
    {
      human_won = 1; // human won
    }
    else
    {
      human_won = -1; // human lost
    }
    screen.draw();
    // if this was the final opponent, congratulate the player
    if (player1_id + player2_id == 5 && human_won == 1)
    {
      alert("Congrats, you have defeated all opponents!");
    }
    return;
  }
  // otherwise let the opponent move (if it is nonhuman)
  if (whose_turn == 1 && player1_id != 0)
  {
    move_operator(player1_id, whose_turn);
    // if the opponent no longer has any moves, then this wont change as the human continues moving
    // so make all human moves
    if (game_board.possible_moves(-1*whose_turn).length == 0)
    {
      while (game_board.possible_moves(whose_turn).length > 0) // note move_operator toggles whose turn
      {
        make_random_move(whose_turn);
      }
    }
  }
  else if (whose_turn == -1 && player2_id != 0)
  {
    move_operator(player2_id, whose_turn);
    // if the opponent no longer has any moves, then this wont change as the human continues moving
    // so make all human moves
    if (game_board.possible_moves(-1*whose_turn).length == 0)
    {
      while (game_board.possible_moves(whose_turn).length > 0) // note move_operator toggles whose turn
      {
        make_random_move(whose_turn);
      }
    }
  }
  // check again for game over
  if (game_board.possible_moves(1).length == 0 && game_board.possible_moves(-1).length == 0) // game is over
  {
    if ((game_board.winner() == 1 && player1_id == 0) || (game_board.winner() == -1 && player2_id == 0))
    {
      human_won = 1; // human won
    }
    else
    {
      human_won = -1; // human lost
    }
    screen.draw();
    // if this was the final opponent, congratulate the player
    if (player1_id + player2_id == 5 && human_won == 1)
    {
      alert("Congrats, you have defeated all opponents!");
    }
  }
}

// ARTIFICIAL OPPONENTS

function make_random_move(player)
{
  // plays by making a completely random move but where it cannot be immediately taken
  var moves = game_board.possible_moves(player);
  if (moves.length == 0)
  {
    return;
  }
  var ok_moves = [];
  for (let i = 0; i < moves.length; i++)
  {
    if (!game_board.could_be_taken(moves[i], player))
    {
      ok_moves.push(moves[i]);
    }
  }
  if (ok_moves.length == 0)
  {
    var move = moves[randint(0, moves.length - 1)];
    game_board.make_move(move, player);
  }
  else
  {
    a = randint(0, ok_moves.length - 1);
    var move = ok_moves[a];
    game_board.make_move(move, player);
  }
}

function make_move_random_opponent(player)
{
  // plays random moves subject to the conditions that they cannot be immediately captured and
  // it shallowly defends stones that could be taken immediately, if possible.
  // additionally, if given the chance, it will capture an unprotected stone
  var possible_moves = game_board.possible_moves(player);
  var enemy_stones = [];
  for (let i = 0; i < game_board.N; i++)
  {
    for (let j = 0; j < game_board.N; j++)
    {
      if (game_board.board[i][j] == player && game_board.could_be_taken([i,j], player))
      {
        var positions = game_board.adjacent_squares([i,j]);
        for (let t = 0; t < positions.length; t++)
        {
          if (array_contains(possible_moves, positions[t]))
          {
            game_board.make_move(positions[t], player);
            return;
          }
        }
      }
      else if (game_board.board[i][j] == -player)
      {
        enemy_stones.push([i,j]);
      }
    }
  }
  // if no stones in danger, just make a random move that cannot be immediately taken
  make_random_move(player);
}

function make_move_physarum(player)
{
  // Slightly weaker defense than the rotundus. When not threatened, tries to move close to its existing stones, and moves toward
  // free space.
  var repeat = 20;
  var depth = 4;
  var detect_radius = 2;
  var space_radius = 2;
  var attack_radius = 2;
  var abort_rating = -1.5;

  var possible_moves = game_board.possible_moves(player);
  var own_stones = [];
  for (let i = 0; i < game_board.N; i++)
  {
    for (let j = 0; j < game_board.N; j++)
    {
      if (game_board.board[i][j] == player)
      {
        own_stones.push([i,j]);
      }
    }
  }
  // randomly search
  var actual_possible_moves = [];
  for (let i = 0; i < possible_moves.length; i++)
  {
    p = possible_moves[i];
    if (!game_board.could_be_taken(p, player))
    {
      var add = false;
      var adj_squares = game_board.adjacent_squares(p);
      for (let j = 0; j < adj_squares.length; j++)
      {
        q = adj_squares[j];
        if (game_board.board[q[0]][q[1]] == player)
        {
          add = true;
          break;
        }
      }
      if (add)
      {
        actual_possible_moves.push(p);
      }
    }
  }
  if (actual_possible_moves.length == 0)
  {
    make_random_move(player);
    return;
  }
  var growing_moves = clone_array(actual_possible_moves);
  // remove all actual possible moves, paring down to only those near stones near the last move played
  actual_possible_moves = [];
  var check_square = game_board.square_neighborhood(game_board.last_move, detect_radius);
  for (let i = 0; i < check_square.length; i++)
  {
    var p = check_square[i];
    if (game_board.board[p[0]][p[1]] == player && game_board.sum_stone(p, player) <= 1)
    {
      var adj_squares = game_board.adjacent_squares(p);
      for (let j = 0; j < adj_squares.length; j++)
      {
        var q = adj_squares[j];
        if (array_contains(growing_moves, q))
        {
          actual_possible_moves.push(q);
        }
      }
    }
  }
  // search these moves
  if (actual_possible_moves.length > 0)
  {
    var ratings = [];
    for (let i = 0; i < actual_possible_moves.length; i++)
    {
      var p = actual_possible_moves[i];
      var rating = 0;
      for (let j = 0; j < repeat; j++)
      {
        // play a game
        var test_board = new GameBoard(game_board.N, game_board.holes, game_board.board, game_board.hole_list);
        test_board.make_move(p, player);
        for (let t = 0; t < depth; t++)
        {
          var enemy_pre_pos_moves = test_board.possible_moves(-player);
          var enemy_pos_moves = [];
          var check_square = test_board.square_neighborhood(p, attack_radius); // only make moves for opponent in this square
          for (let ii = 0; ii < check_square.length; ii++)
          {
            var z = check_square[ii];
            if (array_contains(enemy_pre_pos_moves, z))
            {
              enemy_pos_moves.push(z);
            }
          }
          if (enemy_pos_moves.length > 0)
          {
            test_board.make_move(enemy_pos_moves[randint(0, enemy_pos_moves.length - 1)], -player);
          }
          // own turn, can only play stones adjacent
          var test_possible_moves = test_board.possible_moves(player);
          var test_own_stones = [];
          for (let ii = 0; ii < test_board.N; ii++)
          {
            for (let jj = 0; jj < test_board.N; jj++)
            {
              if (test_board.board[ii][jj] == player)
              {
                test_own_stones.push([ii,jj]);
              }
            }
          }
          var test_actual_possible_moves = [];
          for (let ii = 0; ii < test_possible_moves.length; ii++)
          {
            var pp = test_possible_moves[ii];
            if (!test_board.could_be_taken(pp, player))
            {
              var add = false;
              var adj_squares = test_board.adjacent_squares(pp);
              for (let jj = 0; jj < adj_squares.length; jj++)
              {
                var qq = adj_squares[jj];
                if (test_board.board[qq[0]][qq[1]] == player)
                {
                  add = true;
                }
              }
              if (add)
              {
                test_actual_possible_moves.push(pp);
              }
            }
          }
          if (test_actual_possible_moves.length > 0)
          {
            test_board.make_move(test_actual_possible_moves[randint(0, test_actual_possible_moves.length - 1)], player);
          }
          if (test_actual_possible_moves.length == 0 && enemy_pos_moves.length == 0)
          {
            break;
          }
        }
        var eval = test_board.material_evaluation();
        if (player == 1)
        {
          rating += eval[0] - eval[1];
        }
        else
        {
          rating += eval[1] - eval[0];
        }
      }
      ratings.push(rating);
    }
    // find best-rated move
    var max_rating = ratings[0];
    var max_move = actual_possible_moves[0];
    for (let i = 0; i < actual_possible_moves.length; i++)
    {
      if (max_rating < ratings[i])
      {
        max_rating = ratings[i];
        max_move = actual_possible_moves[i];
      }
    }
    game_board.make_move(max_move, player);
  }
  else // otherwise, find a move close by with the most free space
  {
    possible_moves = shuffle(possible_moves); // extra variety
    // look for moves close by
    var close_moves = [];
    var far_moves = [];
    var close_ratings = [];
    for (let i = 0; i < possible_moves.length; i++)
    {
      var p = possible_moves[i];
      if (!game_board.could_be_taken(p, player))
      {
        var close_by = game_board.square_neighborhood(p, space_radius);
        var counter = 0;
        var add = false;
        for (let j = 0; j < close_by.length; j++)
        {
          var q = close_by[j];
          if (game_board.board[q[0]][q[1]] == player) // has own stone here
          {
            add = true;
            counter--;
          }
          else if (game_board.board[q[0]][q[1]] == -player)
          {
            counter += 0.5;
          }
          else if (array_contains(game_board.hole_list, q))
          {
            counter--;
          }
          else if (game_board.board[q[0]][q[1]] == 0)
          {
            counter++;
          }
        }
        if (add)
        {
          close_moves.push(p);
          close_ratings.push(counter);
        }
        else
        {
          far_moves.push(p);
        }
      }
    }

    if (close_moves.length > 0)
    {
      // find max-rated move
      var max_rating = close_ratings[0];
      var max_move = close_moves[0];
      for (let i = 0; i < close_moves.length; i++)
      {
        if (max_rating < close_ratings[i])
        {
          max_rating = close_ratings[i];
          max_move = close_moves[i];
        }
      }
      if (max_rating > abort_rating)
      {
        game_board.make_move(max_move, player);
      }
      else // move somewhere else if getting too crowded
      {
        if (far_moves.length > 0)
        {
          game_board.make_move(far_moves[randint(0, far_moves.length - 1)], player);
        }
        else
        {
          make_random_move(player);
        }
      }
    }
    else
    {
      // if none, move to somewhere else, possibly far from own stones
      game_board.make_move(far_moves[randint(0, far_moves.length - 1)], player);
    }
  }
}

function make_move_tyrandosaurus(player)
{
  // defends like the random opponent, but when it doesn't need to defend,
  // it attacks the opponent's weakest stones using a local random tree search
  var square_rad = 2;
  var depth = (2*square_rad + 1)*(2*square_rad + 1);
  var repeat = 17;
  var enemy_stones = [];
  // shallowly defends own stones if they are in immediate danger
  var possible_moves = game_board.possible_moves(player);
  for (let i = 0; i < game_board.N; i++)
  {
    for (let j = 0; j < game_board.N; j++)
    {
      if (game_board.board[i][j] == player && game_board.could_be_taken_before([i,j], player))
      {
        var positions = game_board.adjacent_squares([i,j]);
        for (let t = 0; t < positions.length; t++)
        {
          if (array_contains(possible_moves, positions[t]) && !game_board.could_be_taken(positions[t], player))
          {
            game_board.make_move(positions[t], player);
            return;
          }
        }
      }
      else if (game_board.board[i][j] == -player) // add to the enemy stone list
      {
        enemy_stones.push([i,j]);
      }
    }
  }
  // otherwise, attack the opponent's weakest stones
  var sorted_enemy_stones = []; // sorted from smallest sum value to highest
  // first, if there's a stone which can be taken immediately, take it
  for (let i = 0; i < enemy_stones.length; i++)
  {
    if (game_board.could_be_taken_before(enemy_stones[i], -player))
    {
      var attack_moves = game_board.adjacent_squares(enemy_stones[i]);
      for (let s = 0; s < attack_moves.length; s++)
      {
        if (array_contains(possible_moves, attack_moves[s]))
        {
          game_board.make_move(attack_moves[s], player);
          return;
        }
      }
    }
  }
  // then add stones sorted from least to greatest in their sum value
  for (let s = 0; s < 10; s++) // all possible sum values of a stone on the board
  {
    for (let i = enemy_stones.length - 1; i > -1; i--)
    {
      if (game_board.sum_stone(enemy_stones[i], -player) == s)
      {
        sorted_enemy_stones.push(enemy_stones.splice(i, 1)[0]);
      }
    }
  }
  var candidates = [];
  // look for moves adjacent to sum 1 stones first
  for (let a = 0; a < sorted_enemy_stones.length; a++)
  {
    var stone = sorted_enemy_stones[a];
    if (game_board.sum_stone(stone, -player) > 1) break;
    var orig_square = game_board.square_neighborhood(stone, 1);
    candidates = clone_array(orig_square);
    for (let i = candidates.length - 1; i > -1; i--) // remove illegal moves, and moves where the stone could be taken immediately
    {
      if (!array_contains(possible_moves, candidates[i]) || game_board.could_be_taken(candidates[i], player))
      {
        candidates.splice(i, 1);
      }
    }
    if (candidates.length == 1)
    {
      game_board.make_move(candidates[0], player);
      return;
    }
    if (candidates.length > 0) break;
  }
  if (candidates.length == 0) // no moves adjacent to sum 1 stones. Enlarge the search radius and permit higher sum stones
  {
    for (let a = 0; a < sorted_enemy_stones.length; a++)
    {
      var stone = sorted_enemy_stones[a];
      // first check moves right adjacent to the stone
      var orig_square = game_board.square_neighborhood(stone, square_rad);
      candidates = clone_array(orig_square);
      for (let i = candidates.length - 1; i > -1; i--) // remove illegal moves, and moves where the stone could be taken immediately
      {
        if (!array_contains(possible_moves, candidates[i]) || game_board.could_be_taken(candidates[i], player))
        {
          candidates.splice(i, 1);
        }
      }
      if (candidates.length == 0)
      {
        continue;
      }
      if (candidates.length == 1)
      {
        game_board.make_move(candidates[0], player);
        return;
      }
    }
  }
  if (candidates.length > 0) // if now have a populated list
  {
    // perform a random tree search to find the move to make
    // rates each possible move by how many sequences of moves past the move lead to the
    // capture of stone
    candidates = shuffle(candidates); // randomly reorder for extra variety
    var ratings = [];
    for (let i = 0; i < candidates.length; i++)
    {
      ratings.push(0);
    }
    for (let t = 0; t < candidates.length; t++)
    {
      var move = candidates[t];
      for (let l = 0; l < repeat; l++)
      {
        var test_board = new GameBoard(game_board.N, game_board.holes, game_board.board, game_board.hole_list);
        test_board.make_move(move, player);
        for (let i = 0; i < depth; i++)
        {
          var test_pos_moves_enemy = test_board.possible_moves(-player);
          for (let j = test_pos_moves_enemy.length - 1; j > -1; j--) // only make moves in orig_square
          {
            if (!array_contains(orig_square, test_pos_moves_enemy[j]))
            {
              test_pos_moves_enemy.splice(j,1);
            }
          }
          if (test_pos_moves_enemy.length > 0)
          {
            test_board.make_move(test_pos_moves_enemy[randint(0, test_pos_moves_enemy.length - 1)], -player);
          }
          var test_pos_moves_self = test_board.possible_moves(player);
          for (let j = test_pos_moves_self.length - 1; j > -1; j--) // only make moves in orig_square
          {
            if (!array_contains(orig_square, test_pos_moves_self[j]))
            {
              test_pos_moves_self.splice(j, 1);
            }
          }
          if (test_pos_moves_self.length > 0)
          {
            test_board.make_move(test_pos_moves_self[randint(0, test_pos_moves_self.length - 1)], player);
          }
          if (test_pos_moves_self.length == 0 && test_pos_moves_enemy.length == 0)
          {
            break; // no more moves to make
          }
          // check if stone was captured yet, if so, rate sequence based on how long it took
          if (test_board.board[stone[0]][stone[1]] != -player)
          {
            ratings[t] += depth - i;
            break;
          }
        }
      }
    }
    // select highest-rated move in the candidates list
    var max_rating = ratings[0];
    var max_move = candidates[0];
    for (let i = 0; i < candidates.length; i++)
    {
      if (max_rating < ratings[i])
      {
        max_rating = ratings[i];
        max_move = cadidates[i];
      }
      game_board.make_move(max_move, player);
      return;
    }
  }
  // if all else fails, make a move like the first opponent
  make_random_move(player);
}

function make_move_rotundus(player)
{
  // strong defense, and when not threatened will move to open territory
  // hard to remove, and obnoxiously invasive, like its namesake
  var repeat = 20;
  var depth = 6;
  var detect_radius = 2;
  var space_radius = 3;
  var attack_radius = 2;

  var possible_moves = game_board.possible_moves(player);
  var own_stones = [];
  for (let i = 0; i < game_board.N; i++)
  {
    for (let j = 0; j < game_board.N; j++)
    {
      if (game_board.board[i][j] == player)
      {
        own_stones.push([i,j]);
      }
    }
  }
  // randomly search
  var actual_possible_moves = [];
  for (let i = 0; i < possible_moves.length; i++)
  {
    p = possible_moves[i];
    if (!game_board.could_be_taken(p, player))
    {
      var add = false;
      var adj_squares = game_board.adjacent_squares(p);
      for (let j = 0; j < adj_squares.length; j++)
      {
        q = adj_squares[j];
        if (game_board.board[q[0]][q[1]] == player)
        {
          add = true;
          break;
        }
      }
      if (add)
      {
        actual_possible_moves.push(p);
      }
    }
  }
  if (actual_possible_moves.length == 0)
  {
    make_random_move(player);
    return;
  }
  var growing_moves = clone_array(actual_possible_moves);
  // remove all actual possible moves, paring down to only those near stones near the last move played
  actual_possible_moves = [];
  var check_square = game_board.square_neighborhood(game_board.last_move, detect_radius);
  for (let i = 0; i < check_square.length; i++)
  {
    var p = check_square[i];
    if (game_board.board[p[0]][p[1]] == player && game_board.sum_stone(p, player) <= 1)
    {
      var adj_squares = game_board.adjacent_squares(p);
      for (let j = 0; j < adj_squares.length; j++)
      {
        var q = adj_squares[j];
        if (array_contains(growing_moves, q))
        {
          actual_possible_moves.push(q);
        }
      }
    }
  }
  // search these moves
  if (actual_possible_moves.length > 0)
  {
    var ratings = [];
    for (let i = 0; i < actual_possible_moves.length; i++)
    {
      var p = actual_possible_moves[i];
      var rating = 0;
      for (let j = 0; j < repeat; j++)
      {
        // play a game
        var test_board = new GameBoard(game_board.N, game_board.holes, game_board.board, game_board.hole_list);
        test_board.make_move(p, player);
        for (let t = 0; t < depth; t++)
        {
          var enemy_pre_pos_moves = test_board.possible_moves(-player);
          var enemy_pos_moves = [];
          var check_square = test_board.square_neighborhood(p, attack_radius); // only make moves for opponent in this square
          for (let ii = 0; ii < check_square.length; ii++)
          {
            var z = check_square[ii];
            if (array_contains(enemy_pre_pos_moves, z))
            {
              enemy_pos_moves.push(z);
            }
          }
          if (enemy_pos_moves.length > 0)
          {
            test_board.make_move(enemy_pos_moves[randint(0, enemy_pos_moves.length - 1)], -player);
          }
          // own turn, can only play stones adjacent
          var test_possible_moves = test_board.possible_moves(player);
          var test_own_stones = [];
          for (let ii = 0; ii < test_board.N; ii++)
          {
            for (let jj = 0; jj < test_board.N; jj++)
            {
              if (test_board.board[ii][jj] == player)
              {
                test_own_stones.push([ii,jj]);
              }
            }
          }
          var test_actual_possible_moves = [];
          for (let ii = 0; ii < test_possible_moves.length; ii++)
          {
            var pp = test_possible_moves[ii];
            if (!test_board.could_be_taken(pp, player))
            {
              var add = false;
              var adj_squares = test_board.adjacent_squares(pp);
              for (let jj = 0; jj < adj_squares.length; jj++)
              {
                var qq = adj_squares[jj];
                if (test_board.board[qq[0]][qq[1]] == player)
                {
                  add = true;
                }
              }
              if (add)
              {
                test_actual_possible_moves.push(pp);
              }
            }
          }
          if (test_actual_possible_moves.length > 0)
          {
            test_board.make_move(test_actual_possible_moves[randint(0, test_actual_possible_moves.length - 1)], player);
          }
          if (test_actual_possible_moves.length == 0 && enemy_pos_moves.length == 0)
          {
            break;
          }
        }
        var eval = test_board.material_evaluation();
        if (player == 1)
        {
          rating += eval[0] - eval[1];
        }
        else
        {
          rating += eval[1] - eval[0];
        }
      }
      ratings.push(rating);
    }
    // find best-rated move
    var max_rating = ratings[0];
    var max_move = actual_possible_moves[0];
    for (let i = 0; i < actual_possible_moves.length; i++)
    {
      if (max_rating < ratings[i])
      {
        max_rating = ratings[i];
        max_move = actual_possible_moves[i];
      }
    }
    game_board.make_move(max_move, player);
  }
  else // otherwise, find a move in an area with the most free space
  {
    var ratings = [];
    growing_moves = [];
    for (let i = 0; i < possible_moves.length; i++)
    {
      var p = possible_moves[i];
      if (!game_board.could_be_taken(p, player))
      {
        growing_moves.push(p);
      }
    }
    if (growing_moves.length == 0)
    {
      make_random_move(player);
      return;
    }
    growing_moves = shuffle(growing_moves); // randomly reorder the list of moves for extra variety
    for (let i = 0; i < growing_moves.length; i++)
    {
      var rating = 0;
      var p = growing_moves[i];
      var check_square = game_board.square_neighborhood(p, space_radius);
      for (let j = 0; j < check_square.length; j++)
      {
        var q = check_square[j];
        if (array_contains(possible_moves, q))
        {
          rating++;
        }
        if (game_board.board[q[0]][q[1]] == -player) // also add points for places with lots of enemy stones
        {
          rating++;
          if (game_board.sum_stone(q, -player) == 0 && array_contains(game_board.adjacent_squares(p), q))
          {
            rating += 100; // free stone!
          }
        }
        if (game_board.board[q[0]][q[1]] == player) // subtract points for own stones which are close
        {
          rating -= 2*space_radius*space_radius - ((p[0] - q[0])*(p[0] - q[0]) + (p[1] - q[1])*(p[1] - q[1])); // inversely varies with distance
        }
      }
      ratings.push(rating);
    }
    // find max-rated move
    var max_rating = ratings[0];
    var max_move = growing_moves[0];
    for (let i = 0; i < growing_moves.length; i++)
    {
      if (max_rating < ratings[i])
      {
        max_rating = ratings[i];
        max_move = growing_moves[i];
      }
    }
    game_board.make_move(max_move, player);
  }
}

function make_move_phidippus(player)
{
  // has a more rigorous defense reaction, and when not pressured, will make moves based on a
  // random tree search of a certain subset of possible moves
  var possible_moves = game_board.possible_moves(player);
  var repeat = 6; // default
  // ad hoc choices for the repeat for random tree search
  switch (game_board.N)
  {
    case 17:
      repeat = 9;
      break;
    case 15:
      repeat = 11;
      break;
    case 13:
      repeat = 13;
      break;
    case 11:
      repeat = 16;
      break;
    case 9:
      repeat = 20;
      break;
  }
  var max_num_operations = 10000;
  var num_moves_look = max_num_operations/(possible_moves.length * repeat);
  var defend_repeat = 30;
  var defend_depth = 10;
  var defense_radius = 2;
  // possible moves which cannot be immediately taken
  var own_stones = [];
  var enemy_stones = [];
  for (let i = 0; i < game_board.N; i++)
  {
    for (let j = 0; j < game_board.N; j++)
    {
      if (game_board.board[i][j] == player)
      {
        own_stones.push([i,j])
      }
      if (game_board.board[i][j] == -player)
      {
        enemy_stones.push([i,j])
      }
    }
  }
  var actual_possible_moves = [];
  for (let i = 0; i < possible_moves.length; i++)
  {
    var p = possible_moves[i];
    if (!game_board.could_be_taken(p, player))
    {
      actual_possible_moves.push(p);
    }
  }
  if (actual_possible_moves.length == 0)
  {
    make_random_move(player);
    return;
  }
  var defending_moves = [];
  // check to see if in immediate danger
  var em_rates = [];
  for (let t = 0; t < own_stones.length; t++)
  {
    var p = own_stones[t];
    if (game_board.sum_stone(p, player) == 0)
    {
      var tmp = [];
      var check_square = game_board.square_neighborhood(p, 1);
      for (let tt = 0; tt < check_square.length; tt++)
      {
        var q = check_square[tt];
        if (array_contains(actual_possible_moves, q))
        {
          tmp.push(q);
        }
      }
      if (tmp.length > 0)
      {
        if (defending_moves.length == 0)
        {
          em_rates = [];
          for (let tt = 0; tt < tmp.lenth; tt++)
          {
            em_rates.push(0);
          }
          defending_moves = tmp;
        }
        else
        {
          for (let tt = 0; tt < tmp.length; tt++)
          {
            var qq = tmp[tt];
            for (let i = 0; i < defending_moves.length; i++)
            {
              if (qq == defending_moves[i])
              {
                em_rates[i]++;
              }
              else
              {
                em_rates.push(0);
                defending_moves.push(qq);
              }
            }
          }
        }
      }
    }
  }
  if (defending_moves.length > 0)
  {
    // select the highest-priority emergency defense move if there is one
    var max_rating = em_rates[0];
    var max_move = defending_moves[0];
    for (let i = 0; i < defending_moves.length; i++)
    {
      if (max_rating < em_rates[i])
      {
        max_rating = em_rates[i];
        max_move = defending_moves[i];
      }
    }
    // if there is a multi-stone-saving move, do it, otherwise, choose according to the random tree search approach
    if (max_rating > 0)
    {
      game_board.make_move(max_move, player);
      return;
    }
    // do the search
    var ratings = [];
    for (let i = 0; i < defending_moves.length; i++)
    {
      var p = defending_moves[i];
      var rating = 0;
      for (let r = 0; r < defend_repeat; r++)
      {
        // play a game
        var test_board = new GameBoard(game_board.N, game_board.holes, game_board.board, game_board.hole_list);
        test_board.make_move(p, player);
        for (let t = 0; t < defend_depth; t++)
        {
          // enemy turn
          var enemy_pre_pos_moves = test_board.possible_moves(-player);
          var enemy_pos_moves = [];
          var check_square = test_board.square_neighborhood(p, defense_radius);
          for (let tt = 0; tt < check_square.length; tt++)
          {
            var z = check_square[tt];
            if (array_contains(enemy_pre_pos_moves, z))
            {
              enemy_pos_moves.push(z);
            }
          }
          if (enemy_pos_moves.length > 0)
          {
            test_board.make_move(enemy_pos_moves[randint(0, enemy_pos_moves.length - 1)], -player);
          }
          // own turn
          var test_possible_moves = test_board.possible_moves(player);
          var test_actual_possible_moves = [];
          for (let tt = 0; tt < test_possible_moves.length; tt++)
          {
            var pp = test_possible_moves[tt];
            if (!test_board.could_be_taken(pp, player) && array_contains(test_board.square_neighborhood(p, defense_radius), pp))
            {
              test_actual_possible_moves.push(pp);
            }
          }
          if (test_actual_possible_moves.length > 0)
          {
            test_board.make_move(test_actual_possible_moves[randint(0, test_actual_possible_moves.length - 1)], player);
          }
          if (test_actual_possible_moves.length == 0 && enemy_pos_moves.length == 0)
          {
            break;
          }
        }
        var eval = test_board.material_evaluation();
        if (player == 1)
        {
          rating += eval[0] - eval[1];
        }
        else
        {
          rating += eval[1] - eval[0];
        }
      }
      ratings.push(rating);
    }
    // find best move
    var max_rating = ratings[0];
    var max_move = defending_moves[0];
    for (let i = 0; i < defending_moves.length; i++)
    {
      if (max_rating < ratings[i])
      {
        max_rating = ratings[i];
        max_move = defending_moves[i];
      }
    }
    game_board.make_move(max_move, player);
    return;
  }
  // otherwise choose a move based on random tree search from a specially chosen selection of possible moves
  // first add moves from close to last move
  var considered_moves = [];
  if (typeof game_board.last_move !== "undefined")
  {
    var check_square = game_board.square_neighborhood(game_board.last_move, 2);
    for (let i = 0; i < check_square.length; i++)
    {
      var p = check_square[i];
      if (array_contains(actual_possible_moves, p))
      {
        considered_moves.push(p);
        // remove p from actual_possible_moves to avoid duplicates
        for (let ii = 0; ii < actual_possible_moves.length; ii++)
        {
          if (actual_possible_moves[ii] == p)
          {
            actual_possible_moves.splice(ii, 1);
            break;
          }
        }
        if (considered_moves.length == num_moves_look)
        {
          break;
        }
      }
    }
  }
  // then add moves from close to enemy weak stones
  if (considered_moves.length < num_moves_look)
  {
    for (let i = 0; i < enemy_stones.length; i++)
    {
      var p = enemy_stones[i];
      if (game_board.sum_stone(p, -player) <= 1)
      {
        var check_square = game_board.square_neighborhood(p, 2);
        for (let ii = 0; ii < check_square.length; ii++)
        {
          q = check_square[ii];
          if (array_contains(actual_possible_moves, q))
          {
            considered_moves.push(q);
            // remove q from actual_possible_moves to avoid duplicates
            for (let iii = 0; iii < actual_possible_moves.length; iii++)
            {
              if (actual_possible_moves[iii] == q)
              {
                actual_possible_moves.splice(iii, 1);
                break;
              }
            }
            if (considered_moves.length == num_moves_look)
            {
              break;
            }
          }
        }
      }
      if (considered_moves.length == num_moves_look)
      {
        break;
      }
    }
  }
  // if there's any space left, add stones from what's left of actual_possible_moves, randomly
  while (considered_moves.length < num_moves_look && actual_possible_moves.length > 0)
  {
    var q = actual_possible_moves[randint(0, actual_possible_moves.length - 1)];
    considered_moves.push(q);
    // remove q from actual_possible_moves to avoid duplicates
    for (let i = 0; i < actual_possible_moves.length; i++)
    {
      if (actual_possible_moves[i] == q)
      {
        actual_possible_moves.splice(i, 1);
        break;
      }
    }
  }
  // now random tree search to rate the moves
  var ratings = [];
  for (let i = 0; i < considered_moves.length; i++)
  {
    ratings.push(0);
  }
  for (let i = 0; i < considered_moves.length; i++)
  {
    var p = considered_moves[i];
    for (let j = 0; j < repeat; j++)
    {
      // play a game
      var test_board = new GameBoard(game_board.N, game_board.holes, game_board.board, game_board.hole_list);
      test_board.make_move(p, player);
      while (true)
      {
        // enemy move
        var enemy_pos = test_board.possible_moves(-player);
        if (enemy_pos.length > 0)
        {
          test_board.make_move(enemy_pos[randint(0, enemy_pos.length - 1)], -player);
        }
        // own move
        var own_pos = test_board.possible_moves(player);
        if (own_pos.length > 0)
        {
          test_board.make_move(own_pos[randint(0, own_pos.length - 1)], player);
        }
        if (enemy_pos.length == 0 && own_pos.length == 0)
        {
          break;
        }
      }
      var eval = test_board.material_evaluation();
      if (player == 1)
      {
        ratings[i] += eval[0] - eval[1];
      }
      else
      {
        ratings[i] += eval[1] - eval[0];
      }
    }
  }
  // make the best move
  var max_move = considered_moves[0];
  var max_rating = ratings[0];
  for (let i = 0; i < ratings.length; i++)
  {
    if (max_rating < ratings[i])
    {
      max_rating = ratings[i];
      max_move = considered_moves[i];
    }
  }
  game_board.make_move(max_move, player);
}
