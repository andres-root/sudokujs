

class Board {
  constructor() {
    this.rows = BOARD_ELEMENTS.rows.split('');
    this.cols = BOARD_ELEMENTS.columns.split('');
    this.rs = BOARD_ELEMENTS.row_squares;
    this.cs = BOARD_ELEMENTS.column_squares;
    this.boxes = [];
    this.row_units = [];
    this.column_units = [];
    this.square_units = [];
    this.unit_list = [];
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

    console.log(this.unit_list);
  }
}
