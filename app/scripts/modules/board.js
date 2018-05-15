

class Board {
  constructor(values) {
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
    this.values = values;
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
    if (this.values.length === this.boxes.length) {

      // Populate the grid object
      this.boxes.forEach((element, index) => {
        this.grid[element] = this.values[index] === '.' ? this.cols : Array.from(this.values[index]);
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
        this.grid[peer] = this.grid[peer].splice(this.grid[peer].indexOf(n));
      });
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

    // Eliminate invalid values of grid
    this.eliminate();

    return this.grid;
  }
}
