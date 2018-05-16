

class Board {
  constructor(unsolved) {
    this.rows = BOARD_ELEMENTS.rows.split('');
    this.cols = BOARD_ELEMENTS.columns.split('');
    this.rs = BOARD_ELEMENTS.row_squares;
    this.cs = BOARD_ELEMENTS.column_squares;
    this.boxes = [];
    this.row_units = [];
    this.column_units = [];
    this.square_units = [];
    this.unit_list = [];
    this.grid = {};
    this.unsolved = unsolved;
    this.units = {};
    this.peers = {};
  }

  cross(a, b) {
    let crossed = [];
    a.forEach((s) => {
      b.forEach((t) => {
        crossed.push(s + t);
      })
    });
    return crossed;
  }

  grid_values() {
    if (this.unsolved.length === this.boxes.length) {

      // Populate the grid object
      this.boxes.forEach((element, index) => {
        this.grid[element] = this.unsolved[index] === '.' ? this.cols : Array.from(this.unsolved[index]);
      });
    }
  }

  eliminate() {
    // Get a list of solved boxes
    let solved = [];
    Object.keys(this.grid).forEach((box) => {
      if (this.grid[box].length === 1) {
        solved.push(box);
      }
    });
    // Eliminate invalid values for each unsolved box
    solved.forEach((box) => {
      let n = this.grid[box][0];

      this.peers[box].forEach((peer) => {
        this.grid[peer] = Array.from(this.grid[peer]).join('').replace(n, '').split('');
      });
    });
  }

  only_choice() {
    this.unit_list.forEach((unit) => {
      this.cols.forEach((n) => {
        let boxes = [];

        unit.forEach((box) => {
          if (this.grid[box].includes(n)) {
            boxes.push(box);
          }
        });

        if (boxes.length === 1) {
          this.grid[boxes[0]] = n;
        }
      });
    });
  }

  solved_values(limit = 1) {
    let solved = [];
    Object.keys(this.grid).forEach((box) => {
      if (this.grid[box].length === limit) {
        solved.push(box);
      }
    });
    return solved;
  }

  reduce_puzzle() {
    let stalled = false;
    let i = 0;

    while (!stalled) {

      // Check how many boxes have a determined value
      let solved_grid_before = this.solved_values().length;

      // Use the Eliminate Strategy
      this.eliminate()

      // Use the Only Choice Strategy
      this.only_choice()

      // Check how many boxes have a determined value, to compare
      let solved_grid_after = this.solved_values().length;

      // If no new values were added, stop the loop.
      stalled = solved_grid_before === solved_grid_after;

      // Sanity check, return False if there is a box with zero available values:
      if (this.solved_values(0).length > 0) {
        return false;
      }
    }
    return this.grid;
  }

  search(grid) {
    // reduce the puzzle
    let values = this.reduce_puzzle();

    if (!values) {
      return false; // Failed earlier
    }

    if (this.solved_values().length === this.boxes.length) {
      return grid; // Solved the sudoku
    }

    // Choose one of the unfilled squares with the fewest possibilities
    let unfilled_keys = [];
    let unfilled_values = [];
    this.boxes.forEach((s) => {
      if (grid[s].length > 1) {
        unfilled_keys.push(s);
        unfilled_values.push(grid[s].length);
      }
    });

    let n = Math.min(...unfilled_values);
    let s = unfilled_keys[unfilled_values.indexOf(n)];

    // Use recurrence to solve each one of the resulting sudokus
    grid[s].forEach((value) => {
      let new_sudoku = grid;
      new_sudoku[s] = value;
      let attempt = this.search(new_sudoku);

      if (attempt) {
        return attempt;
      }
    });
  }

  build() {
    // Build boxes
    this.boxes = this.cross(this.rows, this.cols);

    // Build row units
    this.rows.forEach((r) => {

      // Pass first parameter of cross function as a list
      this.row_units.push(this.cross([r], this.cols));
    });

    // Build column units
    this.cols.forEach((c) => {

      // Pass second parameter of cross functiojn as a list
      this.column_units.push(this.cross(this.rows, [c]));
    });

    // Build square_units
    this.rs.forEach((rs) => {
      this.cs.forEach((cs) => {

        // Split both parameters of cross function
        this.square_units.push(this.cross(rs.split(''), cs.split('')));
      });
    });

    // Build unit list
    this.unit_list = this.row_units.concat(this.column_units.concat(this.square_units));

    // Build units
    this.boxes.forEach((s) => {
      this.unit_list.forEach((u) => {
        if (u.includes(s)) {
          if (this.units.hasOwnProperty(s)) {
            this.units[s].push(u);
          } else {
            this.units[s] = [];
            this.units[s].push(u);
          }
        }
      })
    });

    // Build peers
    this.boxes.forEach((s) => {
      let units = new Set([].concat.apply([], this.units[s]));
      let boxes = new Set([s]);
      let difference = new Set([...units].filter(x => !boxes.has(x)));
      this.peers[s] = Array.from(difference);
    });

    // Build grid
    this.grid_values();

    // Apply constraint propagation
    this.grid = this.search(this.grid);

    return this.grid;
  }
}
