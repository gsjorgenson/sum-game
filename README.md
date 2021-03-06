# Game of Sum

This program is a graphical interface for a simple board game inspired by the game of Go. The rules are stated here and throughout the game is referred to as the "Game of Sum" or "Sum game."

There are two players and the game is played on an NxN square grid which starts empty. The players take turns placing a stone of their color, either white or black, on the board. White goes first (contrary to Go).

A stone may only be placed on a square that is free. Furthermore, all stones on the board must satisfy the "sum rule:"

```
The number of like-color stones adjacent to (and including) the given stone must be >= the number of opposite colored stones in the adjacent squares.
```

The adjacent squares to a given square are those among the eight surrounding it that are within the board boundary. Any stone which no longer satisfies the sum rule must be removed from the board before further stones may be placed. A stone cannot be placed on the board if it would not satisfy the sum rule. Finally, the sum rule for a stone to be placed is checked before that of stones already on the board; that is, if one places a stone, it must satisfy the sum rule before any stones are removed as a consequence of its placement.

The game ends when both players have no moves left and the winner is the player with the most stones of their color on the board.

As a consequence of the sum rule, the board is always completely filled at the end of a game. Additionally, positions cannot repeat and so unlike the game of Go no additional rules are needed to ensure each game of Sum is finite.

### Hole-sum variant

This capture mechanic is compatible with designating some squares to be "dead," where no stones can ever be placed. Normally the board is always a square, but allowing dead squares, referred to as holes, to be placed on the board enables shapes which are arbitrary subsets of a square NxN grid. This vastly increases the number of possible boards, and the addition of holes a priori can have a large influence on optimal strategy. This is the hope with allowing holes: to encourage variation in strategy.

# About the interface

The program is written in JavaScript and allows users to play Sum game with a visual interface. Several possible board dimension options are provided, as well as the option to include holes. At the moment, hole placement is random and not user-customizable. The number of free squares on a board in the starting position is odd so as to ensure each game has a winner or loser.

Five artificial opponents for the game have been designed, each representing a distinct playstyle. They are not meant to be impossible opponents, but instead meant to be challenging enough to force one to gain some basic insight into effective strategies. The interface offers users an option to face off against these opponents in sequence from easiest to hardest, "running the gauntlet," so to speak. A defeat anywhere along the run requires one to start with the beginning opponent for the next run.

The game can be played in-browser at [https://gsjorgenson.github.io/sum-game/](https://gsjorgenson.github.io/sum-game/).

